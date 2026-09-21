import { chromium } from 'playwright-core';
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { V2_CHAPTERS, V2_DIAGRAMS, V2_STEPS, V2_PANELS } from '../app/assembly-v2-data.ts';
import { V2_MANUAL, manualImage } from '../app/assembly-v2-manual.ts';
const manualPages = new Set();
for (const [step, groups] of Object.entries(V2_MANUAL)) {
  for (const [group, diagrams] of Object.entries(groups)) {
    assert(V2_CHAPTERS[Number(step) - 1].groups[Number(group)], 'Manual group exists');
    for (const diagram of diagrams) {
      manualPages.add(diagram.page);
      assert(readFileSync(`public${manualImage(diagram.page, diagram.src)}`).byteLength > 1000);
    }
  }
}
assert.equal(manualPages.size, 32, 'Every supplied manual page is mapped');
const source = JSON.parse(readFileSync('public/assembly/v2/source.json', 'utf8'));
assert(existsSync('dist/assembly/v2/index.html'));
assert.equal(V2_CHAPTERS[0].start, 0);
assert(Math.abs(V2_CHAPTERS.at(-1).end - source.duration) < 1, 'Chapter end matches source duration within one second');
const chronologicalChapters = [...V2_CHAPTERS].sort((a, b) => a.start - b.start);
for (let i = 1; i < chronologicalChapters.length; i++) {
  assert.equal(chronologicalChapters[i].start, chronologicalChapters[i - 1].end, 'Chapter ranges cover the full recording without gaps');
}
for (const [i, c] of V2_CHAPTERS.entries()) {
  const key = String(i + 1).padStart(2, '0'), images = V2_DIAGRAMS[key];
  assert.deepEqual(source.chapters[i].frames, images, 'Extracted manifest matches authored frame selection');
  assert.deepEqual(V2_PANELS[i + 1].flatMap(p => p.images), images.map((_, j) => j + 1));
  assert.deepEqual(V2_PANELS[i + 1].flatMap(p => p.items), V2_STEPS[i].items.map((_, j) => j));
  for (const image of images) {
    assert(image.seconds >= c.start && image.seconds < c.end);
    assert(readFileSync(`public${image.src}`).byteLength > 1000, image.src);
  }
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const base = process.env.APP_URL || 'http://localhost:3016';
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const heading = page.locator('.assembly-step-header h1');
try {
  await page.goto(`${base}/assembly`);
  await page.locator('.assembly-checklist input').first().check();
  const v1Progress = await page.evaluate(() => localStorage.getItem('orca-atlas.assembly.v1'));
  await page.getByRole('navigation', { name: 'Assembly version' }).getByRole('link', { name: /v2/ }).click();
  await heading.waitFor();
  assert.equal(await heading.innerText(), 'Prepare the finger tendons');
  assert.equal(await page.locator('.assembly-step-list button').count(), 30);
  assert.equal(await page.locator('.assembly-checklist input:checked').count(), 0);
  await page.locator('.diagram-expand img').first().evaluate(img => img.decode());
  await page.screenshot({ path: 'test-results/assembly-v2-desktop.png' });
  await page.locator('.assembly-checklist input').first().check();
  await page.reload();
  assert(await page.locator('.assembly-checklist input').first().isChecked());
  assert.equal(await page.evaluate(() => localStorage.getItem('orca-atlas.assembly.v1')), v1Progress);
  await page.getByRole('button', { name: 'Mark this step complete', exact: true }).click();
  assert.match(await page.locator('.build-progress').innerText(), /1 of 30/);
  await page.getByRole('button', { name: 'Enlarge assembly frame 2', exact: true }).click();
  assert.match(await page.locator('.assembly-zoom[open] img').getAttribute('src'), /0055.jpg$/);
  assert.match(await page.locator('.assembly-zoom[open]').innerText(), /00:55/);
  assert.equal(await page.getByRole('link', { name: 'Watch enlarged frame on YouTube at 00:55' }).getAttribute('href'), 'https://www.youtube.com/watch?v=TgIz7HiyaoU&t=55s');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: /NEXT STEP/ }).click();
  assert.match(page.url(), /#step-02$/);
  await page.goBack();
  assert.equal(await heading.innerText(), 'Prepare the finger tendons');
  await page.getByRole('textbox', { name: 'Find an assembly step' }).fill('magnets');
  assert.equal(await page.locator('.assembly-step-list button').count(), 1);
  await page.locator('.assembly-step-list button').click();
  assert.match(await heading.innerText(), /magnets/);
  assert.match((await page.locator('.assembly-checklist').allTextContents()).join(' '), /four magnets/);
  await page.getByRole('button', { name: 'Clear step search' }).click();
  await page.getByRole('button', { name: 'Video reference', exact: true }).click();
  assert(await page.locator('.assembly-source-dialog').isVisible());
  await page.keyboard.press('Escape');
  for (const step of V2_STEPS) {
    await page.getByRole('button', { name: new RegExp(`^Step ${String(step.number).padStart(2, '0')}:`) }).click();
    assert.equal(await heading.innerText(), step.title);
    assert.equal(await page.locator('.assembly-video-range a').getAttribute('href'), `https://www.youtube.com/watch?v=TgIz7HiyaoU&t=${V2_CHAPTERS[step.number - 1].start}s`);
    const frameLinks = await page.locator('.diagram-figure figcaption a').evaluateAll(links => links.map(a => a.getAttribute('href')));
    assert.deepEqual(frameLinks, V2_DIAGRAMS[String(step.number).padStart(2, '0')].map(frame => `https://www.youtube.com/watch?v=TgIz7HiyaoU&t=${frame.seconds}s`));
    assert.equal(await page.locator('.assembly-checklist input').count(), step.items.length);
    // Force all lazy frames in the chapter to load, not just the first one.
    await page.locator('.diagram-expand img').evaluateAll(async images => {
      for (const image of images) { image.loading = 'eager'; await image.decode(); }
    });
    const expectedManual = Object.values(V2_MANUAL[step.number] || {}).flat();
    assert.deepEqual(await page.locator('.manual-expand img').evaluateAll(images => images.map(image => image.getAttribute('src'))), expectedManual.map(diagram => manualImage(diagram.page, diagram.src)));
    await page.locator('.manual-expand img').evaluateAll(async images => {
      for (const image of images) { image.loading = 'eager'; await image.decode(); }
    });
    assert.equal(await page.locator('.diagram-figure time').count(), V2_DIAGRAMS[String(step.number).padStart(2, '0')].length);
    assert(await page.locator('.assembly-instruction-card').evaluateAll(cards => cards.every(card => card.querySelector('.assembly-checklist').getBoundingClientRect().top >= card.querySelector('.assembly-panel-images').getBoundingClientRect().bottom)));
    assert.equal(await page.locator('a[href*="Orca%20Hand_step"]').count(), 0, 'No v1 source links leak into v2');
  }
  await page.goto(`${base}/assembly/v2/#step-06`);
  await page.getByRole('button', { name: 'Enlarge manual page 11', exact: true }).click();
  assert(await page.locator('.manual-zoom[open]').isVisible());
  assert.match(await page.locator('.manual-zoom[open] img').getAttribute('src'), /page-11.webp$/);
  await page.screenshot({ path: 'test-results/assembly-v2-manual-zoom.png' });
  await page.keyboard.press('Escape');
  await page.locator('.assembly-manual').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/assembly-v2-manual.png' });
  await page.goto(`${base}/assembly/v2/index.html#step-24`);
  assert.equal(await heading.innerText(), 'Anchor & wind the first tendon spools');
  await page.screenshot({ path: 'test-results/assembly-v2-routing.png' });
  await page.getByRole('button', { name: 'Reset checklist' }).click();
  await page.getByRole('button', { name: 'Keep progress', exact: true }).click();
  assert.match(await page.locator('.build-progress').innerText(), /1 of 30/);
  await page.getByRole('button', { name: 'Reset checklist' }).click();
  await page.getByRole('button', { name: 'Reset progress', exact: true }).click();
  assert.match(await page.locator('.build-progress').innerText(), /0 of 30/);
  assert.equal(await page.evaluate(() => localStorage.getItem('orca-atlas.assembly.v1')), v1Progress, 'Reset is isolated to v2');
  for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert(await page.locator('.assembly-content').evaluate(el => el.scrollWidth <= el.clientWidth));
    if (width < 761) {
      await page.getByRole('button', { name: 'All steps' }).click();
      await page.getByRole('button', { name: /^Step 06:/ }).click();
      assert(!(await page.locator('.assembly-sidebar').isVisible()));
      assert.equal(await heading.innerText(), 'Route the finger through its base');
      assert(await page.getByRole('link', { name: 'v1 guide', exact: true }).isVisible());
      await page.locator('.assembly-manual').first().scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'Enlarge manual page 11', exact: true }).click();
      assert(await page.locator('.manual-zoom[open]').isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.keyboard.press('Escape');
    }
    await page.screenshot({ path: `test-results/assembly-v2-${width}.png` });
  }
  await page.evaluate(() => localStorage.setItem('orca-atlas.assembly.v2', '["bad","1:0","1:0",null]'));
  await page.goto(`${base}/assembly/v2/#step-99`);
  assert.equal(await heading.innerText(), 'Prepare the finger tendons');
  assert.equal(await page.locator('.assembly-checklist input:checked').count(), 1);
  await page.evaluate(() => localStorage.setItem('orca-atlas.assembly.v2', '{invalid'));
  await page.reload();
  assert.equal(await page.locator('.assembly-checklist input:checked').count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS: 30 v2 chapters, 171 frames, 32 manual pages with matching groups and zoom, full timeline, image/checklist pairing, separate persistent progress/reset, version navigation, deep links, search, zoom, source reference and responsive layouts.');
} finally { await browser.close(); }
