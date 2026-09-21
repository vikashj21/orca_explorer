import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, CircleCheck, ExternalLink, Hand, ListChecks, Maximize2, RotateCcw, Search, X } from 'lucide-react';
import { ASSEMBLY_PANELS as V1_PANELS } from './assembly-panels';
import { ASSEMBLY_SOURCE, ASSEMBLY_STEPS as V1_STEPS, STAGES as V1_STAGES, stepSource, type AssemblyStep } from './assembly-data';

import { V2_CHAPTERS, V2_STEPS, V2_STAGES, V2_PANELS, V2_DIAGRAMS, V2_SOURCE_TITLE, V2_VIDEO_URL, v2VideoAt, timestamp } from './assembly-v2-data';

import { V2_MANUAL, manualImage, type ManualDiagram } from './assembly-v2-manual';

type Diagram = { src: string; source: string; caption?: string; seconds?: number };
type DiagramMap = Record<string, Diagram[]>;
const itemKey = (number: number, index: number) => `${number}:${index}`;
function readProgress(STORAGE_KEY: string, validKeys: Set<string>): string[] {
  try { const data: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(data) ? [...new Set(data.filter((key): key is string => typeof key === 'string' && validKeys.has(key)))] : []; }
  catch { return []; }
}
function stepFromHash(steps: AssemblyStep[]) {
  const number = Number(location.hash.replace('#step-', ''));
  return steps.find(step => step.number === number)?.number ?? steps[0].number;
}

