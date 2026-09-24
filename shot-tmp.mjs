import { chromium, devices } from '@playwright/test';
const url = process.argv[2];
const out = process.argv[3];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: out });
const box = await page.evaluate(() => {
  const s = document.querySelector('section');
  const img = s?.querySelector('img');
  return {
    viewport: { w: innerWidth, h: innerHeight },
    section: s ? { h: Math.round(s.getBoundingClientRect().height) } : null,
    img: img ? { natural: [img.naturalWidth, img.naturalHeight], rendered: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)], objectFit: getComputedStyle(img).objectFit, objectPosition: getComputedStyle(img).objectPosition } : null,
  };
});
console.log(JSON.stringify(box, null, 2));
await browser.close();
