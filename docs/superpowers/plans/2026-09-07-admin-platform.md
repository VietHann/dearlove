# Dearlove Admin Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and deploy the approved Dearlove admin platform with a responsive admin shell, secure Worker APIs, order operations, catalog/media, CMS, marketing operations, user management, and auditability.

**Architecture:** Keep one React 18/Vite SPA and one Hono Worker. Add a guarded admin route tree in React, a shared `requireAdmin` Worker middleware, domain-specific Hono modules, and small API helpers. Keep D1 as the source of truth for metadata and workflow state, use R2 bindings for streamed public/private media, and make every admin mutation auditable and concurrency-safe.

**Tech Stack:** React 18, React Router 6, Tailwind CSS, Lucide React, Hono 4, Better Auth 1.7, Drizzle ORM 0.45, D1 SQLite, R2, Wrangler 4, Cloudflare Vite plugin.

## Global Constraints

- Keep the canonical brand name `Dearlove`.
- Keep React 18, Vite, React Router, Hono, Better Auth, Drizzle and D1.
- Do not create public admin registration.
- Admin authorization must be enforced in the Worker, not only in React.
- Do not expose source template URLs, source code, private R2 keys, password hashes, session tokens or verification values.
- Do not accept raw HTML or JavaScript as CMS content.
- Do not hard-delete templates referenced by orders; archive them instead.
- Use prepared D1 statements, bounded queries, whitelisted sort/filter values and cursor pagination for admin lists.
- Use R2 streaming APIs for binary data; never buffer large files in Worker memory.
- Use current Cloudflare bindings and generated `worker-configuration.d.ts`; run `npx wrangler types` after binding changes.
- Use Vietnamese UI copy and the existing Dearlove gold/red visual language.
- Do not add standalone test-only artifacts; verify behavior with existing build/type/migration commands, local HTTP checks and live production smoke checks.
- Do not claim production completion without fresh command output and live HTTP/browser evidence.

---

## Task 1: Create shared admin authorization and response foundations

**Files:**
- Create: `worker/middleware/admin.ts`
- Create: `worker/lib/http.ts`
- Create: `worker/lib/pagination.ts`
- Create: `worker/lib/validation.ts`
- Create: `src/lib/admin-api.ts`
- Create: `src/pages/admin/AdminLayout.tsx`
- Create: `src/pages/admin/admin.css`
- Modify: `worker/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/sections/Header.tsx`

**Interfaces:**
- `requireAdmin(request: Request, env: Env): Promise<{ user: { id: string; name: string; email: string; role: string; status: string }; session: unknown } | Response>` checks the Better Auth session and current D1 user status/role.
- `requestId(c: Context): string` returns the request ID from `X-Request-ID` or creates a UUID.
- `jsonData(c, data, status?)` and `jsonError(c, status, code, message)` return `{ data, requestId }` and `{ error, requestId }` envelopes.
- `parseCursor(value: string | undefined): number | null` accepts only a bounded base64url cursor containing a numeric timestamp/id pair.
- `adminApi(path, init?)` sends same-origin JSON requests with credentials and converts non-2xx envelopes into an `AdminApiError` carrying `status`, `code` and `message`.
- `AdminLayout` renders the sidebar and an `<Outlet />`; it never decides authorization from client state alone.

- [ ] **Step 1: Verify the current failure shape before adding the foundation**

Run:

```bash
curl -sS -o /tmp/dearlove-admin-before.json -w '%{http_code}\n' \\
  https://dearlove.click/api/v1/admin/dashboard
cat /tmp/dearlove-admin-before.json
```

Expected: the current Worker has no dashboard route, so the response is not a successful dashboard envelope.

- [ ] **Step 2: Implement bounded response, pagination and validation helpers**

`worker/lib/http.ts` must create a UUID request ID, set `Content-Type: application/json`, `Cache-Control: no-store` for admin responses, and include the request ID header. `worker/lib/pagination.ts` must reject malformed cursors and clamp `limit` to `1..50`. `worker/lib/validation.ts` must expose `requiredString`, `optionalString`, `enumValue`, `boundedInteger` and `isSameOriginMutation` without accepting arbitrary SQL fragments.

- [ ] **Step 3: Implement `requireAdmin` against the current session and D1 user row**

The middleware must:

1. Call `createAuth(env).api.getSession({ headers: request.headers })`.
2. Return `401 UNAUTHORIZED` when there is no session.
3. Query `user` by session user ID and require `role = 'admin'` and `status = 'active'`.
4. Return `403 FORBIDDEN` for any other role/status.
5. For non-GET/HEAD/OPTIONS requests, require an Origin equal to `env.BETTER_AUTH_URL` or the allowed local origin.
6. Never include the database row or session token in an error response.

- [ ] **Step 4: Implement the shared React admin API client**

`adminApi` must set `Accept: application/json`, set `Content-Type` only when a body exists, use `credentials: 'include'`, parse the response once, and throw a typed error for 401/403/409/422/5xx. A 401 must navigate callers to `/auth?mode=login&returnTo=<same-origin-admin-path>`; it must reject external `returnTo` values.

- [ ] **Step 5: Implement the responsive admin shell**

Create a CSS layout with:

- desktop sidebar width between 240px and 280px;
- mobile drawer controlled by a labeled menu button;
- active route styling with text and an icon;
- skip link, visible focus rings and `aria-current`;
- content area with breadcrumb, page title and action slot;
- no fixed horizontal table overflow outside the intended scroll container;
- reduced-motion behavior for drawer transitions.

Use Lucide icons with text labels. Add navigation links for dashboard, orders, catalog, media, content, pricing, blog, contacts, newsletter, users and audit log.

- [ ] **Step 6: Mount the shell and admin index route**

Add an `/admin` route with nested routes in `src/App.tsx`. The shell must render only after the page component has resolved session state; unauthorized users go to login, while API authorization remains authoritative. Keep the public `Layout` separate so the admin does not show the marketing header/footer.

- [ ] **Step 7: Run static verification for the foundation**

Run:

```bash
npm run build
npx wrangler deploy --dry-run
```

Expected: both commands exit with code 0. Fix type/import/config errors before starting Task 2.

- [ ] **Step 8: Commit the foundation**

