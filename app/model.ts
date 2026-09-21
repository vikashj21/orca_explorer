export type Vec3 = [number, number, number];
export type GroupId = 'palm' | 'thumb' | 'index' | 'middle' | 'ring' | 'pinky' | 'base';
export type Layer = 'structure' | 'skin' | 'electronics';
export type Part = { id: string; name: string; abbreviation?: string; description: string; group: GroupId; layer: Layer; link: string; joint: string | null; linkMass: number | null; mesh: string; sourceMesh: string; sourceColor: string; scale: Vec3; xyz: Vec3; rpy: Vec3 };
export type Joint = { id: string; type: string; parent: string; child: string; xyz: Vec3; rpy: Vec3; axis: Vec3; lower: number; upper: number };
export type CollisionPart = { id: string; link: string; mesh: string; scale: Vec3; xyz: Vec3; rpy: Vec3 };
export type Atlas = { side: 'left' | 'right'; version: string; orientation?: Vec3; links: string[]; joints: Joint[]; parts: Part[]; collisions: CollisionPart[]; collisionExclusions: [string, string][] };
export type View = 'perspective' | 'front' | 'back' | 'side';
export type SceneState = { selected: string | null; hidden: string[]; isolate: boolean; explode: number; angles: Record<string, number>; view: View; reset: number; rotate: boolean; color: boolean };
export const GROUPS: { id: GroupId; name: string; color: string; detail: string }[] = [
  { id: 'palm', name: 'Palm & wrist', color: '#737373', detail: 'The foundation of every movement' },
  { id: 'thumb', name: 'Thumb', color: '#555555', detail: 'Four joints for versatile positioning' },
  { id: 'index', name: 'Index finger', color: '#777777', detail: 'Three joints from palm to fingertip' },
  { id: 'middle', name: 'Middle finger', color: '#929292', detail: 'Three joints along the central digit' },
  { id: 'ring', name: 'Ring finger', color: '#686868', detail: 'Three joints along the ring digit' },
  { id: 'pinky', name: 'Little finger', color: '#a0a0a0', detail: 'Three joints along the outer digit' },
  { id: 'base', name: 'Forearm & electronics', color: '#444444', detail: 'Support, enclosure, and peripherals' },
];
export const initialState: SceneState = { selected: null, hidden: [], isolate: false, explode: 0, angles: {}, view: 'perspective', reset: 0, rotate: false, color: true };
export function isVisible(part: Part, state: SceneState) { return state.isolate ? part.id === state.selected : !state.hidden.includes(part.id); }
export function jointName(id: string) { return id.replace(/^(right|left)_/, '').replace(/_/g, ' ').replace(/\b(abd|mcp|pip|dip)\b/g, s => ({ abd: 'abduction', mcp: 'MCP', pip: 'PIP', dip: 'DIP' }[s]!)); }
export function jointAbbreviation(id: string) {
  const [digit, joint] = id.replace(/^(right|left)_/, '').split('_');
  const prefix = { thumb: 'T', index: 'I', middle: 'M', ring: 'R', pinky: 'P' }[digit];
  return prefix && joint ? `${prefix}-${joint.toUpperCase()}` : 'WR';
}
export function partName(part: Part) { return part.abbreviation ? `${part.name} (${part.abbreviation})` : part.name; }
export const degrees = (radians: number) => radians * 180 / Math.PI;
