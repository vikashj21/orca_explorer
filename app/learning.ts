import type { Part } from './model';

export function hardwareNote(part: Part) {
  if (part.group === 'palm') return { title: 'The tendon crossroads', text: 'Finger tendons pass through the carpal body toward the forearm. The assembly guide shows how the wrist belt wraps around the carpal gear.', url: 'https://orca.ethz.ch/assembly/Orca%20Hand_step17.html', label: 'Carpal and wrist assembly' };
  if (part.group === 'base') return { title: 'Where motion begins', text: 'The physical hand uses tendons wound onto servo spools. The assembly guide explains their routing and the two-part spool mechanism. These tendons and spools are not separate meshes in this viewer.', url: 'https://orca.ethz.ch/assembly/Orca%20Hand_step26.html', label: 'Tendon spooling guide' };
  if (part.group === 'thumb') return { title: 'A different base connection', text: 'The thumb has its own abduction assembly. Its tendons are routed through the base opening before the components snap together.', url: 'https://orca.ethz.ch/assembly/Orca%20Hand_step07.html', label: 'Thumb assembly guide' };
  return { title: 'Two directions, paired tendons', text: 'Flexor and extensor tendons drive bending and straightening. Separate tendon pairs act on the proximal segment and fingertip assembly. The real joints snap together after the tendons are routed.', url: 'https://orca.ethz.ch/assembly/Orca%20Hand_step05.html', label: 'Finger assembly guide' };
}
