# Binayah Leads API

External read/write API for syncing Binayah leads into any third-party CRM.

**Base URL:** `https://www.binayah.ae`

## Authentication

Every request must include your API key in **either** header:

```
x-api-key: <your-key>
```
or
```
Authorization: Bearer <your-key>
```

Keys are issued by Binayah ops. To rotate: ask for a new key, switch over, then ask for the old one to be retired (multiple keys can be active at once).

Missing or invalid key → `401 Unauthorized`.

---

## Endpoints

### 1. List leads (poll for new)

```
GET /api/admin/leads
  ?source=inquiry,newsletter,list-property,project-subscribe
  &status=new,contacted,qualified,meeting,won,lost
  &q=ahmed@example.com         # fuzzy search across name, email, phone
  &community=Dubai Marina
  &from=2026-05-01T00:00:00Z   # ISO 8601, createdAt >= from
  &to=2026-05-22T00:00:00Z     # ISO 8601, createdAt <= to
  &assignedTo=anna@binayah.com
  &sort=createdAt:desc         # or createdAt:asc | updatedAt:desc
  &page=1
  &limit=50                    # max 200
```

All parameters are optional. Defaults: page=1, limit=50, sort=createdAt:desc.

**Response:**

```json
{
  "total": 1242,
  "page": 1,
  "limit": 50,
  "leads": [
    {
      "id": "inquiry:507f1f77bcf86cd799439011",
      "source": "inquiry",
      "channel": "contact-form",
      "name": "Ahmed Al-Rashid",
      "email": "ahmed@example.com",
      "phone": "+971501234567",
      "message": "Interested in 2BR Marina apartment",
      "property": { "slug": "marina-pearl-2br", "title": "Marina Pearl 2BR" },
      "status": "new",
      "assignedTo": null,
      "notes": [],
      "createdAt": "2026-05-21T10:23:45.000Z",
      "updatedAt": null
    }
  ],
  "counts": {
    "inquiry": 540,
    "newsletter": 421,
    "list-property": 89,
    "project-subscribe": 192
  }
}
```

**Polling pattern** for incremental sync (recommended every 5–15 min):

```
GET /api/admin/leads?from=<last-poll-timestamp>&sort=createdAt:asc&limit=200
```

Store the most-recent `createdAt` you saw, use it as `from` next call.

---

### 2. Get a single lead

```
GET /api/admin/leads/{mongoId}?source={source}
```

Where `mongoId` is the part after `:` in the `id` field, and `source` is one of `inquiry`, `newsletter`, `list-property`, `project-subscribe`.

Returns the same `Lead` object as above plus a `raw` field with the original underlying MongoDB document for inspection.

---

### 3. Update a lead

```
PATCH /api/admin/leads/{mongoId}?source={source}
Content-Type: application/json

{
  "status": "contacted",
  "assignedTo": "anna@binayah.com",
  "note": { "text": "Called — interested in viewing this weekend." }
}
```

All three fields are optional but at least one must be present. Status must be one of: `new`, `contacted`, `qualified`, `meeting`, `won`, `lost`. Pass `"assignedTo": null` to unassign.

Each status change and assignment change auto-appends a system note to the timeline (`"Status: new → contacted"`).

Returns the full updated `Lead` object.

---

### 4. Bulk update / delete

```
POST /api/admin/leads/bulk
Content-Type: application/json

{
  "ids": ["inquiry:507f...", "newsletter:abc..."],   // max 500 per request
  "action": "patch",
  "status": "qualified"
}
```

Or delete:

```
{
  "ids": [...],
  "action": "delete"
}
```

**Response:**

```json
{
  "processed": 50,
  "succeeded": 48,
  "failed": [
    { "id": "inquiry:abc", "error": "Lead not found" },
    { "id": "inquiry:xyz", "error": "Invalid lead id" }
  ]
}
```

---

### 5. Soft-delete a single lead

```
DELETE /api/admin/leads/{mongoId}?source={source}
```

