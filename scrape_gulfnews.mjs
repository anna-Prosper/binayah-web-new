import { chromium } from 'playwright';

async function scrapeGulfNews() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Mimic a real browser
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  });

  console.log('Navigating to Gulf News Property...');
  await page.goto('https://gulfnews.com/business/property', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  // Wait a moment for dynamic content
  await page.waitForTimeout(3000);

  // Get the page title
  const title = await page.title();
  console.log('Page title:', title);

  // Try to extract article cards - Gulf News uses various selectors
  const articles = await page.evaluate(() => {
    const results = [];

    // Try multiple common selectors for news cards
    const selectors = [
      'article',
      '.article-card',
      '.story-card',
      '[class*="article"]',
      '[class*="story"]',
      '.card',
      'h2 a',
      'h3 a',
    ];

    // Try h2/h3 links first as most reliable
    const headings = document.querySelectorAll('h2 a, h3 a');
    headings.forEach(el => {
      const text = el.textContent?.trim();
      const href = el.href;
      if (text && href && href.includes('gulfnews.com') && !results.find(r => r.url === href)) {
        results.push({ title: text, url: href });
      }
    });

    // Also try article elements
    document.querySelectorAll('article').forEach(article => {
      const link = article.querySelector('a[href*="gulfnews.com"]') || article.querySelector('a');
      const heading = article.querySelector('h1, h2, h3, h4');
      if (heading && link) {
        const text = heading.textContent?.trim();
        const href = link.href;
        if (text && href && !results.find(r => r.url === href)) {
          results.push({ title: text, url: href });
        }
      }
    });

    return results;
  });

  console.log(`\nFound ${articles.length} articles:\n`);
  articles.slice(0, 20).forEach((a, i) => {
    console.log(`${i + 1}. ${a.title}`);
    console.log(`   ${a.url}`);
  });

  // Also dump raw HTML snippet to understand structure
  const bodySnippet = await page.evaluate(() => {
    // Get first 3000 chars of body text to understand structure
    return document.body.innerHTML.substring(0, 5000);
  });

  // Save full results to file
  const fs = await import('fs');
  fs.writeFileSync('/tmp/gulfnews_results.json', JSON.stringify(articles, null, 2));
  console.log('\nFull results saved to /tmp/gulfnews_results.json');

  await browser.close();
}

scrapeGulfNews().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
