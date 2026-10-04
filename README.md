# ORCA Atlas

An interactive 3D explorer for the ORCA robotic hand, built with React, TypeScript, Three.js, and Vite.

**[Try the live demo](https://orcaatlas.netlify.app/)**: explore the website without installing or building anything.

Explore v1 and v2 models, inspect and download parts, try exploded views, and move joints with collision checks. Assembly guides include diagrams and checklists with progress saved in your browser.

## Getting started

Use Node.js 22.12+ and run these commands from the project root:

```sh
npm install
npm run dev
```

Open [localhost:3016](http://localhost:3016). No API keys, backend, or accounts are needed.

| Page | Path |
| --- | --- |
| V1 explorer | `/` |
| V2 explorer | `/v2` |
| V1 assembly guide | `/assembly` |
| V2 assembly reference (outdated) | `/assembly/v2` |

## Development

```sh
npm run check     # TypeScript checks
npm test          # Model and collision checks
npm run build     # Production build in dist/
npm run preview   # Preview the production build
```

Deploy `dist/` to a static host. A Vercel configuration is included.

To regenerate model assets from the source repositories (requires Python 3):

```sh
git submodule update --init --recursive
npm run prepare:models
```

## Scope

Joint movement is a kinematic preview with collision checks, not a physics simulation. The v2 model is illustrative; its left-hand view mirrors the right-hand hardware rather than representing the manufactured left variant. Follow the official documentation when building a physical hand.
