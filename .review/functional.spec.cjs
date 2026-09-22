const { chromium } = require('/opt/npm-cache/_npx/fd3bca3c548369c0/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:3000');
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('main > section').count(), 6);
  assert.match(await page.locator('h1').innerText(), /Go your\nown way/);
  assert.equal(await page.locator('[data-calc-out="annualSaving"]').innerText(), '11,100');

  await page.locator('[data-category="three"]').click();
  assert.equal(await page.locator('[data-range-category]:visible').count(), 1);
  assert.match(await page.locator('[data-range-category]:visible h3').innerText(), /Safar/);
  await page.locator('[data-category="two"]').click();
  assert.equal(await page.locator('[data-range-category]:visible').count(), 2);
  await page.locator('[data-category="all"]').click();
  assert.equal(await page.locator('[data-range-category]:visible').count(), 3);

  await page.locator('[data-product-open="zing"]').click();
  assert.ok(await page.locator('#product-zing').isVisible());
  await page.keyboard.press('Escape');
  assert.ok(!(await page.locator('#product-zing').isVisible()));
  await page.locator('[data-product-open="zing"]').click();
  await page.locator('#product-zing [data-product-book]').click();
  await page.waitForSelector('[data-lead-modal][data-open="true"]');
  assert.ok(await page.locator('input[name="vehicle"][value="zing"]').isChecked());
  assert.ok(!(await page.locator('#product-zing').isVisible()));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);

  await page.locator('#calc-daily').fill('60');
  assert.equal(await page.locator('[data-calc-readout="dailyKm"]').innerText(), '60');
  assert.equal(await page.locator('[data-calc-out="annualSaving"]').innerText(), '22,200');
  await page.locator('.savings-settings summary').click();
  await page.locator('[name="fuelPrice"]').fill('50');
  await page.locator('[name="mileage"]').fill('100');
  assert.equal(await page.locator('[data-calc-out="annualSaving"]').innerText(), '0');
  await page.locator('[name="workingDays"]').fill('-20');
  await page.locator('[name="workingDays"]').blur();
  assert.equal(await page.locator('[name="workingDays"]').inputValue(), '1');

  const answer = page.locator('.ownership-answers details').nth(1);
  await answer.locator('summary').click();
  assert.equal(await answer.getAttribute('open'), '');

  await page.evaluate(() => { window.__openedMap = ''; window.open = url => { window.__openedMap = url; return null; }; });
  await page.locator('[data-dealer-city="Pune"]').click();
  assert.equal(await page.locator('#dealer-city').inputValue(), 'Pune');
  await page.locator('.dealer-search__input button').click();
  assert.match(await page.evaluate(() => window.__openedMap), /Kinetic\+Green\+authorised\+dealer\+Pune/);
  await page.locator('#dealer-city').fill('123');
  await page.locator('.dealer-search__input button').click();
  assert.ok(!(await page.locator('#dealer-city').evaluate(el => el.checkValidity())));

  for (const width of [1920, 1440, 1200, 1024, 768, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('http://127.0.0.1:3000');
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const logo = document.querySelector('.kg-nav__logo');
      const groups = logo.querySelectorAll(':scope > g');
      const kinetic = groups[1].getBoundingClientRect();
      const green = groups[2].getBoundingClientRect();
      const brand = document.querySelector('.kg-nav__brand').getBoundingClientRect();
      const actions = document.querySelector('.kg-nav__actions').getBoundingClientRect();
      const missingAnchors = [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash);
      return { scroll: document.documentElement.scrollWidth, gap: green.left - kinetic.right, logoRight: logo.getBoundingClientRect().right,
        greenRight: green.right, brandRight: brand.right, actionsLeft: actions.left,
        actionsRight: actions.right, viewport: innerWidth, missingAnchors };
    });
    assert.ok(layout.scroll <= width, `page overflow at ${width}`);
    assert.ok(layout.gap > 0 && layout.greenRight <= layout.logoRight + 1, `invalid logo at ${width}`);
    assert.ok(layout.brandRight < layout.actionsLeft && layout.actionsRight <= width, `header collision at ${width}`);
    assert.deepEqual(layout.missingAnchors, [], `broken anchors at ${width}`);
    if (width < 1200) {
      await page.locator('[data-nav-burger]').click();
      await page.waitForSelector('[data-nav-drawer][data-open="true"]');
      assert.ok(await page.locator('[data-nav-drawer]').isVisible());
      await page.keyboard.press('Escape');
      await page.waitForTimeout(450);
      assert.equal(await page.locator('[data-nav-burger]').getAttribute('aria-expanded'), 'false');
    }
    if (width === 390 || width === 1440) await page.screenshot({ path: `.review/final-${width}.png`, fullPage: true });
  }

  // The full booking preview validates input and never submits personal data.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000');
  let posts = 0;
  page.on('request', r => { if (r.method() === 'POST' && r.url().includes('/api/lead')) posts++; });
  await page.locator('[data-lead-source="hero"]').click();
  await page.waitForSelector('[data-lead-modal][data-open="true"]');
  await page.locator('[data-lead-submit]').click();
  assert.ok(await page.locator('[data-lead-step="2"]').isVisible());
  await page.locator('[data-lead-submit]').click();
  assert.match(await page.locator('[data-error-for="city"]').innerText(), /city/);
  await page.locator('[data-lead-city]').fill('Pune');
  await page.locator('[data-lead-submit]').click();
  await page.locator('[data-date-offset="1"]').click();
  await page.locator('[data-lead-submit]').click();
  await page.locator('[data-lead-name]').fill('Preview Rider');
  await page.locator('[data-lead-phone]').fill('9876543210');
  await page.locator('[data-lead-submit]').click();
  assert.match(await page.locator('[data-lead-heading]').innerText(), /Preview complete/);
  assert.match(await page.locator('[data-lead-success-message]').innerText(), /No booking/);
  assert.equal(posts, 0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  assert.equal(await page.locator('body').getAttribute('data-locked'), 'false');

  const noJS = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noJS.goto('http://127.0.0.1:3000');
  assert.ok(await noJS.locator('h1').isVisible());
  assert.equal(await noJS.locator('main>section').count(), 6);
  assert.equal(await noJS.locator('.range-card__fallback:visible').count(), 3);
  assert.equal(await noJS.locator('[data-calc-out="annualSaving"]').innerText(), '11,100');
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: six sections; range filters/dialogs; calculator arithmetic and bounds; ownership; dealer validation; logo, menu and anchors at eight widths; preview booking with zero submissions; no-JS content.');
})().catch(error => { console.error(error); process.exit(1); });
