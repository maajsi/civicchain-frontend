## CivicChain Admin API and Visualization Guide

### Overview
This document describes the existing admin-facing endpoints, their request/response shapes, and suggested visualizations for a modern admin UI. All endpoints below are already implemented in the backend and include blockchain integration where applicable.

---

### Authentication
- Admin endpoints should be accessed by authenticated users with role `government`.
- In dev, you can promote a user using the provided script or SQL.

---

### 1) GET /admin/dashboard
Purpose: Provide aggregate statistics and curated datasets for visualizations (KPIs, charts, heatmap, and a top-priority list).

Request
- Method: GET
- Query: none

Response 200
```json
{
  "success": true,
  "stats": {
    "total_issues": 123,
    "open_issues": 45,
    "in_progress_issues": 30,
    "resolved_issues": 35,
    "closed_issues": 13,
    "total_citizens": 1024,
    "avg_priority": "63.42",
    "category_breakdown": [
      { "category": "pothole", "count": 48 },
      { "category": "water", "count": 25 }
    ]
  },
  "heatmap_data": [
    { "issue_id": "UUID", "lat": 17.43, "lng": 78.36, "priority_score": 80.3, "status": "open", "category": "pothole" }
  ],
  "top_priority_issues": [
    {
      "issue_id": "UUID",
      "reporter_user_id": "UUID",
      "reporter_name": "Alice",
      "reporter_profile_pic": "https://...",
      "image_url": "/uploads/x.jpg",
      "description": "...",
      "category": "water",
      "lat": 17.43,
      "lng": 78.36,
      "region": "west",
      "status": "open",
      "priority_score": 92.5,
      "upvotes": 40,
      "downvotes": 2,
      "created_at": "2025-10-17T...Z"
    }
  ]
}
```

Recommended Visualizations (shadcn/ui)
- KPI Cards: total_issues, open/in_progress/resolved/closed, total_citizens, avg_priority
- Category Breakdown: Donut or horizontal bar chart using `category_breakdown`
- Heatmap: Map heat overlay using `heatmap_data` (lat,lng) with color scaled by `priority_score`
- Top Priority Table: Data table with image thumbnail, category, region, status, priority_score; action column to open update-status modal

Notes
- This endpoint returns sufficient data for a rich dashboard: KPIs, charts, a map heat layer, and high-priority list.

---

### 2) GET /admin/issues
Purpose: Admin issue management list, filterable and sortable for triage and status updates.

Request
- Method: GET
- Query:
  - page: number (default 1)
  - limit: number (default 20)
  - sort_by: one of [priority, date_newest, date_oldest, upvotes]
  - status: "open", "in_progress", "resolved", "closed" or multiple comma-separated (e.g. `open,in_progress`)
  - category: "pothole", "garbage", "streetlight", "water", "other" or multiple comma-separated (e.g. `streetlight,pothole`)
  - date_from: ISO date
  - date_to: ISO date