```bash
git add worker/middleware/admin.ts worker/lib/http.ts worker/lib/pagination.ts \\
  worker/lib/validation.ts src/lib/admin-api.ts src/pages/admin/AdminLayout.tsx \\
  src/pages/admin/admin.css worker/index.ts src/App.tsx src/sections/Header.tsx
git commit -m "feat: add secure admin shell foundations"
```

---

## Task 2: Add D1 indexes and reusable order workflow helpers

**Files:**
- Create: `migrations/0001_admin_operations_indexes.sql`
- Create: `worker/lib/order-state.ts`
- Create: `worker/lib/audit.ts`
- Modify: `worker/db/schema.ts`

**Interfaces:**
- `type OrderStatus = 'draft' | 'submitted' | 'reviewing' | 'awaiting_customer' | 'confirmed' | 'in_production' | 'ready' | 'delivered' | 'completed' | 'cancelled'`.
- `type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'refunded'`.
- `canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean`.
- `transitionOrder(db: D1Database, input: { orderId: string; fromStatus: OrderStatus; toStatus: OrderStatus; actorId: string; reason: string; expectedUpdatedAt: number; now: number }): Promise<'updated' | 'conflict' | 'not_found'>` performs the compare-and-swap update, history insert and audit insert in one D1 batch/transaction-compatible sequence.
- `auditStatement(input: { actorId: string; action: string; entityType: string; entityId: string; metadata?: Record<string, string | number | boolean | null> }, now: number): D1PreparedStatement` removes sensitive keys before serialization.
- `orderRequestStatement(input: { id: string; idempotencyKey: string; customerId: string; orderId: string; now: number }): D1PreparedStatement` records a customer/order submit idempotency key.

- [ ] **Step 1: Verify the current order indexes and status behavior**

Run:

```bash
npx wrangler d1 execute dearlove-production --remote --command \\
  "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name IN ('orders','order_status_history','order_notes','order_assignments');"
```

Expected: current indexes include status/created and customer/created but no deadline/payment/assignment lookup indexes.

- [ ] **Step 2: Write the migration for bounded admin queries and submit idempotency**

Create `0001_admin_operations_indexes.sql` with idempotent indexes and an idempotency table:

```sql
CREATE TABLE IF NOT EXISTS order_requests (
  id TEXT PRIMARY KEY NOT NULL,
  idempotency_key TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(customer_id, idempotency_key),
  FOREIGN KEY (customer_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_order_requests_created
  ON order_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_created
  ON orders(payment_status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_deadline
  ON orders(requested_deadline, status);
CREATE INDEX IF NOT EXISTS idx_order_assignments_active_admin
  ON order_assignments(admin_id, unassigned_at, assigned_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_status
  ON contact_submissions(assigned_to, status, created_at);
```

Add the matching `orderRequests` Drizzle table to `worker/db/schema.ts`. Do not modify `0000_warm_dreaming_celestial.sql`.

- [ ] **Step 3: Implement and check the explicit order transition map**

The map must allow exactly:

```ts
const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  draft: ['submitted'],
  submitted: ['reviewing', 'cancelled'],
  reviewing: ['awaiting_customer', 'confirmed', 'cancelled'],
  awaiting_customer: ['reviewing', 'cancelled'],
  confirmed: ['in_production', 'cancelled'],
  in_production: ['ready', 'cancelled'],
  ready: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
}
```

- [ ] **Step 4: Implement audit metadata sanitization**

Allow only scalar metadata values. Drop keys named `password`, `token`, `secret`, `authorization`, `cookie`, `verification`, `privateKey`, `objectKey`, `body`, `email` and `phone`; any future masked value must use a separate explicitly named field such as `emailDomain`. Keep audit rows small.

- [ ] **Step 5: Run migration checks locally**

Run:

```bash
npx drizzle-kit check
npx wrangler d1 migrations list dearlove-production --remote
```

Expected: Drizzle check succeeds and the new migration is listed as pending until it is applied.

- [ ] **Step 6: Commit order helpers and migration**

```bash
git add migrations/0001_admin_operations_indexes.sql worker/db/schema.ts \\
  worker/lib/order-state.ts worker/lib/audit.ts
git commit -m "feat: add audited order workflow primitives"
```

---

## Task 3: Replace the order queue with complete admin order operations

**Files:**
- Modify: `worker/modules/admin/orders.ts`
- Modify: `worker/index.ts`
- Modify: `src/pages/admin/AdminOrders.tsx`
- Create: `src/pages/admin/AdminOrderDetail.tsx`
- Create: `src/pages/admin/order-utils.ts`
- Create: `src/pages/admin/AdminOrderDetail.css`

**Interfaces:**
- `GET /api/v1/admin/orders?q=&status=&paymentStatus=&assignedTo=&from=&to=&cursor=&limit=&sort=` returns `{ data: { items: AdminOrderRow[]; nextCursor: string | null }, requestId }`.
- `GET /api/v1/admin/orders/:orderId` returns `{ data: AdminOrderDetail; requestId }`.
- `PATCH /api/v1/admin/orders/:orderId/status` accepts `{ toStatus, reason, updatedAt }`.
- `PATCH /api/v1/admin/orders/:orderId/payment` accepts `{ paymentStatus, reason, updatedAt }`.
- `PUT /api/v1/admin/orders/:orderId/assignment` accepts `{ adminId: string | null; updatedAt }`.
- `POST /api/v1/admin/orders/:orderId/notes` accepts `{ visibility: 'customer' | 'internal'; body: string }`.
- `AdminOrderRow` contains `id`, `orderCode`, `customerName`, `customerEmail`, `templateName`, `status`, `paymentStatus`, `requestedDeadline`, `createdAt`, `updatedAt`, `assignedAdminName`.
- `AdminOrderDetail` contains the row plus parsed `contactSnapshot`, `templateSnapshot`, `packageSnapshot`, `formAnswers`, `uploadGroups`, `notes`, `assignments`, `statusHistory`, `availableTransitions` and `adminUsers`.

- [ ] **Step 1: Verify current API and create a safe local baseline**

Run:

```bash
curl -sS -o /tmp/admin-orders-before.json -w '%{http_code}\n' \\
  'https://dearlove.click/api/v1/admin/orders'
cat /tmp/admin-orders-before.json
```

Expected: the old endpoint returns only the minimal list and has no detail/mutation contract.

- [ ] **Step 2: Implement server-side list query**

