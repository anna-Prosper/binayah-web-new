/**
 * POST /api/deal-check/analyze
 *
 * Streams a Deal Check report as NDJSON so the visitor sees progress rather
 * than a 30-second spinner. Each line is `{ event, data? , error? }`, matching
 * the convention the valuation tool already uses.
 *
 * Events: started → parsing → comparing → costing → final | error
 */

import { NextRequest } from "next/server";
import { extractDeal } from "@/lib/deal-check/parse";
import { buildReport } from "@/lib/deal-check/report";
import { fetchListingText } from "@/lib/deal-check/fetch-source";
import { checkRateLimit } from "@/lib/rateLimit";
import type { DealInput } from "@/lib/deal-check/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Screenshots arrive as data URLs; cap the decoded payload at ~6MB. */
const MAX_IMAGE_CHARS = 8_000_000;
const MAX_TEXT_CHARS = 40_000;

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // The analysis makes a vision model call and several upstream fetches, so
  // it is genuinely expensive. Fail open on a Mongo blip — a rate-limiter
  // outage must not take the tool down.
  const allowed = await checkRateLimit("deal-check", ip, 8, 10 * 60 * 1000).catch(() => true);
  if (!allowed) {
    return Response.json(
      { error: "You've run several checks in a row. Give it a few minutes and try again." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: {
    url?: string;
    text?: string;
    image?: string;
    mortgage?: boolean;
    downPaymentPct?: number | null;
    manual?: Partial<DealInput>;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // The stream is closed exactly once, in the `finally` below. Early
      // returns simply stop writing — calling controller.close() at each exit
      // point and again in `finally` throws ERR_INVALID_STATE, which kills the
      // response mid-flight and shows the visitor a hang instead of the error
      // we were trying to send.
      let closed = false;

      const send = (event: string, payload?: unknown) => {
        if (closed) return;
        const line =
          event === "error"
            ? JSON.stringify({ event, error: payload })
            : JSON.stringify({ event, data: payload });
        try {
          controller.enqueue(encoder.encode(line + "\n"));
        } catch {
          // Client hung up mid-stream; nothing useful left to do.
          closed = true;
        }
      };

      try {
        send("started");

        // ── 1. Establish the source text ────────────────────────────────────
        let text = typeof body.text === "string" ? body.text.slice(0, MAX_TEXT_CHARS) : "";
        const image =
          typeof body.image === "string" && body.image.length < MAX_IMAGE_CHARS
            ? body.image
            : undefined;
        let sourceUrl: string | null = null;

        if (body.url) {
          send("parsing", { stage: "fetching" });
          const fetched = await fetchListingText(body.url);
          if (fetched) {
            text = `${fetched.text}\n\n${text}`.slice(0, MAX_TEXT_CHARS);
            sourceUrl = fetched.url;
          } else {
            // A portal that blocks us is common; carry on with whatever else
            // the visitor supplied rather than failing the whole request.
            sourceUrl = body.url;
          }
        }

        if (!text.trim() && !image) {
          send(
            "error",
            "We couldn't read anything from what you sent. Paste the listing details as text, or upload a screenshot.",
          );
          return;
        }

        // ── 2. Extract structured facts ─────────────────────────────────────
        send("parsing", { stage: "reading" });

        const extraction = await extractDeal({
          text: text || undefined,
          imageDataUrl: image,
          sourceUrl,
          mortgage: body.mortgage,
          downPaymentPct: body.downPaymentPct ?? null,
        });

        if (!extraction) {
          send(
            "error",
            "We couldn't read the property details from that. Try pasting the listing text directly, or fill in the details by hand.",
          );
          return;
        }

        // Anything the visitor typed by hand overrides the model — a human
        // correcting the extraction is always more reliable than the model.
        const input: DealInput = { ...extraction.input, ...stripEmpty(body.manual) };

        send("parsing", {
          stage: "done",
          input,
          marketingClaims: extraction.marketingClaims,
          redFlags: extraction.redFlags,
          confidence: extraction.confidence,
        });

        // A rental listing cannot be assessed as a purchase. Running it anyway
        // compares an annual rent against sale comparables and produces
        // nonsense — a "92% below market" verdict and an impossible yield.
        if (extraction.listingIntent === "rent") {
          send(
            "error",
            "That looks like a rental listing rather than a property for sale — the figure is an annual rent, not a purchase price. Deal Check assesses purchases. If you're buying this unit, send the sale listing or enter the asking price.",
          );
          return;
        }

        if (input.price == null) {
          send(
            "error",
            "We couldn't find an asking price. Add it and we'll run the full check.",
          );
          return;
        }

        // ── 3. Comps + costs + report ───────────────────────────────────────
        send("comparing", { community: input.community });
        const report = await buildReport(input);

        send("costing");
        send("final", {
          report,
          marketingClaims: extraction.marketingClaims,
          extractionFlags: extraction.redFlags,
          sizeNote: extraction.sizeNote,
          currencyNote: extraction.currencyNote,
          confidence: extraction.confidence,
        });
      } catch (err) {
        console.error("[deal-check] analyze failed:", err);
        send("error", "Something went wrong running the check. Please try again.");
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            // Already torn down by a client disconnect.
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Drop null/undefined/"" so a blank manual field doesn't erase a parsed one. */
function stripEmpty(obj: Partial<DealInput> | undefined): Partial<DealInput> {
  if (!obj || typeof obj !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined && v !== "") out[k] = v;
  }
  return out as Partial<DealInput>;
}
