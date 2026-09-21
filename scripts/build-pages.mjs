import { mkdirSync, copyFileSync } from 'node:fs';
// Real HTML entries support folder-index static hosts as well as Vite/Vercel.
for (const route of ['v2', 'assembly', 'assembly/v2']) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync('dist/index.html', `dist/${route}/index.html`);
}
