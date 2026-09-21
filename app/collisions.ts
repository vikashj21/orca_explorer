import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { Atlas, CollisionPart } from './model.ts';

export type Angles = Record<string, number>;
export type Contact = { first: string; second: string };
export type MotionResult = { angles: Angles; contact: Contact | null; limited: boolean };
export const COLLISION_CLEARANCE = 0.00005; // 0.05 mm between non-excluded surfaces.
const EPSILON = 1e-8;
const pairKey = (a: string, b: string) => [a, b].sort().join('|');
const rotation = (rpy: number[]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rpy[0], rpy[1], rpy[2], 'ZYX'));
function boxDistance(a: THREE.Box3, b: THREE.Box3) {
  return Math.hypot(Math.max(0, a.min.x - b.max.x, b.min.x - a.max.x), Math.max(0, a.min.y - b.max.y, b.min.y - a.max.y), Math.max(0, a.min.z - b.max.z, b.min.z - a.max.z));
}
type CollisionGeometry = THREE.BufferGeometry & { boundsTree?: MeshBVH };
type Collider = { part: CollisionPart; geometry: CollisionGeometry; bvh: MeshBVH; link: THREE.Group; bounds: THREE.Box3; inverse: THREE.Matrix4; influence: Map<string, number> };
type Pair = { a: Collider; b: Collider; influence: Map<string, number> };

/** Collision geometry has its own kinematic tree: hiding, isolating, and exploding
 * visual pieces never removes physical constraints from joint motion. */
export class CollisionGuard {
  readonly atlas: Atlas;
  readonly colliders: Collider[] = [];
  readonly pairs: Pair[] = [];
  private root = new THREE.Group();
  private driven = new Map<string, THREE.Group>();
  private current: Angles = {};
  private relative = new THREE.Matrix4();

