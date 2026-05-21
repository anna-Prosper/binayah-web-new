/* eslint-disable i18next/no-literal-string */
// This file is the compiled output of the shared valuation page and contains
// inline English UI copy that hasn't been moved to translation files yet.
// The i18next rule is disabled file-wide here; re-enable + run translation
// extraction when the original TSX source is restored.
"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Ruler, Target, User, Phone, Mail, Sparkles, ArrowLeft, Copy, Check, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, MessageCircle, PhoneCall, RefreshCw, Search, Lock, Unlock, FileUp, FileText, X, Link2, } from "lucide-react";
import {
  isBedroomsRequiredForValuation,
  isCommunityRequiredForValuation,
  normalizePropertyType,
  valuationPropertyTypeOptions,
} from "@/lib/property-types";
// buildings.json is 678 KB — dynamically imported on first use to keep it
// out of the initial valuation page bundle. Cached after first load.
let buildingsIndexCache = null;
let buildingsIndexPromise = null;
async function getBuildingsIndex() {
    if (buildingsIndexCache) return buildingsIndexCache;
    if (!buildingsIndexPromise) {
        buildingsIndexPromise = import("@/data/buildings.json").then((m) => {
            buildingsIndexCache = m.default || m;
            return buildingsIndexCache;
        });
    }
    return buildingsIndexPromise;
}
// The supported emirates the page can value. Drives the City dropdown and
// the "is this city allowed?" validation. All area + building suggestions
// are powered live by the DLD-derived buildings.json index (5,781 buildings,
// refreshed via the admin DLD Data page) via usePlacesSearch. Emirates
// outside Dubai have no equivalent open-data source yet — those fields fall
// back to free-text input with no autocomplete dropdown, which is still
// fully functional (validation only requires city + area to be non-empty).
const SUPPORTED_CITIES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK"];

// Empty stubs — kept so existing call sites (Area / Building dropdown
// fallback) compile and degrade gracefully to no-suggestions. If we add
// another emirate's data source later, this is the obvious place to wire it in.
function getAreas(_city) {
    return [];
}
function getBuildings(_city, _area) {
    return [];
}
function isSupportedCity(value) {
    return typeof value === "string" && SUPPORTED_CITIES.includes(value);
}
// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;
const STREAM_TIMEOUT_MS = 190000;
const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const defaultTurnstileConfig = {
    enabled: false,
    configured: true,
    siteKey: "",
    action: "valuation_submit",
};
const defaultDocumentUploadConfig = {
    enabled: true,
    configured: true,
    maxFileSizeBytes: 8 * 1024 * 1024,
    accept: ".pdf,.png,.jpg,.jpeg,.webp,.gif",
    acceptedMimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"],
};
let turnstileScriptPromise = null;
const processingSteps = [
    { label: "Preparing", desc: "Validating property details" },
    { label: "Searching market", desc: "Reviewing live listings and sales" },
    { label: "Building estimate", desc: "Turning research into pricing guidance" },
    { label: "Ready to review", desc: "Formatting your valuation report" },
];
const phaseMap = {
    started: 0,
    searching_web: 1,
    generating_estimate: 2,
    final: 3,
};
const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"];
const MAIDS_OPTIONS = ["No", "Yes"];
const SIZE_OPTIONS = [
    500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1800, 2000,
    2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4200, 4600, 5000, 5400,
    5800, 6200, 6600, 7000, 7400, 7800, 8200, 9000,
];
const SIZE_UNIT_OPTIONS = ["sq ft", "sqm"];
const DEFAULT_SIZE_UNIT = "sq ft";
const TRANSACTION_TYPE_OPTIONS = [
    { value: "buy", label: "Sale" },
    { value: "rent", label: "Rent" },
];
// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, currency = "AED") => n == null ? "—" : `${currency} ${Math.round(n).toLocaleString("en-US")}`;
function normalizeValuationRichText(value) {
    return String(value || "")
        .replace(/\u00A0/g, " ")
        .replace(/[•‣▪▫◦●○]/g, "-")
        .replace(/[ \t]+/g, " ")
        .trim();
}
function humanizeBedroomPhrasing(value) {
    return String(value || "").replace(/\b([1-6])(?:\s*[- ]?\s*)(bedroom|bedrooms|bed|beds|bdr|bdrs|br)\b/gi, (match, count, _label, offset, source) => {
        const word = bedroomCountToWord(count);
        if (!word) {
            return match;
        }
        const shouldCapitalize = offset === 0 || /[.!?]\s*$/.test(source.slice(0, offset));
        const normalizedWord = shouldCapitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word;
        return `${normalizedWord}-bedroom`;
    });
}
function bedroomCountToWord(value) {
    switch (String(value || "")) {
        case "1":
            return "one";
        case "2":
            return "two";
        case "3":
            return "three";
        case "4":
            return "four";
        case "5":
            return "five";
        case "6":
            return "six";
        default:
            return "";
    }
}
function parseValuationRichTextParts(value) {
    const source = normalizeValuationRichText(value);
    if (!source) {
        return [];
    }
    const parts = [];
    let cursor = 0;
    const pushText = (text) => {
        const normalized = humanizeBedroomPhrasing(String(text || "").replace(/[ \t]+/g, " "));
        if (!normalized) {
            return;
        }
        const previous = parts[parts.length - 1];
        if ((previous === null || previous === void 0 ? void 0 : previous.type) === "text") {
            previous.text += normalized;
            return;
        }
        parts.push({ type: "text", text: normalized });
    };
    while (cursor < source.length) {
        const openIndex = source.indexOf("**", cursor);
        if (openIndex < 0) {
            pushText(source.slice(cursor));
            break;
        }
        const closeIndex = source.indexOf("**", openIndex + 2);
        if (closeIndex < 0) {
            pushText(source.slice(cursor));
            break;
        }
        if (openIndex > cursor) {
            pushText(source.slice(cursor, openIndex));
        }
        const strongText = humanizeBedroomPhrasing(String(source.slice(openIndex + 2, closeIndex) || "").replace(/[ \t]+/g, " ")).trim();
        if (strongText) {
            parts.push({ type: "strong", text: strongText });
        }
        else {
            pushText(source.slice(openIndex, closeIndex + 2));
        }
        cursor = closeIndex + 2;
    }
    return parts;
}
function renderValuationRichText(text, keyPrefix = "valuation-rich-text") {
    const parts = parseValuationRichTextParts(text);
    if (!parts.length) {
        return text;
    }
    return parts.map((part, index) => part.type === "strong" ? (<strong key={`${keyPrefix}-${index}`} className="font-semibold">
          {part.text}
        </strong>) : (<React.Fragment key={`${keyPrefix}-${index}`}>{part.text}</React.Fragment>));
}
function extractCommunity(unit) {
    var _a;
    if (!unit)
        return "Your Property";
    return ((_a = unit.split(",")[0]) === null || _a === void 0 ? void 0 : _a.trim()) || "Your Property";
}
// Replace internal/HTTP error wording with copy a non-technical user can act
// on. Falls through unchanged for messages that are already user-friendly,
// so server-authored asks (e.g., "Need bedrooms before we can value this.")
// still reach the UI verbatim.
function humanizeErrorMessage(message) {
    const text = String(message ?? "").trim();
    if (!text) return "Something went wrong. Please try again.";
    if (/^request failed \(\d+\)\.?$/i.test(text)) {
        return "Something went wrong on our end. Please try again in a moment.";
    }
    if (/stream ended before/i.test(text)) {
        return "The valuation didn’t finish. Please try again.";
    }
    if (/streaming not supported/i.test(text)) {
        return "Your browser doesn’t support streaming valuations. Try Chrome, Edge, Firefox, or Safari.";
    }
    if (/^valuation failed\.?$/i.test(text)) {
        return "The valuation couldn’t be completed. Please try again.";
    }
    if (/failed to fetch|network error|networkerror/i.test(text)) {
        return "Network error. Check your connection and try again.";
    }
    return text;
}
// Strip the WhatsApp-style sign-off ("Thank you," / "Binayah team") from a
// server reply so it doesn't look out of place on the web form. The web
// alert has its own dismiss UI; the courtesy lines are noise here.
function stripWhatsappSignature(message) {
    if (!message) return "";
    return String(message)
        .split("\n")
        .filter((line) => {
            const t = line.trim();
            if (!t) return true;
            if (/^thank\s*you[,!.]?$/i.test(t)) return false;
            if (/^[—\-•]?\s*binayah\s*team[.!]?$/i.test(t)) return false;
            return true;
        })
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
function sanitizeComparableDisplayDate(value) {
    const normalized = String(value || "").trim();
    if (!normalized) {
        return "";
    }
    let match = normalized.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s].*)?$/);
    if (match) {
        return `${String(Number(match[1])).padStart(4, "0")}-${String(Number(match[2])).padStart(2, "0")}-${String(Number(match[3])).padStart(2, "0")}`;
    }
    match = normalized.match(/^(\d{4})[-/](\d{1,2})[-/](\?+|x+|0{1,2}|unknown|n\/a|na)$/i);
    if (match) {
        return `${String(Number(match[1])).padStart(4, "0")}-${String(Number(match[2])).padStart(2, "0")}`;
    }
    match = normalized.match(/^(\d{4})[-/](\?+|x+|0{1,2}|unknown|n\/a|na)$/i);
    if (match) {
        return String(Number(match[1]));
    }
    match = normalized.match(/^([A-Za-z]+)\s+(\?+|x+|0{1,2}|unknown|n\/a|na)(?:,)?\s+(\d{4})$/i);
    if (match) {
        return `${match[1]} ${match[3]}`;
    }
    match = normalized.match(/^(\?+|x+|0{1,2}|unknown|n\/a|na)\s+([A-Za-z]+)(?:,)?\s+(\d{4})$/i);
    if (match) {
        return `${match[2]} ${match[3]}`;
    }
    return normalized;
}
// Mirror the backend rules in lib/inquiry.js:
//   - city: always required
//   - community OR propertyName: at least one (server accepts either)
//   - bedrooms: required for everything except Plot
//
// UX framing: Area is treated as the primary location field (most users
// know their community). Building/Unit is an *optional* alternative. The
// joint "either one is enough" requirement is enforced by flagging Area
// only when Building is also empty — once the user fills Building, Area's
// required marker clears. We never separately flag Building, since that
// would imply both are required (the rule the screenshot exposed).
function validateForm(form) {
    const errors = {};
    if (!form.city.trim()) {
        errors.city = "Please select the city.";
    }
    if (
        isCommunityRequiredForValuation({ propertyName: form.unit }) &&
        !form.area.trim()
    ) {
        errors.area = "Please enter the area or community — or fill the building/unit field.";
    }
    if (isBedroomsRequiredForValuation(form.type) && !form.beds.trim()) {
        errors.beds = "Please select the number of bedrooms.";
    }
    return errors;
}
function mapApiToResult(api, form) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const defaultMovingFactors = DEED_DUMMY_RESULT.movingFactors;
    const community = ((_a = api === null || api === void 0 ? void 0 : api.property_identity) === null || _a === void 0 ? void 0 : _a.normalizedLocation) || form.area || extractCommunity(form.unit);
    // Building/project name — prefer what the engine resolved (PF canonical
    // name from autocomplete), fall back to the user-typed `form.unit`.
    // Without this, the header collapses to "<community>, Dubai, UAE" and
    // hides which building we actually valued.
    const propertyName = (
        ((api === null || api === void 0 ? void 0 : api.property_identity) || {}).propertyName
        || (form.unit ? String(form.unit).split(",")[0].trim() : "")
        || ""
    );
    const propType = ((_a = form.type) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "property";
    const comparables = [
        ...((_b = api.transactions) !== null && _b !== void 0 ? _b : []).map((c) => ({
            type: "Sale",
            size: c.size || "Not stated",
            date: sanitizeComparableDisplayDate(c.date) || "Not stated",
            price: c.price,
            reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
            visibility: "full",
            match_scope: c.match_scope || null,
        })),
        ...((_c = api.listings) !== null && _c !== void 0 ? _c : []).map((c) => ({
            type: "Listing",
            size: c.size || "Not stated",
            date: sanitizeComparableDisplayDate(c.date) || "Not stated",
            price: c.price,
            reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
            visibility: "full",
            match_scope: c.match_scope || null,
        })),
    ];
    return {
        leadId: api.leadId,
        createdAt: api.createdAt,
        accessState: api.accessState || "unlocked",
        currency: api.currency || "AED",
        propertyName,
        community,
        city: form.city || "Dubai",
        country: (((_b = api === null || api === void 0 ? void 0 : api.market) === null || _b === void 0 ? void 0 : _b.countryCode) || "AE") === "AE" ? "UAE" : ((_c = api === null || api === void 0 ? void 0 : api.market) === null || _c === void 0 ? void 0 : _c.countryCode) || "UAE",
        tags: [form.type, community].filter(Boolean),
        fairValueLow: api.estimate_low,
        fairValueHigh: api.estimate_high,
        fairValueExplanation: api.estimate_summary,
        confidence: api.confidence,
        confidenceReason: api.confidence_reason,
        quickSaleLow: (_d = api.quick_sale_range) === null || _d === void 0 ? void 0 : _d.low,
        quickSaleHigh: (_e = api.quick_sale_range) === null || _e === void 0 ? void 0 : _e.high,
        suggestedListLow: (_f = api.recommended_list_price) === null || _f === void 0 ? void 0 : _f.low,
        suggestedListHigh: (_g = api.recommended_list_price) === null || _g === void 0 ? void 0 : _g.high,
        comparables,
        marketRead: api.market_read,
        strategy: api.recommendation,
        strategyBullets: [
            (_h = api.recommended_list_price) === null || _h === void 0 ? void 0 : _h.note,
            (_j = api.quick_sale_range) === null || _j === void 0 ? void 0 : _j.note,
        ].filter(Boolean),
        movingFactors: Array.isArray(api.moving_factors) && api.moving_factors.length
            ? api.moving_factors
            : defaultMovingFactors.map((factor) => factor.includes("Vacancy status")
                ? `Vacancy status - vacant ${propType}s typically command a **3-8% premium**.`
                : factor),
        movingFactorsLocked: false,
        disclaimer: api.disclaimer || DEED_DUMMY_RESULT.disclaimer,
        sources: api.sources || [],
        sourceCount: Array.isArray(api.sources) ? api.sources.length : 0,
        delivery: api.delivery || null,
        // Engine-emitted enrichments. cohortBreakdown is the per-scope
        // transaction count summary (same_building / sibling / community)
        // already rendered on the admin page; surfacing it here gives users
        // grounding for the confidence band. marketReference carries the
        // "view on Property Finder" deep-link the engine derives from the
        // resolved location. valuationTier flags community/broader/insufficient
        // estimates so the UI can show a "limited evidence" banner.
        cohortBreakdown: api.cohort_breakdown || null,
        marketReference: api.market_reference || null,
        valuationTier: api.valuation_tier || null,
        priceBandTrace: api.price_band_trace || null,
        valuationMethodology: api.valuation_methodology || null,
    };
}
function mapPreviewApiToResult(api, form) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const community = ((_a = api === null || api === void 0 ? void 0 : api.property_identity) === null || _a === void 0 ? void 0 : _a.normalizedLocation) || form.area || extractCommunity(form.unit);
    // Mirror the unlocked path — surface the building name in the result so
    // the header reads "<Building>, <Community>, Dubai, UAE" instead of just
    // "<Community>, Dubai, UAE".
    const propertyName = (
        ((api === null || api === void 0 ? void 0 : api.property_identity) || {}).propertyName
        || (form.unit ? String(form.unit).split(",")[0].trim() : "")
        || ""
    );
    const previewRows = ((_b = (_a = api.preview) === null || _a === void 0 ? void 0 : _a.comparableRows) !== null && _b !== void 0 ? _b : []).map((row) => {
        var _a;
        return ({
            type: row.type === "Listing" ? "Listing" : "Sale",
            size: row.size || "Not stated",
            date: sanitizeComparableDisplayDate(row.date) || "Not stated",
            price: row.visibility === "teaser" ? (_a = row.price) !== null && _a !== void 0 ? _a : null : null,
            reason: row.whyItMatters || "Comparable detail unlocks with the full report.",
            visibility: row.visibility,
        });
    });
    return {
        leadId: api.leadId,
        createdAt: api.createdAt,
        accessState: "preview",
        previewRanges: ((_c = api.preview) === null || _c === void 0 ? void 0 : _c.rangePreview) || [],
        sourceCount: Number(((_d = api.preview) === null || _d === void 0 ? void 0 : _d.sourceCount) || 0),
        currency: "AED",
        propertyName,
        community,
        city: form.city || "Dubai",
        country: (((_e = api === null || api === void 0 ? void 0 : api.market) === null || _e === void 0 ? void 0 : _e.countryCode) || "AE") === "AE" ? "UAE" : ((_f = api === null || api === void 0 ? void 0 : api.market) === null || _f === void 0 ? void 0 : _f.countryCode) || "UAE",
        tags: [form.type, community].filter(Boolean),
        fairValueLow: null,
        fairValueHigh: null,
        confidence: ((_e = api.preview) === null || _e === void 0 ? void 0 : _e.confidence) || "Low",
        confidenceReason: ((_f = api.preview) === null || _f === void 0 ? void 0 : _f.confidenceReason) ||
            "Confidence depends on how closely the available evidence matches this exact property.",
        fairValueExplanation: "Exact valuation figures unlock when you request the full report.",
        quickSaleLow: (_j = (_h = (_g = api.preview) === null || _g === void 0 ? void 0 : _g.quickSaleRange) === null || _h === void 0 ? void 0 : _h.low) !== null && _j !== void 0 ? _j : null,
        quickSaleHigh: (_m = (_l = (_k = api.preview) === null || _k === void 0 ? void 0 : _k.quickSaleRange) === null || _l === void 0 ? void 0 : _l.high) !== null && _m !== void 0 ? _m : null,
        suggestedListLow: null,
        suggestedListHigh: null,
        comparables: previewRows.length
            ? previewRows
            : [
                {
                    type: "Sale",
                    size: "Not stated",
                    date: "Not stated",
                    price: null,
                    reason: "Comparable detail unlocks with the full report.",
                    visibility: "locked",
                },
            ],
        marketRead: "Unlock the full report to reveal the market read for this property.",
        strategy: "Unlock the full report to reveal the recommended sale strategy.",
        strategyBullets: [
            "Suggested list pricing unlocks after the contact step.",
            "Quick-sale guidance unlocks after the contact step.",
        ],
        movingFactors: Array.isArray((_o = api.preview) === null || _o === void 0 ? void 0 : _o.movingFactors) && api.preview.movingFactors.length
            ? api.preview.movingFactors
            : DEED_DUMMY_RESULT.movingFactors,
        movingFactorsLocked: typeof ((_p = api.preview) === null || _p === void 0 ? void 0 : _p.movingFactorsLocked) === "boolean"
            ? api.preview.movingFactorsLocked
            : true,
        disclaimer: "AI-assisted market snapshot. Not a formal appraisal.",
        sources: [],
        delivery: null,
        // Engine enrichments — same fields the unlocked path forwards, so the
        // preview UI can show cohort counts and a tier banner before unlock.
        cohortBreakdown: api.cohort_breakdown || null,
        marketReference: api.market_reference || null,
        valuationTier: api.valuation_tier || null,
        priceBandTrace: api.price_band_trace || null,
        valuationMethodology: api.valuation_methodology || null,
    };
}
function getPreviewRange(result, label) {
    var _a;
    const normalizedLabel = label.trim().toLowerCase();
    return (_a = result === null || result === void 0 ? void 0 : result.previewRanges) === null || _a === void 0 ? void 0 : _a.find((range) => range.label.trim().toLowerCase() === normalizedLabel);
}
function getPriceComparisonBounds(result) {
    if (!result) {
        return null;
    }
    const bounds = [
        result.quickSaleLow,
        result.quickSaleHigh,
        result.fairValueLow,
        result.fairValueHigh,
        result.suggestedListLow,
        result.suggestedListHigh,
    ]
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
    if (!bounds.length) {
        return null;
    }
    let min = Math.min(...bounds);
    let max = Math.max(...bounds);
    if (min === max) {
        min *= 0.95;
        max *= 1.05;
    }
    return { min, max };
}
function getDeliveryNotice(delivery) {
    var _a;
    const summary = delivery && typeof delivery === "object" ? delivery.summary : null;
    const message = typeof (summary === null || summary === void 0 ? void 0 : summary.message) === "string" ? summary.message.trim() : "";
    if (!message) {
        return null;
    }
    return {
        message,
        tone: ((_a = summary === null || summary === void 0 ? void 0 : summary.tone) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === "success" ? "success" : "warning",
        action: delivery && typeof delivery === "object" && delivery.whatsapp && typeof delivery.whatsapp === "object"
            ? delivery.whatsapp.action || null
            : null,
    };
}
function normalizeTurnstileConfig(value) {
    const safeValue = value && typeof value === "object" ? value : {};
    return {
        enabled: Boolean(safeValue.enabled),
        configured: typeof safeValue.configured === "boolean" ? safeValue.configured : !safeValue.enabled,
        siteKey: String(safeValue.siteKey || "").trim(),
        action: String(safeValue.action || "").trim() || "valuation_submit",
    };
}
function normalizeDocumentUploadConfig(value) {
    const safeValue = value && typeof value === "object" ? value : {};
    const maxFileSizeBytes = Number(safeValue.maxFileSizeBytes);
    return {
        enabled: typeof safeValue.enabled === "boolean"
            ? safeValue.enabled
            : defaultDocumentUploadConfig.enabled,
        configured: typeof safeValue.configured === "boolean"
            ? safeValue.configured
            : defaultDocumentUploadConfig.configured,
        maxFileSizeBytes: Number.isFinite(maxFileSizeBytes) && maxFileSizeBytes > 0
            ? maxFileSizeBytes
            : defaultDocumentUploadConfig.maxFileSizeBytes,
        accept: typeof safeValue.accept === "string" && safeValue.accept.trim()
            ? safeValue.accept
            : defaultDocumentUploadConfig.accept,
        acceptedMimeTypes: Array.isArray(safeValue.acceptedMimeTypes) && safeValue.acceptedMimeTypes.length
            ? safeValue.acceptedMimeTypes.map((entry) => String(entry || "").trim()).filter(Boolean)
            : defaultDocumentUploadConfig.acceptedMimeTypes,
    };
}
function resolveDocumentMimeType(file) {
    const normalizedType = String(file.type || "").trim().toLowerCase();
    if (normalizedType) {
        return normalizedType;
    }
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith(".pdf"))
        return "application/pdf";
    if (fileName.endsWith(".png"))
        return "image/png";
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))
        return "image/jpeg";
    if (fileName.endsWith(".webp"))
        return "image/webp";
    if (fileName.endsWith(".gif"))
        return "image/gif";
    return "";
}
async function readFileAsBase64(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("The selected file could not be read."));
        reader.onload = () => {
            const result = String(reader.result || "");
            const separatorIndex = result.indexOf(",");
            if (separatorIndex === -1) {
                reject(new Error("The selected file could not be read."));
                return;
            }
            resolve(result.slice(separatorIndex + 1));
        };
        reader.readAsDataURL(file);
    });
}
// (Removed) `fetchValuation` was the helper for the deleted `runValuation`
// path. `runValuationWithPhases` inlines its own streaming reader.
// ─── Field error component ────────────────────────────────────────────────────
const FieldError = ({ message }) => message ? (<p className="text-xs text-[#b42318] mt-1 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3 flex-shrink-0"/>
      {message}
    </p>) : null;
