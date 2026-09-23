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
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(p);
  }
})(ROOT);
const source = new Map(files.map((f) => [f, fs.readFileSync(f, "utf8")]));

const isClientComponent = (f) => /^\s*["']use client["']/m.test(source.get(f) || "");

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null; // bare package import
  const candidates = [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx"), path.join(base, "index.ts")];
  return candidates.find((c) => source.has(c)) || null;
}

/** Top-level namespaces read in a file ("home.hero" -> "home"). */
const namespacesIn = (f) =>
  [...(source.get(f) || "").matchAll(/useTranslations\(\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1].split(".")[0]);

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
  (function visit(file, inClient) {
    const key = `${file}|${inClient}`;
    if (seen.has(key)) return;
    seen.add(key);
    const client = inClient || isClientComponent(file);
    if (client) namespacesIn(file).forEach((n) => found.add(n));
    for (const dep of importsOf(file)) visit(dep, client);
  })(entry, false);
  return found;
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

// ------------------------------------------------------------------- report
const pages = files.filter((f) => f.startsWith(PAGES_ROOT) && f.endsWith("page.tsx")).sort();
const rows = [];
for (const page of pages) {
  const route = page.slice(PAGES_ROOT.length).replace(/\/page\.tsx$/, "") || "/";
  const needed = [...clientNamespacesFor(page)].filter((n) => !BASE.has(n));
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
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2));
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
process.exit(rows.length === 0 ? 0 : 1);