Build the SQL from fixed query branches, not arbitrary client strings. Join `orders`, `user`, `templates`, `order_assignments` and the active assigned user. Search with escaped `%`/`_` in the three allowed fields. Use `LIMIT ?` with `limit + 1`, encode the last row into the cursor, and return no more than 50 rows.

- [ ] **Step 3: Implement order detail hydration**

Load the order by ID, then bounded child queries for form answers, upload groups/files, notes, status history, assignments and active admin users. Parse JSON snapshots with a safe helper; malformed historical JSON becomes `{}` plus a server log event, not a request crash. Never return `media_assets.object_key` for private assets.

- [ ] **Step 4: Implement status mutation with optimistic concurrency**

Validate `toStatus`, `reason` length `1..500`, `updatedAt` as an integer, and the transition map. Update only when `id = ? AND status = ? AND updated_at = ?`. Insert history and audit rows with actor ID. Return `409 ORDER_CONFLICT` when the compare-and-swap affects zero rows because the order changed; return `422 INVALID_ORDER_TRANSITION` before writing for an invalid edge.

- [ ] **Step 5: Implement payment mutation**

Validate the four payment states. Update with `WHERE id = ? AND updated_at = ?`, require a nonempty reason for `refunded`, insert an audit row and return the refreshed order. A payment update never changes order status automatically.

- [ ] **Step 6: Implement assignment mutation**

When `adminId` is non-null, verify that the user exists, is active and has role `admin`. Close the previous active assignment by setting `unassigned_at`, insert the new assignment, write audit metadata with only IDs, and use `updated_at` compare-and-swap. When null, only close the active assignment.

- [ ] **Step 7: Implement note creation**

Validate visibility and a body of `1..4000` characters. Verify the order exists, insert the note and audit row, and return the created note. Do not send customer-visible notes to an email service in this slice; keep them in the customer order detail for the later notification slice.

- [ ] **Step 8: Implement private file authorization endpoint**

Add `GET /api/v1/admin/orders/:orderId/files/:fileId`. Verify the file belongs to the order, load the media asset, require private visibility and `status = 'ready'`, fetch the object through the private R2 binding once available, and return a no-store streamed response. Return 404 for missing/unauthorized object metadata without revealing whether another customer owns it.

- [ ] **Step 9: Build the order queue UI**

Replace the current table with:

- search field with 300ms debounce;
- status/payment/assignment filters;
- date inputs;
- sort select with fixed values;
- cursor “Tải thêm” button;
- clear filters action;
- row link to `/admin/orders/:orderId`;
- accessible status/payment badges with text;
- skeleton, empty and retry states;
- mobile card rendering and desktop table rendering.

Keep filter state in `URLSearchParams`, abort stale fetches with `AbortController`, and show server error codes in Vietnamese copy.

- [ ] **Step 10: Build order detail UI**

Create sections for summary, contact, template/package, form answers, upload groups, status timeline, notes, assignment and payment. Use confirmation dialogs for destructive/cancelled/refunded actions. Disable controls during mutation. On 409, show the conflict message and a reload action. After a successful mutation, replace data with the server response instead of manually guessing the new timestamp.

- [ ] **Step 11: Apply the migration to the local/remote database**

Run:

```bash
npx wrangler d1 migrations apply dearlove-production --local
npx wrangler d1 migrations apply dearlove-production --remote
```

Expected: migration applies once to each database without editing the initial migration.

- [ ] **Step 12: Run build and dry-run verification**

```bash
npm run build
npx wrangler deploy --dry-run
```

Expected: both exit 0 and the generated bundle contains no private key or session token.

- [ ] **Step 13: Commit complete order operations**

```bash
git add worker/modules/admin/orders.ts worker/index.ts \\
  src/pages/admin/AdminOrders.tsx src/pages/admin/AdminOrderDetail.tsx \\
  src/pages/admin/order-utils.ts src/pages/admin/AdminOrderDetail.css
git commit -m "feat: complete admin order operations"
```

---

## Task 4: Add admin dashboard and operational navigation

**Files:**
- Create: `worker/modules/admin/dashboard.ts`
- Create: `src/pages/admin/AdminDashboard.tsx`
- Create: `src/pages/admin/admin-dashboard.css`
- Modify: `worker/index.ts`
- Modify: `src/pages/admin/AdminLayout.tsx`

**Interfaces:**
- `GET /api/v1/admin/dashboard` returns `{ data: { orderCounts, paymentCounts, openContacts, overdueOrders, recentOrders, recentAuditEvents }, requestId }`.
- `AdminDashboard` renders summary cards, order status distribution, overdue list, latest orders and latest audit events.

- [ ] **Step 1: Add dashboard query branches with explicit limits**

Use one D1 batch for status/payment count queries and separate bounded queries for the five latest overdue/orders/audit rows. Use `COUNT(*)` only with indexed status conditions. Treat an absent audit table row as an empty result, not a 500.

- [ ] **Step 2: Implement the dashboard page**

Add a refresh button, last-updated text, summary cards, a status grid, an overdue list linking to detail, and latest activity linking to the appropriate section. Make the cards readable at 320px width and use text labels alongside icons.

- [ ] **Step 3: Link dashboard navigation**

Make `/admin` the default admin landing route and add active counts to the sidebar only when the dashboard response has loaded. Avoid polling; refresh is explicit.

- [ ] **Step 4: Verify dashboard behavior**

Using the existing admin session cookie or browser session, verify:

```bash
curl -sS -o /tmp/admin-dashboard.json -w '%{http_code}\n' \\
  'https://dearlove.click/api/v1/admin/dashboard'
```

Expected after deployment: HTTP 200 for admin, HTTP 401 without cookies, and a JSON `data` object with bounded arrays.

- [ ] **Step 5: Commit the dashboard**

```bash
git add worker/modules/admin/dashboard.ts src/pages/admin/AdminDashboard.tsx \\
  src/pages/admin/admin-dashboard.css worker/index.ts src/pages/admin/AdminLayout.tsx
git commit -m "feat: add admin operations dashboard"
```

---