Sets `deletedAt` on the underlying document. The lead disappears from list/get responses but the row is preserved in the database for audit. Cannot be undone via API — restore manually in Mongo if needed.

---

### 6. Aggregate stats

```
GET /api/admin/leads/stats
```

Federated analytics: counts by source/status, 30-day daily histogram, pipeline funnel with conversion rates, top communities, most-inquired properties, avg time-to-first-contact (ms).

Cached server-side for 60 seconds.

---

### 7. CSV export

```
GET /api/admin/leads/export?[same filters as /leads]
```

Returns `text/csv` with one row per lead, RFC 4180-quoted. Hard-capped at 10,000 rows per call — for larger exports, slice by `from`/`to` date ranges.

---

## Push notifications (alternative to polling)

If you'd rather receive real-time pushes instead of polling, give Binayah ops an HTTPS URL to receive `POST` notifications when a new lead is created.

Payload shape (same for all sources):

```json
{
  "event": "lead.created",
  "source": "inquiry",
  "channel": "contact-form",
  "name": "Ahmed Al-Rashid",
  "email": "ahmed@example.com",
  "phone": "+971501234567",
  "message": "Interested in 2BR Marina apartment",
  "property": { "slug": "marina-pearl-2br", "title": "Marina Pearl 2BR" },
  "project": null,
  "community": null,
  "intent": null,
  "createdAt": "2026-05-21T10:23:45.000Z",
  "adminUrl": "https://www.binayah.ae/admin/leads"
}
```

- Fired with `Content-Type: application/json`
- 5-second timeout from Binayah side
- Fire-and-forget (no retry yet) — pair with periodic poll for safety net

---

## Sources reference

| `source` value | Where it comes from | Typical "warmth" |
|---|---|---|
| `inquiry` | Contact form, property/project inquiry forms, AI chat lead capture | High — explicit ask |
| `newsletter` | Newsletter strip, weekly market report subscribe, news article subscribe, calculator email-gate | Low to medium |
| `list-property` | "List your property" form | High — seller intent |
| `project-subscribe` | "Subscribe to project updates" button on off-plan project pages | Medium — tracking |

---

## Statuses reference

The pipeline flows: `new → contacted → qualified → meeting → won` (or → `lost` at any point).

| Status | Meaning |
|---|---|
| `new` | Default. No outreach yet. |
| `contacted` | First touch completed (call, email, WhatsApp). |
| `qualified` | Confirmed budget, location, timeline make sense. |
| `meeting` | Viewing or sit-down scheduled. |
| `won` | Deal closed. |
| `lost` | Dead-end (lost to competitor, ghosted, not qualified). |

---

## Rate limits

- No hard per-key limit currently
- Vercel's platform-level limits apply (~10,000 req/min globally)
- Server-side cache: stats endpoint cached 60s; lists/details no cache

Please keep polling to ≤1 req/sec per key.

---

## Error format

All errors return:

```json
{ "error": "Description of what went wrong" }
```

Common status codes:

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Invalid input (bad source, bad status, missing required field) |
| 401 | Missing or invalid API key (and no admin session) |
| 404 | Lead not found (or already soft-deleted) |
| 500 | Server error — please report |

---

## Quick examples

### cURL — fetch new leads in last hour

```bash
curl -H "x-api-key: YOUR_KEY" \
  "https://www.binayah.ae/api/admin/leads?from=$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)&sort=createdAt:asc"
```

### Node — mark a lead as contacted

```js
await fetch(
  `https://www.binayah.ae/api/admin/leads/${mongoId}?source=inquiry`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.BINAYAH_LEADS_KEY,
    },
    body: JSON.stringify({
      status: "contacted",
      note: { text: "Synced from internal CRM" },
    }),
  }
);
```

### Python — daily CSV export

```python
import requests
r = requests.get(
  "https://www.binayah.ae/api/admin/leads/export?from=2026-05-01",
  headers={"x-api-key": API_KEY},
)
open("leads.csv", "wb").write(r.content)
```

---

## Contact

Issues, key rotation, push-notification setup: dev@prosper-fi.com
