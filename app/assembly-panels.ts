// Explicit associations reviewed against the numbered official source pages.
// Image numbers are one-based; item indices retain the existing saved checklist keys.
// Several consecutive views can illustrate one instruction, or one image can
// illustrate multiple instructions. Never pair by array index or equal slices.
export type AssemblyPanel = { images: number[]; items: number[]; note?: string };
export const ASSEMBLY_PANELS: Record<number, AssemblyPanel[]> = {
  0: [
    { images: [1], items: [0] }, { images: [2, 3], items: [1] },
    { images: [4], items: [2] }, { images: [5, 6], items: [3] },
    { images: [7], items: [], note: 'The assembly video shows an older revision. Use it for an overview and follow the current written guide for construction details.' },
  ],
  1: [{ images: [1, 2, 3, 4, 5, 6, 7, 8, 9], items: [0, 1] }, { images: [10, 11], items: [], note: 'These views refer to skin casting in Step 04. That page is missing from the published directory; obtain its instructions from the ORCA project.' }, { images: [12], items: [2] }],
  2: [{ images: [1, 2], items: [0] }, { images: [3, 4, 5, 6], items: [1] }, { images: [7], items: [2] }],
  3: [{ images: [1, 2, 3], items: [0] }, { images: [4], items: [1] }, { images: [5, 6, 7, 8, 9], items: [2] }],
  5: [{ images: [1, 2, 3], items: [0] }, { images: [4], items: [1] }, { images: [5, 6, 7], items: [2] }, { images: [8, 9, 10, 11, 12], items: [3] }, { images: [13], items: [4] }],
  6: [{ images: [1, 2, 3, 4], items: [0] }, { images: [5], items: [1] }, { images: [6, 7], items: [2] }],
  7: [{ images: [1, 2], items: [0] }, { images: [3, 4, 5], items: [1] }, { images: [6], items: [2] }, { images: [7, 8], items: [3] }],
  8: [{ images: [1, 2], items: [0, 1] }],
  9: [{ images: [1], items: [0] }, { images: [2, 3, 4], items: [1, 2] }],
  10: [{ images: [1, 2], items: [0] }, { images: [3, 4], items: [1] }, { images: [5, 6], items: [2, 3] }],
  11: [{ images: [1, 2], items: [0] }, { images: [3, 4, 5, 6, 7], items: [1] }],
  12: [{ images: [1, 2], items: [0] }, { images: [3], items: [1] }, { images: [4, 5], items: [2] }, { images: [6], items: [3] }],
  13: [{ images: [1, 2], items: [0] }, { images: [3], items: [1] }, { images: [4], items: [2] }],
  14: [{ images: [1, 2, 3, 4], items: [0, 1] }, { images: [5], items: [2] }, { images: [6], items: [3] }],
  15: [{ images: [1], items: [0, 1] }],
  16: [{ images: [1, 2], items: [0, 1] }],
  17: [{ images: [1], items: [0] }, { images: [2, 3, 4], items: [1, 2] }, { images: [5], items: [3] }],
  18: [{ images: [1], items: [0, 1, 2] }],
  19: [{ images: [1], items: [0, 1, 2] }],
  20: [{ images: [1], items: [0] }, { images: [2], items: [1] }, { images: [3, 4], items: [2, 3] }],
  21: [{ images: [1], items: [0] }, { images: [2], items: [1] }, { images: [3, 4], items: [2] }],
  22: [{ images: [1], items: [0, 1] }],
  23: [{ images: [1], items: [0] }, { images: [2, 3, 4], items: [1] }, { images: [5], items: [2] }, { images: [6], items: [3, 4] }],
  24: [{ images: [1, 2], items: [0, 1] }],
  25: [{ images: [1], items: [0, 1] }, { images: [2], items: [2] }, { images: [3, 4], items: [3] }],
  26: [{ images: [1, 2, 3, 4, 5, 6], items: [0] }, { images: [7], items: [1] }, { images: [8, 9, 10, 11, 12, 13, 14], items: [2] }, { images: [15, 16, 17], items: [3] }, { images: [18], items: [4] }],
  29: [{ images: [1, 2], items: [0] }, { images: [3, 4], items: [1, 2] }],
  30: [{ images: [1, 2], items: [0, 1] }],
  31: [{ images: [1], items: [0, 1] }],
};
