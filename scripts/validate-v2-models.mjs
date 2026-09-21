import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
const frame = (xyz, rpy, scale = [1, 1, 1]) => new THREE.Matrix4().compose(new THREE.Vector3(...xyz), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rpy, 'ZYX')), new THREE.Vector3(...scale));
const boundsBySide = {};
for (const side of ['right', 'left']) {
  const atlas = JSON.parse(readFileSync(`public/models/v2/${side}.json`, 'utf8'));
  assert.equal(atlas.parts.length, 31);
  assert.equal(new Set(atlas.parts.map(p => p.id)).size, 31);
  assert.equal(atlas.joints.filter(j => j.type === 'revolute').length, 17);
  assert.equal(atlas.motionMode, undefined);
  assert.equal(atlas.collisions.length, 31);
  assert.equal(atlas.collisionExclusions.length, 69);
  for (const part of atlas.parts) assert.deepEqual(atlas.collisions.find(c => c.id === part.id), Object.fromEntries(['id', 'link', 'mesh', 'scale', 'xyz', 'rpy'].map(k => [k, part[k]])));
  for (const pair of atlas.collisionExclusions) assert(pair.every(link => atlas.links.includes(link)));
  assert(!atlas.parts.some(p => p.id === 'motor_connector_pcb'));
  const byChild = new Map(atlas.joints.map(j => [j.child, j]));
  assert.equal(byChild.size, atlas.joints.length);
  function transform(link, seen = new Set()) {
    assert(atlas.links.includes(link));
    assert(!seen.has(link)); seen.add(link);
    const joint = byChild.get(link);
    if (!joint) { assert.equal(link, 'world'); return new THREE.Matrix4(); }
    assert(joint.lower <= joint.upper);
    assert([...joint.xyz, ...joint.rpy, ...joint.axis, joint.lower, joint.upper].every(Number.isFinite));
    if (joint.type === 'revolute') {
      assert(Math.abs(new THREE.Vector3(...joint.axis).length() - 1) < 1e-10);
      assert(joint.lower <= 0 && joint.upper >= 0);
    }
    return transform(joint.parent, seen).multiply(frame(joint.xyz, joint.rpy));
  }
  const bounds = new THREE.Box3();
  let triangles = 0;
  for (const part of atlas.parts) {
    assert(part.mesh.startsWith('/models/v2/'));
    const bytes = readFileSync(`public${part.mesh}`);
    assert(bytes.equals(readFileSync(`src/orcahand_hardware/${part.sourceMesh}`)), 'Download preserves the supplied hardware STL');
    const geometry = new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    assert(Array.from(geometry.attributes.position.array).every(Number.isFinite));
    triangles += geometry.attributes.position.count / 3;
    const joint = atlas.joints.find(j => j.id === part.joint);
    assert(!part.joint || joint?.type === 'revolute');
    if (part.group === 'index' && part.id === 'index_pp') assert.equal(joint.id, `${side}_index_mcp`);
    geometry.applyMatrix4(transform(part.link).multiply(frame(part.xyz, part.rpy, part.scale)));
    geometry.computeBoundingBox(); bounds.union(geometry.boundingBox); geometry.dispose();
  }
  boundsBySide[side] = bounds;
  const size = bounds.getSize(new THREE.Vector3());
  assert(size.y > .25 && size.y < .5, `Hand is upright at physical scale: ${size.toArray()}`);
  assert(size.x < .25 && size.z < .2);
  console.log(`v2 ${side}: 31 unchanged base meshes, 17 joints, valid pivot frames, ${triangles.toLocaleString()} triangles, ${(size.y * 1000).toFixed(1)} mm height.`);
}
const right = boundsBySide.right, left = boundsBySide.left;
assert(Math.abs(right.min.x + left.max.x) < 1e-6);
assert(Math.abs(right.max.x + left.min.x) < 1e-6);
assert(Math.abs(right.min.y - left.min.y) < 1e-6);
assert(Math.abs(right.max.y - left.max.y) < 1e-6);
console.log('PASS: left preview mirrors the right base geometry at the source scale.');