// ─── Deed demo result ────────────────────────────────────────────────────────
const DEED_DUMMY_RESULT = {
    currency: "AED",
    community: "Marina Gate 1",
    city: "Dubai",
    country: "UAE",
    tags: ["Apartment", "Dubai Marina", "Thinking of selling"],
    fairValueLow: 2750000,
    fairValueHigh: 2950000,
    fairValueExplanation: "Based on 14 comparable transactions in **Marina Gate 1** and surrounding Dubai Marina towers over the last 12 months, a 2-bedroom unit of this size is valued in the **AED 2.75M–2.95M** range, assuming standard finishes and a mid-range floor.",
    confidence: "High",
    confidenceReason: "Strong volume of recent comparable sales within the same building and community, with consistent price-per-sqft data available.",
    quickSaleLow: 2550000,
    quickSaleHigh: 2700000,
    suggestedListLow: 2900000,
    suggestedListHigh: 3050000,
    comparables: [
        { type: "Sale", size: "1,210 sqft", date: "Jan 2026", price: 2800000, reason: "Same building, floor 18, standard finish. Sold in 23 days at **AED 2,314/sqft**." },
        { type: "Sale", size: "1,310 sqft", date: "Dec 2025", price: 2950000, reason: "**Marina Gate 1**, floor 22, upgraded kitchen and sea view." },
        { type: "Listing", size: "1,247 sqft", date: "Mar 2026", price: 3100000, reason: "Current ask in the same building at **AED 3,100,000**. Listed 18 days ago, no offers reported yet." },
        { type: "Sale", size: "1,190 sqft", date: "Nov 2025", price: 2680000, reason: "Lower floor, community view. Useful quick-sale floor reference around **AED 2,680,000**." },
        { type: "Listing", size: "1,280 sqft", date: "Feb 2026", price: 2950000, reason: "**Marina Gate 2** - closest comparable building, similar age and spec." },
    ],
    marketRead: "Dubai Marina continues to attract strong end-user and investor demand in Q1 2026. **Marina Gate** has outperformed the broader Marina average by **~4%** over the past 12 months, driven by newer build quality and proximity to the Marina Walk. Average time-on-market for 2BR units is **28 days**. Rental yields remain competitive at **5.8–6.4% gross**.",
    strategy: "Given the current demand and your intent to sell, listing at **AED 2.9M–3.05M** positions the unit competitively while leaving negotiation room. Price slightly below the most recent comparable listing to attract early offers. Vacant access will materially improve buyer interest and speed up the transaction.",
    strategyBullets: [
        "Stage for photography and enable flexible viewings — this building transacts faster with vacant access.",
        "List at **AED 2,950,000** and treat **AED 2,800,000+** as a strong outcome.",
        "If urgency is high, **AED 2,650,000–2,700,000** targets cash buyers and should close in under 30 days.",
    ],
    movingFactors: [
        "Exact floor level and view — sea or Marina views command a **5–10% premium**.",
        "Finish quality — renovated kitchens and bathrooms add **AED 80,000–150,000**.",
        "Furnishing — fully furnished units achieve **3–8%** higher asking prices.",
        "Vacancy status — vacant units transact **20–30% faster**.",
        "Service charge exposure — buyers factor annual charges into offers.",
    ],
    movingFactorsLocked: false,
    disclaimer: "This is a simulated demo result. For a live AI-powered estimate using real market data, use the smart search or fill the fields manually.",
    // Neutral placeholder sources for the demo result. Live valuations get
    // their `sources` array from the engine response — this list only ever
    // renders if the dummy branch is shown, and should not name third-party
    // data vendors in customer-facing copy.
    sources: [
        { url: "https://binayah.com", title: "Recent Dubai Marina market activity" },
    ],
};
// ─── Component ────────────────────────────────────────────────────────────────
const defaultResolveApiUrl = (path) => path;
const INITIAL_FORM_STATE = {
    countryCode: "AE",
    transactionType: "buy",
    unit: "",
    area: "",
    beds: "",
    maids: "No",
    city: "Dubai",
    type: "",
    size: "",
};
function cleanReportField(value) {
    return typeof value === "string" ? value.trim() : "";
}
function buildFormFromInquiry(inquiry, fallback = INITIAL_FORM_STATE) {
    const safeInquiry = inquiry && typeof inquiry === "object" ? inquiry : {};
    const transactionType = cleanReportField(safeInquiry.transactionType).toLowerCase() === "rent" ? "rent" : "buy";
    return {
        countryCode: cleanReportField(safeInquiry.countryCode) || fallback.countryCode,
        transactionType: cleanReportField(safeInquiry.transactionType) ? transactionType : fallback.transactionType,
        unit: cleanReportField(safeInquiry.propertyName) || fallback.unit,
        area: cleanReportField(safeInquiry.community) || cleanReportField(safeInquiry.location) || fallback.area,
        beds: cleanReportField(safeInquiry.bedrooms) || fallback.beds,
        maids: cleanReportField(safeInquiry.maids) || fallback.maids,
        city: cleanReportField(safeInquiry.city) || fallback.city,
        type: normalizePropertyType(safeInquiry.propertyType, "") || fallback.type,
        size: cleanReportField(safeInquiry.size) || fallback.size,
    };
}
function getValuationIdFromCurrentUrl() {
    if (typeof window === "undefined") {
        return "";
    }
    try {
        const url = new URL(window.location.href);
        return cleanReportField(url.searchParams.get("valuation") || url.searchParams.get("leadId"));
    }
    catch (_a) {
        return "";
    }
}
function replaceValuationIdInCurrentUrl(valuationId) {
    if (typeof window === "undefined") {
        return;
    }
    const normalizedValuationId = cleanReportField(valuationId);
    try {
        const url = new URL(window.location.href);
        if (normalizedValuationId) {
            url.searchParams.set("valuation", normalizedValuationId);
        }
        else {
            url.searchParams.delete("valuation");
        }
        url.searchParams.delete("leadId");
        window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    catch (_a) { }
}
function buildShareUrlForValuationId(valuationId) {
    const normalizedValuationId = cleanReportField(valuationId);
    if (!normalizedValuationId || typeof window === "undefined") {
        return "";
    }
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("valuation", normalizedValuationId);
        url.searchParams.delete("leadId");
        return url.toString();
    }
    catch (_a) {
        return "";
    }
}
const SharedValuationPage = ({ Header = null, Footer = null, resolveApiUrl = defaultResolveApiUrl }) => {
    var _a, _b, _c, _d, _e, _f;
    const tv = useTranslations("valuation");
    const [step, setStep] = useState("form");
    // PF-only engine: when PropertyFinder autocomplete returns multiple
    // plausible matches and the user query didn't exactly name one, we ask
    // the user to pick. `disambiguationCandidates` is the list of options
    // and `disambiguationContext` carries the inquiry / leadId from the
    // ambiguous turn so a follow-up POST can reference it.
    const [disambiguationCandidates, setDisambiguationCandidates] = useState(null);
    const [disambiguationContext, setDisambiguationContext] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [result, setResult] = useState(null);
    const [activeProcessStep, setActiveProcessStep] = useState(0);
    const [copied, setCopied] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [globalError, setGlobalError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
    const [showBuildingSuggestions, setShowBuildingSuggestions] = useState(false);
    // (Removed) `showSmartSuggestions` only gated the orphaned
    // `usePlacesSearch(smartQuery, ...)` call that the smart-suggestion
    // dropdown used to read from. The dropdown is gone now.
    const [smartQuery, setSmartQuery] = useState("");
    const [fieldSources, setFieldSources] = useState({ city: "manual", maids: "manual" });
    // Server-driven free-text intake — set by handleSubmit when the user
    // submits with text in the smart-search box. Mirrors the WhatsApp
    // pipeline's response: { decision, replyText, missingFields, ... }.
    // Used to render the inline "we need a bit more info" alert above the
    // form and to focus the first missing field after a needs_more_details.
    const [smartIntakeAlert, setSmartIntakeAlert] = useState(null);
    const [deedFile, setDeedFile] = useState(null);
    const [deedParsing, setDeedParsing] = useState(false);
    const [deedParsed, setDeedParsed] = useState(false);
    const [useDeedResult, setUseDeedResult] = useState(false);
    const deedInputRef = useRef(null);
    const turnstileContainerRef = useRef(null);
    const turnstileWidgetIdRef = useRef(null);
    const turnstileWidgetPromiseRef = useRef(null);
    const turnstilePendingRef = useRef(null);
    const turnstileConfigRef = useRef(defaultTurnstileConfig);
    const documentUploadConfigRef = useRef(defaultDocumentUploadConfig);
    // Once /api/valuation/config succeeds, cache the response so subsequent
    // submit/unlock/deed calls reuse it. Without this, a single 5xx blip
    // from the config endpoint cascades to every action on the page.
    const cachedConfigRef = useRef(null);
    // Track the active streaming controller so resubmits / disambig picks
    // can abort an in-flight request before kicking off the next one — stops
    // stale stream responses from overwriting newer state via applyLoadedReport.
    const activeStreamControllerRef = useRef(null);
    const [showPlaces, setShowPlaces] = useState(false);
    const smartInputRef = useRef(null);
    const placesRef = useRef(null);
    // (Removed) `usePlacesSearch(smartQuery, showSmartSuggestions)` and its
    // `smartPlacesResults` / `smartPlacesLoading` outputs were consumed only
    // by the smart-suggestion dropdown UI, which was removed when the page
    // switched to server-side LLM extraction via /api/valuation/from-text.
    // The Building input still uses its own usePlacesSearch via `placesResults`.
    const { results: placesResults, loading: placesLoading } = usePlacesSearch(form.unit, showPlaces);
    // DLD-backed area dropdown — derives unique areas from the same
    // buildings.json index that powers the Building dropdown. Activates as
    // soon as the field is focused (showAreaSuggestions=true). No loading
    // indicator needed — the index is cached locally, lookup is instant.
    const { results: areaSearchResults } = useAreaSearch(form.area, showAreaSuggestions && Boolean(form.city));
    const [unlocked, setUnlocked] = useState(false);
    const [gate, setGate] = useState({ name: "", phone: "", email: "" });
    const [gateErrors, setGateErrors] = useState({});
    const [gateSubmitting, setGateSubmitting] = useState(false);
    const [unlockHighlight, setUnlockHighlight] = useState(false);
    const [turnstileState, setTurnstileState] = useState("idle");
    const [loadingSavedReport, setLoadingSavedReport] = useState(false);
    // Single concurrency guard for every submission entry point:
    // - Get Valuation button (smart-text + manual)
    // - Disambiguation candidate buttons
    // - Internal retries inside runValuationWithPhases
    // The smart-text path doesn't transition to step="processing" until the
    // server replies (~1-3s of LLM extraction), so the form stays visible and
    // the button stays clickable without this guard. `submittingCandidateId`
    // tracks WHICH disambiguation candidate is being processed so we can show
    // the spinner on just that one card.
    const [submitting, setSubmitting] = useState(false);
    const [submittingCandidateId, setSubmittingCandidateId] = useState(null);
    const topRef = useRef(null);
    const unlockSectionRef = useRef(null);
    const unlockHighlightTimeoutRef = useRef(null);
    const reportHydrationAttemptedRef = useRef(false);
    const unitInputRef = useRef(null);
    const areaSuggestionsRef = useRef(null);
    const buildingSuggestionsRef = useRef(null);
    const setTrackedValues = useCallback((values, source) => {
        const entries = Object.entries(values)
            .filter((entry) => typeof entry[1] === "string");
        if (!entries.length) {
            return;
        }
        setForm((current) => {
            const next = Object.assign({}, current);
            for (const [key, value] of entries) {
                next[key] = value;
            }
            return next;
        });
        setFieldSources((current) => {
            const next = Object.assign({}, current);
            for (const [key, value] of entries) {
                if (value.trim())
                    next[key] = source;
                else
                    delete next[key];
            }
            return next;
        });
        // Live validation after the first submit attempt — clear errors as
        // the user fills the corresponding fields. We don't re-validate
        // here (that happens on next submit); we just remove the red badge
        // once the value is non-empty so the form feels responsive.
        if (submitAttempted) {
            setFieldErrors((prev) => {
                const next = Object.assign({}, prev);
                for (const key of Object.keys(values)) {
                    const value = typeof values[key] === "string" ? values[key] : "";
                    if (!value.trim()) continue;
                    if (key === "unit" && next.unit) delete next.unit;
                    if (key === "area" && next.area) delete next.area;
                    if (key === "city" && next.city) delete next.city;
                    if (key === "beds" && next.beds) delete next.beds;
                }
                return next;
            });
        }
    }, [submitAttempted]);
    const updateField = useCallback((key, val, source = "manual") => {
        setTrackedValues({ [key]: val }, source);
    }, [setTrackedValues]);
    const handleSmartInputChange = useCallback((value) => {
        setSmartQuery(value);
    }, []);
    // Close suggestions when clicking outside (Area + Building dropdowns
    // only; the smart-search suggestion dropdown was removed when the page
    // switched to server-side LLM extraction).
    useEffect(() => {
        const handler = (e) => {
            const target = e.target;
            if (areaSuggestionsRef.current && !areaSuggestionsRef.current.contains(target)) {
                setShowAreaSuggestions(false);
            }
            if (buildingSuggestionsRef.current && !buildingSuggestionsRef.current.contains(target) &&
                unitInputRef.current && !unitInputRef.current.contains(target)) {
                setShowBuildingSuggestions(false);
            }
            if (placesRef.current && !placesRef.current.contains(target) &&
                unitInputRef.current && !unitInputRef.current.contains(target)) {
                setShowPlaces(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const { turnstileConfig } = await loadValuationConfig();
                if (!cancelled && turnstileConfig.enabled && turnstileConfig.configured) {
                    await ensureTurnstileWidget(turnstileConfig);
                }
            }
            catch (_a) { }
        })();
        return () => {
            cancelled = true;
            if (unlockHighlightTimeoutRef.current) {
                clearTimeout(unlockHighlightTimeoutRef.current);
            }
            rejectPendingTurnstileRequest("Security verification was interrupted.");
            removeTurnstileWidget();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const applyLoadedReport = useCallback((data, options = {}) => {
        var _a;
        // PF-only engine disambiguation: server signals that PropertyFinder
        // autocomplete returned multiple plausible matches. Show a picker
        // instead of routing to results.
        if (
            data &&
            data.decision === "needs_more_details" &&
            Array.isArray(data.disambiguationCandidates) &&
            data.disambiguationCandidates.length >= 2
        ) {
            const nextForm = buildFormFromInquiry(data.inquiry, INITIAL_FORM_STATE);
            setForm(nextForm);
            setSmartQuery([nextForm.unit, nextForm.area, nextForm.city].filter(Boolean).join(", "));
            setFieldErrors({});
            setGlobalError(null);
            setDisambiguationCandidates(data.disambiguationCandidates);
            setDisambiguationContext({
                leadId: data.leadId || null,
                inquiry: data.inquiry || nextForm,
            });
            if (data.leadId) {
                replaceValuationIdInCurrentUrl(data.leadId);
            }
            setStep("disambiguation");
            (_a = topRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }
        // Only rebuild the form from the server-parsed inquiry on hydration
        // (page load with ?valuation=) — otherwise we'd overwrite the user's
        // own typed values whenever a stream resolves or an unlock returns.
        // `options.resetForm` is passed `true` by the hydration path only.
        if (options.resetForm) {
            const nextForm = buildFormFromInquiry(data === null || data === void 0 ? void 0 : data.inquiry, INITIAL_FORM_STATE);
            setForm(nextForm);
            setSmartQuery([nextForm.unit, nextForm.area, nextForm.city].filter(Boolean).join(", "));
            setFieldSources({ city: "manual", maids: "manual" });
        }
        const formForMapping = options.resetForm
            ? buildFormFromInquiry(data === null || data === void 0 ? void 0 : data.inquiry, INITIAL_FORM_STATE)
            : form;
        setFieldErrors({});
        setGateErrors({});
        setGate({ name: "", phone: "", email: "" });
        setGlobalError(null);
        setUseDeedResult(false);
        setDeedFile(null);
        setDeedParsing(false);
        setDeedParsed(false);
        setLoadingSavedReport(false);
        setDisambiguationCandidates(null);
        setDisambiguationContext(null);
        if ((data === null || data === void 0 ? void 0 : data.accessState) === "preview") {
            setResult(mapPreviewApiToResult(data, formForMapping));
            setUnlocked(false);
        }
        else {
            setResult(mapApiToResult(data, formForMapping));
            setUnlocked((data === null || data === void 0 ? void 0 : data.accessState) === "unlocked");
        }
        if (data === null || data === void 0 ? void 0 : data.leadId) {
            replaceValuationIdInCurrentUrl(data.leadId);
        }
        setStep("results");
        (_a = topRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [form]);
    const copyShareLink = useCallback(async () => {
        const shareUrl = buildShareUrlForValuationId(result === null || result === void 0 ? void 0 : result.leadId);
        if (!shareUrl) return;
        // navigator.clipboard requires a secure context AND user-granted
        // permission; either can fail. Show a brief inline error if the
        // copy itself rejects so the user knows to manually select the URL.
        try {
            if (!navigator.clipboard) throw new Error("Clipboard not available");
            await navigator.clipboard.writeText(shareUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch {
            setGlobalError("Could not copy the link automatically. Long-press the address bar or select the URL manually.");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result?.leadId]);
    const resetForNewSearch = useCallback(() => {
        var _a;
        setStep("form");
        setForm(INITIAL_FORM_STATE);
        setResult(null);
        setUnlocked(false);
        setGate({ name: "", phone: "", email: "" });
        setGateErrors({});
        setGateSubmitting(false);
        setFieldErrors({});
        setSubmitAttempted(false);
        setGlobalError(null);
        setRetryCount(0);
        setActiveProcessStep(0);
        setUseDeedResult(false);
        setDeedFile(null);
        setDeedParsing(false);
        setDeedParsed(false);
        setSmartQuery("");
        setShowAreaSuggestions(false);
        setShowBuildingSuggestions(false);
        setShowPlaces(false);
        setFieldSources({ city: "manual", maids: "manual" });
        setCopied(false);
        setLinkCopied(false);
        setLoadingSavedReport(false);
        replaceValuationIdInCurrentUrl("");
        (_a = topRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);
    useEffect(() => {
        if (reportHydrationAttemptedRef.current) {
            return;
        }
        reportHydrationAttemptedRef.current = true;
        const valuationId = getValuationIdFromCurrentUrl();
        if (!valuationId) {
            return;
        }
        let cancelled = false;
        setLoadingSavedReport(true);
        setGlobalError(null);
        setStep("processing");
        void (async () => {
            try {
                const response = await fetch(resolveApiUrl(`/api/valuation/report?valuation=${encodeURIComponent(valuationId)}`), {
                    headers: { Accept: "application/json" },
                    cache: "no-store",
                });
                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Could not load the saved valuation report.");
                }
                if (cancelled) {
                    return;
                }
                // Hydration from URL ?valuation=... — rebuild the form from
                // the server-side inquiry (this is the one path where doing
                // so is correct; everywhere else we keep user-typed values).
                applyLoadedReport(data, { resetForm: true });
            }
            catch {
                if (cancelled) {
                    return;
                }
                replaceValuationIdInCurrentUrl("");
                setLoadingSavedReport(false);
                // Hydration-specific copy: a generic "request failed" doesn't
                // tell the user what to do. The form is below the banner, so
                // direct them to start fresh.
                setGlobalError(
                    `That saved valuation could not be loaded — it may have expired or been removed. Start a fresh search below.`
                );
                setStep("form");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [applyLoadedReport, resolveApiUrl]);
    const scrollToUnlockSection = useCallback(() => {
        var _a;
        if (unlocked) {
            return;
        }
        (_a = unlockSectionRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
        setUnlockHighlight(true);
        if (unlockHighlightTimeoutRef.current) {
            clearTimeout(unlockHighlightTimeoutRef.current);
        }
        unlockHighlightTimeoutRef.current = setTimeout(() => {
            setUnlockHighlight(false);
        }, 1800);
    }, [unlocked]);
    const getUnlockCardProps = useCallback((enabled, label) => {
        if (!enabled) {
            return {};
        }
        return {
            "aria-label": label,
            className: "cursor-pointer transition-transform duration-300 hover:-translate-y-0.5",
            onClick: scrollToUnlockSection,
            onKeyDown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    scrollToUnlockSection();
                }
            },
            role: "button",
            tabIndex: 0,
        };
    }, [scrollToUnlockSection]);
    // `runValuation` (non-streaming, retries via recursion) was the original
    // submit path. It was replaced by `runValuationWithPhases` (NDJSON stream
    // with built-in retry) and is no longer called from anywhere. Removed to
    // eliminate the dead second copy and avoid future confusion about which
    // path is "live".
    const handleDeedUpload = async (file) => {
        setDeedFile(file);
        setDeedParsing(true);
        setDeedParsed(false);
        try {
            setGlobalError(null);
            setUseDeedResult(false);
            const { turnstileConfig, documentUploadConfig } = await loadValuationConfig();
            const mimeType = resolveDocumentMimeType(file);
            if (!mimeType || !documentUploadConfig.acceptedMimeTypes.includes(mimeType)) {
                throw new Error("Unsupported file format. Upload PDF, PNG, JPG/JPEG, WEBP, or GIF.");
            }
            if (file.size > documentUploadConfig.maxFileSizeBytes) {
                throw new Error("The selected file is too large for document extraction.");
            }
            const fileData = await readFileAsBase64(file);
            const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
            const response = await fetch(resolveApiUrl("/api/valuation/document"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign({ fileName: file.name, mimeType,
                    fileData }, (turnstileToken ? { turnstileToken } : {}))),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Could not extract property details from the uploaded file.");
            }
            const inquiry = (data === null || data === void 0 ? void 0 : data.inquiry) || {};
            setTrackedValues(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (inquiry.propertyName ? { unit: inquiry.propertyName } : {})), ((inquiry.community || inquiry.location) ? { area: inquiry.community || inquiry.location } : {})), (inquiry.city ? { city: inquiry.city } : {})), (inquiry.propertyType ? { type: normalizePropertyType(inquiry.propertyType, "") } : {})), (inquiry.bedrooms ? { beds: inquiry.bedrooms } : {})), (inquiry.maids ? { maids: inquiry.maids } : {})), (inquiry.size ? { size: inquiry.size } : {})), "deed");
            setGate((current) => ({
                name: current.name || inquiry.ownerName || current.name,
                phone: current.phone || inquiry.phone || current.phone,
                email: current.email || inquiry.email || current.email,
            }));
            setDeedParsed(true);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Could not read the deed.";
            setGlobalError(humanizeErrorMessage(msg));
            setDeedFile(null);
            setDeedParsed(false);
        }
        finally {
            setDeedParsing(false);
            resetTurnstileWidget();
        }
    };
    const scrollToFirstFormError = useCallback((errors) => {
        // Priority order matches the visual layout of the form so the user is
        // always scrolled to the FIRST blocking error rather than a later one.
        // The smart-search input lives above the manual fields and is the
        // best target when the user typed there — only fall back to the
        // building input when smart-search isn't focused yet.
        if (errors.city || errors.area || errors.unit) {
            const target = smartInputRef.current ?? unitInputRef.current;
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
            target?.focus();
            return;
        }
        if (errors.beds) {
            // Bedrooms sits below city/area/unit — scroll the smart input
            // into view; the field error renders inline below the picker so
            // the user can see what's blocking without further navigation.
            const target = smartInputRef.current ?? unitInputRef.current;
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
    }, []);
    // Translate a server-side inquiry record (the shape /api/valuation/from-text
    // and /api/valuation/stream return) into the form-state shape used by
    // the manual fields. Reuses buildFormFromInquiry which already handles
    // the field-name remapping (propertyName → unit, community → area, etc.).
    const fillFormFromServerInquiry = useCallback((serverInquiry) => {
        if (!serverInquiry) return form;
        const nextForm = buildFormFromInquiry(serverInquiry, form);
        setForm(nextForm);
        return nextForm;
    }, [form]);

    const handleSubmit = async (e) => {
        var _a;
        e.preventDefault();
        // Re-entry guard: ignore rapid double-clicks while a submission is
        // already in flight (the smart-text branch can take 1-3s before the
        // form unmounts to "processing", leaving the button clickable).
        if (submitting) return;
        setSubmitAttempted(true);
        setSmartIntakeAlert(null);

        const smartText = smartQuery.trim();
        if (smartText) {
            // Free-text path: same intake pipeline WhatsApp users hit.
            // The server runs LLM extraction + matchers + validation, then
            // tells us one of: ready (proceed), needs_more_details (ask the
            // user), guidance (example reply), extraction_failed (LLM down).
            setSubmitting(true);
            try {
                await submitFromText(smartText);
            } finally {
                // submitFromText resets submitting itself on the streaming
                // path (via runValuationWithPhases). For the early-return
                // branches (guidance/needs_more_details/error) we must also
                // make sure the guard releases.
                setSubmitting(false);
            }
            return;
        }

        // Manual-form path: validate locally + submit directly.
        const errors = validateForm(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            scrollToFirstFormError(errors);
            return;
        }
        setFieldErrors({});
        setGlobalError(null);
        setRetryCount(0);
        setSubmitting(true);
        setStep("processing");
        setActiveProcessStep(0);
        (_a = topRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        try {
            const { turnstileConfig } = await loadValuationConfig();
            const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
            // `community` alone is enough — backend normalizeInquiry reads
            // either `community` or `location`. Sending both was legacy noise.
            const apiPayload = Object.assign({ countryCode: form.countryCode || "AE", transactionType: form.transactionType, propertyName: form.unit, community: form.area, city: form.city, propertyType: form.type, bedrooms: form.beds, maids: form.maids, size: form.size }, (turnstileToken ? { turnstileToken } : {}));
            // runValuationWithPhases owns the submitting reset for the
            // streaming path — it stays true across retries, then flips to
            // false in its finally block (top-level call only).
            await runValuationWithPhases(apiPayload, 1);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : "Security verification failed.";
            setGlobalError(humanizeErrorMessage(msg));
            setStep("form");
            setSubmitting(false);
        }
    };

    const submitFromText = async (text) => {
        var _a;
        setGlobalError(null);
        setRetryCount(0);
        setFieldErrors({});
        try {
            const response = await fetch(resolveApiUrl("/api/valuation/from-text"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error((data && data.error) || `Request failed (${response.status}).`);
            }
            // Always reflect what the server understood back into the form so
            // the user can see + tweak the extracted values regardless of
            // decision branch. Fallback to current form if no inquiry.
            const filledForm = data.inquiry ? fillFormFromServerInquiry(data.inquiry) : form;

            if (data.decision === "guidance") {
                setSmartIntakeAlert({ kind: "guidance", message: data.replyText || "Please describe the property in more detail." });
                return;
            }
            if (data.decision === "extraction_failed") {
                setGlobalError(data.replyText || "Could not read your message. Please try again.");
                return;
            }
            if (data.decision === "needs_more_details") {
                // Stay on the form, show an inline alert with the server's
                // ask, scroll the first missing field into view so the user
                // can complete it inline. Re-submit goes through the manual
                // path (smartQuery is unchanged but the form has the
                // extracted values now).
                setSmartIntakeAlert({
                    kind: "needs_more_details",
                    message: data.replyText || data.validationError || "We need a bit more info before we can run the valuation.",
                    missingFields: Array.isArray(data.missingFields) ? data.missingFields : [],
                });
                if (Array.isArray(data.missingFields) && data.missingFields.length) {
                    const focusable = { city: "city", community: "area", location: "area", propertyName: "unit", bedrooms: "beds" };
                    const errs = {};
                    for (const m of data.missingFields) {
                        const formKey = focusable[m];
                        if (formKey) errs[formKey] = `Required to run the valuation.`;
                    }
                    setFieldErrors(errs);
                    scrollToFirstFormError(errs);
                }
                return;
            }
            if (data.decision === "ready") {
                // Server says we have everything. Stream the valuation.
                setStep("processing");
                setActiveProcessStep(0);
                (_a = topRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
                const { turnstileConfig } = await loadValuationConfig();
                const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
                const apiPayload = Object.assign({
                    countryCode: data.inquiry?.countryCode || filledForm.countryCode || "AE",
                    transactionType: data.inquiry?.transactionType || filledForm.transactionType,
                    propertyName: data.inquiry?.propertyName || filledForm.unit,
                    community: data.inquiry?.community || filledForm.area,
                    city: data.inquiry?.city || filledForm.city,
                    propertyType: data.inquiry?.propertyType || filledForm.type,
                    bedrooms: data.inquiry?.bedrooms || filledForm.beds,
                    maids: data.inquiry?.maids || filledForm.maids,
                    size: data.inquiry?.size || filledForm.size,
                    // Carry locationId forward if the LLM resolved one (rare on
                    // first turn, but the disambig branch sets it).
                    ...(data.inquiry?.locationId ? { locationId: data.inquiry.locationId } : {}),
                }, (turnstileToken ? { turnstileToken } : {}));
                await runValuationWithPhases(apiPayload, 1);
                return;
            }
            // Unknown decision — fall back to a generic prompt.
            setSmartIntakeAlert({
                kind: "needs_more_details",
                message: "Please describe the property in more detail.",
                missingFields: [],
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Could not process your message.";
            setGlobalError(humanizeErrorMessage(msg));
            setStep("form");
        }
    };
    // Separate function that also tracks phases (keeps runValuation clean for retries)
    const runValuationWithPhases = async (payload, attempt) => {
        var _a, _b, _c, _d, _e, _f;
        // Abort any in-flight stream before kicking off a new one. Otherwise a
        // resubmit (or disambig pick) leaves the old stream running — when it
        // resolves, applyLoadedReport stomps the result of the newer stream.
        if (attempt === 1 && activeStreamControllerRef.current) {
            try { activeStreamControllerRef.current.abort(); } catch { /* ignore */ }
            activeStreamControllerRef.current = null;
        }
        const controller = new AbortController();
        if (attempt === 1) {
            activeStreamControllerRef.current = controller;
        }
        const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
        try {
            const res = await fetch(resolveApiUrl("/api/valuation/stream"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                if (res.status === 429) {
                    const retry = errData === null || errData === void 0 ? void 0 : errData.retryAfterSeconds;
                    throw new Error(retry
                        ? `Service at capacity. Please try again in ${retry} seconds.`
                        : ((_a = errData === null || errData === void 0 ? void 0 : errData.error) !== null && _a !== void 0 ? _a : "Too many requests."));
                }
                throw new Error((_b = errData === null || errData === void 0 ? void 0 : errData.error) !== null && _b !== void 0 ? _b : `Request failed (${res.status}).`);
            }
            if (!res.body)
                throw new Error("Streaming not supported in this browser.");
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let finalData = null;
            while (true) {
                const { value, done } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = (_c = lines.pop()) !== null && _c !== void 0 ? _c : "";
                for (const line of lines) {
                    if (!line.trim())
                        continue;
                    let evt;
                    try {
                        evt = JSON.parse(line);
                    }
                    catch (_g) {
                        continue;
                    }
                    if (evt.event === "error")
                        throw new Error((_d = evt.error) !== null && _d !== void 0 ? _d : "Valuation failed.");
                    if (evt.event in phaseMap)
                        setActiveProcessStep(phaseMap[evt.event]);
                    if (evt.event === "final" && evt.data)
                        finalData = evt.data;
                }
            }
            if (!finalData)
                throw new Error("Stream ended before a result was returned.");
            applyLoadedReport(finalData);
        }
        catch (err) {
            clearTimeout(timeout);
            const msg = err instanceof Error ? err.message : "Something went wrong.";
            const isTimeout = err instanceof Error && err.name === "AbortError";
            const isRetryable = (isTimeout || !msg.includes("Too many requests")) && attempt < MAX_RETRIES;
            console.error(`[ValuationPage] attempt ${attempt}:`, err);
            if (isRetryable) {
                setRetryCount(attempt);
                setActiveProcessStep(0);
                await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
                await runValuationWithPhases(payload, attempt + 1);
            }
            else {
                setGlobalError(isTimeout
                    ? "The valuation timed out. Please try again."
                    : humanizeErrorMessage(msg));
                setStep("form");
                (_f = topRef.current) === null || _f === void 0 ? void 0 : _f.scrollIntoView({ behavior: "smooth" });
            }
        }
        finally {
            clearTimeout(timeout);
            resetTurnstileWidget();
            // Only the top-level (attempt===1) call owns the controller ref.
            // Internal retries (attempt > 1) get their own controller and must
            // NOT touch the ref or they'd race the top-level abort logic.
            if (attempt === 1 && activeStreamControllerRef.current === controller) {
                activeStreamControllerRef.current = null;
            }
            // Release the submission guard only at the TOP level — internal
            // retries must keep it true so the form/candidate stays disabled
            // while we're still trying. The disambiguation candidate id is
            // cleared here too so the spinner clears on the picker (if the
            // user lands back on it via "None of these" later).
            if (attempt === 1) {
                setSubmitting(false);
                setSubmittingCandidateId(null);
            }
        }
    };
    // PF disambiguation: user picked a candidate from the surfaced list.
    // Lock the candidate's canonical name as the building/unit and re-run.
    const selectDisambiguationCandidate = async (candidate) => {
        var _a;
        if (!candidate || !candidate.name) return;
        // Re-entry guard: ignore clicks while a candidate is already being
        // processed (button stays mounted until setStep("processing")
        // commits, so two rapid clicks would otherwise double-fire).
        if (submitting) return;
        const ctxInquiry = (disambiguationContext && disambiguationContext.inquiry) || {};
        const updatedForm = Object.assign({}, form, { unit: candidate.name });
        setForm(updatedForm);
        setSubmitting(true);
        setSubmittingCandidateId(candidate.id != null ? String(candidate.id) : candidate.name);
        setDisambiguationCandidates(null);
        setDisambiguationContext(null);
        setStep("processing");
        setActiveProcessStep(0);
        setGlobalError(null);
        setRetryCount(0);
        (_a = topRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
        try {
            const { turnstileConfig } = await loadValuationConfig();
            const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
            // Lock the picked candidate by id — the backend uses `locationId`
            // to skip its own autocomplete resolution and prevent the user
            // from being re-disambiguated on the next turn. Mirrors the same
            // architectural fix already shipped on the WhatsApp pipeline.
            const apiPayload = Object.assign(
                {
                    countryCode: updatedForm.countryCode || ctxInquiry.countryCode || "AE",
                    transactionType: updatedForm.transactionType || ctxInquiry.transactionType,
                    propertyName: candidate.name,
                    community: updatedForm.area || ctxInquiry.community || ctxInquiry.location || "",
                    city: updatedForm.city || ctxInquiry.city,
                    propertyType: updatedForm.type || ctxInquiry.propertyType,
                    bedrooms: updatedForm.beds || ctxInquiry.bedrooms,
                    maids: updatedForm.maids || ctxInquiry.maids,
                    size: updatedForm.size || ctxInquiry.size,
                },
                candidate.id != null ? { locationId: String(candidate.id) } : {},
                turnstileToken ? { turnstileToken } : {},
            );
            await runValuationWithPhases(apiPayload, 1);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Something went wrong.";
            setGlobalError(humanizeErrorMessage(msg));
            setStep("form");
            setSubmitting(false);
            setSubmittingCandidateId(null);
        }
    };
    const loadValuationConfig = useCallback(async () => {
        // Resilience: once we've successfully loaded the config, reuse it for
        // subsequent submit/unlock/deed calls. Only re-fetch if the request
        // explicitly fails — a single 5xx blip from /api/valuation/config
        // would otherwise block every protected action on the page.
        if (cachedConfigRef.current) {
            return cachedConfigRef.current;
        }
        const response = await fetch(resolveApiUrl("/api/valuation/config"), {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        const responseText = await response.text();
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            }
            catch (_a) {
                data = null;
            }
        }
        if (!response.ok) {
            const detail = typeof (data === null || data === void 0 ? void 0 : data.error) === "string" && data.error.trim().length > 0
                ? data.error.trim()
                : responseText.trim();
            throw new Error(detail
                ? `Could not load the valuation form settings. ${detail}`
                : "Could not load the valuation form settings.");
        }
        const configData = data;
        const nextTurnstileConfig = normalizeTurnstileConfig(configData === null || configData === void 0 ? void 0 : configData.turnstile);
        const nextDocumentUploadConfig = normalizeDocumentUploadConfig(configData === null || configData === void 0 ? void 0 : configData.documentUpload);
        turnstileConfigRef.current = nextTurnstileConfig;
        documentUploadConfigRef.current = nextDocumentUploadConfig;
        const resolved = {
            turnstileConfig: nextTurnstileConfig,
            documentUploadConfig: nextDocumentUploadConfig,
        };
        cachedConfigRef.current = resolved;
        return resolved;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const ensureTurnstileWidget = useCallback(async (config) => {
        if (!config.enabled) {
            return null;
        }
        if (!config.configured) {
            throw new Error("Security verification is temporarily unavailable. Please try again later.");
        }
        if (!turnstileContainerRef.current) {
            throw new Error("Security verification is not ready yet. Please try again.");
        }
        if (turnstileWidgetIdRef.current !== null) {
            const turnstile = await loadTurnstileScript();
            setTurnstileState("ready");
            return turnstile;
        }
        if (!turnstileWidgetPromiseRef.current) {
            turnstileWidgetPromiseRef.current = (async () => {
                const turnstile = await loadTurnstileScript();
                if (turnstileWidgetIdRef.current === null && turnstileContainerRef.current) {
                    turnstileWidgetIdRef.current = turnstile.render(turnstileContainerRef.current, {
                        sitekey: config.siteKey,
                        action: config.action,
                        appearance: "execute",
                        execution: "execute",
                        callback(token) {
                            const pending = turnstilePendingRef.current;
                            if (!pending)
                                return;
                            turnstilePendingRef.current = null;
                            setTurnstileState("ready");
                            pending.resolve(token);
                        },
                        "error-callback": () => rejectPendingTurnstileRequest("Security verification failed. Please try again."),
                        "expired-callback": () => rejectPendingTurnstileRequest("Security verification expired. Please try again."),
                        "timeout-callback": () => rejectPendingTurnstileRequest("Security verification timed out. Please try again."),
                    });
                }
                setTurnstileState("ready");
                return turnstile;
            })();
        }
        try {
            return await turnstileWidgetPromiseRef.current;
        }
        finally {
            turnstileWidgetPromiseRef.current = null;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const requestTurnstileToken = useCallback(async () => {
        const config = turnstileConfigRef.current.enabled || turnstileConfigRef.current.siteKey
            ? turnstileConfigRef.current
            : (await loadValuationConfig()).turnstileConfig;
        if (!config.enabled) {
            return "";
        }
        const turnstile = await ensureTurnstileWidget(config);
        if (!turnstile || turnstileWidgetIdRef.current === null) {
            throw new Error("Security verification is not ready yet. Please try again.");
        }
        setTurnstileState("verifying");
        return await new Promise((resolve, reject) => {
            rejectPendingTurnstileRequest("Security verification was interrupted.");
            turnstilePendingRef.current = { resolve, reject };
            try {
                turnstile.reset(turnstileWidgetIdRef.current);
                turnstile.execute(turnstileWidgetIdRef.current);
            }
            catch (_a) {
                rejectPendingTurnstileRequest("Security verification could not start. Please try again.");
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ensureTurnstileWidget, loadValuationConfig]);
    const resetTurnstileWidget = useCallback(() => {
        if (!window.turnstile || turnstileWidgetIdRef.current === null)
            return;
        try {
            window.turnstile.reset(turnstileWidgetIdRef.current);
            if (turnstileConfigRef.current.enabled && turnstileConfigRef.current.configured) {
                setTurnstileState("ready");
            }
        }
        catch (_a) { }
    }, []);
    const removeTurnstileWidget = useCallback(() => {
        turnstileWidgetPromiseRef.current = null;
        if (!window.turnstile || turnstileWidgetIdRef.current === null) {
            turnstileWidgetIdRef.current = null;
            return;
        }
        try {
            window.turnstile.remove(turnstileWidgetIdRef.current);
        }
        catch (_a) { }
        turnstileWidgetIdRef.current = null;
    }, []);
    const rejectPendingTurnstileRequest = useCallback((message) => {
        const pending = turnstilePendingRef.current;
        if (!pending)
            return;
        turnstilePendingRef.current = null;
        setTurnstileState("error");
        pending.reject(new Error(message));
    }, []);
    const copySummary = async () => {
        if (!result) return;
        const c = result.currency;
        const text = [
            `Valuation for ${result.community}, ${result.city}`,
            `Fair Value: ${fmt(result.fairValueLow, c)} – ${fmt(result.fairValueHigh, c)}`,
            `Suggested List: ${fmt(result.suggestedListLow, c)} – ${fmt(result.suggestedListHigh, c)}`,
            `Quick Sale: ${fmt(result.quickSaleLow, c)} – ${fmt(result.quickSaleHigh, c)}`,
        ].join("\n");
        try {
            if (!navigator.clipboard) throw new Error("Clipboard not available");
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setGlobalError("Could not copy the summary automatically. Select the values manually instead.");
        }
    };
    const showLockedFairValuePreview = !unlocked && (result === null || result === void 0 ? void 0 : result.accessState) === "preview";
    const priceComparisonBounds = getPriceComparisonBounds(result);
    const lockedPriceComparisonCardProps = getUnlockCardProps(!unlocked, "Unlock the full report");
    const lockedComparableEvidenceCardProps = getUnlockCardProps(!unlocked, "Unlock the full report to reveal comparable evidence");
    const lockedMarketReadCardProps = getUnlockCardProps(!unlocked, "Unlock the full report to reveal market read");
    const lockedStrategyCardProps = getUnlockCardProps(!unlocked, "Unlock the full report to reveal recommended strategy");
    const lockedMovingFactorsCardProps = getUnlockCardProps(Boolean(result === null || result === void 0 ? void 0 : result.movingFactorsLocked), "Unlock the full report to reveal what can move this estimate");
    const deliveryNotice = getDeliveryNotice(result === null || result === void 0 ? void 0 : result.delivery);
    const currentProcessingStep = Math.min(activeProcessStep + 1, processingSteps.length);
    const processingProgress = `${(currentProcessingStep / processingSteps.length) * 100}%`;
    // ─── Render ────────────────────────────────────────────────────────────────
    return (<div className="min-h-screen bg-[#faf7f2] text-[#10231e]">
      {Header ? <Header /> : null}
      <div ref={topRef} className="h-16 sm:h-20"/>

      <AnimatePresence mode="wait">

        {/* ── Form ── */}
        {step === "form" && (<motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
            {/* Hero */}
            <section className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 sm:pt-12">
              <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                      <Target className="h-4 w-4 text-white"/>
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {tv("ownerReadyValuation")}
                    </p>
                  </div>
                  <h1 className="mb-6 text-3xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
                    {tv("heroTitle")}{" "}
                    <span style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      {tv("heroTitleHighlight")}
                    </span>{" "}{tv("heroTitleSuffix")}
                  </h1>
                  <p className="mb-6 max-w-xl text-base text-[#66706d] sm:text-lg">
                    {tv("heroSubtitle")}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {[tv("recentSales"), tv("liveAskingPrices"), tv("expertGuidance")].map((chip) => (<span key={chip} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#10231e] rounded-xl text-xs font-bold border border-[rgba(227,221,207,0.5)] shadow-sm hover:border-[rgba(11,61,46,0.3)] hover:shadow-md transition-all duration-300">
                        {chip}
                      </span>))}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="space-y-5 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}/>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {tv("whatYouGet")}
                      </p>
                    </div>
                    {[
                { icon: TrendingUp, title: tv("wyg1Title"), desc: tv("wyg1Desc") },
                { icon: Target, title: tv("wyg2Title"), desc: tv("wyg2Desc") },
                { icon: Sparkles, title: tv("wyg3Title"), desc: tv("wyg3Desc") },
            ].map((item) => (<div key={item.title} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="h-4 w-4 text-[#0B3D2E]"/>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#10231e] text-sm">{item.title}</h3>
                          <p className="text-[#66706d] text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>))}
                  </div>
                </div>
              </div>
            </section>

            {/* Global error banner */}
            {globalError && (<div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
                <div className="rounded-2xl border border-[rgba(180,35,24,0.3)] bg-[rgba(180,35,24,0.1)] px-6 py-4 text-sm text-[#b42318] font-medium flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5"/>
                  <span className="flex-1">{globalError}</span>
                  <button
                    type="button"
                    aria-label="Dismiss error"
                    onClick={() => setGlobalError(null)}
                    className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full text-[#b42318]/70 transition-colors hover:bg-[#b42318]/10 hover:text-[#b42318]"
                  >
                    <X className="h-4 w-4"/>
                  </button>
                </div>
              </div>)}

            {/* Form */}
            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
              <div className="rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                    <Building2 className="h-4 w-4 text-white"/>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold sm:text-3xl">{tv("tellUsAbout")}</h2>
                    <p className="text-xs text-[#66706d] mt-0.5">{tv("formSubtitle")}</p>
                  </div>
                </div>
                <div className="h-px bg-[rgba(227,221,207,0.5)] my-6"/>

                <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">

                  {/* Inline alert from the server's free-text intake.
                       Two branches:
                       - "guidance": the LLM found no property in the message
                         (gibberish / chit-chat). We render a web-native tip
                         card with three actionable suggestions instead of
                         the raw WhatsApp reply.
                       - "needs_more_details": real partial extraction. We
                         keep the server's ask but strip the WhatsApp
                         signature so it reads cleanly on web. */}
                  {smartIntakeAlert && smartIntakeAlert.kind === "guidance" ? (
                    <div
                      role="status"
                      className="relative overflow-hidden rounded-2xl border border-[#D4A847]/40 bg-gradient-to-br from-[#fdf7ec] to-white p-5 sm:p-6"
                    >
                      <button
                        type="button"
                        aria-label="Dismiss"
                        onClick={() => setSmartIntakeAlert(null)}
                        className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#7a5b14]/70 transition-colors hover:bg-[#D4A847]/15 hover:text-[#5a3f0a]"
                      >
                        <X className="h-4 w-4"/>
                      </button>
                      <div className="flex items-start gap-3 pr-8">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A847] to-[#B8922F] text-white shadow-[0_6px_14px_rgba(212,168,71,0.28)]">
                          <Sparkles className="h-4 w-4"/>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-[#5a3f0a]">
                            We couldn’t spot a property in your message
                          </h3>
                          <p className="mt-0.5 text-xs text-[#7a5b14]/80">
                            Pick one of these and we’ll value it for you.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSmartQuery("Marina Gate 1, Dubai Marina, 2BR");
                            setSmartIntakeAlert(null);
                            smartInputRef.current?.focus();
                          }}
                          className="group flex items-start gap-2.5 rounded-xl border border-[#D4A847]/25 bg-white px-3 py-3 text-left transition-all hover:border-[#0B3D2E]/30 hover:bg-[#0B3D2E]/[0.025] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                        >
                          <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0B3D2E]"/>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#10231e]">Type the details</p>
                            <p className="mt-0.5 text-[11px] text-[#66706d] leading-snug truncate">
                              “Marina Gate 1, 2BR” →
                            </p>
                          </div>
                        </button>
                        <div className="flex items-start gap-2.5 rounded-xl border border-[#D4A847]/25 bg-white px-3 py-3 text-left">
                          <Link2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0B3D2E]"/>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#10231e]">Paste a listing URL</p>
                            <p className="mt-0.5 text-[11px] text-[#66706d] leading-snug">
                              From PropertyFinder, Bayut, or Dubizzle.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSmartIntakeAlert(null);
                            deedInputRef.current?.click();
                          }}
                          className="group flex items-start gap-2.5 rounded-xl border border-[#D4A847]/25 bg-white px-3 py-3 text-left transition-all hover:border-[#0B3D2E]/30 hover:bg-[#0B3D2E]/[0.025] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                        >
                          <FileUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0B3D2E]"/>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#10231e]">Upload the title deed</p>
                            <p className="mt-0.5 text-[11px] text-[#66706d] leading-snug">
                              PDF or image — we’ll extract the rest.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : smartIntakeAlert ? (
                    <div
                      role="status"
                      className="rounded-2xl border border-[#d4a847]/40 bg-[#fdf7ec] px-4 py-3 text-sm text-[#5a3f0a]"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B8922F]"/>
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {stripWhatsappSignature(smartIntakeAlert.message)}
                          </p>
                          {Array.isArray(smartIntakeAlert.missingFields) && smartIntakeAlert.missingFields.length > 0 ? (
                            <p className="mt-2 text-xs text-[#7a5b14]">
                              Highlighted below:{" "}
                              {smartIntakeAlert.missingFields
                                .map((f) => ({ city: "City", community: "Area / Community", location: "Area / Community", propertyName: "Building", bedrooms: "Bedrooms", transactionType: "Transaction type" })[f] || f)
                                .join(", ")}
                            </p>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setSmartIntakeAlert(null)}
                            className="mt-2 text-xs font-medium underline-offset-2 hover:underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Smart search bar */}
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="inline-flex rounded-full border border-[rgba(227,221,207,0.6)] bg-[rgba(244,239,231,0.35)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                        {TRANSACTION_TYPE_OPTIONS.map((option) => {
                const active = form.transactionType === option.value;
                return (<button key={option.value} type="button" disabled={submitting} onClick={() => updateField("transactionType", option.value)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 disabled:cursor-wait disabled:opacity-60 sm:px-5 ${active
                        ? "text-white shadow-[0_10px_24px_rgba(11,61,46,0.22)]"
                        : "text-[#66706d] hover:text-[#10231e]"}`} style={active
                        ? {
                            background: option.value === "buy"
                                ? "linear-gradient(135deg, #0B3D2E, #1A7A5A)"
                                : "linear-gradient(135deg, #D4A847, #B8922F)",
                        }
                        : undefined}>
                              {option.label}
                            </button>);
            })}
                      </div>
                      <p className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(102,112,109,0.7)] sm:block">
                        {tv("searchMode")}
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#66706d] pointer-events-none z-10"/>
                      {/* Right padding scales with what's visible: just space
                          for the icons when empty, more room when the inline
                          submit pill appears so text doesn't slip under it. */}
                      <input
                        ref={smartInputRef}
                        value={smartQuery}
                        onChange={(e) => handleSmartInputChange(e.target.value)}
                        disabled={submitting}
                        placeholder='Try "Marina Gate 1, Dubai Marina, 2BR" or "3 bed villa Dubai Hills"'
                        className={`h-14 w-full rounded-2xl border-2 border-[#0B3D2E]/20 bg-[#faf7f2] pl-12 text-[15px] transition-all placeholder:text-[rgba(102,112,109,0.5)] focus:outline-none focus:border-[#0B3D2E]/40 focus:ring-2 focus:ring-[#0B3D2E]/10 disabled:cursor-wait disabled:opacity-70 ${smartQuery ? "pr-44 sm:pr-52" : "pr-12"}`}
                      />
                      {smartQuery && (
                        <div className="absolute inset-y-0 right-2 flex items-center gap-1.5 sm:right-2.5">
                          <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setSmartQuery("")}
                            disabled={submitting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#66706d] transition-colors hover:bg-[#0B3D2E]/5 hover:text-[#10231e] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="h-4 w-4"/>
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            aria-busy={submitting}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(11,61,46,0.22)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-wait disabled:opacity-80 disabled:hover:scale-100 sm:px-5"
                            style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                          >
                            {submitting ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin"/>
                                <span className="hidden sm:inline">{tv("gettingValuation")}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5"/>
                                <span>{tv("getValuation")}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Or divider + deed upload */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-[rgba(227,221,207,0.5)]"/>
                    <span className="text-xs font-semibold text-[#66706d] uppercase tracking-wider">{tv("or")}</span>
                    <div className="flex-1 h-px bg-[rgba(227,221,207,0.5)]"/>
                  </div>

                  {/* ── Title deed upload ── */}
                  <div>
                    <input ref={deedInputRef} type="file" accept={documentUploadConfigRef.current.accept} className="hidden" onChange={(e) => {
                var _a;
                const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                if (file)
                    handleDeedUpload(file);
                e.target.value = "";
            }}/>
                    {!deedFile ? (<button type="button" disabled={submitting} onClick={() => { var _a; return (_a = deedInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} className="group flex w-full flex-col items-start gap-3 rounded-2xl border-2 border-dashed border-[#0B3D2E]/20 px-5 py-4 text-left text-[#66706d] transition-all duration-200 hover:border-[#0B3D2E]/40 hover:bg-[#0B3D2E]/5 hover:text-[#0B3D2E] disabled:cursor-wait disabled:opacity-60 disabled:hover:border-[#0B3D2E]/20 disabled:hover:bg-transparent disabled:hover:text-[#66706d] sm:flex-row sm:items-center sm:justify-center sm:px-6">
                        <FileUp className="h-5 w-5 group-hover:scale-110 transition-transform"/>
                        <div className="text-left">
                          <p className="text-sm font-semibold">{tv("uploadTitleDeed")}</p>
                          <p className="text-xs opacity-70">{tv("uploadDesc")}</p>
                        </div>
                        <span className="rounded-full bg-[#0B3D2E]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0B3D2E] sm:ml-auto">{tv("optional")}</span>
                      </button>) : (<div className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 transition-all duration-300 sm:flex-row sm:items-center sm:px-5 ${deedParsing ? "border-[#D4A847]/30 bg-[#D4A847]/5" :
                    deedParsed ? "border-[#0B3D2E]/25 bg-[#0B3D2E]/5" :
                        "border-[#e3ddcf] bg-[rgba(244,239,231,0.3)]"}`}>
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${deedParsing ? "bg-[#D4A847]/15" : deedParsed ? "bg-[#0B3D2E]/10" : "bg-[#f4efe7]"}`}>
                          {deedParsing
                    ? <RefreshCw className="h-4 w-4 text-[#D4A847] animate-spin"/>
                    : deedParsed
                        ? <FileText className="h-4 w-4 text-[#0B3D2E]"/>
                        : <FileUp className="h-4 w-4 text-[#66706d]"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#10231e] truncate">{deedFile.name}</p>
                          <p className="text-xs text-[#66706d] mt-0.5">
                            {deedParsing ? "Reading deed and extracting property details…" :
                    deedParsed ? "Fields filled from deed — review and adjust below" :
                        "Ready to process"}
                          </p>
                        </div>
                        {!deedParsing && (<button type="button" disabled={submitting} onClick={() => { setDeedFile(null); setDeedParsed(false); setUseDeedResult(false); }} className="self-end p-1 text-[#66706d] transition-colors hover:text-[#10231e] disabled:cursor-wait disabled:opacity-50 disabled:hover:text-[#66706d] sm:self-auto">
                            <X className="h-4 w-4"/>
                          </button>)}
                      </div>)}
                  </div>

                  {/* Row 1 — City → (Area OR Building). Each of Area /
                       Building gets a small "or <other>" tag in its label —
                       same pattern the unlock card uses for Phone / Email.
                       Clear, unobtrusive, and accurately implies that
                       either one satisfies the location requirement. */}
                  <div className="grid sm:grid-cols-3 gap-4">

                    {/* City */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
                        {tv("city")}
                        <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">{tv("required")}</span>
                      </label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#66706d] flex-shrink-0"/>
                        <select value={form.city} onChange={(event) => {
                const v = event.target.value;
                setTrackedValues({ city: v, area: "", unit: "" }, "manual");
                if (submitAttempted)
                    setFieldErrors((prev) => {
                        const next = Object.assign({}, prev);
                        delete next.city;
                        return next;
                    });
            }} className={`h-12 w-full appearance-none rounded-xl border bg-[#faf7f2] pl-10 pr-10 text-sm text-[#10231e] outline-none transition-colors hover:border-[rgba(102,112,109,0.3)] focus:border-[#0B3D2E]/40 ${fieldErrors.city ? "border-[#b42318]" : "border-[#e3ddcf]"}`}>
                          {SUPPORTED_CITIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                        <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66706d]" fill="none" viewBox="0 0 12 8">
                          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"/>
                        </svg>
                      </div>
                      {fieldErrors.city && (<p className="text-xs text-[#b42318] mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0"/>{fieldErrors.city}
                        </p>)}
                    </div>

                    {/* Area / Community — searchable. Label carries an
                         inline "or building" tag (same pattern the unlock
                         card uses for Phone / Email) so the OR-relationship
                         with the next field reads naturally without a
                         badge or a separate connector. */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
                        {tv("areaCommunity")}
                        <span className="text-[9px] text-[rgba(102,112,109,0.6)] font-normal normal-case tracking-normal">{tv("orBuilding")}</span>
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66706d] z-10 pointer-events-none"/>
                        <input
                          value={form.area}
                          onChange={(e) => {
                            setTrackedValues({ area: e.target.value, unit: "" }, "manual");
                            setShowAreaSuggestions(true);
                          }}
                          onFocus={() => setShowAreaSuggestions(true)}
                          onKeyDown={(e) => { if (e.key === "Escape") setShowAreaSuggestions(false); }}
                          placeholder={form.city ? `Search in ${form.city}…` : "Select city first"}
                          autoComplete="off"
                          disabled={!form.city}
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={showAreaSuggestions && areaSearchResults.length > 0}
                          className={`w-full pl-10 h-12 bg-[#faf7f2] rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]/40 disabled:opacity-50 disabled:cursor-not-allowed ${fieldErrors.area ? "border-[#b42318]" : "border-[#e3ddcf]"}`}
                        />
                        {/* DLD-backed area dropdown — softer header + a
                             "use as typed" first item so the user knows the
                             suggestions are optional. Mirrors the Building
                             field's pattern. */}
                        {showAreaSuggestions && form.city && (areaSearchResults.length > 0 || form.area.trim()) ? (
                          <div ref={areaSuggestionsRef} role="listbox" className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-[#e3ddcf] bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                            <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[rgba(102,112,109,0.6)] bg-[rgba(244,239,231,0.3)] border-b border-[rgba(227,221,207,0.3)]">
                              {tv("liveResults")}
                            </p>
                            {form.area.trim() ? (
                              <button
                                type="button"
                                role="option"
                                aria-selected="false"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-[#f4efe7]/50 transition-colors flex items-start gap-2.5 border-b border-[rgba(227,221,207,0.3)] bg-[rgba(244,239,231,0.35)]"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  // Commit the user's free text verbatim and close the dropdown.
                                  setShowAreaSuggestions(false);
                                }}
                              >
                                <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B3D2E]/10 text-[11px] text-[#0B3D2E] mt-0.5">✏</span>
                                <div className="min-w-0">
                                  <p className="font-medium text-[#10231e] truncate">
                                    {tv("useAsTyped", { value: form.area.trim() })}
                                  </p>
                                  <p className="text-xs text-[#66706d] truncate mt-0.5">
                                    {tv("useAsTypedSub")}
                                  </p>
                                </div>
                              </button>
                            ) : null}
                            {areaSearchResults.map((a) => (
                              <button
                                key={a.area}
                                type="button"
                                role="option"
                                aria-selected="false"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-[#f4efe7]/50 transition-colors flex items-center gap-2.5 border-b border-[rgba(227,221,207,0.3)] last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setTrackedValues({ area: a.area, unit: "" }, "manual");
                                  setShowAreaSuggestions(false);
                                }}
                              >
                                <MapPin className="h-3.5 w-3.5 text-[#66706d] flex-shrink-0"/>
                                <span className="flex-1 truncate">{a.area}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {fieldErrors.area && (<p className="text-xs text-[#b42318] mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0"/>{fieldErrors.area}
                        </p>)}
                    </div>

                    {/* Building + Unit — mirrors the Area pattern: inline
                         "or area" tag in the label, no badge. Both fields
                         carry the same OR cue so the alternative-relationship
                         reads identically from either direction. */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
                        {tv("buildingUnit")}
                        <span className="text-[9px] text-[rgba(102,112,109,0.6)] font-normal normal-case tracking-normal">{tv("orArea")}</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66706d] z-10 pointer-events-none"/>
                        {placesLoading && (<RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#66706d] animate-spin z-10 pointer-events-none"/>)}
                        <input ref={unitInputRef} value={form.unit} onChange={(e) => {
                updateField("unit", e.target.value);
                setShowBuildingSuggestions(true);
                setShowPlaces(true);
            }} onFocus={() => { setShowBuildingSuggestions(true); setShowPlaces(true); }} onKeyDown={(e) => {
                if (e.key === "Escape") {
                    setShowBuildingSuggestions(false);
                    setShowPlaces(false);
                }
            }} placeholder={form.area ? `Search in ${form.area}…` : "Search any building, community, villa…"} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={showPlaces && placesResults.length > 0} className={`w-full pl-10 h-12 bg-[#faf7f2] rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${fieldErrors.unit ? "border-[#b42318]" : "border-[#e3ddcf] focus:border-[#0B3D2E]/40"}`}/>

                        {/* DLD buildings index results — softer header + an
                             explicit "use as typed" first item so the user
                             knows the suggestions are optional. They can
                             always continue with their own free text. */}
                        {showPlaces && placesResults.length > 0 && (<div ref={placesRef} role="listbox" className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-[#e3ddcf] bg-white shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                            <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[rgba(102,112,109,0.6)] bg-[rgba(244,239,231,0.3)] border-b border-[rgba(227,221,207,0.3)]">
                              {tv("liveResults")}
                            </p>
                            {form.unit.trim() ? (
                              <button
                                type="button"
                                role="option"
                                aria-selected="false"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-[#f4efe7]/50 transition-colors flex items-start gap-2.5 border-b border-[rgba(227,221,207,0.3)] bg-[rgba(244,239,231,0.35)]"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  // Commit the user's free text verbatim.
                                  // form.unit already has the typed value, so
                                  // we just close the dropdown + blur to
                                  // signal "you're done picking".
                                  setShowPlaces(false);
                                  setShowBuildingSuggestions(false);
                                  unitInputRef.current?.blur();
                                }}
                              >
                                <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B3D2E]/10 text-[11px] text-[#0B3D2E] mt-0.5">✏</span>
                                <div className="min-w-0">
                                  <p className="font-medium text-[#10231e] truncate">
                                    {tv("useAsTyped", { value: form.unit.trim() })}
                                  </p>
                                  <p className="text-xs text-[#66706d] truncate mt-0.5">
                                    {tv("useAsTypedSub")}
                                  </p>
                                </div>
                              </button>
                            ) : null}
                            {placesResults.map((p) => (<button key={p.placeId} type="button" role="option" aria-selected="false" className="w-full text-left px-4 py-3 text-sm hover:bg-[#f4efe7]/50 transition-colors flex items-start gap-2.5 border-b border-[rgba(227,221,207,0.3)] last:border-0" onMouseDown={(e) => {
                        var _a;
                        e.preventDefault();
                        const placeCity = isSupportedCity(p.city) ? p.city : form.city;
                        setTrackedValues(Object.assign(Object.assign({ unit: p.building || p.description.split(",")[0].trim() }, (p.area ? { area: p.area } : {})), (placeCity ? { city: placeCity } : {})), "places");
                        setShowPlaces(false);
                        setShowBuildingSuggestions(false);
                        (_a = unitInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                    }}>
                                <MapPin className="h-3.5 w-3.5 text-[#0B3D2E] flex-shrink-0 mt-0.5"/>
                                <div className="min-w-0">
                                  <p className="font-medium text-[#10231e] truncate">
                                    {p.building || p.description.split(",")[0]}
                                  </p>
                                  <p className="text-xs text-[#66706d] truncate mt-0.5">
                                    {[p.area, p.city, "UAE"].filter(Boolean).join(", ")}
                                  </p>
                                </div>
                              </button>))}
                          </div>)}

                        {/* Local fallback — shown when no Places results yet */}
                        {showBuildingSuggestions && placesResults.length === 0 && !placesLoading && (() => {
                const q = form.unit.trim().toLowerCase();
                const pool = form.city && form.area
                    ? getBuildings(form.city, form.area)
                    : form.city
                        ? getAreas(form.city).flatMap((a) => a.buildings)
                        : [];
                const matches = q.length >= 1
                    ? pool.filter((b) => b.toLowerCase().includes(q)).slice(0, 7)
                    : pool.slice(0, 7);
                return matches.length > 0 ? (<div ref={buildingSuggestionsRef} className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-[#e3ddcf] bg-white shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[rgba(102,112,109,0.6)] bg-[rgba(244,239,231,0.3)] border-b border-[rgba(227,221,207,0.3)]">
                                {tv("suggestions")}
                              </p>
                              {matches.map((b) => (<button key={b} type="button" className="w-full text-left px-4 py-3 text-sm hover:bg-[#f4efe7]/50 transition-colors flex items-center gap-2.5 border-b border-[rgba(227,221,207,0.3)] last:border-0" onMouseDown={(e) => {
                            var _a;
                            e.preventDefault();
                            updateField("unit", b);
                            setShowBuildingSuggestions(false);
                            (_a = unitInputRef.current) === null || _a === void 0 ? void 0 : _a.blur();
                        }}>
                                  <Building2 className="h-3.5 w-3.5 text-[#66706d] flex-shrink-0"/>
                                  <span>{b}</span>
                                </button>))}
                            </div>) : null;
            })()}
                      </div>
                      <FieldError message={fieldErrors.unit}/>
                    </div>
                  </div>

                                    {/* Row 2 — Type / Beds / Size */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 block">{tv("typeOptional")}</label>
                      <div className="relative">
                        <select value={form.type} onChange={(event) => updateField("type", event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-[#e3ddcf] bg-[#faf7f2] px-3 pr-10 text-sm text-[#10231e] outline-none transition-colors hover:border-[rgba(102,112,109,0.3)] focus:border-[#0B3D2E]/40">
                          <option value="">{tv("selectIfKnown")}</option>
                          {valuationPropertyTypeOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                        <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66706d]" fill="none" viewBox="0 0 12 8">
                          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"/>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
                        {tv("beds")}
                        {/* Bedrooms is required for everything except Plot —
                             matches backend rule, prevents the engine from
                             silently picking comps of the wrong bedroom
                             count for unit-number queries. */}
                        {isBedroomsRequiredForValuation(form.type) && (
                          <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">{tv("required")}</span>
                        )}
                      </label>
                      <BedroomPicker maids={form.maids} onChange={(value) => updateField("beds", value)} onMaidsChange={(value) => updateField("maids", value)} value={form.beds}/>
                      <FieldError message={fieldErrors.beds}/>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 block">{tv("size")}</label>
                      <SizePicker onChange={(value) => updateField("size", value)} value={form.size}/>
                    </div>
                  </div>



                  <div>
                    <button
                      type="submit"
                      disabled={submitting}
                      aria-busy={submitting}
                      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 disabled:hover:scale-100 disabled:hover:shadow-none sm:w-auto"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin"/>
                          {tv("gettingValuation")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4"/>
                          {tv("getValuation")}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-[#66706d] mt-3">
                      {tv("formDisclaimer")}
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </motion.div>)}

        {/* ── Disambiguation ── PropertyFinder returned multiple plausible matches */}
        {step === "disambiguation" && Array.isArray(disambiguationCandidates) && (
          <motion.div
            key="disambiguation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
          >
            <div
              role="radiogroup"
              aria-labelledby="disambig-heading"
              className="rounded-[28px] border border-[#0B3D2E]/10 bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBF7_100%)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10"
            >
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>
                {tv("disambigKicker")}
              </p>
              <h2 id="disambig-heading" className="mb-2 text-2xl font-bold sm:text-3xl text-[#0B3D2E]">
                {tv("disambigTitle")}
              </h2>
              <p className="text-[#66706d] mb-6">
                {tv("disambigSubtitle", { query: form.unit || form.area || tv("disambigFallbackQuery") })}
              </p>
              <div className="grid gap-3">
                {disambiguationCandidates.map((candidate, idx) => {
                  const candidateKey = candidate.id != null ? String(candidate.id) : candidate.name;
                  const isThisOneSubmitting = submitting && submittingCandidateId === candidateKey;
                  const otherIsSubmitting = submitting && !isThisOneSubmitting;
                  return (
                    <button
                      key={candidate.id != null ? String(candidate.id) : `cand-${idx}`}
                      type="button"
                      role="radio"
                      aria-checked="false"
                      aria-busy={isThisOneSubmitting}
                      disabled={submitting}
                      onClick={() => selectDisambiguationCandidate(candidate)}
                      className="group flex items-center gap-4 rounded-2xl border border-[#0B3D2E]/12 bg-white px-5 py-4 text-left transition-all hover:border-[#0B3D2E]/40 hover:bg-[#FCFBF7] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/30 disabled:cursor-wait disabled:hover:border-[#0B3D2E]/12 disabled:hover:bg-white disabled:hover:shadow-none"
                      style={otherIsSubmitting ? { opacity: 0.5 } : undefined}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
                      >
                        {isThisOneSubmitting ? <RefreshCw className="h-4 w-4 animate-spin"/> : idx + 1}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-base font-semibold text-[#0B3D2E] break-words">{candidate.name}</span>
                        {candidate.community ? (
                          <span className="text-xs text-[#66706d] break-words">{candidate.community}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 ml-auto text-sm font-medium text-[#0B3D2E]/60 group-hover:text-[#0B3D2E]">
                        {isThisOneSubmitting ? tv("disambigSelecting") : tv("disambigSelect")}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setDisambiguationCandidates(null);
                  setDisambiguationContext(null);
                  // Clear the smart-search text so the user isn't sent back
                  // into the same disambiguation loop on the next submit.
                  // The form's structured fields (city/area/building) keep
                  // whatever the LLM already populated so they can edit.
                  setSmartQuery("");
                  setSmartIntakeAlert(null);
                  setFieldErrors({});
                  setStep("form");
                }}
                className="mt-6 text-sm font-medium text-[#0B3D2E]/70 underline-offset-4 hover:text-[#0B3D2E] hover:underline disabled:cursor-wait disabled:opacity-60 disabled:hover:no-underline"
              >
                {tv("disambigNoneOfThese")}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === "processing" && (<motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            {loadingSavedReport ? (<div className="rounded-[28px] border border-[#0B3D2E]/10 bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBF7_100%)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>{tv("savedReport")}</p>
                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{tv("loadingLink")}</h2>
                <p className="text-[#66706d]">{tv("reopeningReport")}</p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#0B3D2E]/12 bg-white px-4 py-2 text-sm font-medium text-[#0B3D2E]">
                  <RefreshCw className="h-4 w-4 animate-spin"/>
                  {tv("fetchingReport")}
                </div>
              </div>) : (<div className="rounded-[28px] border border-[#0B3D2E]/10 bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFBF7_100%)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>{tv("valuationSnapshot")}</p>
              <h2 className="mb-2 text-2xl font-bold sm:text-3xl break-words">{extractCommunity(form.unit)}</h2>
              <p className="text-[#66706d] mb-3">{tv("processingSubtitle")}</p>
              <span className="inline-block px-3 py-1 rounded-full border border-[#e3ddcf] text-sm font-medium">{form.city}</span>

              {/* Retry notice */}
              {retryCount > 0 && (<div className="mt-4 flex items-center gap-2 text-sm text-[#D4A847]">
                  <RefreshCw className="h-4 w-4 animate-spin"/>
                  {tv("retrying")} {retryCount + 1} / {MAX_RETRIES + 1}
                </div>)}

              <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0B3D2E]/10">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#0B3D2E_0%,#1A7A5A_100%)] transition-all duration-700" style={{ width: processingProgress }}/>
                </div>
                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-[#0B3D2E]/65">
                  {tv("step")} {currentProcessingStep} / {processingSteps.length}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {processingSteps.map((ps, i) => {
                const isDone = i < activeProcessStep;
                const isActive = i === activeProcessStep;
                return (<div key={ps.label} className={`relative overflow-hidden rounded-[24px] border p-5 transition-all duration-500 sm:p-6 ${isDone
                        ? "border-[#0B3D2E]/18 bg-white shadow-[0_18px_45px_rgba(11,61,46,0.08)]"
                        : isActive
                            ? "border-[#0B3D2E]/28 bg-[linear-gradient(180deg,rgba(11,61,46,0.08)_0%,rgba(255,255,255,0.96)_100%)] shadow-[0_22px_55px_rgba(11,61,46,0.14)]"
                            : "border-[rgba(227,221,207,0.8)] bg-white/70"}`}>
                      <div className={`absolute inset-x-0 top-0 h-1 transition-colors duration-500 ${isDone || isActive ? "bg-[linear-gradient(90deg,#0B3D2E_0%,#1A7A5A_100%)]" : "bg-transparent"}`}/>

                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full border transition-all duration-500 ${isDone
                        ? "border-[#0B3D2E] bg-[#0B3D2E]"
                        : isActive
                            ? "border-[#0B3D2E] bg-[#0B3D2E] ring-4 ring-[#0B3D2E]/12"
                            : "border-[rgba(102,112,109,0.2)] bg-[rgba(102,112,109,0.25)]"} ${isActive ? "animate-pulse" : ""}`}/>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[rgba(102,112,109,0.7)]">
                            {tv("phase")} {i + 1}
                          </p>
                          <h3 className="mt-2 text-xl font-bold leading-tight text-[#10231e]">
                            {ps.label}
                          </h3>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-6 text-[#66706d]">
                        {ps.desc}
                      </p>
                    </div>);
            })}
              </div>

              <div className="mt-8 space-y-4">
                {[1, 2].map((n) => (<div key={n} className="rounded-[22px] border border-[#0B3D2E]/8 bg-white/80 p-6 space-y-3 animate-pulse shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="h-4 w-1/3 bg-[#0B3D2E]/10 rounded"/>
                    <div className="h-3 w-2/3 bg-[#0B3D2E]/5 rounded"/>
                    <div className="h-3 w-1/2 bg-[#0B3D2E]/5 rounded"/>
                    <div className="h-3 w-3/4 bg-[#0B3D2E]/5 rounded"/>
                  </div>))}
              </div>
            </div>)}
          </motion.div>)}

        {/* ── Results ── */}
        {step === "results" && result && (<motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            {/* Demo banner */}
            {useDeedResult && (<div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#D4A847]/30 bg-[#D4A847]/8 px-4 py-3.5 sm:px-6">
                <FileText className="h-4 w-4 text-[#B8922F] flex-shrink-0"/>
                <p className="text-sm text-[#B8922F] font-medium">
                  <strong>{tv("demoResult")}</strong> — {tv("demoResultDesc")}
                </p>
              </div>)}

            {/* Header */}
            <div className="mb-4 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] shadow-[0_10px_24px_rgba(11,61,46,0.18)]">
                    <Target className="h-4.5 w-4.5 text-white"/>
                  </div>
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.28em] text-[#B8922F]">
                    {tv("valuationSnapshot")}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  {result.leadId ? (<button onClick={copyShareLink} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#0B3D2E]/12 bg-white px-4 text-[0.82rem] font-semibold text-[#0B3D2E] transition-all duration-300 hover:border-[#0B3D2E]/22 hover:bg-[#0B3D2E]/[0.03] sm:w-auto" type="button">
                      {linkCopied ? <Check className="h-4 w-4"/> : <Link2 className="h-4 w-4"/>}
                      {linkCopied ? tv("linkCopied") : tv("copyLink")}
                    </button>) : null}
                  <button onClick={resetForNewSearch} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#0B3D2E]/12 bg-[#0B3D2E]/[0.03] px-4 text-[0.82rem] font-semibold text-[#0B3D2E] transition-all duration-300 hover:border-[#0B3D2E]/22 hover:bg-[#0B3D2E]/[0.06] sm:w-auto" type="button">
                    <ArrowLeft className="h-4 w-4"/>
                    {tv("newSearch")}
                  </button>
                </div>
              </div>
              <h2 className="mb-2 text-2xl font-bold sm:text-4xl break-words">
                {[result.propertyName, result.community, result.city, result.country].filter(Boolean).join(", ")}
              </h2>
              <p className="text-[#66706d] mb-4">{tv("processingSubtitle")}</p>
              {deliveryNotice && (<div className={`mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3.5 sm:px-5 ${deliveryNotice.tone === "success"
                    ? "border-[#0B3D2E]/18 bg-[#0B3D2E]/[0.045] text-[#0B3D2E]"
                    : "border-[#D4A847]/30 bg-[#D4A847]/8 text-[#8a6920]"}`}>
                  <div className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${deliveryNotice.tone === "success" ? "bg-[#0B3D2E] text-white" : "bg-[#D4A847]/18 text-[#B8922F]"}`}>
                    {deliveryNotice.tone === "success" ? <Check className="h-3.5 w-3.5"/> : <AlertTriangle className="h-3.5 w-3.5"/>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">{deliveryNotice.message}</p>
                    {deliveryNotice.action && typeof deliveryNotice.action.href === "string" && deliveryNotice.action.href ? (<a href={deliveryNotice.action.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,211,102,0.22)] transition-transform duration-300 hover:scale-[1.02] hover:bg-[#1da851]">
                        <MessageCircle className="h-4 w-4"/>
                        {deliveryNotice.action.label || "Send Hi on WhatsApp"}
                      </a>) : null}
                  </div>
                </div>)}
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => (<span key={t} className="rounded-full px-3.5 py-1.5 text-xs font-medium text-[#10231e] sm:px-4 sm:text-sm" style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}>
                    {t}
                  </span>))}
              </div>
            </div>

            {/* ── Price section — numbers blurred until unlocked ── */}
            <div className="relative">
              {/* Fair Value + Confidence */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div aria-label={showLockedFairValuePreview ? "Unlock the full report to reveal fair value" : undefined} className={`rounded-2xl overflow-hidden shadow-sm ${showLockedFairValuePreview ? "cursor-pointer transition-transform duration-300 hover:-translate-y-0.5" : ""}`} onClick={showLockedFairValuePreview ? scrollToUnlockSection : undefined} onKeyDown={showLockedFairValuePreview ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    scrollToUnlockSection();
                }
            } : undefined} role={showLockedFairValuePreview ? "button" : undefined} tabIndex={showLockedFairValuePreview ? 0 : undefined}>
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#D4A847] via-[#C9A83E] to-[#B8922F] p-5 text-white sm:p-8">
                    <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.24), transparent 42%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12), transparent 46%)" }}/>
                    <div className="relative">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/75 font-bold">{tv("fairValue")}</p>
                        {showLockedFairValuePreview && (<span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                            <Lock className="h-3 w-3"/>
                            {tv("exactRangeReady")}
                          </span>)}
                      </div>

                      {showLockedFairValuePreview ? (<div className="grid gap-4">
                          <div className="inline-flex max-w-full items-center rounded-2xl border border-white/18 bg-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                            <HiddenRangeValue currency={result.currency}/>
                          </div>
                          <p className="max-w-xl text-sm leading-relaxed text-white/90">
                            {tv("fairValuePrepared")}
                          </p>
                        </div>) : (<>
                          <p className={`text-2xl sm:text-3xl font-bold transition-all duration-500 select-none ${!unlocked ? "blur-md" : ""}`}>
                            {fmt(result.fairValueLow, result.currency)} – {fmt(result.fairValueHigh, result.currency)}
                          </p>
                          <p className={`text-sm text-white/80 mt-3 leading-relaxed transition-all duration-500 ${!unlocked ? "blur-sm opacity-60" : ""}`}>{renderValuationRichText(result.fairValueExplanation, "fair-value-explanation")}</p>
                        </>)}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 border-l-[3px] border-l-[#0B3D2E] shadow-sm sm:p-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-2">{tv("confidence")}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`h-5 w-5 ${result.confidence === "High" ? "text-[#0B3D2E]"
                : result.confidence === "Medium" ? "text-[#D4A847]"
                    : "text-[#b42318]"}`}/>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${result.confidence === "High" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]"
                : result.confidence === "Medium" ? "bg-[#D4A847]/15 text-[#B8922F]"
                    : "bg-[rgba(180,35,24,0.1)] text-[#b42318]"}`}>
                      {result.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-[#66706d] leading-relaxed">{renderValuationRichText(result.confidenceReason, "confidence-reason")}</p>
                </div>
              </div>

              {/* Price bars */}
              <div {...lockedPriceComparisonCardProps} className={`mb-4 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-8 ${lockedPriceComparisonCardProps.className || ""}`}>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#D4A847] to-[#B8922F]"/>
                  <p className="text-sm font-semibold text-[#10231e]">{tv("priceComparison")}</p>
                  {!unlocked && (<button aria-label="Unlock the full report" className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-[#66706d] transition-colors hover:bg-[#f4efe7]/50 hover:text-[#10231e]" onClick={scrollToUnlockSection} type="button">
                      <Lock className="h-3.5 w-3.5"/>
                    </button>)}
                </div>
                <div className="space-y-4 sm:grid sm:min-w-0 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-3 sm:gap-y-4 sm:space-y-0">
                  <PriceBar label="Quick sale" low={result.quickSaleLow} high={result.quickSaleHigh} min={(_a = priceComparisonBounds === null || priceComparisonBounds === void 0 ? void 0 : priceComparisonBounds.min) !== null && _a !== void 0 ? _a : result.quickSaleLow} max={(_b = priceComparisonBounds === null || priceComparisonBounds === void 0 ? void 0 : priceComparisonBounds.max) !== null && _b !== void 0 ? _b : result.suggestedListHigh} rangePreview={getPreviewRange(result, "Quick sale")} color="#D4A847" currency={result.currency} blurred={false} fixedWidthPct={null}/>
                  <PriceBar label="Fair value" low={result.fairValueLow} high={result.fairValueHigh} min={(_c = priceComparisonBounds === null || priceComparisonBounds === void 0 ? void 0 : priceComparisonBounds.min) !== null && _c !== void 0 ? _c : result.quickSaleLow} max={(_d = priceComparisonBounds === null || priceComparisonBounds === void 0 ? void 0 : priceComparisonBounds.max) !== null && _d !== void 0 ? _d : result.suggestedListHigh} rangePreview={getPreviewRange(result, "Fair value")} color="#0B3D2E" currency={result.currency} blurred={!unlocked} maskedPreview={!unlocked && result.accessState === "preview"} fixedWidthPct={null}/>
                  <PriceBar label="Suggested list" low={result.suggestedListLow} high={result.suggestedListHigh} min={(_e = priceComparisonBounds === null || priceComparisonBounds === void 0 ? void 0 : priceComparisonBounds.min) !== null && _e !== void 0 ? _e : result.quickSaleLow} max={(_f = priceComparisonBounds === null || priceComparisonBounds === void 0 ? void 0 : priceComparisonBounds.max) !== null && _f !== void 0 ? _f : result.suggestedListHigh} rangePreview={getPreviewRange(result, "Suggested list")} color="#1A7A5A" currency={result.currency} blurred={!unlocked} maskedPreview={!unlocked && result.accessState === "preview"} fixedWidthPct={null}/>
                </div>
                <p className="text-[10px] text-[#66706d] mt-4 bg-[rgba(244,239,231,0.3)] rounded-xl p-3 border border-[rgba(227,221,207,0.3)]">{renderValuationRichText(result.disclaimer, "disclaimer")}</p>
              </div>

              {/* Suggested + Quick sale cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div aria-label={!unlocked && result.accessState === "preview" ? "Unlock the full report to reveal suggested list price" : undefined} className={`rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 border-l-[3px] border-l-[#0B3D2E] shadow-sm sm:p-6 ${!unlocked && result.accessState === "preview" ? "cursor-pointer transition-transform duration-300 hover:-translate-y-0.5" : ""}`} onClick={!unlocked && result.accessState === "preview" ? scrollToUnlockSection : undefined} onKeyDown={!unlocked && result.accessState === "preview" ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    scrollToUnlockSection();
                }
            } : undefined} role={!unlocked && result.accessState === "preview" ? "button" : undefined} tabIndex={!unlocked && result.accessState === "preview" ? 0 : undefined}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-[#0B3D2E]"/>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d]">{tv("suggestedListPrice")}</p>
                  </div>
                  {!unlocked && result.accessState === "preview" ? (<div className="grid gap-1.5">
                      <MaskedInlineRange currency={result.currency}/>
                      <p className="text-xs text-[rgba(102,112,109,0.8)]">
                        {tv("exactRangeUnlocks")}
                      </p>
                    </div>) : (<p className={`text-xl font-bold transition-all duration-500 select-none ${!unlocked ? "blur-md" : ""}`}>
                      {fmt(result.suggestedListLow, result.currency)} – {fmt(result.suggestedListHigh, result.currency)}
                    </p>)}
                </div>
                <div className="rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 border-l-[3px] border-l-[#D4A847] shadow-sm sm:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D4A847]/10 flex items-center justify-center">
                      <TrendingDown className="h-3.5 w-3.5 text-[#D4A847]"/>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d]">{tv("quickSaleRange")}</p>
                  </div>
                  <p className="text-xl font-bold">
                    {fmt(result.quickSaleLow, result.currency)} – {fmt(result.quickSaleHigh, result.currency)}
                  </p>
                </div>
              </div>

              {/* Copy — only shown when unlocked */}
              {unlocked && (<div className="mb-4 flex justify-start sm:justify-end">
                  <button onClick={copySummary} className="flex items-center gap-1.5 text-sm text-[#66706d] hover:text-[#10231e] transition-colors">
                    {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                    {copied ? "Copied!" : "Copy summary"}
                  </button>
                </div>)}
            </div>

            {/* ── Comparables — price + reasoning blurred until unlocked ── */}
            <div {...lockedComparableEvidenceCardProps} className={`mb-4 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-8 ${lockedComparableEvidenceCardProps.className || ""}`}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Building2 className="h-4 w-4 text-white"/>
                </div>
                <h3 className="text-xl font-bold">{tv("comparableEvidence")}</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-[#66706d] ml-auto"/>}
              </div>
              <p className="mb-6 text-sm text-[#66706d] sm:ml-[46px]">{tv("comparableDesc")}</p>
              {result.comparables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[rgba(227,221,207,0.8)] bg-[rgba(250,247,242,0.5)] px-5 py-8 text-center">
                  <Building2 className="mx-auto h-6 w-6 text-[rgba(102,112,109,0.5)]" />
                  <p className="mt-3 text-sm font-semibold text-[#10231e]">No directly comparable evidence in our index yet</p>
                  <p className="mt-1.5 text-xs text-[#66706d] max-w-md mx-auto leading-relaxed">
                    The estimate above is anchored on broader market signal. A RERA-certified appraiser can collect on-site data and ground the figure further.
                  </p>
                </div>
              ) : null}
              <div className="grid gap-3 md:hidden">
                {result.comparables.map((c, i) => {
                const isLockedPreviewRow = !unlocked && c.visibility === "locked";
                return (<div key={i} className="rounded-2xl border border-[rgba(227,221,207,0.5)] bg-[rgba(250,247,242,0.6)] p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.type === "Sale" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : "bg-[#D4A847]/15 text-[#B8922F]"}`}>{c.type}</span>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#66706d]">{tv("price")}</p>
                          <div className="mt-1 text-sm font-bold transition-all duration-500 select-none">
                            {isLockedPreviewRow ? (<MaskedComparablePrice currency={result.currency}/>) : (fmt(c.price, result.currency))}
                          </div>
                        </div>
                      </div>
                      <div className="mb-3 flex flex-wrap gap-2 text-xs text-[#66706d]">
                        <span className="rounded-full bg-[#f4efe7] px-2.5 py-1">{c.size}</span>
                        <span className="rounded-full bg-[#f4efe7] px-2.5 py-1">{c.date}</span>
                      </div>
                      <p className={`text-sm leading-relaxed text-[#66706d] transition-all duration-500 select-none ${isLockedPreviewRow ? "blur-sm" : ""}`}>
                        {renderValuationRichText(c.reason, `comparable-mobile-${i}`)}
                      </p>
                    </div>);
            })}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[6rem]"/>
                    <col className="w-[7.5rem]"/>
                    <col className="w-[8.5rem]"/>
                    <col className="w-[16rem]"/>
                    <col/>
                  </colgroup>
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-[#66706d] border-b border-[#e3ddcf]">
                      <th className="pb-3 pr-4">{tv("type")}</th>
                      <th className="pb-3 pr-4">{tv("size")}</th>
                      <th className="pb-3 pr-4 whitespace-nowrap">{tv("date")}</th>
                      <th className="pb-3 pr-4 whitespace-nowrap">{tv("price")}</th>
                      <th className="pb-3">{tv("whyItMatters")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparables.map((c, i) => {
                const isLockedPreviewRow = !unlocked && c.visibility === "locked";
                return (<tr key={i} className="border-b border-[rgba(227,221,207,0.5)] last:border-0">
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.type === "Sale" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : "bg-[#D4A847]/15 text-[#B8922F]"}`}>{c.type}</span>
                        </td>
                        <td className="py-3 pr-4 text-[#66706d]">{c.size}</td>
                        <td className="py-3 pr-4 whitespace-nowrap text-[#66706d]">{c.date}</td>
                        <td className="py-3 pr-4 whitespace-nowrap font-bold transition-all duration-500 select-none">
                          {isLockedPreviewRow ? (<MaskedComparablePrice currency={result.currency}/>) : (fmt(c.price, result.currency))}
                        </td>
                        <td className={`py-3 text-[#66706d] max-w-xs transition-all duration-500 select-none ${isLockedPreviewRow ? "blur-sm" : ""}`}>
                          {renderValuationRichText(c.reason, `comparable-desktop-${i}`)}
                        </td>
                      </tr>);
            })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Gate card — inline unlock prompt ── */}
            {!unlocked && (<div ref={unlockSectionRef}>
                <GateCard highlight={unlockHighlight} gate={gate} gateErrors={gateErrors} gateSubmitting={gateSubmitting} onChange={(field, val) => {
                    setGate((g) => (Object.assign(Object.assign({}, g), { [field]: val })));
                    setGateErrors((prev) => {
                        const next = Object.assign({}, prev);
                        if (field === "name") {
                            if (val.trim().length >= 2)
                                delete next.name;
                        }
                        if (field === "phone" || field === "email") {
                            const phone = field === "phone" ? val : gate.phone;
                            const email = field === "email" ? val : gate.email;
                            if (phone.trim().length > 5 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                                delete next.contact;
                        }
                        return next;
                    });
                }} onUnlock={async () => {
                    const errs = {};
                    if (!gate.name.trim() || gate.name.trim().length < 2)
                        errs.name = "Your name is required.";
                    const hasPhone = gate.phone.trim().length > 5;
                    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gate.email.trim());
                    if (!hasPhone && !hasEmail)
                        errs.contact = "Please add a phone or email so we can send the PDF report.";
                    if (Object.keys(errs).length) {
                        setGateErrors(errs);
                        return;
                    }
                    if (!(result === null || result === void 0 ? void 0 : result.leadId)) {
                        setGateErrors({ contact: "The valuation preview is missing. Please run the valuation again." });
                        return;
                    }
                    setGateSubmitting(true);
                    setGlobalError(null);
                    try {
                        const { turnstileConfig } = await loadValuationConfig();
                        const turnstileToken = turnstileConfig.enabled ? await requestTurnstileToken() : "";
                        const response = await fetch(resolveApiUrl("/api/valuation/unlock"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(Object.assign({ leadId: result.leadId, ownerName: gate.name, phone: gate.phone, email: gate.email }, (turnstileToken ? { turnstileToken } : {}))),
                        });
                        const data = await response.json().catch(() => null);
                        if (!response.ok) {
                            throw new Error((data === null || data === void 0 ? void 0 : data.error) || "Could not unlock the full report.");
                        }
                        // Guard: if the unlock response would route into the
                        // disambiguation picker (server returned candidates
                        // again for some reason), surface as an inline error
                        // rather than dumping the user into a picker mid-unlock.
                        if (
                            data &&
                            data.decision === "needs_more_details" &&
                            Array.isArray(data.disambiguationCandidates) &&
                            data.disambiguationCandidates.length >= 2
                        ) {
                            setGateErrors({ contact: "We could not finalize this property. Start a new search and pick the exact building." });
                            return;
                        }
                        applyLoadedReport(data);
                    }
                    catch (err) {
                        const msg = err instanceof Error ? err.message : "Could not unlock the full report.";
                        setGateErrors({ contact: humanizeErrorMessage(msg) });
                    }
                    finally {
                        setGateSubmitting(false);
                        resetTurnstileWidget();
                    }
                }}/>
              </div>)}

            {/* ── Market read — body blurred ── */}
            <div {...lockedMarketReadCardProps} className={`mb-4 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-8 ${lockedMarketReadCardProps.className || ""}`}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }}/>
                <h3 className="text-xl font-bold">{tv("marketRead")}</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-[#66706d] ml-auto"/>}
              </div>
              <p className={`text-[#66706d] leading-relaxed transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                {renderValuationRichText(result.marketRead, "market-read")}
              </p>
            </div>

            {/* ── Strategy — text + bullets blurred ── */}
            <div {...lockedStrategyCardProps} className={`mb-4 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-8 ${lockedStrategyCardProps.className || ""}`}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#0B3D2E]"/>
                </div>
                <h3 className="text-xl font-bold">{tv("recommendedStrategy")}</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-[#66706d] ml-auto"/>}
              </div>
              <p className={`text-[#66706d] leading-relaxed mb-4 transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                {renderValuationRichText(result.strategy, "strategy")}
              </p>
              <ul className="space-y-2.5">
                {result.strategyBullets.map((b, i) => (<li key={i} className={`flex items-start gap-2.5 text-[#66706d] text-sm transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                    <ChevronRight className="h-4 w-4 mt-0.5 text-[#0B3D2E] flex-shrink-0"/>
                    <span>{renderValuationRichText(b, `strategy-bullet-${i}`)}</span>
                  </li>))}
              </ul>
            </div>

            {/* ── Moving factors — blurred in preview, visible after unlock ── */}
            <div {...lockedMovingFactorsCardProps} className={`mb-8 rounded-2xl border border-[rgba(227,221,207,0.5)] bg-white p-5 shadow-sm sm:p-8 ${lockedMovingFactorsCardProps.className || ""}`}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[#D4A847]/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-[#D4A847]"/>
                </div>
                <h3 className="text-xl font-bold">{tv("movingFactors")}</h3>
                {result.movingFactorsLocked ? <Lock className="h-3.5 w-3.5 text-[#66706d] ml-auto"/> : null}
              </div>
              <p className="mb-4 text-sm text-[#66706d] sm:ml-[46px]">{tv("movingFactorsDesc")}</p>
              <ul className="space-y-2.5">
                {result.movingFactors.map((f, i) => (<li key={i} className={`flex items-start gap-2.5 text-[#66706d] text-sm transition-all duration-500 select-none ${result.movingFactorsLocked ? "blur-sm" : ""}`}>
                    <span className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }}/>
                    <span>{renderValuationRichText(f, `moving-factor-${i}`)}</span>
                  </li>))}
              </ul>
            </div>

            {/* CTA */}
            <div className="relative mb-10 overflow-hidden rounded-3xl border border-[rgba(227,221,207,0.3)] p-6 text-center sm:mb-12 sm:p-14" style={{ background: "linear-gradient(160deg, hsl(40,20%,96%), hsl(43,40%,95%))" }}>
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }}/>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,168,71,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }}/>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                  <Target className="h-6 w-6 text-white"/>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-[#10231e]">{tv("wantAppraisal")}</h3>
                <p className="mx-auto mb-8 max-w-lg leading-relaxed text-[#66706d] sm:mb-10">
                  {tv("appraisalDesc")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://wa.me/971549988811?text=Hi%2C%20I%20just%20used%20the%20online%20valuation%20tool%20and%20would%20like%20a%20detailed%20appraisal." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg" style={{ background: "linear-gradient(to right, #25D366, #1DA851)", boxShadow: "0 8px 24px -4px rgba(37,211,102,0.3)" }}>
                    <MessageCircle className="h-5 w-5"/>
                    {tv("whatsappInquiry")}
                  </a>
                  <a href="tel:+971549988811" className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg" style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                    <PhoneCall className="h-5 w-5"/>
                    {tv("callNow")}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>

      <div ref={turnstileContainerRef} className="h-0 overflow-hidden"/>
      {Footer ? <Footer /> : null}
    </div>);
};
// Search DLD-derived buildings index (data/buildings.json) by building or area name.
// Ranked by transaction volume (sales + rents).
function searchBuildingsIndex(query, limit = 6) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    // Index is loaded asynchronously — if not yet available, return empty.
    // Caller already triggers preload via getBuildingsIndex() on mount.
    if (!buildingsIndexCache) {
        getBuildingsIndex();
        return [];
    }
    const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
    const scored = [];
    for (const b of buildingsIndexCache.buildings) {
        const bName = b.building.toLowerCase();
        const bArea = b.area.toLowerCase();
        let score = 0;
        if (bName === q) score = 300;
        else if (bName.startsWith(q)) score = 250;
        else if (bArea.startsWith(q)) score = 200;
        else if (bName.includes(q)) score = 175;
        else if (bArea.includes(q)) score = 125;
        else if (tokens.length >= 2 && tokens.every((t) => bName.includes(t) || bArea.includes(t))) score = 100;
        if (score === 0) continue;
        scored.push({ b, score });
    }
    scored.sort((x, y) => {
        if (x.score !== y.score) return y.score - x.score;
        return (y.b.sales + y.b.rents) - (x.b.sales + x.b.rents);
    });
    return scored.slice(0, limit).map(({ b }) => ({
        placeId: `dld:${b.area}|${b.building}`.toLowerCase(),
        building: b.building,
        area: b.area,
        city: b.city,
        description: `${b.building}, ${b.area}, ${b.city}`,
        sales: b.sales,
        rents: b.rents,
        units: b.units,
    }));
}
// Search areas (communities) extracted from the DLD buildings index.
// Returns deduplicated areas ranked by total building count (most active
// communities first). Used by the Area / Community field's dropdown, mirrors
// the searchBuildingsIndex pattern for the Building dropdown above.
//
// Memoized at module scope — the buildings.json file is loaded once and the
// area aggregation result is cached so we don't re-scan all 5,781 records
// on every keystroke.
let areasIndexCache = null;
function getAreasFromBuildingsIndex() {
    if (areasIndexCache) return areasIndexCache;
    if (!buildingsIndexCache) {
        getBuildingsIndex();
        return null;
    }
    const counts = new Map();
    for (const b of buildingsIndexCache.buildings) {
        if (!b?.area) continue;
        const existing = counts.get(b.area) || { area: b.area, city: b.city, count: 0, activity: 0 };
        existing.count += 1;
        existing.activity += (b.sales || 0) + (b.rents || 0);
        counts.set(b.area, existing);
    }
    areasIndexCache = Array.from(counts.values()).sort((a, b) => b.activity - a.activity);
    return areasIndexCache;
}

function searchAreasIndex(query, limit = 8) {
    const q = query.trim().toLowerCase();
    const allAreas = getAreasFromBuildingsIndex();
    if (!allAreas) return [];
    // Empty query — return the top areas by activity (helps users browse).
    if (q.length < 1) return allAreas.slice(0, limit);
    const scored = [];
    for (const a of allAreas) {
        const aName = a.area.toLowerCase();
        let score = 0;
        if (aName === q) score = 300;
        else if (aName.startsWith(q)) score = 250;
        else if (aName.includes(q)) score = 175;
        if (score === 0) continue;
        scored.push({ a, score });
    }
    scored.sort((x, y) => {
        if (x.score !== y.score) return y.score - x.score;
        return y.a.activity - x.a.activity;
    });
    return scored.slice(0, limit).map(({ a }) => a);
}

function useAreaSearch(query, enabled) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);
    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        getBuildingsIndex().then(() => {
            if (!cancelled) setResults(searchAreasIndex(query, 8));
        });
        return () => { cancelled = true; };
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!enabled) {
            setResults([]);
            return;
        }
        if (timerRef.current) clearTimeout(timerRef.current);
        setLoading(true);
        timerRef.current = setTimeout(() => {
            setResults(searchAreasIndex(query, 8));
            setLoading(false);
        }, 50);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [query, enabled]);
    return { results, loading };
}

// Autocomplete hook backed by the local DLD buildings index (no network, no Places API).
// Kept under the `usePlacesSearch` name to avoid churn across the many call sites.
function usePlacesSearch(query, enabled) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);
    // Preload buildings.json as soon as the hook mounts so it's ready before
    // the user finishes typing (it's ~120KB gzip + parse time).
    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        getBuildingsIndex().then(() => {
            if (!cancelled && query.trim().length >= 2) {
                setResults(searchBuildingsIndex(query, 6));
            }
        });
        return () => { cancelled = true; };
    }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!enabled || query.trim().length < 2) {
            setResults([]);
            return;
        }
        if (timerRef.current) clearTimeout(timerRef.current);
        setLoading(true);
        timerRef.current = setTimeout(() => {
            setResults(searchBuildingsIndex(query, 6));
            setLoading(false);
        }, 50);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [query, enabled]);
    return { results, loading };
}
const BedroomPicker = ({ maids, onChange, onMaidsChange, value, }) => {
    // `tv` must be created inside the component body — this picker is at module
    // scope so it doesn't inherit `tv` from the parent SharedValuationPage. The
    // labels referenced below ({tv("bedrooms")}, {tv("maidsRoom")}) would throw
    // ReferenceError without this hook.
    const tv = useTranslations("valuation");
    const [open, setOpen] = useState(false);
    const pickerRef = useRef(null);
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const handlePointerDown = (event) => {
            const target = event.target;
            if (pickerRef.current && !pickerRef.current.contains(target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);
    const handleSelect = (nextValue) => {
        onChange(nextValue);
        setOpen(false);
    };
    const handleMaidsSelect = (nextValue) => {
        onMaidsChange(nextValue);
    };
    const triggerLabel = (() => {
        if (!value && !maids) {
            return "Select bedrooms";
        }
        const bedroomLabel = value === "Studio"
            ? "Studio"
            : value
                ? `${value} bed${value === "1" ? "" : "s"}`
                : "";
        const maidsLabel = maids === "Yes" ? "maid's room" : "";
        return [bedroomLabel, maidsLabel].filter(Boolean).join(" · ") || "Select bedrooms";
    })();
    return (<div className="relative" ref={pickerRef}>
      <button aria-expanded={open} aria-haspopup="dialog" className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#e3ddcf] bg-[#faf7f2] px-3 text-left text-sm text-[#10231e] transition-colors hover:border-[rgba(102,112,109,0.3)]" onClick={() => setOpen((current) => !current)} type="button">
        <span className={`truncate ${value || maids ? "text-[#10231e]" : "text-[#66706d]"}`}>
          {triggerLabel}
        </span>
        <svg aria-hidden="true" className={`h-4 w-4 flex-none text-[#66706d] transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 8">
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"/>
        </svg>
      </button>

      {open ? (<div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-[#e3ddcf] bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:w-[min(380px,calc(100vw-2rem))] sm:max-w-[calc(100vw-2rem)] sm:p-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#66706d]">
                {tv("bedrooms")}
              </span>
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                {BEDROOM_OPTIONS.map((option) => {
                const selected = value === option;
                return (<button aria-pressed={selected} className={`inline-flex min-w-0 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:min-w-[54px] sm:px-4 ${selected
                        ? "border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-[0_8px_18px_rgba(11,61,46,0.18)]"
                        : "border-[#e3ddcf] bg-[#faf7f2] text-[#10231e] hover:border-[rgba(102,112,109,0.3)] hover:bg-[rgba(244,239,231,0.3)]"}`} key={option} onClick={() => handleSelect(option)} type="button">
                      {option}
                    </button>);
            })}
              </div>
            </div>
            <div className="grid gap-2 border-t border-[rgba(227,221,207,0.6)] pt-3">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#66706d]">
                {tv("maidsRoom")}
              </span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {MAIDS_OPTIONS.map((option) => {
                const selected = maids === option;
                return (<button aria-pressed={selected} className={`inline-flex min-w-0 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium transition sm:min-w-[64px] sm:px-4 ${selected
                        ? "border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-[0_8px_18px_rgba(11,61,46,0.18)]"
                        : "border-[#e3ddcf] bg-[#faf7f2] text-[#10231e] hover:border-[rgba(102,112,109,0.3)] hover:bg-[rgba(244,239,231,0.3)]"}`} key={option} onClick={() => handleMaidsSelect(option)} type="button">
                      {option}
                    </button>);
            })}
              </div>
            </div>
          </div>
        </div>) : null}
    </div>);
};
const SizePicker = ({ onChange, value, }) => {
    // Module-scope component — needs its own `tv` hook (see BedroomPicker note).
    const tv = useTranslations("valuation");
    const [open, setOpen] = useState(false);
    const pickerRef = useRef(null);
    const parsedValue = parseSizeValue(value);
    const normalizedValue = normalizeSizeOptionValue(parsedValue.amount);
    const [selectedUnit, setSelectedUnit] = useState(parsedValue.unit);
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const handlePointerDown = (event) => {
            const target = event.target;
            if (pickerRef.current && !pickerRef.current.contains(target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);
    useEffect(() => {
        if (!value) {
            return;
        }
        setSelectedUnit(parseSizeValue(value).unit);
    }, [value]);
    const handleSelect = (option) => {
        onChange(formatSizeValue(option.toLocaleString("en-US"), selectedUnit));
        setOpen(false);
    };
    const handleUnitChange = (nextUnit) => {
        setSelectedUnit(nextUnit);
        onChange(formatSizeValue(parsedValue.amount, nextUnit));
    };
    return (<div className="relative" ref={pickerRef}>
      <button aria-expanded={open} aria-haspopup="dialog" className="flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#e3ddcf] bg-[#faf7f2] px-3 text-left text-sm text-[#10231e] transition-colors hover:border-[rgba(102,112,109,0.3)]" onClick={() => setOpen((current) => !current)} type="button">
        <span className={`truncate ${value ? "text-[#10231e]" : "text-[#66706d]"}`}>
          {value || "Select or enter size"}
        </span>
        <svg aria-hidden="true" className={`h-4 w-4 flex-none text-[#66706d] transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 12 8">
          <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"/>
        </svg>
      </button>

      {open ? (<div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-[#e3ddcf] bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:w-[min(380px,calc(100vw-2rem))] sm:max-w-[calc(100vw-2rem)] sm:p-4">
          <div className="grid gap-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_112px]">
              <div className="relative">
                <Ruler className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66706d]"/>
                <input autoFocus className="h-11 w-full rounded-xl border border-[#e3ddcf] bg-[#faf7f2] pl-10 pr-3 text-sm text-[#10231e] outline-none transition-colors hover:border-[rgba(102,112,109,0.3)] focus:border-[#0B3D2E]/40" onChange={(event) => onChange(formatSizeValue(event.target.value, selectedUnit))} placeholder="Type any size" value={parsedValue.amount}/>
              </div>
              <div>
                <div className="relative">
                  <select className="h-11 w-full appearance-none rounded-xl border border-[#e3ddcf] bg-[#faf7f2] px-3 pr-9 text-sm text-[#10231e] outline-none transition-colors hover:border-[rgba(102,112,109,0.3)] focus:border-[#0B3D2E]/40" onChange={(event) => handleUnitChange(event.target.value)} value={selectedUnit}>
                    {SIZE_UNIT_OPTIONS.map((option) => (<option key={option} value={option}>
                        {option}
                      </option>))}
                  </select>
                  <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66706d]" fill="none" viewBox="0 0 12 8">
                    <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#66706d]">
                {tv("presets")}
              </span>
              <div className="grid max-h-[216px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:flex sm:flex-wrap">
                {SIZE_OPTIONS.map((option) => {
                const selected = normalizedValue === String(option);
                return (<button aria-pressed={selected} className={`inline-flex items-center justify-center rounded-full border px-3.5 py-2 text-sm font-medium transition ${selected
                        ? "border-[#0B3D2E] bg-[#0B3D2E] text-white shadow-[0_8px_18px_rgba(11,61,46,0.18)]"
                        : "border-[#e3ddcf] bg-[#faf7f2] text-[#10231e] hover:border-[rgba(102,112,109,0.3)] hover:bg-[rgba(244,239,231,0.3)]"}`} key={option} onClick={() => handleSelect(option)} type="button">
                      {option.toLocaleString("en-US")}
                    </button>);
            })}
              </div>
            </div>
          </div>
        </div>) : null}
    </div>);
};
function formatSizeValue(amount, unit = DEFAULT_SIZE_UNIT) {
    const normalizedAmount = stripSizeUnit(amount).trim();
    if (!normalizedAmount) {
        return "";
    }
    return `${normalizedAmount} ${unit}`;
}
function normalizeSizeOptionValue(value) {
    return stripSizeUnit(value)
        .toLowerCase()
        .replace(/,/g, "")
        .trim();
}
function parseSizeValue(value) {
    const rawValue = String(value || "").trim();
    if (!rawValue) {
        return { amount: "", unit: DEFAULT_SIZE_UNIT };
    }
    const normalizedValue = rawValue.toLowerCase();
    if (/\s*(sqm|sq m|m2)$/u.test(normalizedValue)) {
        return {
            amount: rawValue.replace(/\s*(sqm|sq m|m2)$/iu, "").trim(),
            unit: "sqm",
        };
    }
    if (/\s*(sq\.?\s*ft|sqft|sf)$/u.test(normalizedValue)) {
        return {
            amount: rawValue.replace(/\s*(sq\.?\s*ft|sqft|sf)$/iu, "").trim(),
            unit: "sq ft",
        };
    }
    return { amount: rawValue, unit: DEFAULT_SIZE_UNIT };
}
function stripSizeUnit(value) {
    return String(value || "")
        .replace(/\s*(sq\.?\s*ft|sqft|sf|sqm|sq m|m2)$/iu, "")
        .trim();
}
// ─── GateCard ─────────────────────────────────────────────────────────────────
const GateCard = ({ gate, gateErrors, gateSubmitting, highlight = false, onChange, onUnlock, }) => {
    // Module-scope component — needs its own `tv` hook (see BedroomPicker note).
    const tv = useTranslations("valuation");
    return (<div className="mb-8">
    {/* Unlock card */}
    <div className={`relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-lg transition-all duration-500 sm:p-8 ${highlight
        ? "border-[#D4A847]/55 shadow-[0_18px_44px_rgba(212,168,71,0.18)] ring-4 ring-[#D4A847]/10"
        : "border-[#0B3D2E]/20"}`}>
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }}/>

      <div className="mb-2 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md flex-shrink-0">
          <Lock className="h-4.5 w-4.5 text-white"/>
        </div>
        <div>
          <h3 className="font-bold text-[#10231e] text-lg leading-tight">{tv("unlockTitle")}</h3>
          <p className="text-xs text-[#66706d] mt-0.5">{tv("unlockSubtitle")}</p>
        </div>
      </div>

      <p className="text-sm text-[#66706d] mb-6 leading-relaxed">
        {tv("unlockDesc")}
      </p>

      <div className="mb-6 grid gap-2 rounded-2xl border border-[#0B3D2E]/10 bg-[#faf7f2] p-3.5 text-sm text-[#46524d] sm:grid-cols-2 sm:p-4">
        <div className="flex items-start gap-2.5">
          <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0B3D2E]"/>
          <span>{tv("pdfToEmail")}</span>
        </div>
        <div className="flex items-start gap-2.5">
          <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0B3D2E]"/>
          <span>{tv("whatsappPdfDesc")}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {/* Name */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
            {tv("name")}
            <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">{tv("required")}</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66706d]"/>
            <input value={gate.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Your name" autoComplete="name" className={`w-full pl-10 h-12 bg-[#faf7f2] rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${gateErrors.name ? "border-[#b42318]" : "border-[#e3ddcf] focus:border-[#0B3D2E]/40"}`}/>
          </div>
          {gateErrors.name && (<p className="text-xs text-[#b42318] mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 flex-shrink-0"/>{gateErrors.name}
            </p>)}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
            {tv("phone")}
            <span className="text-[9px] text-[rgba(102,112,109,0.6)] font-normal normal-case tracking-normal">{tv("orEmail")}</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66706d]"/>
            <input value={gate.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+971 50 000 0000" autoComplete="tel" className={`w-full pl-10 h-12 bg-[#faf7f2] rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${gateErrors.contact ? "border-[#b42318]" : "border-[#e3ddcf] focus:border-[#0B3D2E]/40"}`}/>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66706d] mb-1.5 flex items-center gap-1">
            {tv("email")}
            <span className="text-[9px] text-[rgba(102,112,109,0.6)] font-normal normal-case tracking-normal">{tv("orPhone")}</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#66706d]"/>
            <input value={gate.email} onChange={(e) => onChange("email", e.target.value)} placeholder="owner@example.com" type="email" autoComplete="email" className={`w-full pl-10 h-12 bg-[#faf7f2] rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${gateErrors.contact ? "border-[#b42318]" : "border-[#e3ddcf] focus:border-[#0B3D2E]/40"}`}/>
          </div>
        </div>
      </div>

      {gateErrors.contact && (<p className="text-xs text-[#b42318] mb-4 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0"/>{gateErrors.contact}
        </p>)}

      <button onClick={onUnlock} disabled={gateSubmitting} className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 sm:w-auto" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}>
        {gateSubmitting ? (<><RefreshCw className="h-4 w-4 animate-spin"/> {tv("unlocking")}</>) : (<><Unlock className="h-4 w-4"/> {tv("unlockAndSend")}</>)}
      </button>
    </div>
  </div>);
};
const HiddenRangeValue = ({ currency = "AED" }) => {
    const tv = useTranslations("valuation");
    return (<div className="max-w-full text-white">
      <span className="inline-block max-w-full text-2xl font-bold tracking-[0.02em] text-white/95 blur-[3px] sm:text-3xl">
        {currency} {tv("rangeAfterUnlock")}
      </span>
    </div>);
};
const MaskedInlineRange = ({ currency = "AED" }) => {
    const tv = useTranslations("valuation");
    return (<span className="inline-flex max-w-full items-baseline gap-2 text-[#10231e]">
      <span className="text-base font-semibold tracking-[0.08em] text-[#10231e]">
        {currency}
      </span>
      <span className="inline-block text-xl font-semibold tracking-[-0.04em] text-[rgba(16,35,30,0.7)] blur-[1.5px] select-none">
        {tv("rangeAfterUnlock")}
      </span>
    </span>);
};
const MaskedComparablePrice = ({ currency = "AED" }) => {
    const tv = useTranslations("valuation");
    return (<span className="inline-flex whitespace-nowrap text-[#10231e] md:min-w-[15rem] items-baseline gap-2">
      <span className="text-[0.98rem] font-semibold tracking-[0.08em] text-[#10231e]">
        {currency}
      </span>
      <span className="inline-block whitespace-nowrap text-[1.02rem] font-semibold tracking-[0.02em] text-[rgba(16,35,30,0.68)] blur-[1.55px] select-none">
        {tv("priceAfterUnlock")}
      </span>
    </span>);
};
async function loadTurnstileScript() {
    if (typeof window === "undefined") {
        throw new Error("Security verification is not available in this browser.");
    }
    if (window.turnstile) {
        return window.turnstile;
    }
    if (!turnstileScriptPromise) {
        turnstileScriptPromise = new Promise((resolve, reject) => {
            const resolveTurnstile = () => {
                if (window.turnstile) {
                    resolve(window.turnstile);
                    return;
                }
                reject(new Error("Security verification could not load. Please try again."));
            };
            const existingScript = document.querySelector(`script[src="${turnstileScriptUrl}"]`);
            if (existingScript) {
                existingScript.addEventListener("load", resolveTurnstile, { once: true });
                existingScript.addEventListener("error", () => reject(new Error("Security verification could not load. Please try again.")), { once: true });
                return;
            }
            const script = document.createElement("script");
            script.src = turnstileScriptUrl;
            script.async = true;
            script.defer = true;
            script.onload = resolveTurnstile;
            script.onerror = () => reject(new Error("Security verification could not load. Please try again."));
            document.head.appendChild(script);
        }).catch((error) => {
            turnstileScriptPromise = null;
            throw error;
        });
    }
    return await turnstileScriptPromise;
}
// ─── PriceBar ─────────────────────────────────────────────────────────────────
const PriceBar = ({ label, low, high, min, max, rangePreview, color, currency = "AED", blurred = false, textOverride, maskedPreview = false, fixedWidthPct = 18, }) => {
    const tv = useTranslations("valuation");
    var _a, _b, _c, _d, _e;
    const range = (max !== null && max !== void 0 ? max : 0) - (min !== null && min !== void 0 ? min : 0) || 1;
    const startValue = Math.min((_a = low !== null && low !== void 0 ? low : min) !== null && _a !== void 0 ? _a : 0, (_b = high !== null && high !== void 0 ? high : low) !== null && _b !== void 0 ? _b : 0);
    const endValue = Math.max((_d = (_c = high !== null && high !== void 0 ? high : low) !== null && _c !== void 0 ? _c : max) !== null && _d !== void 0 ? _d : 0, (_e = low !== null && low !== void 0 ? low : min) !== null && _e !== void 0 ? _e : 0);
    const previewStartPct = rangePreview
        ? rangePreview.startPercent
        : null;
    const previewWidthPct = rangePreview
        ? rangePreview.widthPercent
        : null;
    const naturalStartPct = previewStartPct !== null
        ? previewStartPct
        : ((startValue - (min !== null && min !== void 0 ? min : 0)) / range) * 100;
    const naturalWidthPct = previewWidthPct !== null
        ? previewWidthPct
        : ((endValue - startValue) / range) * 100;
    const clampedStartPct = Math.min(Math.max(naturalStartPct, 0), 100);
    const fixedWidthEnabled = Number.isFinite(fixedWidthPct) && fixedWidthPct > 0;
    const safeWidthPct = fixedWidthEnabled
        ? Math.min(Math.max(fixedWidthPct, 0), 100)
        : Math.min(Math.max(naturalWidthPct, 0), 100 - clampedStartPct);
    const leftPct = Math.min(clampedStartPct, 100 - safeWidthPct);
    const widthPct = Math.min(safeWidthPct, 100 - leftPct);
    const text = textOverride || `${fmt(low, currency)} – ${fmt(high, currency)}`;
    const valueClass = "text-sm leading-snug text-[#66706d] transition-all duration-500 select-none sm:justify-self-start sm:text-left sm:whitespace-nowrap";
    const valueMarkup = maskedPreview ? (<span className={valueClass}>
      <span>{currency}</span>
      <span className="ml-2 inline-block blur-[1.6px] text-[rgba(16,35,30,0.7)]">{tv("rangeAfterUnlock")}</span>
    </span>) : (<span className={`${valueClass} ${blurred ? "blur-md" : ""}`}>
      {text}
    </span>);
    return (<div className="grid gap-2 sm:contents">
      <div className="flex items-center justify-between gap-3 sm:block">
        <span className="text-sm font-medium sm:pr-4">{label}</span>
        <div className="text-right sm:hidden">
          {valueMarkup}
        </div>
      </div>
      <div className="h-3 min-w-0 bg-[#f4efe7] rounded-full relative overflow-hidden">
        <div className="h-3 rounded-full absolute top-0" style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: color }}/>
      </div>
      <div className="hidden sm:block">
        {valueMarkup}
      </div>
    </div>);
};
export default SharedValuationPage;
