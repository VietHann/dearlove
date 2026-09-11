# Admin Invitation Template Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp bộ 122 template HTML của `local_invite` vào admin Dearlove với schema-driven editor và preview nội bộ an toàn.

**Architecture:** Worker Hono là lớp proxy có `requireAdmin`; renderer FastAPI trong `local_invite` giữ registry/renderer hiện tại và có token nội bộ tùy chọn. React admin gọi proxy, sinh form từ manifest và hiển thị HTML preview trong iframe sandbox.

**Tech Stack:** React 18, TypeScript, React Router, Hono, Cloudflare Workers, FastAPI, Pydantic, BeautifulSoup renderer.

## Global Constraints

- Không đưa source template vào public catalog hoặc public route.
- Worker admin API luôn kiểm tra `requireAdmin` trước proxy.
- Renderer URL/token chỉ đọc từ server environment; không trả token về client.
- Preview HTML hiển thị trong `iframe sandbox`, không inject vào DOM chính.
- Dùng `FormData` cho preview ảnh và không tạo upload asset lâu dài trong slice này.
- Không tạo file kiểm thử mới; dùng test hiện có, build và HTTP checks.
- UI tiếng Việt, responsive và giữ vùng chạm/focus accessibility.

---

### Task 1: Bảo vệ renderer FastAPI bằng token nội bộ

**Files:**
- Modify: `/Users/admin/Desktop/local_invite/app/config.py`
- Modify: `/Users/admin/Desktop/local_invite/app/main.py`
- Modify: `/Users/admin/Desktop/local_invite/docker-compose.yml`
- Modify: `/Users/admin/Desktop/local_invite/README.md`

**Interfaces:**
- Produces optional environment variable `INVITATION_RENDERER_TOKEN`.
- Produces required header `X-Invitation-Renderer-Token` for `/api/*` when token is configured.
- Keeps `/health` public and keeps current renderer endpoints unchanged when no token is configured.

- [ ] **Step 1: Add token configuration without storing a secret**

In `app/config.py`, read `INVITATION_RENDERER_TOKEN` from `os.environ`, trim it and default to an empty string. Do not add a literal token to any file.

- [ ] **Step 2: Add FastAPI middleware with constant-time comparison**

In `app/main.py`, add HTTP middleware that:

```python
if INTERNAL_RENDER_TOKEN and request.url.path.startswith("/api/"):
    presented = request.headers.get("X-Invitation-Renderer-Token", "")
    if not secrets.compare_digest(presented, INTERNAL_RENDER_TOKEN):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
```

Do not protect `/health` or `/docs` in this slice. Do not log the presented token.

- [ ] **Step 3: Pass the token through Docker without committing it**

Add to the `invitation-api` service:

```yaml
    environment:
      INVITATION_RENDERER_TOKEN: ${INVITATION_RENDERER_TOKEN:-}
```

- [ ] **Step 4: Document local/production setup**

Document that local development can leave the value empty, while production must configure the same token in the FastAPI service environment and Cloudflare Worker secret. Never put the value in README or Compose literals.

- [ ] **Step 5: Run existing local_invite tests**

```bash
cd /Users/admin/Desktop/local_invite
.venv/bin/pytest -q
```

Expected: all existing tests pass with token unset.

---

### Task 2: Add the Worker renderer proxy

**Files:**
- Create: `worker/modules/admin/invitation-templates.ts`
- Modify: `worker/index.ts`
- Modify: `worker-configuration.d.ts` only through `npx wrangler types` if config bindings change

**Interfaces:**
- `GET /api/v1/admin/invitation-templates`
- `GET /api/v1/admin/invitation-templates/:templateId/schema`
- `POST /api/v1/admin/invitation-templates/:templateId/preview`
- `POST /api/v1/admin/invitation-templates/:templateId/preview/upload`
- `GET /api/v1/admin/invitation-templates/status`

- [ ] **Step 1: Define server-side renderer configuration**

Use an internal type intersection for optional values:

```ts
type RendererEnv = Env & {
  INVITATION_RENDERER_URL?: string
  INVITATION_RENDERER_TOKEN?: string
}
```

Resolve only an absolute `http:` or `https:` URL from `INVITATION_RENDERER_URL`. In local non-production mode, default to `http://127.0.0.1:8000`; in production with no configured URL, return `503 INVITATION_RENDERER_NOT_CONFIGURED`.