## Task 5: Create and bind public/private R2 buckets for media operations

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `worker-configuration.d.ts` via generated output
- Create: `worker/modules/admin/media.ts`
- Create: `worker/modules/media/storage.ts`
- Create: `src/pages/admin/AdminMedia.tsx`
- Create: `src/pages/admin/admin-media.css`
- Modify: `worker/index.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Bindings: `PUBLIC_MEDIA` and `PRIVATE_UPLOADS` as `R2Bucket`.
- `GET /api/v1/admin/media?bucket=&purpose=&status=&q=&cursor=&limit=` lists metadata only.
- `POST /api/v1/admin/media/prepare` accepts `{ bucket: 'public' | 'private'; purpose; filename; contentType; sizeBytes; altText? }` and returns `{ assetId, uploadPath: '/api/v1/admin/media/upload/:assetId', expiresAt }`; the server-created `objectKey` is never returned to the browser.
- `PUT /api/v1/admin/media/upload/:assetId` accepts the request stream and writes it to the server-created R2 key.
- `POST /api/v1/admin/media/:assetId/complete` checks object metadata and sets `status = 'ready'`.
- `DELETE /api/v1/admin/media/:assetId` deletes metadata/object only when not referenced by a published template/page.
- `GET /api/v1/media/public/:assetId` streams ready public assets with cache headers.

- [ ] **Step 1: Inspect available production R2 buckets**

Run:

```bash
npx wrangler r2 bucket list
```

Expected: determine whether the two Dearlove buckets exist. Do not reuse an unrelated bucket.

- [ ] **Step 2: Create only missing dedicated buckets**

Use names `dearlove-public-media` and `dearlove-private-uploads`:

```bash
npx wrangler r2 bucket create dearlove-public-media
npx wrangler r2 bucket create dearlove-private-uploads
```

If a bucket already exists, keep it and record its exact name in config. Do not delete existing data.

- [ ] **Step 3: Add R2 bindings and generate types**

Add production bindings to `wrangler.jsonc`, keep local bindings safe, then run:

```bash
npx wrangler types
```

Confirm that `PUBLIC_MEDIA: R2Bucket` and `PRIVATE_UPLOADS: R2Bucket` appear in `worker-configuration.d.ts`. Do not hand-edit generated binding types.

- [ ] **Step 4: Implement storage helpers using streams**

`putStream` must pass `request.body` directly to `R2Bucket.put` with validated `httpMetadata`; it must not call `arrayBuffer`, `blob`, `text` or duplicate the request body. `getStream` must set `ETag`, content type, content length and cache policy from R2 metadata. Private responses use `Cache-Control: private, no-store`.

- [ ] **Step 5: Implement metadata-first media prepare/complete/delete**

Generate object keys as `admin/<actorId>/<assetId>/<safeExtension>` or `orders/<orderId>/<assetId>/<safeExtension>`. Never use the original filename as a key. Validate MIME against `image/jpeg`, `image/png`, `image/webp`, `image/avif`, PDF only for private payment proof, and cap admin image size at 20 MiB. Complete must call `head` and compare size/content type before marking ready.

- [ ] **Step 6: Implement media library UI**

Provide bucket/purpose/status filters, search, cursor pagination, upload form, preview for ready public images, metadata editor for alt text and delete/archive action. Upload the selected `File` with `XMLHttpRequest` to the returned `uploadPath` so the UI can display `loaded / total` progress; the object key stays inside the Worker.

- [ ] **Step 7: Verify R2 access and privacy locally**

Run the Worker locally with the configured bindings and verify:

```bash
curl -i http://127.0.0.1:8787/api/v1/media/public/missing
curl -i http://127.0.0.1:8787/api/v1/admin/media
```

Expected: missing public asset is 404; unauthenticated admin media is 401; no R2 key is returned in either response.

- [ ] **Step 8: Build and commit media**

```bash
npm run build
npx wrangler deploy --dry-run
git add wrangler.jsonc worker-configuration.d.ts worker/modules/admin/media.ts \\
  worker/modules/media/storage.ts src/pages/admin/AdminMedia.tsx \\
  src/pages/admin/admin-media.css worker/index.ts src/App.tsx
git commit -m "feat: add admin media storage operations"
```

---

## Task 6: Add catalog/category administration and public catalog API

**Files:**
- Create: `worker/modules/admin/catalog.ts`
- Create: `worker/modules/catalog/public.ts`
- Create: `src/pages/admin/AdminCatalog.tsx`
- Create: `src/pages/admin/AdminTemplateEditor.tsx`
- Create: `src/pages/admin/AdminCategoryEditor.tsx`
- Create: `src/pages/admin/admin-catalog.css`
- Create: `src/lib/catalog-api.ts`
- Modify: `worker/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/templates/Templates.tsx`
- Modify: `src/pages/templates/TemplateCard.tsx`
- Modify: `src/sections/TemplatesSection.tsx`

**Interfaces:**
- Public: `GET /api/v1/templates?category=&tier=&featured=&q=&cursor=&limit=`.
- Public: `GET /api/v1/templates/:slug`.
- Admin: `GET/POST/PATCH /api/v1/admin/catalog/categories`.
- Admin: `GET/POST/PATCH /api/v1/admin/catalog/templates`.
- Admin: `POST /api/v1/admin/catalog/templates/:templateId/publish`.
- Admin: `POST /api/v1/admin/catalog/templates/:templateId/archive`.
- Template publish requires a published category and at least one ready public screenshot with a supported derivative variant.
- Public responses contain only id/slug/name/category/description/tier/price/badges/featured/order/screenshot public URLs. They never contain source URL, private bucket, object key or draft rows.

- [ ] **Step 1: Inspect current hard-coded catalog IDs and production rows**

Run:

```bash
npx wrangler d1 execute dearlove-production --remote --command \\
  "SELECT id, slug, name, category_id, status FROM templates ORDER BY sort_order, created_at LIMIT 20;"
