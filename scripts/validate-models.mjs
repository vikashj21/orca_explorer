import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

for (const side of ['right', 'left']) {
  const atlas = JSON.parse(readFileSync(`public/models/${side}.json`, 'utf8'));
  assert.equal(atlas.parts.length, 34);
  assert.equal(new Set(atlas.parts.map(p => p.id)).size, 34);
  assert.equal(atlas.joints.filter(j => j.type === 'revolute').length, 17);
  const byChild = new Map(atlas.joints.map(j => [j.child, j]));
  assert.equal(byChild.size, atlas.joints.length, 'Each frame has one parent');
  function transform(link, visited = new Set()) {
    assert(!visited.has(link), 'No cycles in URDF tree');
    visited.add(link);
    const joint = byChild.get(link);
    if (!joint) return new THREE.Matrix4();
    assert(atlas.links.includes(joint.parent));
    assert(joint.lower <= joint.upper);
    assert(joint.type !== 'revolute' || new THREE.Vector3(...joint.axis).length() > .99);
    return transform(joint.parent, visited).multiply(new THREE.Matrix4().compose(new THREE.Vector3(...joint.xyz), new THREE.Quaternion().setFromEuler(new THREE.Euler(...joint.rpy, 'ZYX')), new THREE.Vector3(1, 1, 1)));
  }
  const bounds = new THREE.Box3();
  let triangles = 0;
  for (const part of atlas.parts) {
    assert(atlas.links.includes(part.link));
    assert(!part.joint || atlas.joints.some(j => j.id === part.joint));
    assert(part.description.length > 50);
    const bytes = readFileSync(`public${part.mesh}`);
    const geometry = new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    const positions = geometry.getAttribute('position');
    assert(positions.count > 0 && positions.count % 3 === 0);
    assert(Array.from(positions.array).every(Number.isFinite));
    triangles += positions.count / 3;
    const matrix = transform(part.link).multiply(new THREE.Matrix4().compose(new THREE.Vector3(...part.xyz), new THREE.Quaternion().setFromEuler(new THREE.Euler(...part.rpy, 'ZYX')), new THREE.Vector3(...part.scale)));
    geometry.applyMatrix4(matrix); geometry.computeBoundingBox(); bounds.union(geometry.boundingBox);
    geometry.dispose();
  }
  const size = bounds.getSize(new THREE.Vector3());
  assert(size.z > .25 && size.z < .6, `Expected a hand-sized assembly in meters, got ${size.z}`);
  assert(size.x < .5 && size.y < .5);
  console.log(`${side}: all 34 meshes valid; 17 joint limits and kinematic tree valid; ${triangles.toLocaleString()} triangles; ${(size.z * 1000).toFixed(1)} mm assembly height.`);
}
