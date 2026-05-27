// ── Lead stats aggregation ──────────────────────────────────────────────────
// Federated aggregations across all 4 lead-bearing collections. All queries
// run in parallel; results merged in memory. Tuned for the Binayah scale
// (~10K–100K total leads) — for >1M docs each query becomes its own pipeline.

import clientPromise from "@/lib/mongodb";
import type { LeadSource, LeadStatus } from "./types";
import { LEAD_STATUSES } from "./types";

const DB = "binayah_web_new_dev";

const SOURCE_COLLECTION: Record<LeadSource, string> = {
  inquiry: "inquiries",
  newsletter: "marketreportsubscriptions",
  "list-property": "property_submissions",
  "project-subscribe": "project_subscriptions",
};

const ALL_SOURCES: LeadSource[] = [
  "inquiry",
  "newsletter",
  "list-property",
  "project-subscribe",
];

const ALIVE_FILTER = { deletedAt: { $exists: false } };

function buildDateFilter(from?: Date, to?: Date): Record<string, unknown> {
  if (!from && !to) return {};
  const range: Record<string, Date> = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;
  return { createdAt: range };
}

export interface FunnelStage {
  status: LeadStatus;
  count: number;
}

export interface LeadStats {
  total: number;
  open: number;        // not won, not lost, not deleted
  last7Days: number;
  last30Days: number;
  last90Days: number;
  bySource: Record<LeadSource, number>;
  byStatus: Record<LeadStatus, number>;
  /** Last 30 days bucketed by ISO date (YYYY-MM-DD), Dubai time. */
  byDay: { date: string; count: number }[];
  funnel: {
    stages: FunnelStage[];
    /** Conversion ratio from new to each subsequent stage (0..1). */
    rates: Partial<Record<LeadStatus, number>>;
  };
  topCommunities: { name: string; count: number }[];
  topProperties: { slug: string; title: string; count: number }[];
  /** Average ms between createdAt and earliest non-system note (i.e. first manual touch). */
  avgTimeToContactMs: number | null;
  generatedAt: string;
}

function startOfDayDubai(d: Date): Date {
  // Dubai is UTC+4, no DST.
  const utc = d.getTime();
  const dubai = new Date(utc + 4 * 60 * 60 * 1000);
  dubai.setUTCHours(0, 0, 0, 0);
  return new Date(dubai.getTime() - 4 * 60 * 60 * 1000);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function emptySourceMap(): Record<LeadSource, number> {
  return ALL_SOURCES.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<LeadSource, number>
  );
}

function emptyStatusMap(): Record<LeadStatus, number> {
  return LEAD_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<LeadStatus, number>
  );
}

// ── Per-source primitive queries ─────────────────────────────────────────────

async function countAlive(collectionName: string, extra: Record<string, unknown> = {}, dateFilter: Record<string, unknown> = {}): Promise<number> {
  const client = await clientPromise;
  return client.db(DB).collection(collectionName).countDocuments({ ...ALIVE_FILTER, ...dateFilter, ...extra });
}