```

Keep existing rows and IDs compatible with current order drafts while replacing fallback insertion in future order creation.

- [ ] **Step 2: Implement admin category CRUD**

Validate slug as lowercase URL-safe text, name length `1..120`, description max `1000`, position bounded, and status enum. Handle unique slug conflicts as `409 SLUG_EXISTS`. Every mutation writes an audit record.

- [ ] **Step 3: Implement admin template CRUD and publish rules**

Validate slug/name/category/access tier/status/sort order, allow optional description and price label, and preserve existing order references. Publish must query category and screenshot readiness before atomically setting `status = 'published'`; archive must keep the row.

- [ ] **Step 4: Implement public catalog queries**

Use joins against published categories and ready public screenshot assets. Whitelist filters and sort order. Encode cursor from `sort_order`, `created_at`, and `id`. Use `Cache-Control: public, max-age=60, s-maxage=300` for successful public catalog reads and `no-store` for admin.

- [ ] **Step 5: Replace frontend catalog data reads**

Create `catalog-api.ts` with loading/error/empty states and use one API-backed catalog source in `/templates` and the home templates section. Keep a temporary fallback only for an explicit API failure state with visible “Dữ liệu catalog đang tạm thời không khả dụng”, not silently stale hard-coded content. Keep card CTA as “Chọn mẫu”; remove any source/preview link.

- [ ] **Step 6: Build catalog administration UI**

Add tabs for templates/categories, status filters, search, edit forms, screenshot attachment, publish/archive controls, validation errors and responsive cards/table. Disable publish when requirements are missing and explain the missing requirement inline.

- [ ] **Step 7: Verify draft isolation and public safety**

Create a draft category/template through the admin API, call the public templates API, confirm it is absent, publish it only after screenshot readiness, confirm it appears, then archive it and confirm it disappears. Delete the temporary rows/assets after verification.

- [ ] **Step 8: Commit catalog work**

```bash
npm run build
npx wrangler deploy --dry-run
git add worker/modules/admin/catalog.ts worker/modules/catalog/public.ts \\
  src/pages/admin/AdminCatalog.tsx src/pages/admin/AdminTemplateEditor.tsx \\
  src/pages/admin/AdminCategoryEditor.tsx src/pages/admin/admin-catalog.css \\
  src/lib/catalog-api.ts worker/index.ts src/App.tsx \\
  src/pages/templates/Templates.tsx src/pages/templates/TemplateCard.tsx \\
  src/sections/TemplatesSection.tsx
git commit -m "feat: add admin catalog management"
```

---

## Task 7: Add typed CMS content, settings, revision publish and rollback

**Files:**
- Create: `worker/modules/admin/content.ts`
- Create: `worker/modules/content/public.ts`
- Create: `worker/lib/content-schema.ts`
- Create: `src/pages/admin/AdminContent.tsx`
- Create: `src/pages/admin/ContentBlockEditor.tsx`
- Create: `src/pages/admin/admin-content.css`
- Create: `src/lib/content-api.ts`
- Modify: `worker/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/sections/HeroSection.tsx`
- Modify: `src/sections/FaqSection.tsx`
- Modify: `src/sections/Footer.tsx`
- Modify: `src/pages/LegalPage.tsx`

**Interfaces:**
- `GET /api/v1/site/bootstrap` returns only published settings/pages/sections.
- `GET /api/v1/admin/content/pages` lists pages and current draft/published versions.
- `GET /api/v1/admin/content/pages/:pageKey` returns draft, published snapshot and revision list.
- `PUT /api/v1/admin/content/pages/:pageKey/draft` accepts `{ title, seoTitle?, seoDescription?, sections, expectedVersion }`.
- `POST /api/v1/admin/content/pages/:pageKey/publish` accepts `{ expectedVersion, publishNote? }`.
- `POST /api/v1/admin/content/pages/:pageKey/rollback` accepts `{ revisionId, publishNote? }`.
- `ContentBlock` is a discriminated union for `hero`, `banner`, `cta`, `faq`, `stats`, `testimonials`, `feature_grid`, `footer_links`, `contact_info`, `seo_defaults`.

- [ ] **Step 1: Define typed block schemas and safe limits**

Implement schema validation without adding raw HTML. Each string field has a max length; arrays have max item counts; links accept only same-origin paths or HTTPS URLs from an explicit allowlist; image references accept media asset IDs, not arbitrary object keys. Invalid blocks return field-level errors.

- [ ] **Step 2: Implement page/revision read APIs**

Load the published revision for public bootstrap. For admin detail, load the latest draft revision, published revision and at most 20 recent revisions. Parse snapshots defensively and omit malformed sections from the public response while logging a structured error.

- [ ] **Step 3: Implement draft save with version check**

Use `expectedVersion` to prevent concurrent overwrite. In one D1 write sequence, create a new `content_revisions` row and its `page_sections`, increment the version, and leave `published_revision_id` unchanged. Return `409 CONTENT_CONFLICT` when the expected version is stale.

- [ ] **Step 4: Implement publish and rollback**

Publish only a validated draft; update `pages.published_revision_id` and `pages.status` atomically. Rollback copies the selected revision snapshot into a new revision authored by the current admin, then publishes that new revision. Write audit actions `content.draft_saved`, `content.published`, and `content.rollback`.

- [ ] **Step 5: Implement site bootstrap API**

Return page settings and sections grouped by page key with `ETag` derived from the latest published version. Use short public cache headers and no private fields. Do not return draft revisions or author IDs.

- [ ] **Step 6: Build the CMS editor**

Create page tabs, draft/published indicator, block reorder controls, visibility toggles, block-specific forms, media picker, preview link, save draft, publish and rollback controls. Reorder must use buttons plus keyboard-friendly controls; do not require drag-and-drop. Show unsaved changes and conflict reload action.

- [ ] **Step 7: Connect public sections to bootstrap data**

Use the bootstrap API for content that has a published block. Preserve current static layout as a typed default only when a page has no published CMS content. Keep no arbitrary HTML injection and keep legal text safely rendered as text/paragraph blocks.

- [ ] **Step 8: Verify draft/publish/rollback isolation**

Create a temporary page revision as admin, verify public bootstrap remains unchanged before publish, publish, verify the new value is visible, rollback, verify the previous value returns, then delete only temporary page/revision data if no production page references it.

- [ ] **Step 9: Commit CMS work**

```bash
npm run build
npx wrangler deploy --dry-run
git add worker/modules/admin/content.ts worker/modules/content/public.ts \\
  worker/lib/content-schema.ts src/pages/admin/AdminContent.tsx \\
  src/pages/admin/ContentBlockEditor.tsx src/pages/admin/admin-content.css \\
  src/lib/content-api.ts worker/index.ts src/App.tsx \\
  src/sections/HeroSection.tsx src/sections/FaqSection.tsx \\
  src/sections/Footer.tsx src/pages/LegalPage.tsx
