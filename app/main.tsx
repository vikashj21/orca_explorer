import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import './assembly.css';
const Assembly = lazy(() => import('./Assembly'));
const isAssembly = ['/assembly', '/assembly/', '/assembly/index.html'].includes(window.location.pathname);
const isAssemblyV2 = ['/assembly/v2', '/assembly/v2/', '/assembly/v2/index.html'].includes(window.location.pathname);
const isV2 = ['/v2', '/v2/', '/v2/index.html'].includes(window.location.pathname);
createRoot(document.getElementById('root')!).render(
  isAssembly || isAssemblyV2 ? <Suspense fallback={<div className="route-loading" role="status">Loading the assembly guide…</div>}><Assembly version={isAssemblyV2 ? 'v2' : 'v1'} /></Suspense> : <App version={isV2 ? 'v2' : 'v1'} />
);