- [ ] **Step 2: Implement bounded upstream request helpers**

Create helpers that:

- join the configured base URL with fixed paths;
- encode `templateId` with `encodeURIComponent`;
- send `Accept: application/json`;
- send `X-Invitation-Renderer-Token` only when the server secret exists;
- map upstream 404 to `TEMPLATE_NOT_FOUND`;
- map network/5xx failures to `502 INVITATION_RENDERER_UNAVAILABLE`;
- never forward browser cookies or authorization headers to FastAPI.

- [ ] **Step 3: Implement list and schema proxy routes**

Forward `/api/templates` and `/api/templates/:id/schema`, parse JSON once, and return only data in the normal Dearlove `{ data, requestId }` envelope. The list response must contain summary fields; schema response may contain field/image definitions but no source HTML.

- [ ] **Step 4: Implement JSON preview proxy**

Accept a bounded JSON body containing only `fields`, `images`, `standalone` and `strip_editable_attributes`. Create a new body with the server-controlled `template_id`, call `/api/render/data`, and return `{ html, warnings, templateId }` to the authenticated admin.

- [ ] **Step 5: Implement multipart preview proxy without parsing files in Worker**

Require a bounded `Content-Length` when present, require `multipart/form-data`, and forward the incoming request body stream to `/api/render/upload` with `output_mode=html` and `standalone=true` supplied by the admin client. Return `{ html, warnings, templateId }` after reading the bounded HTML response. Do not forward cookies/auth headers.

- [ ] **Step 6: Register the router**

Mount the router at `/api/v1/admin/invitation-templates` in `worker/index.ts`, before the SPA fallback.

- [ ] **Step 7: Verify unauthenticated behavior**

Run the local Worker and call:

```bash
curl -i http://127.0.0.1:8787/api/v1/admin/invitation-templates
```

Expected: `401` or the existing authentication-unavailable response, never template HTML.

---

### Task 3: Add the admin template studio API client and navigation

**Files:**
- Create: `src/lib/invitation-template-api.ts`
- Modify: `src/lib/admin-api.ts`
- Modify: `src/pages/admin/AdminLayout.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- `getInvitationTemplates(): Promise<{ data: { items: InvitationTemplateSummary[] } }>`
- `getInvitationTemplateSchema(templateId: string): Promise<{ data: InvitationTemplateManifest }>`
- `previewInvitationTemplate(templateId: string, payload: PreviewPayload): Promise<PreviewResult>`
- `previewInvitationTemplateUpload(templateId: string, fields: Record<string, string>, files: Record<string, File>): Promise<PreviewResult>`

- [ ] **Step 1: Make `adminApi` preserve FormData content type**

Change automatic `Content-Type: application/json` assignment to apply only when `typeof init.body === 'string'`. This keeps current JSON callers unchanged and lets the browser set the multipart boundary for `FormData`.

- [ ] **Step 2: Implement typed API functions**

Define manifest types matching `local_invite/app/schemas.py`: summary, field definition, image definition, manifest and preview result. Use `adminApi` for all calls and never expose an absolute renderer URL to React.

- [ ] **Step 3: Add the admin route**

Import `AdminInvitationTemplates` and add:

```tsx
<Route path="invitation-templates" element={<AdminInvitationTemplates />} />
```

- [ ] **Step 4: Add sidebar navigation**

Add “Template Studio” under the content group with a Lucide template icon, active-route styling and the existing drawer behavior.

---

### Task 4: Build the schema-driven Invitation Template Studio UI

**Files:**
- Create: `src/pages/admin/AdminInvitationTemplates.tsx`
- Modify: `src/pages/admin/admin.css`

**Interfaces:**
- Consumes the API functions from Task 3.
- Renders list, schema form, image inputs, preview iframe, loading, empty, unavailable and error states.

- [ ] **Step 1: Load and display the template registry**

On mount, request the summary list. Add a search input that filters the loaded list by ID/name, show text/image field counts, and provide a retry action. When renderer is not configured, show the server error message and configuration hint.

- [ ] **Step 2: Load a manifest when a template is selected**

On selection, load the schema and initialize text values from `default`. Clear old image files and preview state when switching templates. Show the selected template ID and field counts.

- [ ] **Step 3: Generate accessible text controls**

Render every manifest field with a visible label:

- `email` → `type="email"`;
- `phone` → `type="tel"`;
- `time` → `type="time"`;
- long/default multiline text → textarea;
- all other fields → text input.

Use field IDs for `id`/`htmlFor`, `aria-invalid` on validation errors and helper text for occurrence count.

- [ ] **Step 4: Generate image controls**

Render one file input per manifest image ID, show the selected filename and size, accept image MIME types, and keep files in React state keyed by field ID. Do not create object keys client-side.

- [ ] **Step 5: Implement JSON and upload preview actions**

If no files are selected, call JSON preview. If at least one file is selected, call multipart preview with the text values and files. Disable the button while loading, show the warning count/content and preserve the last successful preview on nonfatal errors.

- [ ] **Step 6: Render preview in a sandboxed iframe**

Use:

```tsx
<iframe
  title={`Bản xem trước mẫu ${manifest.id}`}
  sandbox=""
  srcDoc={preview.html}
  className="admin-template-preview-frame"