git commit -m "feat: add typed admin content publishing"
```

---

## Task 8: Add pricing, blog and marketing content administration

**Files:**
- Create: `worker/modules/admin/pricing.ts`
- Create: `worker/modules/admin/blog.ts`
- Create: `worker/modules/public/pricing.ts`
- Create: `worker/modules/public/blog.ts`
- Create: `worker/lib/markdown.ts`
- Create: `src/pages/admin/AdminPricing.tsx`
- Create: `src/pages/admin/AdminBlog.tsx`
- Create: `src/pages/admin/admin-marketing.css`
- Create: `src/lib/marketing-api.ts`
- Modify: `worker/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/pricing/Pricing.tsx`
- Modify: `src/pages/blog/Blog.tsx`
- Modify: `src/pages/blog/BlogContent.tsx`
- Modify: `src/pages/blog/BlogNewsletter.tsx`

**Interfaces:**
- Public: `GET /api/v1/pricing`, `GET /api/v1/blog`, `GET /api/v1/blog/:slug`.
- Admin: `GET/POST/PATCH /api/v1/admin/pricing`, `POST /api/v1/admin/pricing/:id/publish`, `POST /api/v1/admin/pricing/:id/archive`.
- Admin: `GET/POST/PATCH /api/v1/admin/blog`, `POST /api/v1/admin/blog/:id/publish`, `POST /api/v1/admin/blog/:id/archive`.
- Blog content is sanitized Markdown/block content, not raw HTML.

- [ ] **Step 1: Implement pricing CRUD and publish rules**

Validate unique slug/name/price label, payload JSON shape, position and status. Public pricing returns only published rows ordered by position. Write audit rows for create/update/publish/archive.

- [ ] **Step 2: Implement blog CRUD and safe rendering**

Validate slug/title/excerpt, cover media ID, category, author ID, status and publish date. Sanitize Markdown to a supported subset of headings, paragraphs, lists, links and emphasis; strip scripts, event attributes, iframes and unsafe URLs. Public blog returns only published posts.

- [ ] **Step 3: Build pricing and blog admin screens**

Use a shared editor form with draft/published badges, preview, save, publish/archive and validation errors. Provide a list search/filter and cursor pagination. Make publish date explicit in `Asia/Ho_Chi_Minh` UI while storing UTC timestamps.

- [ ] **Step 4: Replace public hard-coded marketing reads**

Pricing and blog pages use the public APIs with loading/error/empty states. Blog newsletter submit calls the real newsletter endpoint from Task 9 instead of a delay/mock. Keep current design components but pass API data into them.

- [ ] **Step 5: Verify unpublished isolation and sanitizer behavior**

Confirm draft posts/plans are absent from public APIs. Submit Markdown containing a script/event attribute and confirm returned/rendered content excludes it. Confirm published links use same-origin or HTTPS only.

- [ ] **Step 6: Commit marketing administration**

```bash
npm run build
npx wrangler deploy --dry-run
git add worker/modules/admin/pricing.ts worker/modules/admin/blog.ts \\
  worker/modules/public/pricing.ts worker/modules/public/blog.ts \\
  worker/lib/markdown.ts src/pages/admin/AdminPricing.tsx \\
  src/pages/admin/AdminBlog.tsx src/pages/admin/admin-marketing.css \\
  src/lib/marketing-api.ts worker/index.ts src/App.tsx \\
  src/pages/pricing/Pricing.tsx src/pages/blog/Blog.tsx \\
  src/pages/blog/BlogContent.tsx src/pages/blog/BlogNewsletter.tsx
git commit -m "feat: add pricing and blog administration"
```

---

## Task 9: Add contact, newsletter, users and audit log operations

**Files:**
- Create: `worker/modules/admin/contacts.ts`
- Create: `worker/modules/admin/newsletter.ts`
- Create: `worker/modules/admin/users.ts`
- Create: `worker/modules/admin/audit.ts`
- Create: `worker/modules/public/contact.ts`
- Create: `worker/modules/public/newsletter.ts`
- Create: `src/pages/admin/AdminContacts.tsx`
- Create: `src/pages/admin/AdminNewsletter.tsx`
- Create: `src/pages/admin/AdminUsers.tsx`
- Create: `src/pages/admin/AdminAuditLog.tsx`
- Create: `src/pages/admin/admin-operations.css`
- Create: `src/lib/operations-api.ts`
- Modify: `worker/index.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/contact/Contact.tsx`
- Modify: `src/pages/contact/ContactFAQ.tsx`
- Modify: `src/sections/Footer.tsx`

**Interfaces:**
- Public: `POST /api/v1/contact-submissions` with name/email/phone/topic/message and anti-spam token fields.
- Public: `POST /api/v1/newsletter-subscriptions` and `POST /api/v1/newsletter-unsubscribe`.
- Admin: `GET/PATCH /api/v1/admin/contacts`.
- Admin: `GET/PATCH /api/v1/admin/newsletter`.
- Admin: `GET/PATCH /api/v1/admin/users`.
- Admin: `GET /api/v1/admin/audit-log`.

- [ ] **Step 1: Implement public contact validation and persistence**

Validate email/name/message lengths, topic enum, honeypot and idempotency header. Insert a `new` submission with a generated ID. Return a generic success response for valid/duplicate requests to avoid enumeration. Do not log message/body/email/phone.

- [ ] **Step 2: Implement public newsletter subscribe/unsubscribe**

Normalize email lowercase, use the unique constraint, preserve consent timestamp, support reactivation after unsubscribe, and return a generic success response for duplicates. Keep unsubscribe token design out of this slice unless email delivery is configured; admin can set status manually.

- [ ] **Step 3: Implement admin contact operations**

List with status/assigned/search filters and cursor pagination. Detail fields may show PII only to active admins. Patch status or assignment with whitelist and audit metadata containing only IDs/action. Never include message in audit JSON.

- [ ] **Step 4: Implement admin newsletter operations**

List status/date filters, update active/unsubscribed status, and export only email/status/consent date after an explicit admin action. Keep export endpoint bounded and do not expose subscriber data to customers.

- [ ] **Step 5: Implement admin user operations**

List users with role/status/search filters. Add suspend/restore and role update endpoints. Forbid suspending or demoting the last active admin; forbid changing password/account/session fields. Revoke all sessions when a user is suspended by deleting rows for that user. Audit user ID and action only.

- [ ] **Step 6: Implement audit log query**

Filter by actor/action/entity/date, use cursor pagination and return actor name/email masked as needed. Never return sensitive `metadata_json` values; sanitize legacy rows before returning.

- [ ] **Step 7: Build four admin screens**

Use a shared operation list pattern with filters, status badges, pagination, detail drawer/page, mutation confirmation and accessible retry/empty states. User role/status controls must show a warning before suspend/demote. Audit log is read-only.

- [ ] **Step 8: Connect public contact/newsletter forms**

Replace simulated delays with API calls. Show inline validation, server error, success confirmation and disabled/loading states. Preserve current marketing design and provide a no-JavaScript-safe form action message only if a real fallback exists; otherwise show the client error clearly.

- [ ] **Step 9: Verify object authorization and audit behavior**

Use admin API calls to change a contact/user/order operation and query audit log for the action. Use an unauthenticated request and a customer session to confirm 401/403. Verify a suspended user cannot use the customer order API after sessions are revoked.

- [ ] **Step 10: Commit operations administration**

```bash
npm run build
npx wrangler deploy --dry-run
git add worker/modules/admin/contacts.ts worker/modules/admin/newsletter.ts \\
  worker/modules/admin/users.ts worker/modules/admin/audit.ts \\
  worker/modules/public/contact.ts worker/modules/public/newsletter.ts \\
  src/pages/admin/AdminContacts.tsx src/pages/admin/AdminNewsletter.tsx \\
  src/pages/admin/AdminUsers.tsx src/pages/admin/AdminAuditLog.tsx \\
  src/pages/admin/admin-operations.css src/lib/operations-api.ts \\
  worker/index.ts src/App.tsx src/pages/contact/Contact.tsx \\
  src/pages/contact/ContactFAQ.tsx src/sections/Footer.tsx
