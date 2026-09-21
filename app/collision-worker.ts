import { loadCollisionGuard, type CollisionGuard, type Angles } from './collisions';
import type { Atlas } from './model';
let guard: CollisionGuard | null = null;
self.onmessage = async (event: MessageEvent<{ type: 'init'; atlas: Atlas } | { type: 'move'; id: number; angles: Angles } | { type: 'reset'; id: number }>) => {
  const message = event.data;
  try {
    if (message.type === 'init') {
      guard = await loadCollisionGuard(message.atlas, new AbortController().signal);
      const contacts = guard.contacts();
      if (contacts.length) throw new Error('The reference pose contains an unexpected collision. Joint motion is disabled.');
      self.postMessage({ type: 'ready' });
    } else if (guard) {
      if (message.type === 'reset') { guard.reset(); self.postMessage({ type: 'result', id: message.id, angles: guard.angles, limited: false, contact: null }); }
      else self.postMessage({ type: 'result', id: message.id, ...guard.moveTo(message.angles) });
    }
  } catch (error) { self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'Collision checking failed.' }); }
};