Response 200
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 235,
    "total_pages": 12
  },
  "issues": [
    {
      "issue_id": "UUID",
      "reporter_user_id": "UUID",
      "reporter_name": "Alice",
      "reporter_profile_pic": "https://...",
      "reporter_email": "alice@example.com",
      "wallet_address": "...",
      "image_url": "/uploads/x.jpg",
      "description": "...",
      "category": "pothole",
      "lat": 17.43,
      "lng": 78.36,
      "region": "west",
      "status": "open",
      "priority_score": 88.7,
      "blockchain_tx_hash": "...",
      "upvotes": 22,
      "downvotes": 1,
      "admin_proof_url": null,
      "verification_count": 2,
      "created_at": "2025-10-17T...Z",
      "updated_at": "2025-10-17T...Z"
    }
  ]
}
```

Notes
- Multi-select filters are supported via comma-separated values for `status` and `category`.
- Default sorting can be `priority` to surface the most urgent issues first.

Recommended UI
- Filter bar with multi-select chips for category/status
- Date range picker
- Data table with sticky header, sortable columns, and row actions
- Bulk actions for status updates (optional future enhancement)

---

### 3) POST /issue/:id/update-status
Purpose: Allow government officials to update an issue’s status and optionally attach a proof image. This triggers an on-chain status update.

Request
- Method: POST
- Params: id (issue_id UUID)
- Body:
```json
{
  "status": "open" | "in_progress" | "resolved" | "closed"
}
```
- Multipart: If an image is uploaded, backend stores `admin_proof_url`.

Response 200
```json
{
  "success": true,
  "message": "Issue status updated successfully",
  "issue": {
    "issue_id": "UUID",
    "status": "in_progress",
    "admin_proof_url": "/uploads/proof.jpg",
    "updated_at": "2025-10-17T...Z"
  },
  "blockchain_tx_hash": "TxSignatureString"
}
```

Blockchain Integration
- The backend signs and submits `updateIssueStatus` on-chain using the authenticated government user’s key.
- Mapping from API `status` to on-chain enum is handled server-side.

Recommended UI
- Inline status selector per row + optional upload proof modal
- Confirmation dialog showing current status, next status, and on-chain submission note
- Toast with `blockchain_tx_hash` and link to a Solana explorer

---

### 4) Verification Flow (Citizen)
Purpose: Citizens verify resolved issues. When the verification threshold is reached, the backend auto-closes the issue.

Endpoint
- POST /issue/:id/verify

Preconditions
- User role must be `citizen`
- Issue status must be `resolved`
- User cannot verify own issue
- Payload must include `verified: true`

Response 200
```json
{
  "success": true,
  "message": "Issue verified successfully",
  "auto_closed": true,
  "issue": {
    "issue_id": "UUID",
    "status": "closed",
    "verification_count": 3
  },
  "rep_rewards": { "verifier": 2, "reporter": 5 },
  "blockchain_tx_hash": "TxSignatureString"
}
```

Admin Considerations
- Closed issues can be filtered out in `/admin/issues` by using `status=open,in_progress`.
- Dashboard KPIs and charts will reflect verification-driven closures over time.

---

### 5) GET /issues (App listing)
Purpose: Public/admin listing with filters. To hide closed issues by default in admin UI, request with `status=open,in_progress`.

Examples
- GET /issues?status=open,in_progress
- GET /issues?category=streetlight,pothole&status=open,in_progress&lat=17.43&lng=78.36&radius=5000

Response 200
```json
{
  "success": true,
  "count": 42,
  "issues": [ ... ]
}
```

---

### Error Handling
- Validation errors return 400 with specific messages
- Unauthorized/missing user context returns 401
- Not found returns 404
- Server/blockchain errors return 500 and include a short message; detailed on-chain logs are captured server-side

---

### UI/Visualization Ideas (shadcn/ui)
- Dashboard
  - KPI Cards: totals and averages
  - Category Donut/Bar: issue counts
  - Trend Line: daily created vs resolved
  - Map Heat: `heatmap_data` with priority-weighted intensity
  - Top Priority Table: quick access to status updates
- Issues Page
  - Left filter rail: category/status chips, date pickers
  - Main table: priority first, columns for region, votes, verifications
  - Row action: update status, upload proof, view chain tx link
- Detail Drawer/Modal
  - Full issue info, location map, history of votes/verifications, images, and admin actions

---

### Blockchain Notes
- All status updates and verifications are integrated with Solana via Anchor methods
- The backend handles enum mapping and signing; frontend just calls the API
- Failures include a `blockchain_tx_hash` when available or a clear error message

---

### Coverage Checklist
1. Visualizations: Dashboard endpoint provides KPIs, category breakdown, heatmap, and top-priority list
2. Full issue list: `/admin/issues` supports filters, pagination, and priority sorting
3. Status update: `/issue/:id/update-status` with optional proof image and on-chain submission
4. Blockchain integration: handled server-side; errors surfaced with context
5. Frontend ideas: Provided shadcn/ui patterns for charts, tables, and interactions
