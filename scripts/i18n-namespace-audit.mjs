#!/usr/bin/env node
/**
 * i18n namespace audit — guards the per-route translation slicing.
 *
 * Background: [locale]/layout.tsx used to pass the ENTIRE next-intl catalogue
 * (all 80 namespaces, ~179KB of en.json) into NextIntlClientProvider, which
 * serialised it into every page's inline RSC payload. On the homepage that was
 * ~182KB of a 449KB payload and a 710KB document — the dominant cost behind a
 * mobile LCP of 10.7s. The layout now ships only BASE_CLIENT_NAMESPACES (the
 * always-mounted chrome), and each route mounts a nested provider with its own
 * slice.
 *
 * The failure mode this guards: a client component calls useTranslations("x")
 * where "x" is not in the route's slice. next-intl does NOT crash — its default
 * onError logs and getMessageFallback renders the key path, so the page quietly
 * displays "dealCheck.title" instead of real copy. That is exactly the kind of
 * silent content defect a type check cannot catch, so it gets a script.
 *
 * Usage:
 *   node scripts/i18n-namespace-audit.mjs          # report routes missing a slice
 *   node scripts/i18n-namespace-audit.mjs --json   # machine-readable
 *
 * Exits non-zero if any route reads a namespace it is not provided.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
const PAGES_ROOT = path.join(ROOT, "app", "[locale]");

// ---------------------------------------------------------------- source map
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) files.push(p);
  }
})(ROOT);
const source = new Map(files.map((f) => [f, fs.readFileSync(f, "utf8")]));

const isClientComponent = (f) => /^\s*["']use client["']/m.test(source.get(f) || "");

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null; // bare package import
  // An explicit extension in the specifier resolves as-is. ValuationPage.tsx
  // imports "./shared/SharedValuationPage.jsx" spelled out, so appending
  // extensions to the base would look for "…SharedValuationPage.jsx.tsx".
  if (source.has(base)) return base;
  // .jsx/.js included: SharedValuationPage.jsx is the only non-TS component in
  // the tree, and skipping it hid the "valuation" namespace entirely — the live
  // /valuation page rendered 28 raw key paths, form labels included.
  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
    path.join(base, "index.jsx"),
    path.join(base, "index.js"),
  ];
  return candidates.find((c) => source.has(c)) || null;
}

/** Top-level namespaces read in a file ("home.hero" -> "home"). */
const namespacesIn = (f) =>
  [...(source.get(f) || "").matchAll(/useTranslations\(\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1].split(".")[0]);

/**
 * `useTranslations(...)` calls whose namespace is NOT a string literal — e.g.
 * CommunitiesPageClient's `useTranslations(kind === "area" ? "areas" : "communities")`.
 * The literal scan above cannot see either branch, so both namespaces looked
 * unused and /communities shipped rendering "communities.heroTitle" live.
 * These cannot be resolved statically, so they are reported for a human to
 * confirm rather than silently skipped.
 */
const dynamicNamespaceCalls = (f) =>
  [...(source.get(f) || "").matchAll(/useTranslations\(\s*([^)]*)\)/g)]
    .map((m) => m[1].trim())
    .filter((arg) => arg && !/^["'`]/.test(arg));

const importsOf = (f) =>
  [...(source.get(f) || "").matchAll(/from\s+["']([^"']+)["']/g)]
    .map((m) => resolveImport(f, m[1]))
    .filter(Boolean);

/**
 * Namespaces reachable on the CLIENT from a route entry point. A module only
 * counts once the traversal has crossed a "use client" boundary — a component
 * without the directive that is imported by a client component is client-side
 * too, which is why `inClient` is sticky.
 */
function clientNamespacesFor(entry) {
  const seen = new Set();
  const found = new Set();
  const dynamic = new Map(); // file -> [raw argument source]
  (function visit(file, inClient) {
    const key = `${file}|${inClient}`;
    if (seen.has(key)) return;
    seen.add(key);
    const client = inClient || isClientComponent(file);
    if (client) {
      namespacesIn(file).forEach((n) => found.add(n));
      const dyn = dynamicNamespaceCalls(file);
      if (dyn.length) dynamic.set(path.relative(ROOT, file), dyn);
    }
    for (const dep of importsOf(file)) visit(dep, client);
  })(entry, false);
  return { found, dynamic };
}

// ------------------------------------------------- declared slices (source of truth)
const declared = fs.readFileSync(path.join(ROOT, "i18n", "client-namespaces.ts"), "utf8");
function declaredList(constName) {
  const m = declared.match(new RegExp(`${constName}\\s*=\\s*\\[([^\\]]*)\\]`));
  if (!m) throw new Error(`Could not parse ${constName} from client-namespaces.ts`);
  return new Set([...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]));
}
const BASE = declaredList("BASE_CLIENT_NAMESPACES");
const HOME = declaredList("HOME_CLIENT_NAMESPACES");

// ------------------------------------- invariant: nested providers keep BASE
// next-intl's IntlProvider REPLACES the parent context rather than merging it
// (use-intl react.js: `messages === undefined ? prevContext?.messages :
// messages`). So every namespace the always-mounted chrome reads has to be in
// the slice each page passes to its own nested provider — pages render
// <Navbar>/<Footer> INSIDE that provider.
//
// This shipped broken once: pickRouteMessages excluded the base set to avoid
// double-serialising, and the live site rendered "footer.address" and
// "nav.listYourProperty" on every page in all 7 locales. The check below only
// skips BASE namespaces because pickRouteMessages re-adds them, so if that ever
// stops being true this audit would go quiet exactly when it matters most.
if (!/pick\(\s*messages\s*,\s*\[\s*\.\.\.BASE_CLIENT_NAMESPACES\s*,/.test(declared)) {
  console.error(
    "pickRouteMessages no longer merges BASE_CLIENT_NAMESPACES into each route's slice.\n" +
      "A nested NextIntlClientProvider replaces its parent's messages, so the chrome\n" +
      "(Navbar/Footer/WhatsApp button) rendered inside it would show raw key paths.\n" +
      "Restore the merge, or move the chrome outside every page's nested provider.",
  );
  process.exit(1);
}

// ------------------------------------------------------------------- report
const pages = files.filter((f) => f.startsWith(PAGES_ROOT) && f.endsWith("page.tsx")).sort();
const rows = [];
const dynamicRows = [];
for (const page of pages) {
  const route = page.slice(PAGES_ROOT.length).replace(/\/page\.tsx$/, "") || "/";
  const { found, dynamic } = clientNamespacesFor(page);
  const needed = [...found].filter((n) => !BASE.has(n));
  // What the page itself provides: the named homepage constant, and/or the
  // inline array it passes to pickRouteMessages(...).
  const provided = new Set();
  const pageSource = source.get(page) || "";
  for (const call of pageSource.matchAll(/pickRouteMessages\([^,]*,\s*\[([^\]]*)\]/g)) {
    for (const ns of call[1].matchAll(/["']([^"']+)["']/g)) provided.add(ns[1]);
  }
  if (/HOME_CLIENT_NAMESPACES/.test(pageSource)) HOME.forEach((n) => provided.add(n));
  const missing = needed.filter((n) => !provided.has(n)).sort();
  if (missing.length) rows.push({ route, missing });
  // A computed namespace can't be checked statically; surface it so a human
  // confirms every branch is in the slice.
  for (const [file, calls] of dynamic) dynamicRows.push({ route, file, calls });
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ missing: rows, dynamic: dynamicRows }, null, 2));
} else if (rows.length === 0) {
  console.log(`✓ all ${pages.length} routes have every namespace their client tree reads`);
} else {
  console.log(`${rows.length} of ${pages.length} routes read namespaces not in their slice:\n`);
  for (const { route, missing } of rows) console.log(`  ${route.padEnd(50)} ${missing.join(", ")}`);
  console.log(
    `\nEach of these renders the raw key path (e.g. "dealCheck.title") instead of copy.\n` +
      `Fix by wrapping the page's tree in a nested NextIntlClientProvider with\n` +
      `pickRouteMessages(await getMessages(), [...]) — see [locale]/page.tsx.`,
  );
}
// Warn-only: these are correct today, but a computed namespace is invisible to
// the check above, so it is listed rather than trusted.
if (!process.argv.includes("--json") && dynamicRows.length) {
  const seen = new Set();
  const lines = [];
  for (const { file, calls } of dynamicRows) {
    for (const call of calls) {
      const key = `${file}|${call}`;
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`  ${file}: useTranslations(${call})`);
    }
  }
  if (lines.length) {
    console.log(`\n! ${lines.length} computed namespace(s) — verify every branch is in the route's slice:`);
    for (const l of lines) console.log(l);
  }
}

process.exit(rows.length === 0 ? 0 : 1);
