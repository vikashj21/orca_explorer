import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { isVisible, partName, type Atlas, type Part, type SceneState } from './model';

type Props = { atlas: Atlas; state: SceneState; onSelect: (id: string) => void; onProgress: (value: number) => void; onError: (message: string) => void };
type Piece = { part: Part; mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>; home: THREE.Vector3; center: THREE.Vector3; size: THREE.Vector3; destination: THREE.Vector3 };
const orientation = (rpy: number[]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rpy[0], rpy[1], rpy[2], 'ZYX'));

export default function Scene({ atlas, state, onSelect, onProgress, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ state, onSelect, onProgress, onError });
  live.current = { state, onSelect, onProgress, onError };
  useEffect(() => {
    const container = host.current!;
    delete container.dataset.ready;
    const abort = new AbortController();
    let disposed = false, frame = 0, loaded = false;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { live.current.onError('The 3D viewer needs WebGL. Enable hardware acceleration or try a browser with WebGL support.'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    const tooltip = document.createElement('span'); tooltip.className = 'mesh-tooltip'; container.appendChild(tooltip);
    renderer.domElement.setAttribute('aria-label', 'Interactive Orca hand. Drag to orbit, scroll to zoom, or select a part. All parts are also available in the component list.');
    renderer.domElement.setAttribute('role', 'img');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .001, 30);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .09;
    controls.minDistance = .025;
    controls.maxDistance = 4;
    controls.autoRotateSpeed = 1;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8e8e8e, 1.6));
    for (const [position, intensity] of [[[-1, 2, 3], 2.2], [[2, 1, -2], 1.5], [[0, -1, 1], .5]] as [number[], number][]) {
      const light = new THREE.DirectionalLight(0xffffff, intensity);
      light.position.fromArray(position); scene.add(light);
    }
    const root = new THREE.Group();
    root.quaternion.copy(orientation(atlas.orientation ?? [-Math.PI / 2, 0, 0]));
    scene.add(root);
    const links = new Map(atlas.links.map(id => [id, new THREE.Group()]));
    const driven = new Map<string, THREE.Group>();
    const children = new Set(atlas.joints.map(j => j.child));
    for (const [id, group] of links) if (!children.has(id)) root.add(group);
    for (const joint of atlas.joints) {
      const anchor = new THREE.Group();
      anchor.position.fromArray(joint.xyz); anchor.quaternion.copy(orientation(joint.rpy));
      const rotation = new THREE.Group(); anchor.add(rotation);
      rotation.add(links.get(joint.child)!); links.get(joint.parent)!.add(anchor);
      if (joint.type === 'revolute') driven.set(joint.id, rotation);
    }
    const pieces: Piece[] = [];
    const loader = new STLLoader();
    const grid = new THREE.GridHelper(.8, 32, 0xbdbdbd, 0xd9d9d9);
    grid.position.y = -.002;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = .34;
    scene.add(grid);
    let currentExplosion = 0, previousLayout = '', previousFocus = '', previousAppearance = '', hovered: string | null = null;
    const targetPosition = new THREE.Vector3(), targetLook = new THREE.Vector3();
    let flying = false;
    function fit() {
      const s = live.current.state;
      const box = new THREE.Box3();
      for (const p of pieces) if (isVisible(p.part, s)) box.union(new THREE.Box3().setFromObject(p.mesh));
      if (box.isEmpty()) box.setFromCenterAndSize(new THREE.Vector3(.08, .2, 0), new THREE.Vector3(.2, .4, .15));
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const direction = s.view === 'front' ? new THREE.Vector3(0, 0, 1) : s.view === 'back' ? new THREE.Vector3(0, 0, -1) : s.view === 'side' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(atlas.side === 'right' ? -.7 : .7, .24, 1);
      if (s.explode > .01) direction.set(0, 0, 1);
      // Bounding sphere fits every orientation, with tighter vertical framing for the assembled hand.
      const vertical = s.explode > .01 ? size.y : Math.max(size.y, size.z);
      const horizontal = s.view === 'side' ? size.z : Math.max(size.x, size.z);
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const distance = Math.max(vertical / 2 / Math.tan(halfFov), horizontal / 2 / Math.tan(halfFov) / camera.aspect) * 1.28 + size.z / 2;
      targetLook.copy(center);
      targetPosition.copy(center).addScaledVector(direction.normalize(), Math.max(distance, .065));
      flying = true;
    }
    function layout() {
      const visible = pieces.filter(p => isVisible(p.part, live.current.state));
      const padding = .022;
      const area = visible.reduce((sum, p) => sum + (p.size.x + padding) * (p.size.y + padding), 0);
      const width = Math.max(.22, Math.sqrt(area * Math.max(.5, camera.aspect)) * 1.25);
      let x = 0, y = 0, rowHeight = 0;
      const slots: { p: Piece; x: number; y: number }[] = [];
      for (const p of visible) {
        const w = p.size.x + padding, h = p.size.y + padding;
        if (x > 0 && x + w > width) { y += rowHeight; x = 0; rowHeight = 0; }
        slots.push({ p, x: x + w / 2, y: y + h / 2 });
        x += w; rowHeight = Math.max(rowHeight, h);
      }
      const totalHeight = y + rowHeight;
      for (const { p, x, y } of slots) {
        const desired = new THREE.Vector3(x - width / 2 + .08, totalHeight / 2 - y + .22, 0);
        const offset = desired.sub(p.center);
        const parent = p.mesh.parent!;
        const inverse = new THREE.Matrix4().copy(parent.matrixWorld).invert();
        const worldHome = p.home.clone().applyMatrix4(parent.matrixWorld);
        p.destination.copy(worldHome.add(offset).applyMatrix4(inverse));
      }
    }
    function appearance() {
      const s = live.current.state;
      for (const p of pieces) {
        p.mesh.visible = isVisible(p.part, s);
        const selected = p.part.id === s.selected;
        const color = s.color ? p.part.sourceColor : '#a0a0a0';
        p.mesh.material.color.set(selected ? '#e32626' : color);
        p.mesh.material.emissive.set(selected ? '#660000' : p.part.id === hovered ? '#ffffff' : '#000000');
        p.mesh.material.emissiveIntensity = selected ? .12 : .035;
        p.mesh.material.roughness = p.part.layer === 'skin' ? .8 : .48;
        p.mesh.material.metalness = p.part.layer === 'skin' ? .02 : .16;
      }
    }
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    function hit(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(pieces.filter(p => p.mesh.visible).map(p => p.mesh), false)[0]?.object.userData.id as string | undefined;
    }
    let down: { x: number; y: number; time: number } | null = null;
    const pointers = new Set<number>();
    function pointerDown(e: PointerEvent) { pointers.add(e.pointerId); down = pointers.size === 1 ? { x: e.clientX, y: e.clientY, time: performance.now() } : null; flying = false; }
    function pointerUp(e: PointerEvent) {
      pointers.delete(e.pointerId);
      if (down && performance.now() - down.time < 600 && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) { const id = hit(e); if (id) live.current.onSelect(id); }
      down = null;
    }
    function pointerMove(e: PointerEvent) { const rect = container.getBoundingClientRect(); tooltip.style.left = `${Math.min(e.clientX - rect.left + 12, rect.width - 190)}px`; tooltip.style.top = `${e.clientY - rect.top + 16}px`; if (e.buttons || e.pointerType === 'touch') return; const id = hit(e) ?? null; if (hovered !== id) { hovered = id; appearance(); container.style.cursor = id ? 'pointer' : 'grab'; container.dataset.hovered = id ?? ''; const hoveredPart = atlas.parts.find(p => p.id === id); tooltip.textContent = hoveredPart ? partName(hoveredPart) : ''; tooltip.style.display = id ? 'block' : 'none'; } }
    function pointerCancel(e: PointerEvent) { pointers.delete(e.pointerId); down = null; }
    function stopFlight() { flying = false; }
    function pointerLeave() { hovered = null; tooltip.style.display = 'none'; appearance(); }
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    renderer.domElement.addEventListener('pointermove', pointerMove);
    renderer.domElement.addEventListener('pointercancel', pointerCancel);
    renderer.domElement.addEventListener('wheel', stopFlight);
    renderer.domElement.addEventListener('pointerleave', pointerLeave);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix();
      previousLayout = ''; if (loaded) { layout(); fit(); }
    });
    resize.observe(container);
    let count = 0;
    Promise.all(atlas.parts.map(async part => {
      const response = await fetch(part.mesh, { signal: abort.signal });
      if (!response.ok) throw new Error(`Could not load ${part.name}. Reload to try again.`);
      const data = await response.arrayBuffer();
      if (disposed) return;
      const geometry = loader.parse(data);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }));
      mesh.position.fromArray(part.xyz); mesh.quaternion.copy(orientation(part.rpy)); mesh.scale.fromArray(part.scale);
      mesh.userData.id = part.id; links.get(part.link)!.add(mesh);
      pieces.push({ part, mesh, home: mesh.position.clone(), center: new THREE.Vector3(), size: new THREE.Vector3(), destination: mesh.position.clone() });
      live.current.onProgress(Math.round(++count / atlas.parts.length * 95));
    })).then(() => {
      if (disposed) return;
      pieces.sort((a, b) => atlas.parts.indexOf(a.part) - atlas.parts.indexOf(b.part));
      root.updateMatrixWorld(true);
      for (const p of pieces) { const box = new THREE.Box3().setFromObject(p.mesh); box.getCenter(p.center); box.getSize(p.size); }
      if (atlas.orientation) grid.position.y = new THREE.Box3().setFromObject(root).min.y - .002;
      loaded = true; layout(); appearance(); fit();
      camera.position.copy(targetPosition); controls.target.copy(targetLook); controls.update(); flying = false;
      container.dataset.ready = 'true'; live.current.onProgress(100);
    }).catch(error => { if (!disposed && error.name !== 'AbortError') live.current.onError(error.message); });
    let lastTime = performance.now();
    function animate(now: number) {
      frame = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, .05); lastTime = now;
      if (loaded) {
        const s = live.current.state;
        for (const j of atlas.joints) if (driven.has(j.id)) driven.get(j.id)!.quaternion.setFromAxisAngle(new THREE.Vector3(...j.axis).normalize(), s.explode > 0 ? 0 : Math.max(j.lower, Math.min(j.upper, s.angles[j.id] ?? 0)));
        root.updateMatrixWorld(true);
        const layoutKey = JSON.stringify([s.hidden, s.isolate, s.isolate ? s.selected : null]);
        if (layoutKey !== previousLayout) {
          // Calculate destinations in the neutral, assembled frame.
          for (const p of pieces) p.mesh.position.copy(p.home);
          for (const rotation of driven.values()) rotation.quaternion.identity();
          root.updateMatrixWorld(true); layout(); previousLayout = layoutKey;
          for (const j of atlas.joints) if (driven.has(j.id)) driven.get(j.id)!.quaternion.setFromAxisAngle(new THREE.Vector3(...j.axis).normalize(), s.explode > 0 ? 0 : s.angles[j.id] ?? 0);
        }
        currentExplosion = THREE.MathUtils.damp(currentExplosion, s.explode / 100, 9, dt);
        for (const p of pieces) p.mesh.position.lerpVectors(p.home, p.destination, currentExplosion);
        scene.updateMatrixWorld(true);
        const appearanceKey = JSON.stringify([s.hidden, s.selected, s.isolate, s.color]);
        if (appearanceKey !== previousAppearance) { appearance(); previousAppearance = appearanceKey; }
        const focusKey = JSON.stringify([s.view, s.reset, s.isolate, s.isolate ? s.selected : null, s.explode > 0, s.hidden]);
        if (focusKey !== previousFocus || (Math.abs(currentExplosion - s.explode / 100) > .002)) { fit(); previousFocus = focusKey; }
        grid.visible = !s.isolate && currentExplosion < .02;
        controls.autoRotate = s.rotate && !s.explode;
        if (flying) {
          camera.position.lerp(targetPosition, 1 - Math.exp(-8 * dt)); controls.target.lerp(targetLook, 1 - Math.exp(-8 * dt));
          if (camera.position.distanceTo(targetPosition) < .0001) flying = false;
        }
        controls.update();
      }
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true; abort.abort(); cancelAnimationFrame(frame); resize.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);
      renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointermove', pointerMove);
      renderer.domElement.removeEventListener('pointercancel', pointerCancel);
      renderer.domElement.removeEventListener('wheel', stopFlight);
      renderer.domElement.removeEventListener('pointerleave', pointerLeave);
      for (const p of pieces) { p.mesh.geometry.dispose(); p.mesh.material.dispose(); }
      grid.geometry.dispose(); (grid.material as THREE.Material).dispose(); renderer.dispose(); renderer.domElement.remove(); tooltip.remove();
    };
  }, [atlas]);
  return <div ref={host} className="scene" data-testid="scene" />;
}