async function statusBreakdown(collectionName: string, dateFilter: Record<string, unknown> = {}): Promise<Partial<Record<LeadStatus, number>>> {
  const client = await clientPromise;
  try {
    const rows = await client
      .db(DB)
      .collection(collectionName)
      .aggregate<{ _id: string | null; count: number }>([
        { $match: { ...ALIVE_FILTER, ...dateFilter } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray();
    const out: Partial<Record<LeadStatus, number>> = {};
    for (const r of rows) {
      const status = (r._id || "new") as LeadStatus;
      if (LEAD_STATUSES.includes(status)) {
        out[status] = (out[status] || 0) + r.count;
      } else {
        out.new = (out.new || 0) + r.count;
      }
    }
    return out;
  } catch {
    return {};
  }
}

async function dailyBuckets(collectionName: string, from: Date, to?: Date): Promise<Map<string, number>> {
  const client = await clientPromise;
  const rangeFilter: Record<string, Date> = { $gte: from };
  if (to) rangeFilter.$lte = to;
  try {
    const rows = await client
      .db(DB)
      .collection(collectionName)
      .aggregate<{ _id: string; count: number }>([
        { $match: { ...ALIVE_FILTER, createdAt: rangeFilter } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Dubai" },
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    return new Map(rows.map((r) => [r._id, r.count]));
  } catch {
    return new Map();
  }
}

async function topByField(
  collectionName: string,
  field: string,
  limit: number,
  extra: Record<string, unknown> = {},
  dateFilter: Record<string, unknown> = {}
): Promise<Map<string, number>> {
  const client = await clientPromise;
  try {
    const rows = await client
      .db(DB)
      .collection(collectionName)
      .aggregate<{ _id: string | null; count: number }>([
        { $match: { ...ALIVE_FILTER, ...dateFilter, [field]: { $exists: true, $nin: ["", null] }, ...extra } },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return new Map(rows.filter((r) => r._id).map((r) => [String(r._id), r.count]));
  } catch {
    return new Map();
  }
}

async function topInquiredProperties(limit: number, dateFilter: Record<string, unknown> = {}): Promise<Map<string, { title: string; count: number }>> {
  const client = await clientPromise;
  try {
    const rows = await client
      .db(DB)
      .collection("inquiries")
      .aggregate<{ _id: { slug: string; title: string }; count: number }>([
        { $match: { ...ALIVE_FILTER, ...dateFilter, propertySlug: { $exists: true, $nin: ["", null] } } },
        {
          $group: {
            _id: { slug: "$propertySlug", title: "$propertyTitle" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();
    return new Map(rows.map((r) => [String(r._id.slug), { title: r._id.title || r._id.slug, count: r.count }]));
  } catch {
    return new Map();
  }
}

// Average ms between createdAt and earliest non-system note across all sources.
// Pulled with one aggregation per collection; merged client-side.
async function avgTimeToContact(): Promise<number | null> {
  const client = await clientPromise;
  const sums: number[] = [];

  for (const coll of Object.values(SOURCE_COLLECTION)) {
    try {
      const rows = await client
        .db(DB)
        .collection(coll)
        .aggregate<{ deltaMs: number }>([
          { $match: { ...ALIVE_FILTER, notes: { $exists: true, $ne: [] } } },
          {
            $project: {
              firstManualAt: {
                $min: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$notes",
                        as: "n",
                        cond: { $ne: ["$$n.system", true] },
                      },
                    },
                    as: "n",
                    in: "$$n.at",
                  },
                },
              },
              createdAt: 1,
            },
          },
          { $match: { firstManualAt: { $ne: null } } },
          {
            $project: {
              deltaMs: { $subtract: ["$firstManualAt", "$createdAt"] },
            },
          },
          { $match: { deltaMs: { $gte: 0 } } },
        ])
        .toArray();
      for (const r of rows) sums.push(r.deltaMs);
    } catch {
      /* skip this collection */
    }
  }

  if (sums.length === 0) return null;
  return sums.reduce((a, b) => a + b, 0) / sums.length;
}

// ── Main entry point ─────────────────────────────────────────────────────────

export async function computeLeadStats(opts: { from?: Date; to?: Date } = {}): Promise<LeadStats> {
  const now = new Date();
  const day7 = daysAgo(7);
  const day30 = daysAgo(30);
  const day90 = daysAgo(90);
  const df = buildDateFilter(opts.from, opts.to);
  // Histogram covers the requested range or defaults to last 30 days
  const bucketStart = opts.from ?? startOfDayDubai(daysAgo(29));

  // Parallel everything.
  const [
    totals,
    opens,
    last7,
    last30,
    last90,
    statusBreakdowns,
    dailyMaps,
    inqCommunityProxy,   // inquiries don't have community directly — best-effort via propertyTitle
    newsCommunityMaps,
    listCommunityMap,
    topProps,
    avgTtc,
  ] = await Promise.all([
    Promise.all(ALL_SOURCES.map((s) => countAlive(SOURCE_COLLECTION[s], {}, df))),
    Promise.all(
      ALL_SOURCES.map((s) =>
        countAlive(SOURCE_COLLECTION[s], { status: { $nin: ["won", "lost"] } }, df)
      )
    ),
    Promise.all(
      ALL_SOURCES.map((s) => countAlive(SOURCE_COLLECTION[s], { createdAt: { $gte: day7 } }))
    ),
    Promise.all(
      ALL_SOURCES.map((s) => countAlive(SOURCE_COLLECTION[s], { createdAt: { $gte: day30 } }))
    ),
    Promise.all(
      ALL_SOURCES.map((s) => countAlive(SOURCE_COLLECTION[s], { createdAt: { $gte: day90 } }))
    ),
    Promise.all(ALL_SOURCES.map((s) => statusBreakdown(SOURCE_COLLECTION[s], df))),
    Promise.all(ALL_SOURCES.map((s) => dailyBuckets(SOURCE_COLLECTION[s], bucketStart, opts.to))),
    // community proxies — only ones that semantically exist
    topByField("inquiries", "propertyTitle", 50, {}, df),
    topByField("marketreportsubscriptions", "areas", 50, {}, df),   // areas is an array — Mongo $group unwinds it implicitly if we $unwind first; without $unwind it groups by the whole array. Skip and merge below.
    topByField("property_submissions", "community", 50, {}, df),
    topInquiredProperties(10, df),
    avgTimeToContact(),
  ]);

  // Source counts
  const bySource = emptySourceMap();
  ALL_SOURCES.forEach((s, i) => (bySource[s] = totals[i]));

  // Status counts (merge across sources)
  const byStatus = emptyStatusMap();
  for (const breakdown of statusBreakdowns) {
    for (const [status, count] of Object.entries(breakdown)) {
      byStatus[status as LeadStatus] += count || 0;
    }
  }

  // Daily buckets — generate every day in range so the chart has no gaps.
  const byDay: { date: string; count: number }[] = [];
  const bucketEnd = opts.to ?? new Date();
  const msPerDay = 86_400_000;
  const dayCount = Math.min(365, Math.ceil((bucketEnd.getTime() - bucketStart.getTime()) / msPerDay) + 1);
  for (let i = 0; i < dayCount; i++) {
    const d = new Date(bucketStart.getTime() + i * msPerDay);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Dubai" });  // YYYY-MM-DD
    const total = dailyMaps.reduce((sum, m) => sum + (m.get(key) ?? 0), 0);
    byDay.push({ date: key, count: total });
  }

  // Funnel: collapse statuses into pipeline progression.
  // new -> contacted -> qualified -> meeting -> won (lost = dead-end at any stage)
  const funnelStages: FunnelStage[] = LEAD_STATUSES
    .filter((s) => s !== "lost")
    .map((s) => ({ status: s, count: byStatus[s] }));
  // Conversion rate = next-stage / prev-stage. Lost is summed separately.
  const rates: Partial<Record<LeadStatus, number>> = {};
  for (let i = 1; i < funnelStages.length; i++) {
    const prev = funnelStages[i - 1].count;
    rates[funnelStages[i].status] = prev > 0 ? funnelStages[i].count / prev : 0;
  }

  // Top communities — merge across sources (proxy via propertyTitle for inquiries).
  const communityMerge = new Map<string, number>();
  for (const map of [inqCommunityProxy, listCommunityMap, newsCommunityMaps]) {
    for (const [name, count] of map) {
      communityMerge.set(name, (communityMerge.get(name) ?? 0) + count);
    }
  }
  const topCommunities = Array.from(communityMerge.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top properties (inquiry-only)
  const topProperties = Array.from(topProps.entries()).map(([slug, v]) => ({
    slug,
    title: v.title,
    count: v.count,
  }));

  return {
    total: totals.reduce((a, b) => a + b, 0),
    open: opens.reduce((a, b) => a + b, 0),
    last7Days: last7.reduce((a, b) => a + b, 0),
    last30Days: last30.reduce((a, b) => a + b, 0),
    last90Days: last90.reduce((a, b) => a + b, 0),
    bySource,
    byStatus,
    byDay,
    funnel: { stages: funnelStages, rates },
    topCommunities,
    topProperties,
    avgTimeToContactMs: avgTtc,
    generatedAt: now.toISOString(),
  };
}
