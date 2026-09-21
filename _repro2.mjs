import { getNewsArticle, getRelatedNews } from './src/lib/api.ts';
import { sanitizeArticleHtml } from './src/lib/sanitize.ts';
import { isIndexableNewsArticle } from './src/lib/news-topicality.ts';
const slug = process.argv[2] || 'types-of-commercial-properties-in-dubai';
const step = async (name, fn) => {
  try { const r = await fn(); console.log(`  OK     ${name}`); return r; }
  catch (e) {
    console.log(`  THREW  ${name}\n     ${e.constructor.name}: ${e.message}`);
    if (e.stack) console.log('     ' + e.stack.split('\n').slice(1,5).join('\n     '));
    return undefined;
  }
};
console.log(`slug: ${slug}`);
const article = await step('getNewsArticle', () => getNewsArticle(slug, 'en'));
if (!article) { console.log('  -> null, would 404'); process.exit(0); }
console.log(`     category: ${Array.isArray(article.category)?'array':typeof article.category}  content: ${(article.content||'').length}B`);
await step('isIndexableNewsArticle', () => isIndexableNewsArticle(article));
const clean = await step('sanitizeArticleHtml', () => sanitizeArticleHtml(article.content || ''));
if (clean !== undefined) console.log(`     sanitized: ${clean.length}B`);
await step('getRelatedNews', () => getRelatedNews(slug, article.category, 3, 'en'));
