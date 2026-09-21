import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BoxGeometry } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { CollisionGuard } from '../app/collisions.ts';

for (const side of ['right', 'left']) {
  const atlas = JSON.parse(fs.readFileSync(`public/models/${side}.json`));
  assert.equal(atlas.collisions.length, 34);
  assert.equal(atlas.collisionExclusions.length, 18);
  const geometries = atlas.collisions.map(part => {
    const bytes = fs.readFileSync(`public${part.mesh}`);
    return new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  });
  const guard = new CollisionGuard(atlas, geometries);
  assert.deepEqual(guard.contacts(), [], `${side}: neutral is clear`);
  const joint = atlas.joints.find(j => j.id === `${side}_middle_abd`);
  assert(joint);
  assert(guard.contacts({ [joint.id]: joint.upper }).length, 'Extreme spread intersects a neighboring finger');
  const blocked = guard.moveTo({ [joint.id]: joint.upper });
  assert(blocked.limited && blocked.contact, 'Motion stops before the collision');
  assert(blocked.angles[joint.id] > .25 && blocked.angles[joint.id] < .4);
  assert.deepEqual(guard.contacts(), [], 'Accepted pose has no mesh contacts');
  assert.equal(guard.moveTo({}).limited, false, 'Can move away from a blocked pose');
  assert.equal(guard.angles[joint.id], 0);
  for (const j of atlas.joints.filter(j => j.type === 'revolute')) {
    for (const limit of [j.lower, j.upper]) {
      guard.reset();
      const result = guard.moveTo({ [j.id]: limit });
      assert.deepEqual(guard.contacts(), [], `${side}: ${j.id} accepted endpoint is clear`);
      assert(result.angles[j.id] >= j.lower && result.angles[j.id] <= j.upper);
    }
  }
  guard.reset();
  assert.equal(guard.moveTo({ [`${side}_thumb_dip`]: 1.45 }).limited, false, 'Free motion reaches its target');
  guard.dispose();
}

// Both endpoints are clear, but a rotating block passes through an obstacle.
// This catches collision checks that only compare the requested endpoint.
const part = (id, link, xyz) => ({ id, link, xyz, rpy: [0, 0, 0], scale: [1, 1, 1] });
const atlas = {
  links: ['base', 'moving'], collisionExclusions: [],
  joints: [{ id: 'hinge', type: 'revolute', parent: 'base', child: 'moving', xyz: [0, 0, 0], rpy: [0, 0, 0], axis: [0, 0, 1], lower: 0, upper: Math.PI }],
  collisions: [part('obstacle', 'base', [0, 1, 0]), part('rotating-block', 'moving', [1, 0, 0])],
};
const guard = new CollisionGuard(atlas, [new BoxGeometry(.1, .1, .1), new BoxGeometry(.1, .1, .1)]);
assert.deepEqual(guard.contacts(), []);
assert.deepEqual(guard.contacts({ hinge: Math.PI }), []);
const swept = guard.moveTo({ hinge: Math.PI });
assert(swept.limited && swept.contact, 'Stops along the swept path even with a clear endpoint');
assert(swept.angles.hinge > 1 && swept.angles.hinge < Math.PI / 2);
assert.deepEqual(guard.contacts(), []);
assert.equal(guard.moveTo({ hinge: 0 }).limited, false);
guard.dispose();
console.log('PASS: source collision meshes, both hands, joint extremes, contact blocking, retreat, and continuous swept motion.');