git commit -m "feat: add admin operations and user management"
```

---

## Task 10: Connect admin and customer order detail contracts

**Files:**
- Modify: `worker/modules/orders/orders.ts`
- Create: `worker/modules/orders/detail.ts`
- Create: `worker/modules/orders/submit.ts`
- Create: `src/pages/account/OrderDetail.tsx`
- Create: `src/pages/account/order-detail.css`
- Modify: `src/pages/account/Account.tsx`
- Modify: `src/pages/orders/OrderPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- `GET /api/v1/orders/:orderId` only returns the authenticated customer’s order and customer-visible notes.
- `PATCH /api/v1/orders/:orderId` updates a draft with customer-owned fields only.
- `POST /api/v1/orders/:orderId/submit` accepts an idempotency key and changes draft to submitted once.
- `POST /api/v1/orders/:orderId/messages` creates a customer-visible note only for the order owner.

- [ ] **Step 1: Remove template/category fallback insertion from order creation**

Require an existing published template ID. Load category/template/screenshot metadata, create immutable template/package snapshots, and return `422 TEMPLATE_UNAVAILABLE` when the template is draft/archived/missing. Keep current production order rows readable.

- [ ] **Step 2: Add customer order detail authorization**

Every detail/update query must include `customer_id = session.user.id`. Do not use only the URL ID. Return generic 404 for another customer’s order. Parse snapshots defensively.

- [ ] **Step 3: Add draft update and submit idempotency**

Require an `Idempotency-Key` header of 16..128 printable characters on submit. In one D1 write sequence, first insert `order_requests(id, idempotency_key, customer_id, order_id, created_at)` under the unique `(customer_id, idempotency_key)` constraint, then update the draft to `submitted` with `WHERE id = ? AND customer_id = ? AND status = 'draft'`. If the key already exists for the same customer, return the original order result without creating another transition; if the order is no longer draft for a new key, return `409 ORDER_ALREADY_SUBMITTED`. The `order_requests` table and index are created in Task 2.

- [ ] **Step 4: Build customer order detail/timeline UI**

Show order code, status/payment, template snapshot, submitted data, customer-visible notes and next action. Keep admin/internal notes out of the customer response. Link from account order rows.

- [ ] **Step 5: Verify cross-customer isolation**

Create two temporary customer sessions/orders and confirm each account receives only its own detail; request the other order ID and expect the same 404 shape as an unknown order. Clean temporary data after the check.

- [ ] **Step 6: Commit customer/admin contract alignment**

```bash
npm run build
npx wrangler deploy --dry-run
git add worker/modules/orders/orders.ts worker/modules/orders/detail.ts \\
  worker/modules/orders/submit.ts src/pages/account/OrderDetail.tsx \\
  src/pages/account/order-detail.css src/pages/account/Account.tsx \\
  src/pages/orders/OrderPage.tsx src/App.tsx
git commit -m "feat: align customer order detail with admin workflow"
```

---

## Task 11: Harden Worker configuration, migrations and deployment workflow

**Files:**
- Modify: `wrangler.jsonc`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `worker-configuration.d.ts` via generated output

**Interfaces:**
- Production remains Worker `dearlovevip` with custom domain `https://dearlove.click` and D1 `dearlove-production`.
- Add explicit `env.staging` and `env.production` blocks when the account has separate resources; do not silently point staging at production.
- `npm run cf:typegen` runs `wrangler types`.
- `npm run cf:check` runs build, type check, migration/schema checks and `wrangler deploy --dry-run`.
- Production verification uses explicit shell/curl assertions and contains no credentials or write requests.

- [ ] **Step 1: Inspect current config behavior**

Run:

```bash
npx wrangler deploy --dry-run
npx wrangler types --check
```

Record whether the generated binding output describes production or local values and correct config naming instead of trusting the log label.

- [ ] **Step 2: Add explicit environment blocks without overwriting production secrets**

Keep the current production database ID and custom domain as the production deployment source of truth. Keep preview/local DB separate. Do not add an `env.staging` deployment target until a separate staging D1/R2 resource set exists; never point staging at production. Do not copy `BETTER_AUTH_SECRET` into source or `.env` files.

- [ ] **Step 3: Fix build/version command compatibility**

The repository deploy command remains `npx wrangler deploy`. The Cloudflare dashboard’s Version command must be removed or changed to `npx wrangler deploy`; `npx wrangler versions upload` is not used as the build deploy command because it does not match this Worker + assets release path.

- [ ] **Step 4: Update npm scripts and preserve safe production config**

Set the scripts to:

```json
{
  "cf:typegen": "wrangler types",
  "cf:check": "npm run build && npx drizzle-kit check && wrangler types --check && wrangler deploy --dry-run"
}
```

