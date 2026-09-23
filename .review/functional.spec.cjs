/**
 * Functional review spec for the premium homepage.
 * Run:  BASE_URL=http://127.0.0.1:4173 node .review/functional.spec.cjs
 * Needs playwright-core (devDependency) and a Chromium binary (CHROME_PATH or
 * the Playwright default install).
 */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const launch = { headless: true };
if (process.env.CHROME_PATH) launch.executablePath = process.env.CHROME_PATH;

(async () => {
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ignoreHTTPSErrors: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);

  // Structure
  assert.equal(await page.locator('main > section').count(), 8);
  assert.match(await page.locator('h1').innerText(), /Chal meri\s*Luna\./);
  assert.equal(await page.locator('.p-chapter').count(), 4);
  assert.match(await page.locator('.p-story__sub').innerText(), /₹69,990/);
  // Colour preview swaps the paint and its label
  assert.equal(await page.locator('[data-paint-input]').count(), 5);
  await page.locator('.p-paint__swatch:nth-child(2)').click();
  assert.equal(await page.locator('[data-story]').getAttribute('data-paint'), 'blue');
  assert.equal(await page.locator('[data-paint-name]').evaluate(el => el.textContent), 'Ocean Blue');
  assert.match(await page.locator('.p-partner').innerText(), /Tonino Lamborghini/);

  // Range cards carry real figures and prefill the booking modal
  assert.equal(await page.locator('.p-card').count(), 3);
  assert.match(await page.locator('.p-card').nth(1).innerText(), /Zing[\s\S]*₹71,990/);
  await page.locator('[data-lead-open][data-lead-source="range-zing"]').click();
  await page.waitForSelector('[data-lead-modal][data-open="true"]');
  assert.ok(await page.locator('input[name="vehicle"][value="zing"]').isChecked());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  assert.ok(!(await page.locator('[data-lead-modal][data-open="true"]').count()));

  // Savings calculator
  assert.equal(await page.locator('[data-calc-out="annualSaving"]').innerText(), '11,100');
  await page.locator('#calc-daily').fill('60');
  assert.equal(await page.locator('[data-calc-readout="dailyKm"]').innerText(), '60');
  assert.equal(await page.locator('[data-calc-out="annualSaving"]').innerText(), '22,200');
  await page.locator('.p-calc__settings summary').click();
  await page.locator('[name="fuelPrice"]').fill('50');
  await page.locator('[name="mileage"]').fill('100');
  assert.equal(await page.locator('[data-calc-out="annualSaving"]').innerText(), '0');
  await page.locator('[name="workingDays"]').fill('-20');
  await page.locator('[name="workingDays"]').blur();
  assert.equal(await page.locator('[name="workingDays"]').inputValue(), '1');

  // Ownership accordion
  const answer = page.locator('.p-acc__item').nth(1);
  await answer.locator('summary').click();
  assert.equal(await answer.getAttribute('open'), '');

  // Dealer search opens Google Maps with a validated query
  await page.evaluate(() => { window.__openedMap = ''; window.open = url => { window.__openedMap = url; return null; }; });
  await page.locator('[data-dealer-city="Pune"]').click();
  assert.equal(await page.locator('#dealer-city').inputValue(), 'Pune');
  await page.locator('.p-field button[type="submit"]').click();
  assert.match(await page.evaluate(() => window.__openedMap), /Kinetic\+Green\+authorised\+dealer\+Pune/);
  await page.locator('#dealer-city').fill('123');
  await page.locator('.p-field button[type="submit"]').click();
  assert.ok(!(await page.locator('#dealer-city').evaluate(el => el.checkValidity())));

  // Layout integrity across breakpoints
  for (const width of [1920, 1440, 1280, 1024, 834, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(BASE);
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const brand = document.querySelector('.p-nav__brand').getBoundingClientRect();
      const actions = document.querySelector('.p-nav__actions').getBoundingClientRect();
      const missingAnchors = [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash);
      return { scroll: document.documentElement.scrollWidth, brandRight: brand.right, actionsLeft: actions.left, actionsRight: actions.right, missingAnchors };
    });
    assert.ok(layout.scroll <= width, `page overflow at ${width}`);
    assert.ok(layout.brandRight < layout.actionsLeft && layout.actionsRight <= width, `header collision at ${width}`);
    assert.deepEqual(layout.missingAnchors, [], `broken anchors at ${width}`);
    if (width < 1024) {
      await page.locator('[data-p-nav-toggle]').click();
      assert.equal(await page.locator('[data-p-nav-toggle]').getAttribute('aria-expanded'), 'true');
      assert.ok(await page.locator('#p-nav-sheet').evaluate(el => el.classList.contains('is-open')));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[data-p-nav-toggle]').getAttribute('aria-expanded'), 'false');
    }
  }

  // Motion contract: reduced motion means no pin, everything visible
  const rm = await page.evaluate(() => ({
    heroPinned: getComputedStyle(document.querySelector('.p-story__pin')).position === 'sticky',
    hiddenReveals: [...document.querySelectorAll('[data-reveal]')].filter(el => getComputedStyle(el).opacity !== '1').length,
  }));
  assert.equal(rm.heroPinned, false);
  assert.equal(rm.hiddenReveals, 0);

  // LCP element is the product image with full motion enabled
  const motion = await browser.newPage({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  await motion.goto(BASE, { waitUntil: 'load' });
  const metrics = await motion.evaluate(() => new Promise(res => {
    const r = {};
    new PerformanceObserver(l => { const e = l.getEntries().pop(); r.lcp = Math.round(e.startTime); r.el = e.element && e.element.className; }).observe({ type: 'largest-contentful-paint', buffered: true });
    let cls = 0; new PerformanceObserver(l => { l.getEntries().forEach(e => { if (!e.hadRecentInput) cls += e.value; }); r.cls = cls; }).observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => res(r), 2000);
  }));
  assert.equal(metrics.el, 'p-story__img', `LCP element was ${metrics.el}`);
  // Scroll story: steps advance and chapters activate on desktop with motion
  const travel = await motion.evaluate(() => document.querySelector('[data-story]').offsetHeight - innerHeight * 2);
  await motion.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(travel * 0.42));
  await motion.waitForTimeout(400);
  assert.equal(await motion.locator('[data-story]').getAttribute('data-step'), '2');
  assert.ok(await motion.locator('.p-chapter[data-chapter="2"]').evaluate(el => el.classList.contains('is-active')));
  assert.ok((metrics.cls || 0) < 0.05, `CLS ${metrics.cls}`);

  assert.deepEqual(errors, []);
  await browser.close();
  console.log('functional spec passed', JSON.stringify(metrics));
})().catch(error => { console.error(error); process.exit(1); });
