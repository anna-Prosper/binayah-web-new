import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function scrapeGulfNews() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  // Block ads/trackers to speed up load
  await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2}', r => r.abort());
  await page.route('**/{ads,analytics,tracking,gtm,doubleclick}**', r => r.abort());

  console.log('Navigating...');
  await page.goto('https://gulfnews.com/business/property', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  // Scroll to trigger lazy-loaded content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3000);

  console.log('Title:', await page.title());

  // Dump top classes
  const classInfo = await page.evaluate(() => {
    const found = {};
    document.querySelectorAll('*').forEach(el => {
      if (el.className && typeof el.className === 'string') {
        el.className.trim().split(/\s+/).slice(0, 2).forEach(cls => {
          if (cls.length > 2) found[cls] = (found[cls] || 0) + 1;
        });
      }
    });
    return Object.entries(found)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([cls, count]) => `${count}x .${cls}`);
  });
  console.log('\nTop classes:\n', classInfo.join('\n'));

  // Find all links with text
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .filter(a => a.textContent.trim().length > 20 && a.href.includes('gulfnews.com/business/property'))
      .map(a => ({ title: a.textContent.trim().replace(/\s+/g, ' '), url: a.href }))
      .filter((v, i, arr) => arr.findIndex(x => x.url === v.url) === i)
      .slice(0, 30);
  });

  console.log(`\nFound ${links.length} property article links:`);
  links.forEach((l, i) => console.log(`${i+1}. ${l.title}\n   ${l.url}`));

  writeFileSync('/tmp/gulfnews_page.html', await page.content());
  writeFileSync('/tmp/gulfnews_results.json', JSON.stringify(links, null, 2));
  console.log('\nSaved HTML + JSON to /tmp/');

  await browser.close();
}

scrapeGulfNews().catch(e => { console.error(e.message); process.exit(1); });