Preserve the existing `build` and `cf:deploy` scripts. Keep production D1/R2 IDs and the `BETTER_AUTH_SECRET` Worker secret outside source control. Until a separate staging D1/R2 set exists, do not add a staging deploy target that could point at production. The Cloudflare dashboard’s Version command must be removed or changed to `npx wrangler deploy`; `npx wrangler versions upload` is not used for this Worker + assets release path.

- [ ] **Step 5: Run safe unauthenticated contract checks**

Run these commands directly; do not create a verification script or store credentials:

```bash
health="$(curl -fsS https://dearlove.click/api/health)"
printf '%s\n' "$health" | grep -q '"production"'
admin_status="$(curl -sS -o /tmp/dearlove-admin-contract.json -w '%{http_code}' https://dearlove.click/api/v1/admin/dashboard)"
test "$admin_status" = 401
admin_orders_status="$(curl -sS -o /tmp/dearlove-admin-orders-contract.json -w '%{http_code}' https://dearlove.click/api/v1/admin/orders)"
test "$admin_orders_status" = 401
public_templates="$(curl -fsS https://dearlove.click/api/v1/templates)"
printf '%s\n' "$public_templates" | grep -Eiq 'object_key|objectKey|private|source_url|sourceUrl' && exit 1 || true
```

Expected: health reports production; both admin endpoints return 401; public catalog output contains no private/source field names. Remove temporary response files after the check.

- [ ] **Step 6: Run complete local verification**

```bash
npm run build
npx drizzle-kit check
npx wrangler types --check
npx wrangler deploy --dry-run
```

Expected: all commands exit 0; warnings about bundle size may remain, but no TypeScript, migration or configuration errors may remain.

- [ ] **Step 7: Commit deployment hardening**

```bash
git add wrangler.jsonc package.json .gitignore worker-configuration.d.ts
git commit -m "chore: harden admin deployment workflow"
```

---

## Task 12: Deploy migrations and Worker, then run live admin acceptance checks

**Files:**
- No new application files.
- Apply already committed migrations to the production D1 database.

**Interfaces:**
- Production URLs: `https://dearlove.click` and `https://dearlovevip.lv-viet-vn.workers.dev`.
- Production admin login: use the existing admin account without printing its password into logs or committed files.

- [ ] **Step 1: Verify git state and commit ancestry**

```bash
git status --short --branch
git log --oneline -12
```

Expected: only intended implementation commits are present and the worktree is clean before deployment.

- [ ] **Step 2: Apply pending D1 migrations**

```bash
npx wrangler d1 migrations list dearlove-production --remote
npx wrangler d1 migrations apply dearlove-production --remote
```

Expected: each intended migration is applied once; record the migration names in the terminal output, not in application data.

- [ ] **Step 3: Run a production dry run**

```bash
npm run build
npx wrangler types --check
npx wrangler deploy --dry-run
```

Expected: all exit 0 and the dry-run reports Worker + assets without missing bindings/secrets.

- [ ] **Step 4: Deploy production Worker**

```bash
npm run cf:deploy
```

Expected: Wrangler reports a successful deployment and the custom domain remains attached. Do not use the dashboard Version command.

- [ ] **Step 5: Run unauthenticated smoke checks**

```bash
curl -fsS https://dearlove.click/api/health
curl -i https://dearlove.click/api/v1/admin/dashboard
curl -i https://dearlove.click/api/v1/admin/orders
curl -fsS https://dearlove.click/api/v1/templates
curl -fsS https://dearlove.click/api/v1/site/bootstrap
```

Expected: health 200; admin endpoints 401; public endpoints 200 or a documented empty response; no response contains private R2 keys or auth secrets.

- [ ] **Step 6: Run authenticated admin browser/API smoke checks**

Log in through `https://dearlove.click/auth?mode=login&returnTo=/admin`, then verify in the browser:

1. `/admin` loads dashboard cards.
2. `/admin/orders` filters and opens a row.
3. `/admin/orders/:orderId` shows detail sections.
4. A valid status mutation appears in timeline.
5. An invalid status mutation displays a validation error.
6. Payment, assignment and note mutations refresh from the server.
7. `/admin/catalog`, `/admin/media`, `/admin/content`, `/admin/pricing`, `/admin/blog`, `/admin/contacts`, `/admin/newsletter`, `/admin/users` and `/admin/audit-log` all load.
8. Logout returns to public auth and `/admin` redirects back to login.

Use a disposable order/contact/template/page for write checks and remove only data created by the smoke test after evidence is captured.

- [ ] **Step 7: Run customer isolation smoke checks**

With a customer session, confirm:

- admin dashboard/order/media endpoints return 403;
- customer order list contains only that customer’s orders;
- private file endpoint cannot be accessed with another order ID;
- public catalog has no draft/archived/source/private fields.

- [ ] **Step 8: Inspect production deployment and logs**

Run:

```bash
npx wrangler versions list
npx wrangler d1 info dearlove-production
```

If a request fails, inspect structured Worker logs before changing code. Roll back the Worker version only when the failure is confirmed as a deployment regression and preserve the D1 migration state.

- [ ] **Step 9: Verify final worktree and commits**

```bash
git status --short --branch
git log --oneline -20
```

Expected: implementation changes are committed, no secret files are tracked, and the branch contains only conventional commits for this work.

---

## Plan Self-Review Checklist

- **Scope coverage:** Tasks 1–4 cover admin shell, authorization, dashboard and complete order operations; Tasks 5–6 cover R2/media/catalog; Tasks 7–8 cover CMS, pricing and blog; Task 9 covers contact/newsletter/users/audit; Task 10 aligns customer contracts; Tasks 11–12 cover deployment and live acceptance.
- **Placeholder scan:** No step relies on “TBD”, “TODO”, an unspecified file, or an unbounded “handle errors” instruction. Each task names files, interfaces and commands.
- **Type consistency:** The `OrderStatus`, `PaymentStatus`, `requireAdmin`, response envelopes, cursor contract and `AdminOrderDetail` shapes are reused consistently across backend/frontend tasks.
- **Security consistency:** Admin API authorization, same-origin mutation checks, private R2 isolation, audit sanitization, user/session handling and customer object authorization are explicit.
- **Deployment consistency:** D1 migrations are applied before Worker deployment, R2 bindings trigger generated types, and the dashboard version-command issue is explicitly removed from the release path.
- **User constraint:** No standalone test-only artifacts are planned; verification uses build/type/migration commands, local HTTP checks, browser checks and controlled live smoke requests.
