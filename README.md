# Orca Atlas

An interactive anatomy explorer for the Orca robotic hand, inspired by the supplied Human Atlas project. Built with React, TypeScript, Three.js, and Vite.

## Run

```sh
npm install
npm run dev
```

Open **http://localhost:3016**. Run commands from this workspace root; the original repositories remain in `src/`.

Node 22.12+ is recommended. This project also includes a local Node 22 runtime so npm scripts work on this machine, whose system Node is older. If an old system npm skips Vite's native optional dependency, install using a current Node/npm environment. No API keys, backend, or accounts are needed.

## Explore

- Switch between the real left and right hand models, using their original black/dark-grey structures and white coverings from the MJCF material assignments.
- Toggle Original hand colours to compare the source materials with a uniform grey inspection view. Selected parts turn red; clearing selection restores their original colours. The interface stays monochrome.
- Orbit, zoom, hover, and click any of the 34 visual meshes per hand.
- Search names, source mesh identifiers, rigid links, and descriptions. Press `/` to search.
- Browse seven assemblies, hide individual parts, or use Complete, Frame, and Skin presets.
- Read part explanations, hardware notes, nearest movable joints, and source identifiers.
- Isolate a piece, download its original STL, and follow official assembly instructions.
- Separate visible pieces with the exploded inventory slider.
- Move all 17 revolute joints within their source URDF limits. Try neutral, curl, and spread poses.
- Follow a five-stop guided tour. Phone controls use a component drawer and a compact inspector that leaves the model visible.
- Press Escape to clear selection/search; Reset restores the assembled neutral hand.

## V2 base hardware explorer

Open **http://localhost:3016/v2**. The **v1 · Original / v2 · Base** switch in
Components links between the existing explorer and the new subpage. Direct visits,
refreshes, `/v2/`, and `/v2/index.html` work on static hosts and Vercel.

V2 preserves the original layout, selection, search, visibility, skin/frame presets,
STL downloads, exploded inventory, camera controls, joint sliders and five-stop tour.
Its Assembly link opens `/assembly/v2`, with navigation back to the matching explorer.
Joint labels include abbreviations such as **I-MCP**; component labels include
**I-PP**, **I-IP**, and related source terms. Search accepts either form. The motion
panel explains the digit, joint and segment abbreviations.

The page uses **31 pieces from `src/orcahand_hardware/orca_v2/base`**: finger
structures, coverings, palm frame/core/skin, Dynamixel wrist support and the
Dynamixel forearm with two fans. Original STL bytes are copied without simplification.
The supplied v2 MJCF body hierarchy supplies placement, joint pivots, axes and
17 joint limits. Nonzero joint pivots are represented by fixed offset frames.
This is an illustrative articulated view, not a validated CAD assembly. Loose spools,
fasteners, molds, covers and alternate motor variants are not placed in this view.

The Base `STEP Files/Tower` directory supplies separate CAD exports of the
Dynamixel/Feetech forearm frames, front/back hulls, side plate, fan cover, spool
parts, cable holders and wrist hardware. These are individual parts, not a full
bottom-tower assembly. The viewer currently places the forearm frame and wrist
support using the supplied v2 joint frames. The reconstructed Gerber PCB has
been removed; the original electronics fabrication files remain in `src/`.

The right view uses the base hardware in its native coordinates. **The left view**
mirrors that right geometry into the left simulation frames; it is not the actual
left manufacturing variant. V2 now uses **the same mesh collision guard as v1**. Its 31 displayed meshes
(including skin) provide collision surfaces. The v2 MJCF supplies 69
contact exclusions, which are preserved exactly; rigidly attached pieces do not
collide with each other. Motion checks the entire swept path with 0.05 mm
clearance and stops before non-excluded mesh surfaces meet. Hidden and isolated
parts still constrain movement. Collision checks run in a worker, with sliders
and presets disabled until it is ready or if geometry fails to load. This is
kinematic collision checking, not a simulation of tendon dynamics or forces.

Run `npm run prepare:models` to regenerate both versions. V2’s packager is
`scripts/prepare_v2_models.py`; its outputs live in `public/models/v2`.
Hardware is credited to **ORCA Dexterity, Inc., CC BY 4.0**, with the supplied
license at `public/licenses/orcahand-hardware.txt`. Source-frame XML downloads are
reference fragments and require the original MJCF assets to simulate.

