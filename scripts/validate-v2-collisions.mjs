import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { CollisionGuard } from '../app/collisions.ts';
for (const side of ['right', 'left']) {
  const atlas = JSON.parse(fs.readFileSync(`public/models/v2/${side}.json`));
  const geometry = atlas.collisions.map(p => {
    const b = fs.readFileSync(`public${p.mesh}`);
    return new STLLoader().parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  });
  const guard = new CollisionGuard(atlas, geometry);
  assert.deepEqual(guard.contacts(), [], `${side}: initial pose is clear`);
  assert(!guard.colliders.some(c => c.part.id === 'motor_connector_pcb'), 'Removed PCB has no collider');
  const joint = atlas.joints.find(j => j.id === `${side}_middle_abd`);
  assert(guard.contacts({ [joint.id]: joint.upper }).length, 'Requested spread intersects another finger');
  const result = guard.moveTo({ [joint.id]: joint.upper });
  assert(result.limited && result.contact);
  assert(result.angles[joint.id] > .2 && result.angles[joint.id] < .3);
  assert.deepEqual(guard.contacts(), [], 'Accepted pose stays clear');
  assert(!guard.moveTo({}).limited, 'Retreat from contact remains possible');
  assert.equal(guard.angles[joint.id], 0);
  for (const j of atlas.joints.filter(j => j.type === 'revolute')) {
    for (const limit of [j.lower, j.upper]) {
      guard.reset();
      const result = guard.moveTo({ [j.id]: limit });
      assert.deepEqual(guard.contacts(), [], `${side} ${j.id}: accepted pose stays clear`);
      assert(result.angles[j.id] >= j.lower && result.angles[j.id] <= j.upper);
    }
  }
  guard.reset();
  const index = `${side}_index_mcp`;
  assert(!guard.moveTo({ [index]: .5 }).limited, 'Free motion reaches requested angle');
  assert.equal(guard.angles[index], .5);
  guard.dispose();
  console.log(`PASS: v2 ${side} mesh collision blocking, retreat, every joint limit, source exclusions and PCB removal.`);
}
