import { useEffect, useRef, useState } from 'react';
import type { Atlas } from './model';
import type { Angles, Contact, MotionResult } from './collisions';

type Request = { type: 'move'; id: number; angles: Angles } | { type: 'reset'; id: number };
export function useCollisionMotion(atlas: Atlas | null, accept: (angles: Angles) => void) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'checking' | 'error'>('loading');
  const [contact, setContact] = useState<Contact | null>(null);
  const [limited, setLimited] = useState(false);
  const [error, setError] = useState('');
  const acceptRef = useRef(accept); acceptRef.current = accept;
  const workerRef = useRef<Worker | null>(null);
  const ready = useRef(false), busy = useRef(false), serial = useRef(0), resetId = useRef(0);
  const queued = useRef<Request[]>([]);
  useEffect(() => {
    setStatus('loading'); setContact(null); setLimited(false); setError('');
    ready.current = false; busy.current = false; queued.current = [];
    if (!atlas) return;
    let worker: Worker;
    try { worker = new Worker(new URL('./collision-worker.ts', import.meta.url), { type: 'module' }); }
    catch { setStatus('error'); setError('Collision checking could not start. Reload to try again.'); return; }
    workerRef.current = worker;
    const fail = (message: string) => { ready.current = false; busy.current = false; queued.current = []; setStatus('error'); setError(message); };
    worker.onerror = () => fail('Collision checking failed to load. Reload to try again.');
    worker.onmessage = (event: MessageEvent<({ type: 'ready' } | { type: 'error'; message: string } | ({ type: 'result'; id: number } & MotionResult))>) => {
      const message = event.data;
      if (message.type === 'error') { fail(message.message); return; }
      if (message.type === 'ready') { ready.current = true; setStatus('ready'); return; }
      busy.current = false;
      // An explicit reset supersedes responses from earlier motion requests.
      if (message.id >= resetId.current) {
        acceptRef.current(message.angles); setContact(message.contact); setLimited(message.limited);
      }
      if (queued.current.length) { const next = queued.current.shift()!; busy.current = true; worker.postMessage(next); }
      else setStatus('ready');
    };
    worker.postMessage({ type: 'init', atlas });
    return () => { ready.current = false; worker.terminate(); workerRef.current = null; };
  }, [atlas]);
  function send(request: Request) {
    if (!ready.current || !workerRef.current) return;
    setStatus('checking');
    if (busy.current) {
      if (request.type === 'reset') queued.current = [request];
      else { if (queued.current.at(-1)?.type === 'move') queued.current.pop(); queued.current.push(request); }
    }
    else { busy.current = true; workerRef.current.postMessage(request); }
  }
  return { status, contact, limited, error,
    move: (angles: Angles) => send({ type: 'move', id: ++serial.current, angles }),
    reset: () => { resetId.current = ++serial.current; setContact(null); setLimited(false); send({ type: 'reset', id: resetId.current }); },
  };
}
