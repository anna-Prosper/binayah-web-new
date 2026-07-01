// Builds a data-driven "About" paragraph for a developer that has projects but
// no editorial description. Facts come straight from the developer's project
// list (count, communities, off-plan/ready mix, entry price) so each summary is
// factually unique per developer — not the kind of boilerplate Google discounts.
// Returns "" when there are no projects (nothing real to say → leave it noindexed).

interface SummaryProject {
  community?: string;
  status?: string;
  startingPrice?: number | null;
  currency?: string;
}

export function buildDeveloperSummary(name: string, projects: SummaryProject[] | undefined | null): string {
  if (!projects || projects.length === 0) return "";
  const n = projects.length;
  const projWord = n === 1 ? "project" : "projects";

  // Communities by frequency (top 3)
  const freq = new Map<string, number>();
  for (const p of projects) {
    const c = (p.community || "").trim();
    if (c) freq.set(c, (freq.get(c) || 0) + 1);
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 3);

  // Off-plan vs ready mix
  let ready = 0, offplan = 0;
  for (const p of projects) {
    const s = (p.status || "").toLowerCase();
    if (/ready|complet/.test(s)) ready++;
    else offplan++;
  }

  // Entry price — normalise the "< 1000 means millions" shorthand used elsewhere
  let min = Infinity, currency = "AED";
  for (const p of projects) {
    if (p.currency) currency = p.currency;
    const raw = typeof p.startingPrice === "number" ? p.startingPrice : NaN;
    if (!isNaN(raw) && raw > 0) {
      const v = raw < 1000 ? raw * 1_000_000 : raw;
      if (v < min) min = v;
    }
  }

  const sentences: string[] = [];

  let s1 = `${name} is a Dubai real estate developer with ${n} ${projWord} listed on Binayah`;
  if (top.length === 1) s1 += `, with developments in ${top[0]}`;
  else if (top.length === 2) s1 += `, active in ${top[0]} and ${top[1]}`;
  else if (top.length >= 3) s1 += `, active in ${top[0]}, ${top[1]} and ${top[2]}`;
  sentences.push(s1 + ".");

  let s2 = "";
  if (offplan > 0 && ready > 0) s2 = "The portfolio spans both off-plan and ready homes";
  else if (offplan > 0) s2 = "The portfolio focuses on off-plan developments";
  else if (ready > 0) s2 = "The portfolio focuses on ready homes";
  if (min !== Infinity) {
    const price = `${currency} ${Math.round(min).toLocaleString("en-AE")}`;
    s2 = s2 ? `${s2}, with starting prices from ${price}` : `Starting prices from ${price}`;
  }
  if (s2) sentences.push(s2 + ".");

  sentences.push(`Browse all ${n} ${name} ${projWord} below.`);
  return sentences.join(" ");
}
