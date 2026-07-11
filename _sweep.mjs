import { chromium } from "playwright";
const paths = [
  ["RU home", "/ru"],
  ["RU community", "/ru/communities/dubai-marina"],
  ["RU report", "/ru/pulse/reports/dubai-property-market-report-2026-07-11"],
  ["RU buy", "/ru/buy"],
  ["ZH home", "/zh"],
  ["ZH community", "/zh/communities/palm-jumeirah"],
  ["ZH project", "/zh/project/solaya-at-la-mer"],
  ["AR home (RTL)", "/ar"],
  ["EN project", "/project/solaya-at-la-mer"],
  ["EN property", "/property/genuine-resale-vacant-soon-fully-furnished"],
  ["EN developer", "/developer/ade"],
  ["EN off-plan", "/off-plan"],
  ["EN developers", "/developers"],
  ["EN guides", "/pulse/guides"],
];
const b = await chromium.launch({ args: ["--host-resolver-rules=MAP www.binayah.ae 216.150.1.1"] });
console.log("label            | http | visLen | csp | pageErr | h1");
for (const [label, path] of paths) {
  const ctx = await b.newContext({ ignoreHTTPSErrors: true });
  const p = await ctx.newPage();
  let csp=0, pe=0, status=0;
  p.on("console", m => { if (m.type()==="error" && /Content Security Policy/.test(m.text())) csp++; });
  p.on("pageerror", () => pe++);
  p.on("response", r => { if (r.url().endsWith(path) || r.url().includes(path)) { if(!status) status=r.status(); } });
  let resp;
  try { resp = await p.goto("https://www.binayah.ae"+path, { waitUntil: "networkidle", timeout: 45000 }); } catch(e){}
  await p.waitForTimeout(1200);
  const code = resp ? resp.status() : 0;
  const len = await p.evaluate(() => (document.body.innerText||"").trim().length);
  const h1 = await p.evaluate(() => (document.querySelector("h1")?.innerText||"(none)").replace(/\n/g," ").slice(0,32));
  console.log(`${label.padEnd(16)} | ${String(code).padEnd(4)} | ${String(len).padEnd(6)} | ${String(csp).padEnd(3)} | ${String(pe).padEnd(7)} | ${h1}`);
  await ctx.close();
}
await b.close();
