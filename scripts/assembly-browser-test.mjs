import { ASSEMBLY_PANELS } from '../app/assembly-panels.ts';
import { ASSEMBLY_STEPS } from '../app/assembly-data.ts';
import { chromium } from 'playwright-core';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const diagrams = JSON.parse(readFileSync('public/assembly/diagrams.json', 'utf8'));
const numbers = Array.from({ length: 32 }, (_, i) => i).filter(i => ![4, 27, 28].includes(i));
assert.deepEqual(Object.keys(diagrams).sort(), numbers.map(n => String(n).padStart(2, '0')).sort());
assert.equal(Object.values(diagrams).reduce((sum, images) => sum + images.length, 0), 154);
for (const images of Object.values(diagrams)) for (const image of images) {
  assert(existsSync(`public${image.src}`), image.src);
  assert(image.source.startsWith('https://orca.ethz.ch/assembly/'));
  assert(readFileSync(`public${image.src}`).byteLength > 0);
}
for (const step of ASSEMBLY_STEPS) {
  const panels = ASSEMBLY_PANELS[step.number];
  assert.deepEqual(panels.flatMap(p => p.images), diagrams[String(step.number).padStart(2, '0')].map((_, i) => i + 1), `Step ${step.number}: every image appears once, in source order`);
  assert.deepEqual(panels.flatMap(p => p.items), step.items.map((_, i) => i), `Step ${step.number}: checklist items and saved keys stay intact`);
}
assert(existsSync('dist/assembly/index.html'), 'Production build includes the assembly HTML entry');
mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = process.env.APP_URL || 'http://localhost:3016';
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const heading = () => page.locator('.assembly-step-header h1');
const imageLoaded = () => page.locator('.diagram-expand img').first().evaluate(img => img.complete && img.naturalWidth > 0);
try {
  await page.goto(`${base}/assembly`);
  await heading().waitFor();
  assert.equal(await heading().innerText(), 'Prepare the tendons & knots');
  await page.waitForFunction(() => { const img = document.querySelector('.diagram-expand img'); return img?.complete && img.naturalWidth > 0; });
  assert(await imageLoaded());
  assert.equal(await page.locator('.assembly-step-list button').count(), 29);
  await page.screenshot({ path: 'test-results/assembly-desktop.png' });
  await page.locator('.assembly-checklist input').first().check();
  await page.reload(); await heading().waitFor();
  assert(await page.locator('.assembly-checklist input').first().isChecked(), 'Checkbox progress survives refresh');
  await page.getByRole('button', { name: 'Mark this step complete', exact: true }).click();
  assert.match(await page.locator('.build-progress').innerText(), /1 of 29/);
  assert.equal(await page.locator('.diagram-figure').count(), 7, 'Every diagram appears inline');
  await page.getByRole('button', { name: 'Enlarge assembly diagram 2', exact: true }).click();
  assert.match(await page.locator('.assembly-zoom img').getAttribute('src'), /00-02/);
  assert(await page.locator('.assembly-zoom').isVisible());
  await page.keyboard.press('Escape'); assert(!(await page.locator('.assembly-zoom').isVisible()));
  await page.getByRole('button', { name: /NEXT STEP/ }).click();
  assert.match(page.url(), /#step-01$/);
  assert.equal(await page.locator('.assembly-checklist input:checked').count(), 0, 'Navigation does not mark work complete');
  assert.match(await page.locator('.diagram-expand img').first().getAttribute('src'), /01-01/);
  await page.goBack(); assert.equal(await heading().innerText(), 'Prepare the tendons & knots');
  await page.getByRole('textbox', { name: 'Find an assembly step' }).fill('M4×14');
  assert.equal(await page.locator('.assembly-step-list button').count(), 1);
  await page.locator('.assembly-step-list button').click();
  assert.equal(await heading().innerText(), 'Join the two tower sections');
  await page.getByRole('button', { name: 'Clear step search' }).click();
  // Every published stage opens its own local diagram and source link.
  for (const n of numbers) {
    await page.getByRole('button', { name: new RegExp(`^Step ${String(n).padStart(2, '0')}:`) }).click();
    await page.waitForFunction(() => { const img = document.querySelector('.diagram-expand img'); return img?.complete && img.naturalWidth > 0; });
    assert(await imageLoaded(), `Step ${n} diagram loads`);
    assert.equal(await page.locator('.diagram-figure').count(), diagrams[String(n).padStart(2, '0')].length);
    assert.equal(await page.locator('.assembly-checklist input').count(), ASSEMBLY_STEPS.find(s => s.number === n).items.length);
    assert(await page.locator('.assembly-instruction-card').evaluateAll(cards => cards.every(card => {
      const images = card.querySelector('.assembly-panel-images').getBoundingClientRect();
      const checklist = card.querySelector('.assembly-checklist');
      return !checklist || checklist.getBoundingClientRect().top >= images.bottom;
    })), 'Checklist instructions appear below their associated images');
    assert(await page.locator('.diagram-figure').evaluateAll(figures => figures.every(figure => {
      const image = figure.querySelector('.diagram-expand');
      const caption = figure.querySelector('figcaption');
      return caption.textContent.trim() && (!image || caption.getBoundingClientRect().top >= image.getBoundingClientRect().bottom);
    })), 'Every image has its caption underneath');
    assert.match(await page.getByRole('link', { name: 'Read the full official step' }).getAttribute('href'), new RegExp(`step${String(n).padStart(2, '0')}\\.html$`));
  }
  await page.goto(`${base}/assembly/#step-26`); await heading().waitFor();
  assert.equal(await heading().innerText(), 'Wind & secure the tendons');
  await page.getByRole('button', { name: 'Enlarge assembly diagram 18', exact: true }).click();
  assert.match(await page.locator('.assembly-zoom img').getAttribute('src'), /26-18/);
  await page.keyboard.press('Escape');
  await page.screenshot({ path: 'test-results/assembly-tendons.png' });
  await page.getByRole('button', { name: 'Reset checklist' }).click();
  await page.getByRole('button', { name: 'Keep progress', exact: true }).click();
  assert.match(await page.locator('.build-progress').innerText(), /1 of 29/);
  await page.getByRole('button', { name: 'Reset checklist' }).click();
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  assert.match(await page.locator('.build-progress').innerText(), /0 of 29/);
  await page.getByRole('link', { name: 'Inspect the related part in 3D' }).click();
  await page.locator('.detail-content h2').waitFor();
  assert.equal(await page.locator('.detail-content h2').innerText(), 'Forearm frame', 'Assembly links select the related mesh');
  await page.getByRole('navigation', { name: 'Pages', exact: true }).getByRole('link', { name: 'Assembly', exact: true }).click(); await heading().waitFor();
  for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No document overflow');
    assert(await page.locator('.assembly-content').evaluate(el => el.scrollWidth <= el.clientWidth), 'No content overflow');
    if (width < 761) {
      await page.getByRole('button', { name: 'All steps' }).click();
      await page.getByRole('button', { name: /^Step 09:/ }).click();
      assert(!(await page.locator('.assembly-sidebar').isVisible()), 'Choosing a step closes the mobile list');
      assert.equal(await heading().innerText(), 'Line the palm’s routing holes');
    }
    await page.screenshot({ path: `test-results/assembly-${width}.png` });
  }
  await page.evaluate(() => localStorage.setItem('orca-atlas.assembly.v1', '{invalid'));
  await page.reload(); await heading().waitFor();
  assert.match(await page.locator('.build-progress').innerText(), /0 of 29/, 'Malformed stored state is recovered');
  assert.deepEqual(errors, []);
  console.log('PASS: 29 steps, 154 local assets, source links, image-caption pairing, inline views/zoom, persistent checklists, reset/cancel, deep links/history, 3D cross-links, desktop/mobile layouts, and malformed storage recovery.');
} finally { await browser.close(); }
