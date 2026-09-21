import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
mkdirSync('test-results', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
page.on('pageerror', e => errors.push(e.message));
const motionReady = () => page.locator('main[data-motion-state="ready"]').waitFor({ timeout: 60000 });
const ready = async () => { await page.locator('.scene[data-ready="true"]').waitFor({ timeout: 60000 }); await motionReady(); };
const settle = () => page.waitForTimeout(800);
const setRange = (locator, value) => locator.fill(String(value));
try {
  await page.goto(process.env.APP_URL || 'http://localhost:3016'); await ready(); await settle();
  assert.match(await page.locator('.sidebar-foot').innerText(), /34 of 34/);
  await page.screenshot({ path: 'test-results/desktop.png' });
  await page.keyboard.press('/'); await page.waitForFunction(() => document.querySelector('.search-field input') === document.activeElement);
  await page.getByRole('textbox', { name: 'Search components' }).fill('u2d2');
  await page.locator('.search-result').click();
  assert.equal(await page.locator('.detail-content h2').innerText(), 'U2D2 interface board');
  await page.getByRole('button', { name: 'Isolate component', exact: true }).click(); await settle();
  assert.match(await page.locator('.sidebar-foot').innerText(), /1 of 34/);
  assert.equal(await page.locator('#explode').isDisabled(), true);
  await page.screenshot({ path: 'test-results/isolated.png' });
  await page.getByRole('button', { name: 'Show full assembly' }).click();
  await page.getByRole('button', { name: 'Reset explorer' }).click();
  await page.getByRole('button', { name: 'Frame', exact: true }).click();
  assert.match(await page.locator('.sidebar-foot').innerText(), /22 of 34/);
  await page.getByRole('button', { name: 'Skin', exact: true }).click();
  assert.match(await page.locator('.sidebar-foot').innerText(), /11 of 34/);
  await page.getByRole('button', { name: 'Complete', exact: true }).click();
  await setRange(page.locator('#explode'), 100); await page.waitForTimeout(1800);
  await page.screenshot({ path: 'test-results/exploded.png' });
  assert.equal(await page.locator('#explode').inputValue(), '100');
  await setRange(page.locator('#explode'), 0); await page.waitForTimeout(1800);
  await page.getByRole('tab', { name: 'Joint motion' }).click();
  assert.equal(await page.locator('.joint-control').count(), 17);
  const before = await page.locator('canvas').screenshot();
  await page.getByRole('button', { name: 'Curl', exact: true }).click(); await settle();
  const after = await page.locator('canvas').screenshot(); assert(!before.equals(after), 'Joint pose changes geometry');
  await page.screenshot({ path: 'test-results/motion.png' });
  await page.getByRole('button', { name: 'Neutral', exact: true }).click();
  await page.waitForFunction(() => [...document.querySelectorAll('.joint-control input')].every(input => Math.abs(Number(input.value)) < .001));
  await motionReady();
  const middleAbduction = page.getByRole('slider', { name: 'middle abduction', exact: true });
  await middleAbduction.fill('0.64523'); await page.locator('.collision-status.is-blocked').waitFor(); await motionReady();
  assert(Number(await middleAbduction.inputValue()) < .4, 'Collision clamps a requested joint pose');
  assert.match(await page.locator('.collision-status').innerText(), /Movement stopped/);
  await page.screenshot({ path: 'test-results/collision-blocked.png' });
  await page.getByRole('button', { name: 'Neutral', exact: true }).click(); await page.locator('.collision-status.is-blocked').waitFor({ state: 'hidden' }); await motionReady();
  assert(Math.abs(Number(await middleAbduction.inputValue())) < .001, 'Joint can retreat from contact');
  await page.getByRole('tab', { name: 'Components', exact: true }).click();
  await page.getByRole('button', { name: /A little guidance/ }).click();
  for (let i = 1; i < 5; i++) { assert.match(await page.locator('.lesson-card').innerText(), new RegExp(`${i} OF 5`)); await page.getByRole('button', { name: 'Next stop' }).click(); }
  await page.getByRole('button', { name: 'Finish tour' }).click();
  assert.equal(await page.locator('.lesson-card').count(), 0);
  await page.getByRole('button', { name: 'Reset explorer' }).click(); await settle();
  // Hit the actual mesh, then make sure dragging does not select a different part.
  const rect = await page.locator('canvas').boundingBox();
  let picked = false;
  for (let y = .2; y < .85 && !picked; y += .09) for (let x = .3; x < .7 && !picked; x += .07) {
    await page.mouse.move(rect.x + rect.width * x, rect.y + rect.height * y);
    if (await page.locator('.scene').getAttribute('data-hovered')) { await page.mouse.click(rect.x + rect.width * x, rect.y + rect.height * y); picked = true; }
  }
  assert(picked, 'Direct raycast selection works');
  const name = await page.locator('.detail-content h2').innerText();
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2); await page.mouse.down(); await page.mouse.move(rect.x + rect.width / 2 + 100, rect.y + rect.height / 2 + 30, { steps: 10 }); await page.mouse.up();
  assert.equal(await page.locator('.detail-content h2').innerText(), name, 'Orbit drag does not select');
  await page.getByRole('button', { name: 'Left hand', exact: true }).click(); await ready(); await settle();
  assert.match(await page.locator('.viewer-heading .overline').innerText(), /LEFT/);
  assert.match(await page.locator('.sidebar-foot').innerText(), /34 of 34/);
  await page.screenshot({ path: 'test-results/left.png' });
  await page.getByRole('tab', { name: 'Joint motion' }).click();
  await middleAbduction.fill('0.64523'); await page.locator('.collision-status.is-blocked').waitFor(); await motionReady();
  assert(Number(await middleAbduction.inputValue()) < .4, 'Left hand also stops at collision');
  await page.getByRole('button', { name: 'Reset explorer' }).click(); await motionReady();
  await page.getByRole('tab', { name: 'Components', exact: true }).click();
  await page.getByRole('button', { name: 'Hide all', exact: true }).click();
  assert.equal(await page.locator('.empty-view').isVisible(), true);
  await page.getByRole('button', { name: 'Show complete hand' }).click();
  await page.getByRole('button', { name: 'About this atlas' }).click(); assert.equal(await page.locator('dialog').isVisible(), true);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog').isVisible(), false);
  for (const [width, height] of [[390, 844], [320, 568], [844, 390]]) {
    await page.setViewportSize({ width, height }); await settle();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow');
    await page.screenshot({ path: `test-results/viewport-${width}.png` });
    if (width < 761) {
      await page.locator('.mobile-toolbar').getByRole('button', { name: 'Components' }).click();
      await page.getByRole('textbox', { name: 'Search components' }).fill('thumb');
      await page.locator('.search-result').first().click();
      assert.equal(await page.locator('.inspector.mobile-open').isVisible(), true);
      await page.getByRole('button', { name: 'Isolate component', exact: true }).click(); await settle();
      const canvasRect = await page.locator('canvas').boundingBox(); const panelRect = await page.locator('.inspector.mobile-open').boundingBox();
      assert(canvasRect.y + canvasRect.height <= panelRect.y + 3, 'Inspector leaves model visible');
      await page.screenshot({ path: `test-results/inspect-${width}.png` });
      await page.getByRole('button', { name: 'Close details', exact: true }).click();
      await page.getByRole('button', { name: 'Reset explorer' }).click();
    }
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log('PASS: both hands, geometry picking, tap vs drag, search, presets, isolation, exploded layout, 17 joint controls, guided tour, credits, hidden state, and desktop/mobile layouts.');
} finally { await browser.close(); }
