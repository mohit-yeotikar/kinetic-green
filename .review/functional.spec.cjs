const { chromium } = require('/opt/npm-cache/_npx/fd3bca3c548369c0/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:3000');
  assert.match(await page.title(), /Kinetic Green/);
  assert.match(await page.locator('h1').innerText(), /Move/i);

  let layout = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(layout.scroll <= layout.viewport + 1, `desktop overflow: ${JSON.stringify(layout)}`);

  await page.locator('[data-category="business"]').click();
  assert.equal(await page.locator('[data-category="business"]').getAttribute('aria-selected'), 'true');

  await page.locator('[data-calc-input][name="dailyKm"]').evaluate((el) => {
    el.value = '60';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  assert.equal(await page.locator('[data-calc-readout="dailyKm"]').innerText(), '60');

  await page.locator('[data-lead-open][data-lead-source="hero"]').click();
  assert.ok(await page.locator('[data-lead-modal]').isVisible(), 'lead modal did not open');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000');
  assert.ok(await page.locator('[data-lead-open][data-lead-source="hero"]').isVisible(), 'mobile hero CTA is not visible');
  layout = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(layout.scroll <= layout.viewport + 1, `mobile overflow: ${JSON.stringify(layout)}`);

  await page.locator('[data-finder-panel="1"] input[type="radio"]').first().check();
  await page.locator('[data-finder-panel="1"] [data-finder-next]').click();
  assert.ok(await page.locator('[data-finder-panel="2"]').isVisible(), 'EV finder did not advance');

  for (const width of [1440, 1200, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3000');
    const header = await page.evaluate(() => {
      const logo = document.querySelector('.kg-nav__logo');
      const groups = logo.querySelectorAll(':scope > g');
      const kinetic = groups[1].getBoundingClientRect();
      const green = groups[2].getBoundingClientRect();
      const brand = document.querySelector('.kg-nav__brand').getBoundingClientRect();
      const actions = document.querySelector('.kg-nav__actions').getBoundingClientRect();
      return { gap: green.left - kinetic.right, logoRight: logo.getBoundingClientRect().right,
        greenRight: green.right, brandRight: brand.right, actionsLeft: actions.left,
        actionsRight: actions.right, viewport: innerWidth };
    });
    assert.ok(header.gap > 0, `overlapping wordmark at ${width}px`);
    assert.ok(header.greenRight <= header.logoRight, `wordmark exceeds SVG at ${width}px`);
    assert.ok(header.brandRight < header.actionsLeft, `brand collides with actions at ${width}px`);
    assert.ok(header.actionsRight <= header.viewport, `header controls clipped at ${width}px`);
    if (width < 1200) {
      await page.locator('[data-nav-burger]').click();
      await page.waitForSelector('[data-nav-drawer][data-open="true"]');
      assert.ok(await page.locator('[data-nav-drawer]').isVisible());
      await page.keyboard.press('Escape');
      await page.waitForTimeout(450);
      assert.equal(await page.locator('[data-nav-burger]').getAttribute('aria-expanded'), 'false');
    }
  }

  await browser.close();
  console.log('PASS: desktop/mobile layout, explorer, calculator, modal, EV finder, logo bounds and responsive menu');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