  constructor(atlas: Atlas, geometries: THREE.BufferGeometry[]) {
    this.atlas = atlas;
    if (!atlas.collisions?.length || atlas.collisions.length !== geometries.length) throw new Error('The collision geometry is incomplete.');
    const links = new Map(atlas.links.map(id => [id, new THREE.Group()]));
    const byChild = new Map(atlas.joints.map(j => [j.child, j]));
    for (const [id, link] of links) if (!byChild.has(id)) this.root.add(link);
    for (const j of atlas.joints) {
      const anchor = new THREE.Group();
      anchor.position.fromArray(j.xyz); anchor.quaternion.copy(rotation(j.rpy));
      const moving = new THREE.Group(); anchor.add(moving);
      moving.add(links.get(j.child)!); links.get(j.parent)!.add(anchor);
      if (j.type === 'revolute') this.driven.set(j.id, moving);
    }
    const rigidBody = (link: string): string => {
      const joint = byChild.get(link);
      return joint?.type === 'fixed' ? rigidBody(joint.parent) : link;
    };
    const excluded = new Set(atlas.collisionExclusions.map(([a, b]) => pairKey(rigidBody(a), rigidBody(b))));
    for (const [i, part] of atlas.collisions.entries()) {
      const geometry = geometries[i] as CollisionGeometry;
      geometry.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...part.xyz), rotation(part.rpy), new THREE.Vector3(...part.scale)));
      geometry.computeBoundingBox();
      const bvh = new MeshBVH(geometry, { maxLeafTris: 8 }); geometry.boundsTree = bvh;
      const positions = geometry.getAttribute('position');
      let radius = 0;
      for (let v = 0; v < positions.count; v++) radius = Math.max(radius, Math.hypot(positions.getX(v), positions.getY(v), positions.getZ(v)));
      // Triangle inequality gives a pose-independent upper bound on each vertex's
      // distance from every upstream joint axis. Used for conservative sweeps.
      const influence = new Map<string, number>();
      let cursor = part.link;
      while (byChild.has(cursor)) {
        const j = byChild.get(cursor)!;
        if (j.type === 'revolute') influence.set(j.id, radius);
        radius += Math.hypot(...j.xyz);
        cursor = j.parent;
      }
      this.colliders.push({ part, geometry, bvh, link: links.get(part.link)!, bounds: new THREE.Box3(), inverse: new THREE.Matrix4(), influence });
    }
    for (let i = 0; i < this.colliders.length; i++) for (let k = i + 1; k < this.colliders.length; k++) {
      const a = this.colliders[i], b = this.colliders[k];
      const bodyA = rigidBody(a.part.link), bodyB = rigidBody(b.part.link);
      if (bodyA === bodyB || excluded.has(pairKey(bodyA, bodyB))) continue;
      // A shared ancestor rotates both shapes together, preserving their separation.
      const influence = new Map<string, number>();
      for (const [id, radius] of a.influence) if (!b.influence.has(id)) influence.set(id, radius);
      for (const [id, radius] of b.influence) if (!a.influence.has(id)) influence.set(id, radius);
      if (influence.size) this.pairs.push({ a, b, influence });
    }
    this.reset();
  }
  private normalize(angles: Angles): Angles {
    return Object.fromEntries(this.atlas.joints.filter(j => j.type === 'revolute').map(j => [j.id, Math.max(j.lower, Math.min(j.upper, Number.isFinite(angles[j.id] ?? 0) ? angles[j.id] ?? 0 : this.current[j.id] ?? 0))]));
  }
  private place(angles: Angles) {
    for (const j of this.atlas.joints) if (j.type === 'revolute') this.driven.get(j.id)!.quaternion.setFromAxisAngle(new THREE.Vector3(...j.axis).normalize(), angles[j.id] ?? 0);
    this.root.updateMatrixWorld(true);
    for (const c of this.colliders) { c.bounds.copy(c.geometry.boundingBox!).applyMatrix4(c.link.matrixWorld); c.inverse.copy(c.link.matrixWorld).invert(); }
  }
  reset() { this.current = this.normalize({}); this.place(this.current); }
  get angles() { return { ...this.current }; }
  private distance(pair: Pair, maxDistance = Infinity) {
    const { a, b } = pair;
    if (boxDistance(a.bounds, b.bounds) > maxDistance) return Infinity;
    this.relative.multiplyMatrices(a.inverse, b.link.matrixWorld);
    return a.bvh.closestPointToGeometry(b.geometry, this.relative, undefined, undefined, 0, maxDistance)?.distance ?? Infinity;
  }
  /** Diagnostic mesh-surface contacts in a pose; does not change the accepted pose. */
  contacts(angles: Angles = this.current, clearance = COLLISION_CLEARANCE): Contact[] {
    this.place(this.normalize(angles));
    const contacts = this.pairs.filter(pair => this.distance(pair, clearance + EPSILON) <= clearance).map(({ a, b }) => ({ first: a.part.id, second: b.part.id }));
    this.place(this.current);
    return contacts;
  }
  moveTo(requested: Angles): MotionResult {
    const target = this.normalize(requested);
    const start = { ...this.current };
    const delta = Object.fromEntries(Object.keys(target).map(id => [id, target[id] - start[id]]));
    const movingPairs = this.pairs.map(pair => ({ pair, speed: [...pair.influence].reduce((sum, [id, radius]) => sum + radius * Math.abs(delta[id] ?? 0), 0) })).filter(p => p.speed > EPSILON);
    if (!movingPairs.length) { this.current = target; this.place(target); return { angles: this.angles, contact: null, limited: false }; }
    let t = 0, blocked: Contact | null = null;
    // Conservative advancement uses mesh distance / maximum relative vertex travel.
    // The entire interval is protected, including a large slider or preset jump.
    for (let iteration = 0; iteration < 192 && t < 1; iteration++) {
      let advance = Math.min(1 - t, .05 / Math.max(...Object.values(delta).map(Math.abs)));
      let nearest: Contact | null = null;
      for (const { pair, speed } of movingPairs) {
        const distance = this.distance(pair, speed * advance + COLLISION_CLEARANCE + EPSILON);
        const safe = (distance - COLLISION_CLEARANCE) / speed;
        if (safe < advance) {
          advance = Math.max(0, safe * .9);
          nearest = { first: pair.a.part.id, second: pair.b.part.id };
        }
      }
      if (nearest) blocked = nearest;
      if (advance < 1e-7) {
        if (!nearest && 1 - t < 1e-7) { t = 1; this.current = target; this.place(target); }
        break;
      }
      t = Math.min(1, t + advance);
      this.current = Object.fromEntries(Object.keys(target).map(id => [id, start[id] + delta[id] * t]));
      this.place(this.current);
    }
    if (t < 1 && t > 0) {
      // Retreat a tiny distance along the already verified path. This leaves
      // room for a subsequent command to move away from the contact boundary.
      t = Math.max(0, t - .00001 / Math.max(...movingPairs.map(p => p.speed)));
      this.current = Object.fromEntries(Object.keys(target).map(id => [id, start[id] + delta[id] * t]));
      this.place(this.current);
    }
    // Dense, nearly coplanar triangles can lose precision in the distance query.
    // Verify the accepted endpoint independently and retreat to a checked pose
    // if conservative advancement landed inside the clearance boundary.
    const endpointContacts = this.contacts();
    if (endpointContacts.length) {
      blocked = endpointContacts[0];
      let clear = 0, touching = t;
      let safeAngles = start;
      for (let i = 0; i < 32 && touching - clear > 1e-8; i++) {
        const midpoint = (clear + touching) / 2;
        const candidate = Object.fromEntries(Object.keys(target).map(id => [id, start[id] + delta[id] * midpoint]));
        if (this.contacts(candidate).length) touching = midpoint;
        else { clear = midpoint; safeAngles = candidate; }
      }
      t = clear;
      this.current = safeAngles;
      this.place(this.current);
    }
    return { angles: this.angles, contact: t < 1 ? blocked : null, limited: t < 1 };
  }
  dispose() { for (const c of this.colliders) { delete c.geometry.boundsTree; c.geometry.dispose(); } }
}

export async function loadCollisionGuard(atlas: Atlas, signal: AbortSignal): Promise<CollisionGuard> {
  const loader = new STLLoader();
  const geometries: THREE.BufferGeometry[] = [];
  try {
    // Await every job before cleanup, including after a failed/aborted request.
    const results = await Promise.allSettled(atlas.collisions.map(async part => {
      const response = await fetch(part.mesh, { signal });
      if (!response.ok) throw new Error(`Could not load collision mesh for ${part.id}.`);
      const data = await response.arrayBuffer();
      signal.throwIfAborted();
      const geometry = loader.parse(data); geometries.push(geometry); return geometry;
    }));
    const failure = results.find(r => r.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
    signal.throwIfAborted();
    const ordered = results.map(r => (r as PromiseFulfilledResult<THREE.BufferGeometry>).value);
    return new CollisionGuard(atlas, ordered);
  } catch (error) { geometries.forEach(g => g.dispose()); throw error; }
}