Run `npm run test:browser:v2` with the server running to verify v2 navigation,
search by abbreviation, PCB removal and source downloads, collision blocking with visible and hidden parts, loading failure handling, presets, the tour, mobile layouts,
version switching and direct routes. Screenshots are written to `test-results/`.

## Assembly guide

Open **http://localhost:3016/assembly** or choose **Assembly** in the top navigation.
The page provides plain-language checklists for all 29 published steps of the
[official ORCA guide](https://orca.ethz.ch/assembly/), grouped into six build
stages. It includes all 154 original diagrams in reading order, with each image's
source caption underneath and the associated checklist below its relevant views.
Images can be enlarged. The page also includes source links, step search, and links
that select the related part in the 3D explorer. Original diagram colours are preserved.

Tick instructions as you finish them. Progress is saved only in this browser's
local storage; no account is needed. Navigate directly to a step, for example
`/assembly#step-26`. Moving between steps does not mark tasks complete. Resetting
the checklist asks for confirmation.

The official directory has no standalone pages for steps **04, 27, and 28**.
The page preserves the source numbering and flags the gaps, including the
reference to skin casting in step 04. Missing procedures, exact routing details,
and commissioning should be obtained from the official project. Checking a box
does not verify physical assembly or safe operation.

Diagrams are served from `public/assembly/`, with original URLs recorded in
`diagrams.json` and attribution in `ATTRIBUTION.md`. All diagrams together are
approximately 96 MB; images farther down each step load lazily. Existing saved
checklist progress is preserved by the image-first layout. To
refresh the assets from the official site:

```sh
npm run sync:assembly
```

The downloader uses Python's standard library and skips existing image files.
The build also creates `dist/assembly/index.html` for static hosts that serve
folder index pages. The included Vercel configuration handles `/assembly` and
`/assembly/` directly.

## Assembly guide v2

Open **http://localhost:3016/assembly/v2** or select **v2 · From the video**
in the assembly guide. The v1 guide remains at `/assembly`.

The v2 subpage adapts the supplied **orcahand v2 · 1000-DX-R full assembly video**
(`videoplayback.mp4`, 92:06, right hand) into **30 steps across seven stages**.
Frame timestamps and chapter ranges link to the corresponding moment in the
[official YouTube video](https://www.youtube.com/watch?v=TgIz7HiyaoU).
It includes **171 original-resolution 4K stills**, captions, source
positions, associated checklists, image enlargement, search, and mobile navigation.
Every stage from finger preparation through calibration is covered. The video’s
corrections for the four bottom-tower magnets and both wrist adjusters are included.

The two versions store progress independently (`orca-atlas.assembly.v1` and
`orca-atlas.assembly.v2`). V2 deep links use `/assembly/v2#step-14`.
Production builds include `dist/assembly/v2/index.html`; Vercel rewrites support
both `/assembly/v2` and `/assembly/v2/`.

The stills come from the original 3840×2160 YouTube video at the reviewed
timestamps. Frames preserve the full original picture and overlays. The software stages
identify the demonstrated procedures and require the matching v2 software and
hand configuration. No unshown torque, winding-turn, or tension values are inferred.
The page is based on the visible demonstration and on-screen captions, not an
audio transcript. The source MP4 is not bundled with the site.

`app/assembly-v2-data.ts` defines the reviewed chapters, text, frame selections,
and explicit instruction groups. `public/assembly/v2/source.json` records the
source checksum, dimensions, duration, timestamps, and extraction method. To
regenerate the stills from a 4K download of the linked YouTube video with FFmpeg
and FFprobe installed:

```sh
npm run extract:assembly:v2 -- /path/to/videoplayback.mp4
npm run build
npm run test:assembly:v2
```

Browser checks require the local server running on port 3016 (or `APP_URL`) and
Chrome at `/usr/bin/google-chrome` (or `CHROME_PATH`). The original guide’s browser
regression checks remain available with `npm run test:assembly`.

## Data and scope

`public/models/` contains all **34 visual meshes from each v1 extended URDF**, with 17 revolute joints (16 finger joints and one wrist joint). Each hand contains 113,998 source triangles. Original STL geometry is preserved, with no simplification. Visual origins and joint axes, offsets, limits, and roll/pitch/yaw transforms come directly from the source URDF. The v2 base hardware has its own explorer at `/v2`, described below.

A visual mesh can represent an entire assembly. The simulation description does not expose every physical screw, tendon, actuator, or board component independently. Collision meshes and fixed offset frames are deliberately not counted as extra physical pieces. Short authored descriptions explain the available pieces; linked official assembly guides provide additional construction details.

Joint motion is a **kinematic preview with collision checks**. Sliders and pose presets use all 34 source collision meshes per hand, their URDF transforms, and the 18 source MJCF contact exclusions. Motion stops before non-excluded meshes touch, with a 0.05 mm clearance. Conservative sweeps check the path, including large slider jumps. Hidden and isolated parts still constrain movement. Checks run in a worker; motion is disabled if collision data cannot load. Reset and exploded inventory are display operations. This does not simulate contact forces, tendon dynamics, or hardware control. Names such as MP, PP, IP, and DP follow the source model, and do not imply an exact one-to-one human anatomical mapping.

Repackage assets after updating the local source repository:

```sh
npm run prepare:models
```

This uses Python's standard library. Both source URDFs are copied unchanged for reference; their `package://` mesh paths are intended for the original ROS package, not standalone URDF downloads.

## Validation

```sh
npm run check
npm test
npm run build
# With the dev server running, and Chrome installed:
npm run test:browser
npm run test:assembly
```

`npm test` validates every mesh buffer, source counts, finite vertices, the kinematic tree, joint limits, assembled physical dimensions, and collision blocking on both hands. A swept-motion regression also checks an obstacle between two clear endpoint poses. Browser checks cover search, direct mesh picking, drag-versus-click handling, visibility presets, isolation, explosion, joint posing, the guided tour, hand switching, the credits dialog, and desktop/phone layouts. Browser screenshots are saved to ignored `test-results/`.

Assembly checks additionally cover all diagram assets, step navigation, URL history, saved checklist state, reset/cancel, malformed storage, diagram zoom, part cross-links, and phone layouts.

The browser scripts use `/usr/bin/google-chrome` by default. Set `CHROME_PATH` for another Chromium executable, and `APP_URL` to test a different running server.

## Build and deploy

```sh
npm run build
npm run preview
```

The static output is in `dist/`. For Vercel, use **this workspace root** as the project root; `vercel.json` is included. The app can also be hosted on any static server at the domain root. Models are bundled locally; the only optional external runtime resource is Google Fonts, with system font fallbacks.

For a simple public link without Git:

1. Run `npm run build` in this folder.
2. Sign in at [Netlify Drop](https://app.netlify.com/drop) and drag the **dist** folder onto the page.
3. Open the assigned site URL and ensure project visibility is public. Share that URL; your computer does not need to stay on.

The upload includes the hand models and Assembly page. To publish later changes, rebuild and upload the new `dist` folder in the existing site's Deploys page. See [Netlify's drag-and-drop instructions](https://docs.netlify.com/deploy/create-deploys/#drag-and-drop).

## Credits

- [Human Atlas](https://human-atlas-seven.vercel.app/): interaction and design inspiration. Its original repository is preserved at `src/human-atlas/`; MIT notice at `public/licenses/human-atlas.txt`.
- [Orca Hand description](https://github.com/orcahand/orcahand_description): source geometry and robot description. Its supplied MIT license is preserved at `public/licenses/orcahand.txt`.
- [ORCA project, ETH Zurich Soft Robotics Lab](https://orca.ethz.ch/): hardware context and [official assembly guides](https://orca.ethz.ch/assembly/), paraphrased with links in the inspector. The project's website content is CC BY 4.0. Research: Christoph et al., *ORCA: An Open-Source, Reliable, Cost-Effective, Anthropomorphic Robotic Hand for Uninterrupted Dexterous Task Learning*, IROS 2025.

This is an independent educational explorer and does not imply endorsement by the original projects.