/>
```

Do not use `dangerouslySetInnerHTML` in the main admin document. Add an empty preview state before the first render.

- [ ] **Step 7: Add responsive admin styles**

Use the existing admin visual language with a two-column desktop layout and one-column mobile layout. Keep the preview frame bounded, allow its own vertical scrolling, preserve visible focus rings and prevent horizontal overflow.

---

### Task 5: Run integration checks and release

**Files:**
- No new test-only files.

- [ ] **Step 1: Start local_invite with the local renderer**

```bash
cd /Users/admin/Desktop/local_invite
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Expected: `/health` reports `template_count: 122`.

- [ ] **Step 2: Start the Dearlove Worker locally with renderer URL configured**

Run the local Worker with `INVITATION_RENDERER_URL=http://127.0.0.1:8000` available to Wrangler through the local environment. Keep the token empty for the local no-token check, or configure the same temporary token in both services without committing it.

- [ ] **Step 3: Verify list/schema/preview contracts**

Using an authenticated admin browser session, verify:

1. Template Studio loads the registry.
2. `mau1` or another known ID opens its manifest.
3. A text value appears in the preview HTML.
4. A selected image is accepted by multipart preview.
5. The iframe has `sandbox=""` and the main document has no injected preview markup.
6. Unauthenticated requests return 401.

- [ ] **Step 4: Run project checks**

```bash
cd /Users/admin/Desktop/dearlove
npm test
cd /Users/admin/Desktop/local_invite
.venv/bin/pytest -q
```

Expected: both projects pass their existing checks.

- [ ] **Step 5: Generate binding types if configuration changed**

If `wrangler.jsonc` was changed, run:

```bash
cd /Users/admin/Desktop/dearlove
npx wrangler types
```

Do not hand-edit generated binding types.

- [ ] **Step 6: Commit and push application changes**

```bash
cd /Users/admin/Desktop/dearlove
git add worker/modules/admin/invitation-templates.ts worker/index.ts src/lib/admin-api.ts src/lib/invitation-template-api.ts src/pages/admin/AdminLayout.tsx src/pages/admin/AdminInvitationTemplates.tsx src/pages/admin/admin.css src/App.tsx docs/superpowers/specs/2026-09-11-admin-invitation-studio-design.md docs/superpowers/plans/2026-09-11-admin-invitation-studio-implementation.md
git commit -m "feat: add admin invitation template studio"
git push origin feat/cloudflare-milestone-0
```

- [ ] **Step 7: Configure production renderer before enabling the feature**

Set `INVITATION_RENDERER_URL` as a production Worker variable and `INVITATION_RENDERER_TOKEN` as a Worker secret only after the FastAPI renderer is deployed at a reachable HTTPS URL with the same token. If the URL is absent, keep the UI in its explicit unavailable state rather than pointing production at localhost.

- [ ] **Step 8: Deploy and smoke-check production**

```bash
cd /Users/admin/Desktop/dearlove
npm run cf:deploy
curl -fsS https://dearlove.click/api/health
```

Expected: deployment succeeds; existing public/admin contracts remain unchanged; Template Studio reports unavailable until production renderer configuration exists.
