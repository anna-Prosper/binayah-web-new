/**
 * First-touch lead attribution.
 *
 * 284 genuine inquiries carry no traffic source at all: `referrer` is absent on
 * every one, `utmSource` on every one, and only 3 of 306 pageUrls hold any
 * query string. The two ChatGPT leads we can see were visible only by accident
 * — ChatGPT appends ?utm_source=chatgpt.com to the link itself, so it happened
 * to survive inside pageUrl. Google, Bing, social and direct are all invisible.
 *
 * FIRST touch, not last, and that is the whole point. Someone lands on
 * /pulse/guides/meydan-investor-guide?utm_source=chatgpt.com, reads it, clicks
 * through to /contact and submits there. Read at submit time, document.referrer
 * is binayah.ae and the utm is long gone — the lead looks like it came from our
 * own contact page. Captured on arrival and held for the session, it is
 * correctly attributed to ChatGPT.
 *
 * sessionStorage rather than a cookie: first-party, tab-scoped, no PII, gone
 * when the tab closes. Nothing here identifies a person; it records where a
 * visit came from.
 */
export type Attribution = {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
};

const KEY = "binayah.attribution";

/** Our own hostnames — an internal hop is navigation, not a traffic source. */
function isOwnHost(host: string): boolean {
  return /(^|\.)binayah\.(ae|ru|com|cn)$/i.test(host) || /(^|\.)jebelalipalmdubai\.com$/i.test(host);
}

/**
 * Record where this session came from. Safe to call on every render: the first
 * write wins, so a later internal navigation cannot overwrite the real source.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch already recorded

    const params = new URLSearchParams(window.location.search);
    const raw = document.referrer || "";
    let external = "";
    if (raw) {
      try {
        if (!isOwnHost(new URL(raw).hostname)) external = raw;
      } catch {
        /* unparseable referrer — treat as none */
      }
    }

    const a: Attribution = {
      referrer: external.slice(0, 300) || undefined,
      utmSource: params.get("utm_source")?.slice(0, 80) || undefined,
      utmMedium: params.get("utm_medium")?.slice(0, 80) || undefined,
      utmCampaign: params.get("utm_campaign")?.slice(0, 120) || undefined,
      landingPage: window.location.href.slice(0, 300),
    };
    // Stored even when everything is empty: "arrived directly" is a real answer
    // and must not be overwritten by whatever page they wander to next.
    sessionStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* private mode / storage disabled — attribution is best-effort, never fatal */
  }
}

/** Spread into an inquiry payload. Returns {} when nothing was recorded. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