export default function Assembly({ version = 'v1' }: { version?: 'v1' | 'v2' }) {
  const isV2 = version === 'v2';
  const ASSEMBLY_STEPS = isV2 ? V2_STEPS : V1_STEPS;
  const STAGES = isV2 ? V2_STAGES : V1_STAGES;
  const ASSEMBLY_PANELS = isV2 ? V2_PANELS : V1_PANELS;
  const STORAGE_KEY = `orca-atlas.assembly.${version}`;
  const validKeys = useMemo(() => new Set(ASSEMBLY_STEPS.flatMap(step => step.items.map((_, i) => itemKey(step.number, i)))), [ASSEMBLY_STEPS]);
  const [current, setCurrent] = useState(() => stepFromHash(ASSEMBLY_STEPS));
  const [checked, setChecked] = useState<string[]>(() => readProgress(STORAGE_KEY, validKeys));
  const [query, setQuery] = useState('');
  const [diagrams, setDiagrams] = useState<DiagramMap>(isV2 ? V2_DIAGRAMS : {});
  const [diagramIndex, setDiagramIndex] = useState(0);
  const [diagramError, setDiagramError] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const content = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const zoom = useRef<HTMLDialogElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const sourceDialog = useRef<HTMLDialogElement>(null);
  const index = ASSEMBLY_STEPS.findIndex(step => step.number === current);
  const step = ASSEMBLY_STEPS[index];
  const number = String(step.number).padStart(2, '0');
  const images = diagrams[number] ?? [];
  const image = images[diagramIndex];
  const completed = ASSEMBLY_STEPS.filter(s => s.items.every((_, i) => checked.includes(itemKey(s.number, i))));
  const done = step.items.every((_, i) => checked.includes(itemKey(step.number, i)));
  const progress = Math.round(checked.length / validKeys.size * 100);
  const matches = useMemo(() => ASSEMBLY_STEPS.filter(s => `${s.number.toString().padStart(2, '0')} ${s.title} ${s.intro} ${s.items.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())), [query, ASSEMBLY_STEPS]);

  useEffect(() => {
    document.title = isV2 ? 'Assembly v2 — Orca Atlas' : 'Assembly guide — Orca Atlas';
    const controller = new AbortController();
    if (!isV2) fetch('/assembly/diagrams.json', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error('Missing diagram catalogue'); return r.json(); }).then(setDiagrams).catch(e => { if (e.name !== 'AbortError') setDiagramError(true); });
    const change = () => { setDiagramIndex(0); setCurrent(stepFromHash(ASSEMBLY_STEPS)); };
    window.addEventListener('hashchange', change);
    return () => { controller.abort(); window.removeEventListener('hashchange', change); };
  }, [isV2, ASSEMBLY_STEPS]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [checked, STORAGE_KEY]);
  useEffect(() => {
    setDiagramIndex(0); setMenuOpen(false);
    content.current?.scrollTo({ top: 0 });
  }, [current]);

  function go(number: number) {
    setDiagramIndex(0);
    setCurrent(number);
    if (location.hash !== `#step-${String(number).padStart(2, '0')}`) location.hash = `step-${String(number).padStart(2, '0')}`;
    setMenuOpen(false);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function toggle(key: string) { setChecked(previous => previous.includes(key) ? previous.filter(k => k !== key) : [...previous, key]); }
  function markStep() {
    const keys = step.items.map((_, i) => itemKey(step.number, i));
    setChecked(previous => done ? previous.filter(key => !keys.includes(key)) : [...new Set([...previous, ...keys])]);
  }

  return <div className={`assembly-shell ${isV2 ? 'assembly-v2' : ''}`}>
    <header className="topbar assembly-topbar">
      <a className="brand" href="/" aria-label="Orca Atlas home"><span className="brand-icon"><Hand size={23} strokeWidth={1.5} /></span><span>orca<span className="brand-light">atlas</span><span className="brand-period">.</span></span></a>
      <div className="header-divider" /><span className="header-description">From individual parts to a working hand</span>
      <nav className="page-navigation" aria-label="Pages"><a href={version === 'v2' ? '/v2' : '/'}>Explorer</a><a href="/assembly" aria-current="page">Assembly</a></nav>
      {isV2 ? <button className="assembly-official" onClick={() => sourceDialog.current?.showModal()}>Video reference <BookOpen size={14} /></button> : <a className="assembly-official" href={ASSEMBLY_SOURCE} target="_blank" rel="noreferrer">Official guide <ArrowUpRight size={14} /></a>}
    </header>
    <div className="assembly-workspace">
      <aside className={`assembly-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Assembly steps">
        <div className="assembly-sidebar-heading"><div><span className="overline">THE BUILD JOURNEY</span><h2>One piece at a time.</h2></div><button className="icon-button assembly-menu-close" aria-label="Close step list" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
        <nav className="assembly-version-switch" aria-label="Assembly version"><a href="/assembly" aria-current={!isV2 ? 'page' : undefined}>v1 <span>Written guide</span></a><a href="/assembly/v2" aria-current={isV2 ? 'page' : undefined}>v2 <span>Video & diagrams</span></a></nav>
        <div className="build-progress"><div><span>{completed.length} of {ASSEMBLY_STEPS.length} steps complete</span><strong>{progress}%</strong></div><progress aria-label="Assembly checklist progress" max="100" value={progress} /><small>{storageError ? 'Progress is available for this visit only.' : 'Your checklist is saved in this browser.'}</small></div>
        <div className="assembly-search"><Search size={16} /><input aria-label="Find an assembly step" placeholder="Find a step, part, or screw…" value={query} onChange={e => setQuery(e.target.value)} />{query && <button aria-label="Clear step search" onClick={() => setQuery('')}><X size={14} /></button>}</div>
        <nav className="assembly-step-list" aria-label="Build stages">{STAGES.map((stage, stageIndex) => {
          const steps = matches.filter(s => s.stage === stageIndex);
          if (!steps.length) return null;
          return <section key={stage}><h3><span>{String(stageIndex + 1).padStart(2, '0')}</span>{stage}</h3>{steps.map(s => {
            const isComplete = completed.some(c => c.number === s.number);
            return <button key={s.number} aria-current={s.number === current ? 'step' : undefined} aria-label={`Step ${String(s.number).padStart(2, '0')}: ${s.title}${isComplete ? ', complete' : ''}`} onClick={() => go(s.number)}><span className={`step-marker ${isComplete ? 'is-complete' : ''}`}>{isComplete ? <Check size={12} /> : String(s.number).padStart(2, '0')}</span><span>{s.title}</span>{s.number === current && <ArrowRight size={13} />}</button>})}</section>;
        })}{!matches.length && <p className="assembly-no-results">No matching steps. Try “wrist”, “tendon”, or “M4”.</p>}</nav>
        <div className="assembly-sidebar-bottom"><a href={version === 'v2' ? '/v2' : '/'}><ArrowLeft size={15} /> Back to the 3D explorer</a><button onClick={() => resetDialog.current?.showModal()}><RotateCcw size={13} /> Reset checklist</button></div>
      </aside>
      <main ref={content} className="assembly-content" id="assembly-content">
        <div className="assembly-mobile-bar"><button onClick={() => setMenuOpen(true)}><ListChecks size={17} /> All steps <ChevronDown size={14} /></button><a className="assembly-mobile-version" href={isV2 ? '/assembly' : '/assembly/v2'}>{isV2 ? 'v1 guide' : 'v2 guide'}</a><span>{completed.length}/{ASSEMBLY_STEPS.length} complete</span></div>
        <article className="assembly-article">
          <div className="assembly-breadcrumb"><a href="/assembly">Assembly</a><span>/</span>{STAGES[step.stage]}<span className="assembly-version">ORCA {version}</span></div>
          <header className="assembly-step-header"><div><span className="overline">{isV2 ? 'BUILD STEP' : 'OFFICIAL STEP'} {number} <span className="heading-dot" /> {index + 1} OF {ASSEMBLY_STEPS.length} {isV2 ? 'BUILD STEPS' : 'PUBLISHED STEPS'}</span><h1 ref={heading} tabIndex={-1}>{step.title}</h1><p>{step.intro}</p></div><span className="large-step-number" aria-hidden="true">{number}</span></header>
          {isV2 && <div className="assembly-video-range"><span>IN THE SOURCE VIDEO</span><a className="assembly-time-link" href={v2VideoAt(V2_CHAPTERS[index].start)} target="_blank" rel="noreferrer" aria-label={`Watch this chapter on YouTube at ${timestamp(V2_CHAPTERS[index].start)}`}><strong>{timestamp(V2_CHAPTERS[index].start)} – {timestamp(V2_CHAPTERS[index].end)}</strong> <ArrowUpRight size={12} /></a><span>1000-DX-R · right hand</span></div>}
          {isV2 && index === 0 && <section className="assembly-preflight"><div><BookOpen size={19} /><h2>The full build, one still at a time.</h2></div><p>Follow 30 steps adapted from the 92-minute v2 assembly video. Study the frames, read the instructions underneath, and tick them off as you build. Select a timestamp to watch that moment in the official YouTube video. Annotated diagrams from the supplied manual accompany the matching tasks.</p><details><summary>Before you start: parts, tools & terminology</summary><div className="preflight-details"><p>Use the v2 1000-DX-R parts and hardware shown in the recording. Have tendons, skins, bearings, pins, fasteners, magnets, tubing, motors, fans, and electronics ready. The demonstrations use tweezers, drivers, pliers, cutters, a measuring tool, and adhesive.</p><p>DP = distal phalange (fingertip); PP = proximal phalange; AP = abduction phalange (finger base); TP = the final thumb base in the video; carpal = palm body. Use the matching v2 software setup for motor configuration, tensioning, and calibration.</p><p>Stills are extracted from the original YouTube video at 3840 × 2160, preserving its full frame and on-screen overlays. Step numbers organise this guide; timestamps refer to the recording, not build-time estimates.</p></div></details></section>}
          {!isV2 && step.number === 0 && <section className="assembly-preflight"><div><BookOpen size={19} /><h2>A practical companion to the official guide.</h2></div><p>Study each image and read the text underneath, then tick off its checklist instructions when you are done. PP means proximal finger segment; IP is the source’s fingertip segment; carpal means palm body.</p><details><summary>Before you start: parts, tools & source gaps</summary><div className="preflight-details"><p>Use the official parts list and printed files for your hand revision. Keep the correct screws, tendons, PTFE tubing, motors, and prepared skin organised by stage. The guide uses tweezers, pliers, a sharp blade, screwdrivers, and a small tapping tool.</p><p><strong>Missing source steps:</strong> the published directory has no standalone pages for 04, 27, or 28. Step 01 refers to 04 for skin casting. Obtain those instructions from the ORCA project before the corresponding work; they are not replaced by this checklist.</p><div className="assembly-resource-links"><a href={ASSEMBLY_SOURCE} target="_blank" rel="noreferrer">CAD & assembly downloads <ArrowUpRight size={13} /></a><a href="https://orca.ethz.ch/" target="_blank" rel="noreferrer">Project, parts list & documentation <ArrowUpRight size={13} /></a></div></div></details></section>}
          <section className="assembly-instructions" aria-labelledby="instructions-title">
            <div className="assembly-section-heading"><h2 id="instructions-title">Follow the images, one task at a time</h2><span>{step.items.filter((_, i) => checked.includes(itemKey(step.number, i))).length}/{step.items.length} done</span></div>
            <p className="assembly-reading-hint">Study each view, then tick the instructions underneath. Select an image to enlarge it.</p>
            <div className="assembly-panels">{ASSEMBLY_PANELS[step.number].map((panel, panelIndex) => <section className="assembly-instruction-card" key={`${number}-${panelIndex}`} aria-label={`Instruction group ${panelIndex + 1}`}>
              <div className={`assembly-panel-images ${panel.images.length === 1 ? 'single-image' : ''}`}>
                {panel.images.map(n => <DiagramFigure key={`${number}-${n}`} isVideo={isV2} image={images[n - 1]} number={number} title={step.title} index={n} failed={diagramError} source={isV2 ? images[n - 1]?.src ?? '/assembly/v2/source.json' : stepSource(step.number)} onEnlarge={() => { setDiagramIndex(n - 1); zoom.current?.showModal(); }} />)}
              </div>
              {isV2 && V2_MANUAL[step.number]?.[panelIndex] && <ManualReferences diagrams={V2_MANUAL[step.number][panelIndex]} />}
              {panel.items.length > 0 && <ol className="assembly-checklist">{panel.items.map(i => <li key={itemKey(step.number, i)} className={checked.includes(itemKey(step.number, i)) ? 'checked' : ''} value={i + 1}><label><input type="checkbox" checked={checked.includes(itemKey(step.number, i))} onChange={() => toggle(itemKey(step.number, i))} /><span><small>CHECKLIST {String(i + 1).padStart(2, '0')}</small>{step.items[i]}</span></label></li>)}</ol>}
              {panel.note && <p className="assembly-panel-note">{panel.note}</p>}
            </section>)}</div>
            {isV2 ? <p className="diagram-credit">Stills from <a href={V2_VIDEO_URL} target="_blank" rel="noreferrer">{V2_SOURCE_TITLE} <ArrowUpRight size={11} /></a>. Original on-screen annotations are preserved; captions and checklists are adapted for this guide. Additional diagrams are extracted from the supplied manual-part-a.pdf; their PDF page numbers are shown separately.</p> : <p className="diagram-credit">Original diagrams and captions: <a href={stepSource(step.number)} target="_blank" rel="noreferrer">ORCA project, ETH Zurich <ArrowUpRight size={11} /></a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Diagram colours are preserved. Checklist instructions are condensed from the source.</p>}
            <div className="assembly-step-notes"><div className="assembly-checkpoint"><CircleCheck size={18} /><div><h3>Before you move on</h3><p>{step.check}</p></div></div>{step.note && <div className="assembly-note"><span>GUIDE NOTE</span><p>{step.note}</p></div>}<div className="step-reference-links">{!isV2 && <a href={stepSource(step.number)} target="_blank" rel="noreferrer">Read the full official step <ArrowUpRight size={14} /></a>}{step.part && <a href={`${isV2 ? "/v2" : "/"}?part=${step.part}`}><Hand size={15} /> Inspect the related part in 3D <ArrowRight size={14} /></a>}{!isV2 && step.number === 20 && <><a href="https://emanual.robotis.com/docs/en/dxl/dxl-quick-start-insert/" target="_blank" rel="noreferrer">ROBOTIS connection guide <ArrowUpRight size={14} /></a><a href="https://emanual.robotis.com/docs/en/software/dynamixel/dynamixel_wizard2/" target="_blank" rel="noreferrer">DYNAMIXEL Wizard 2.0 <ArrowUpRight size={14} /></a></>}{!isV2 && step.number === 0 && <a href="https://www.animatedknots.com/ashley-stopper-knot" target="_blank" rel="noreferrer">Learn the Ashley Stopper knot <ArrowUpRight size={14} /></a>}</div></div>
          </section>
          <div className="assembly-step-actions"><button className={`step-complete-button ${done ? 'completed' : ''}`} onClick={markStep} aria-pressed={done}><Check size={17} />{done ? 'Step complete — undo' : 'Mark this step complete'}</button><span role="status">{done ? 'Added to your completed steps.' : 'Tick each instruction after completing it.'}</span></div>
          <nav className="assembly-pagination" aria-label="Navigate assembly steps"><button disabled={index === 0} onClick={() => go(ASSEMBLY_STEPS[index - 1].number)}><ArrowLeft size={18} /><span><small>PREVIOUS STEP</small>{index > 0 ? ASSEMBLY_STEPS[index - 1].title : 'You’re at the beginning'}</span></button>{index < ASSEMBLY_STEPS.length - 1 ? <button onClick={() => go(ASSEMBLY_STEPS[index + 1].number)}><span><small>NEXT STEP</small>{ASSEMBLY_STEPS[index + 1].title}</span><ArrowRight size={18} /></button> : <a href="/"><span><small>BACK TO EXPLORING</small>See the complete hand</span><ArrowRight size={18} /></a>}</nav>
          {isV2 ? <footer className="assembly-attribution"><p>Source: <a href={V2_VIDEO_URL} target="_blank" rel="noreferrer">{V2_SOURCE_TITLE}</a> on YouTube (92:06). Frames retain their original colours and annotations. Written instructions are condensed from the visible demonstrations and captions.</p><p>Step numbering is editorial. Refer to the timestamped recording for motion details and the matching v2 software for commissioning. Checklist progress records your work in this browser.</p></footer> : <footer className="assembly-attribution"><p>Plain-language adaptation of the <a href={stepSource(step.number)} target="_blank" rel="noreferrer">official ORCA assembly guide</a>, credited to the ORCA project at ETH Zurich under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Text is condensed and reorganised; consult the source for every illustrated routing detail.</p><p>Source numbering is preserved. Steps 04, 27, and 28 have no standalone pages in the published directory. Checklist progress does not verify physical assembly or calibration.</p></footer>}
        </article>
      </main>
    </div>
    <dialog ref={zoom} className="assembly-zoom" onClick={e => { if (e.target === zoom.current) zoom.current.close(); }}><div><span>STEP {number} · {isV2 ? 'FRAME' : 'DIAGRAM'} {diagramIndex + 1}{isV2 && image?.seconds !== undefined && <> · <a href={v2VideoAt(image.seconds)} target="_blank" rel="noreferrer" aria-label={`Watch enlarged frame on YouTube at ${timestamp(image.seconds)}`}>{timestamp(image.seconds)} ↗</a></>}</span><button className="icon-button" aria-label="Close enlarged diagram" onClick={() => zoom.current?.close()}><X size={20} /></button></div>{image && <img src={image.src} alt={isV2 ? image.caption : `Enlarged official diagram ${diagramIndex + 1} for ${step.title}`} />}{isV2 ? <p className="assembly-zoom-caption">{image?.caption}</p> : <a href={stepSource(step.number)} target="_blank" rel="noreferrer">Open full official instructions <ArrowUpRight size={14} /></a>}</dialog>
    {isV2 && <dialog ref={sourceDialog} className="assembly-source-dialog" onClick={e => { if (e.target === sourceDialog.current) sourceDialog.current.close(); }}><div><span className="overline">SOURCE RECORDING</span><button className="icon-button" aria-label="Close video reference" onClick={() => sourceDialog.current?.close()}><X size={20} /></button></div><h2>{V2_SOURCE_TITLE}</h2><p><a className="assembly-time-link" href={V2_VIDEO_URL} target="_blank" rel="noreferrer">Watch the official video on YouTube <ArrowUpRight size={14} /></a></p><p>The original YouTube recording runs for 92 minutes and 6 seconds and demonstrates the right-hand build.</p><p>This guide turns the video into 30 steps with original stills. Select any frame timestamp to watch that moment in the official YouTube video.</p><p>Current chapter: <a className="assembly-time-link" href={v2VideoAt(V2_CHAPTERS[index].start)} target="_blank" rel="noreferrer" aria-label={`Watch this chapter on YouTube at ${timestamp(V2_CHAPTERS[index].start)}`}><strong>{timestamp(V2_CHAPTERS[index].start)} – {timestamp(V2_CHAPTERS[index].end)}</strong> <ArrowUpRight size={12} /></a>.</p><p>The stills are 3840 × 2160; enlarge a still to inspect the original detail. Captions and checklists are adapted from the visible demonstrations and on-screen instructions.</p></dialog>}
    <dialog ref={resetDialog} className="assembly-reset-dialog"><h2>Reset your checklist?</h2><p>This clears completed instructions saved in this browser.</p><div><button onClick={() => resetDialog.current?.close()}>Keep progress</button><button onClick={() => { setChecked([]); resetDialog.current?.close(); }}>Reset progress</button></div></dialog>
  </div>;
}

function DiagramFigure({ isVideo = false, image, number, title, index, failed, source, onEnlarge }: {
  isVideo?: boolean; image?: Diagram; number: string; title: string; index: number; failed: boolean; source: string; onEnlarge: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return <figure className="diagram-figure" data-diagram={index}>
    {image && !imageFailed ? <button className="diagram-expand" onClick={onEnlarge} aria-label={`Enlarge assembly ${isVideo ? 'frame' : 'diagram'} ${index}`}>
      <img src={image.src} loading={index <= 2 ? 'eager' : 'lazy'} decoding="async" alt={isVideo ? image.caption : `Official step ${number}, ${title}: diagram ${index}`} onError={() => setImageFailed(true)} />
      <span><Maximize2 size={14} /> Enlarge</span>
    </button> : <div className="diagram-placeholder"><BookOpen size={26} /><p>{imageFailed || failed ? 'This diagram could not be loaded.' : (isVideo ? 'Loading the video frame…' : 'Loading the official diagram…')}</p><a href={source} target="_blank" rel="noreferrer">{isVideo ? 'Open the frame' : 'View the official diagram'} <ExternalLink size={14} /></a></div>}
    <figcaption><span>{isVideo ? 'VIDEO FRAME' : 'DIAGRAM'} {String(index).padStart(2, '0')}{image?.seconds !== undefined && <a className="assembly-time-link" href={v2VideoAt(image.seconds)} target="_blank" rel="noreferrer" aria-label={`Watch on YouTube at ${timestamp(image.seconds)}`}><time dateTime={`PT${image.seconds}S`}>{timestamp(image.seconds)} ↗</time></a>}</span><p>{isVideo && number === '03' && index === 3 ? image?.caption?.split(/\b(TWO)\b/).map((part, i) => part === 'TWO' ? <strong key={i}>{part}</strong> : part) : image?.caption || 'Reference view — follow the illustrated orientation and the checklist below.'}</p></figcaption>
  </figure>;
}

function ManualReferences({ diagrams }: { diagrams: ManualDiagram[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<ManualDiagram>(diagrams[0]);
  return <section className="assembly-manual" aria-label="Supplementary manual diagrams">
    <div className="assembly-manual-heading"><BookOpen size={16} /><h3>Assembly manual diagrams</h3><span>PART A</span></div>
    <p className="assembly-manual-hint">Match the numbered routes and part orientation. PDF numbering follows the manual’s sequence; the checklist below follows the video. Check illustrated hardware against your kit where the sources differ.</p>
    <div className="assembly-manual-images">{diagrams.map(diagram => <figure className="manual-figure" key={diagram.page}>
      <button className="manual-expand" aria-label={`Enlarge manual page ${diagram.page}`} onClick={() => { setSelected(diagram); dialog.current?.showModal(); }}>
        <img src={manualImage(diagram.page)} alt={diagram.caption} loading="lazy" decoding="async" />
        <span><Maximize2 size={14} /> Enlarge</span>
      </button>
      <figcaption><span>MANUAL · PAGE {String(diagram.page).padStart(2, '0')}</span><p>{diagram.caption}</p></figcaption>
    </figure>)}</div>
    <dialog ref={dialog} className="assembly-zoom manual-zoom" onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div><span>MANUAL PART A · PAGE {selected.page}</span><button className="icon-button" aria-label="Close enlarged manual diagram" onClick={() => dialog.current?.close()}><X size={20} /></button></div>
      <img src={manualImage(selected.page)} alt={selected.caption} />
      <p className="assembly-zoom-caption">{selected.caption} <a href={manualImage(selected.page)} target="_blank" rel="noreferrer">Open full-resolution image ↗</a></p>
    </dialog>
  </section>;
}
