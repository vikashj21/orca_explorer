// Reviewed against manual-part-a.pdf. Page numbers refer to the supplied PDF,
// not to the video-based checklist. Groups are zero-based within each step.
export type ManualDiagram = { page: number; caption: string; src?: string };
export const V2_MANUAL: Record<number, Record<number, ManualDiagram[]>> = {
  1: {
    0: [{ page: 1, caption: 'Parts overview: printed structures, skins, motors and electronics.' }, { page: 2, caption: 'Hardware overview: bearings, pins, fasteners, tendons and tools.' }],
    1: [{ page: 3, caption: 'The 1.5 m tendon, Ashley Stopper knot sequence and spacing checks.' }],
  },
  2: { 0: [{ page: 4, caption: 'Fingertip tendon entry and exit orientation.' }], 1: [{ page: 5, caption: 'Seat the fingertip tendon and fit the two bearings.' }] },
  3: { 0: [{ page: 6, caption: 'Route and seat the proximal segment tendon.' }], 1: [{ page: 7, caption: 'Proximal pin positions.', src: '/assembly/v2/manual/page-07-step-03.webp' }] },
  4: { 0: [{ page: 7, caption: 'Route the fingertip tendons through the proximal segment.' }], 1: [{ page: 8, caption: 'Joint seating, tendon motion and correct versus incorrect routing.' }] },
  5: { 0: [{ page: 9, caption: 'Prepare two 0.75 m base tendons and pull approximately 20 cm through.', src: '/assembly/v2/manual/page-09-step-06.webp' }, { page: 10, caption: 'Tie the base stopper knots and seat them in their recesses.' }] },
  6: { 1: [{ page: 11, caption: 'Numbered tendon passages through the finger base.' }], 2: [{ page: 12, caption: 'Correct and incorrect tendon alignment through the seated finger.' }, { page: 13, caption: 'Finger base connection and pin placement.' }], 3: [{ page: 14, caption: 'Completed finger set: one index, two middle-type fingers and one pinky.' }] },
  7: { 0: [{ page: 15, caption: 'Thumb-specific parts and the assembled tip and proximal segment.', src: '/assembly/v2/manual/page-15-step-07.png' }] },
  8: { 0: [{ page: 16, caption: 'Thumb base tendon routes and joint alignment.' }], 1: [{ page: 17, caption: 'Thumb AP pin and bearing positions.', src: '/assembly/v2/manual/page-17-step-08.png' }, { page: 15, caption: 'Prepare the thumb AP with two 0.75 m tendons, pulling approximately 20 cm through before tying the stopper knots.', src: '/assembly/v2/manual/page-15-step-08.png' }] },
  9: { 0: [{ page: 17, caption: 'Right: the final thumb base and its two 0.75 m tendons.' }] },
  10: { 0: [{ page: 18, caption: 'Numbered routes through the final thumb base.' }, { page: 19, caption: 'Left: completed thumb base connection. Right: the palm routing that follows.' }], 1: [{ page: 14, caption: 'Completed finger set: one index, two middle-type fingers and one pinky.' }] },
  11: { 1: [{ page: 19, caption: 'Right: the first numbered index tendon routes into the palm.' }, { page: 20, caption: 'Continue the six numbered index tendon routes through the palm.' }] },
  12: { 0: [{ page: 21, caption: 'Correct and incorrect finger base seating in the palm.' }], 1: [{ page: 22, caption: 'Repeat for the remaining fingers; the right view also shows thumb attachment.' }] },
  13: { 0: [{ page: 22, caption: 'Right: attach the thumb and inspect the complete hand.' }], 1: [{ page: 23, caption: 'Palm skin fitting and wrist bearing preparation.' }] },
  14: { 0: [{ page: 25, caption: 'Magnet seats in the motor tower and curved housing.' }], 1: [{ page: 24, caption: 'Four magnet locations in each front and back cover.' }] },
  15: { 0: [{ page: 29, caption: 'Wrist housing screw and washer placement.' }, { page: 30, caption: 'Internal wrist nuts, bearings and hardware alignment.' }] },
  17: { 1: [{ page: 32, caption: 'Wrist motor mounting hardware, pulley and pin assembly.' }] },
  18: { 0: [{ page: 27, caption: 'Left: fan mounting. Right: power-board mounting, revisited in step 27. The PDF illustrates a single fan.' }], 1: [{ page: 26, caption: 'Tower nut positions and long retaining piece.' }, { page: 28, caption: 'Tower nuts and the illustrated motor retaining inserts.' }] },
  19: { 0: [{ page: 31, caption: 'Prepare the spool hardware and attach it to each of the sixteen finger motors.' }] },
  27: { 1: [{ page: 27, caption: 'Right: power-board mounting positions and fasteners in the manual’s illustrated housing.' }] },
};
export const manualImage = (page: number, src?: string) => src ?? `/assembly/v2/manual/page-${String(page).padStart(2, '0')}.webp`;
