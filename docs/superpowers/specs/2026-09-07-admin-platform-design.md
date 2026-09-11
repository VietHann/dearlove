# Dearlove Admin Platform Design

**Ngày:** 2026-09-07  
**Trạng thái:** Đã được phê duyệt để triển khai

## Mục tiêu

Xây dựng khu vực quản trị Dearlove dùng được trên production, trong đó admin có thể theo dõi và xử lý đơn hàng, quản lý catalog/media, điều chỉnh nội dung marketing, xử lý contact/newsletter, quản lý người dùng và tra cứu audit log mà không cần sửa code cho các thay đổi dữ liệu thường ngày.

## Phạm vi

### Bao gồm

- Admin shell responsive tại `/admin` với sidebar, breadcrumb, trạng thái phiên và đăng xuất.
- Dashboard với số liệu đơn hàng, đơn theo trạng thái, contact mới và hoạt động gần đây.
- Queue đơn hàng có tìm kiếm, lọc, sắp xếp, phân trang và màn hình chi tiết.
- Cập nhật trạng thái đơn theo state machine; cập nhật payment status; phân công admin; ghi chú nội bộ hoặc ghi chú cho khách; timeline; audit log.
- CRUD category/template, draft/publish/archive và quản lý screenshot derivative.
- Media library cho media public/private với metadata và quyền truy cập tương ứng.
- CMS typed blocks cho site settings, banner, hero, CTA, FAQ, stats, testimonials, footer, pricing và blog.
- Draft, preview, publish và rollback bằng content revision.
- Quản lý contact submissions, newsletter subscribers và user status/role.
- API authorization server-side cho mọi route admin; không có public admin registration.
- Tích hợp R2 public/private theo hướng direct upload hoặc metadata-only trong Worker; Worker không buffer file lớn.

### Không bao gồm

- Khách tự thiết kế thiệp bằng kéo-thả.
- Công khai source template, source URL hoặc route chạy mã mẫu.
- Thanh toán online hoặc subscription engine.
- Raw HTML/JavaScript tùy ý trong CMS.
- Realtime collaboration, WebSocket, Durable Objects, KV làm nguồn dữ liệu chính.
- Social login trong milestone này.

## Người dùng và quyền

- `customer`: chỉ đọc/sửa tài nguyên của chính mình qua customer API.
- `admin`: truy cập admin UI và admin API, xử lý nội dung, catalog, đơn hàng, contact, newsletter và user operations.
- `suspended`: không được tạo session mới hoặc dùng session cho các thao tác cần quyền; session hiện tại bị từ chối ở middleware.
- Không có form đăng ký role admin. Admin đầu tiên đã được bootstrap ngoài public signup; admin hiện hữu là nguồn duy nhất để cấp quyền admin trong các thay đổi tiếp theo.

API là lớp phân quyền cuối cùng. Guard trong React chỉ dùng để điều hướng và cải thiện UX, không được coi là cơ chế bảo mật.

## Cấu trúc giao diện

### Admin shell

- `/admin`: dashboard.
- `/admin/orders`: danh sách đơn.
- `/admin/orders/:orderId`: chi tiết đơn.
- `/admin/catalog`: tổng quan catalog.
- `/admin/catalog/templates`: danh sách và form template.
- `/admin/catalog/categories`: danh sách và form category.
- `/admin/media`: thư viện media.
- `/admin/content`: settings, pages và typed sections.
- `/admin/pricing`: pricing plans.
- `/admin/blog`: bài viết và category.
- `/admin/contacts`: contact submissions.
- `/admin/newsletter`: subscribers.
- `/admin/users`: user list và status/role.
- `/admin/audit-log`: audit log.

Sidebar desktop chuyển thành drawer trên mobile. Tất cả nút thao tác chính có nhãn bằng chữ, vùng chạm tối thiểu 44px, focus ring nhìn thấy được, trạng thái loading/disabled và lỗi gần thành phần liên quan. Màu trạng thái không phải tín hiệu duy nhất; mỗi badge có text.

### Dashboard

Dashboard gọi một endpoint tổng hợp ngắn, gồm:

- Tổng số đơn theo `draft`, `submitted`, `reviewing`, `awaiting_customer`, `confirmed`, `in_production`, `ready`, `delivered`, `completed`, `cancelled`.
- Đơn cần xử lý mới nhất.
- Đơn quá hạn theo `requested_deadline`.
- Contact ở trạng thái `new` hoặc `in_progress`.
- Hoạt động admin gần đây.

Dashboard không thực hiện truy vấn toàn bảng không có giới hạn; các truy vấn đều dùng index hiện có hoặc index được bổ sung trong migration.

### Order queue

Danh sách hiển thị mã đơn, khách hàng, mẫu, trạng thái đơn, trạng thái thanh toán, deadline và thời gian tạo. Hỗ trợ:

- Tìm theo `order_code`, email snapshot hoặc số điện thoại snapshot.
- Lọc trạng thái, payment status, admin được phân công và khoảng thời gian.
- Sắp xếp theo thời gian tạo hoặc deadline với danh sách cột được whitelist.
- Cursor pagination, kích thước trang tối đa 50.
- Giữ bộ lọc trong query string để refresh/deep-link không mất ngữ cảnh.

Chi tiết đơn hiển thị:

1. Thông tin khách và contact snapshot.
2. Template/package snapshot tại thời điểm tạo.
3. Event date, requested deadline, customer note.
4. Câu trả lời form theo label snapshot.
5. File theo từng upload group; file private chỉ lấy qua endpoint authorization.
6. Thanh trạng thái và lịch sử from/to, actor, reason, thời gian.
7. Ghi chú customer/internal.
8. Admin assignment hiện tại và lịch sử phân công.
9. Payment status và lý do thay đổi.

Mutation yêu cầu `updatedAt` hoặc version hiện tại. Nếu dữ liệu đã đổi, API trả `409 ORDER_CONFLICT` và UI buộc reload phần chi tiết thay vì ghi đè im lặng.

### Catalog và media

Admin tạo template ở trạng thái draft, chọn category, nhập thông tin marketing, gắn thumbnail/full-page derivative, xem preview và publish. Template publish phải có category publish và ít nhất một screenshot derivative hợp lệ. Template đã được order tham chiếu không bị hard-delete; chỉ archive.

Media library hiển thị thumbnail, purpose, bucket/visibility, MIME, kích thước, alt text, status và owner. Public catalog chỉ trả object URL derivative public hoặc URL endpoint cacheable; không trả key private hay source template.

### CMS

CMS chỉ cho sửa payload thuộc block type được allowlist. Mỗi block có schema riêng ở Worker và form tương ứng ở React. Các block nền gồm:

- `hero`
- `banner`
- `cta`
- `faq`
- `stats`
- `testimonials`
- `feature_grid`
- `footer_links`
- `contact_info`
- `seo_defaults`

Dữ liệu draft và bản publish tách qua `content_revisions`. Publish atomically đổi `published_revision_id`; rollback tạo revision mới từ snapshot cũ để lịch sử không bị mất. Preview chỉ đọc revision draft qua route đã guard admin.

Blog dùng block/Markdown được sanitize, có status draft/published/archived, slug unique, cover asset public và metadata SEO. Không cho render raw HTML không qua sanitizer.

### Users, contact, newsletter và audit

- Users: danh sách email/name/role/status/createdAt; admin có thể suspend/restore và thay đổi role theo quyền được cấp. Không trả password, account password hash, session token hoặc verification value.
- Contacts: lọc status, xem nội dung, assign admin, chuyển `new -> in_progress -> resolved` hoặc đánh dấu `spam`.
- Newsletter: lọc active/pending/unsubscribed, xem consent time, xử lý unsubscribe; email unique.
- Audit log: actor, action, entity type/id, metadata đã loại bỏ secret/PII không cần thiết, timestamp; có phân trang và filter.

## Kiến trúc backend

`worker/index.ts` chỉ compose các Hono route. Mỗi miền có module riêng:

```text
worker/modules/admin/
  dashboard.ts
  orders.ts
  catalog.ts
  media.ts
  content.ts
  pricing.ts
  blog.ts
  contacts.ts
  newsletter.ts
  users.ts
  audit.ts
worker/middleware/
  session.ts
  authorize.ts
worker/lib/
  response.ts
  pagination.ts
  audit.ts
  order-state.ts
  validation.ts
```

`requireAdmin` lấy session từ Better Auth, kiểm tra user tồn tại, `status = active` và `role = admin`. Admin API dùng cùng-origin session cookie, kiểm tra Origin cho mutation, giới hạn body/query trước khi parse và trả response envelope:

```json
{
  "data": {},
  "requestId": "uuid"
}
```

Lỗi dùng dạng:

```json
{
  "error": {
    "code": "ORDER_CONFLICT",
    "message": "Đơn hàng đã được cập nhật. Vui lòng tải lại dữ liệu."
  },
  "requestId": "uuid"
}
```

Không trả stack trace hoặc secret trong response/log. Log server dùng JSON có action, requestId, route và entity ID; payload PII được giới hạn.

## API hợp đồng chính

### Dashboard và queue

- `GET /api/v1/admin/dashboard`
  - Trả counts theo order status, payment status, open contacts, recent orders và recent audit events.
- `GET /api/v1/admin/orders?status=&paymentStatus=&assignedTo=&q=&cursor=&limit=&sort=`
  - Trả order rows và `nextCursor`.
- `GET /api/v1/admin/orders/:orderId`
  - Trả order detail, form answers, upload groups/files, notes, assignments, status history và audit metadata liên quan.
- `PATCH /api/v1/admin/orders/:orderId/status`
  - Body: `{ "toStatus": OrderStatus, "reason": string, "updatedAt": number }`.
- `PATCH /api/v1/admin/orders/:orderId/payment`
  - Body: `{ "paymentStatus": PaymentStatus, "reason": string, "updatedAt": number }`.
- `PUT /api/v1/admin/orders/:orderId/assignment`
  - Body: `{ "adminId": string | null, "updatedAt": number }`.
- `POST /api/v1/admin/orders/:orderId/notes`
  - Body: `{ "visibility": "customer" | "internal", "body": string }`.
- `GET /api/v1/admin/orders/:orderId/files/:fileId`
  - Trả redirect/URL ngắn hạn sau khi authorization; response không cache public.

State machine server-side:

```text
draft -> submitted
submitted -> reviewing | cancelled
reviewing -> awaiting_customer | confirmed | cancelled
awaiting_customer -> reviewing | cancelled
confirmed -> in_production | cancelled
in_production -> ready | cancelled
ready -> delivered
delivered -> completed
```

Mỗi transition phải nằm trong allowlist; transition không hợp lệ trả `422 INVALID_ORDER_TRANSITION`, đồng thời không ghi history/audit.

### Catalog, content và operations

- `GET /api/v1/admin/catalog/templates`
- `POST /api/v1/admin/catalog/templates`
- `PATCH /api/v1/admin/catalog/templates/:templateId`
- `POST /api/v1/admin/catalog/templates/:templateId/publish`
- `POST /api/v1/admin/catalog/templates/:templateId/archive`
- `GET /api/v1/admin/catalog/categories`
- `POST /api/v1/admin/catalog/categories`
- `PATCH /api/v1/admin/catalog/categories/:categoryId`
- `GET /api/v1/admin/media`
- `POST /api/v1/admin/media/prepare`
- `POST /api/v1/admin/media/:assetId/complete`
- `DELETE /api/v1/admin/media/:assetId`
- `GET /api/v1/admin/content/pages`
- `GET /api/v1/admin/content/pages/:pageKey`
- `PUT /api/v1/admin/content/pages/:pageKey/draft`
- `POST /api/v1/admin/content/pages/:pageKey/publish`
- `POST /api/v1/admin/content/pages/:pageKey/rollback`
- `GET/POST/PATCH /api/v1/admin/pricing`
- `GET/POST/PATCH /api/v1/admin/blog`
- `GET/PATCH /api/v1/admin/contacts`
- `GET/PATCH /api/v1/admin/newsletter`
- `GET/PATCH /api/v1/admin/users`
- `GET /api/v1/admin/audit-log`

Tất cả mutation admin đều gọi helper ghi `audit_logs` trong cùng transaction/batch khi có thể. Query params được whitelist; sort/order direction từ client không được nối trực tiếp vào SQL.

## Dữ liệu và migration

Các bảng auth, CMS, catalog, order, contact, newsletter, notification và audit đã tồn tại trong D1 production. Trước khi thêm API:

- Bổ sung migration cho các cột/index cần thiết như version/concurrency hoặc search index nếu truy vấn thực tế yêu cầu.
- Không sửa migration đã apply trên production.
- Dùng migration mới và chạy local → staging/preview → production.
- Bật foreign key ở các thao tác liên quan và giữ snapshot bất biến sau khi order submitted.
- Dùng integer timestamp UTC theo convention hiện tại.
- Không đưa secret, password hash, session token hoặc R2 private key vào frontend bundle, audit metadata hay nội dung public.

## R2 và upload

- `PUBLIC_MEDIA`: derivative catalog, cover blog, banner và ảnh public đã kiểm tra.
- `PRIVATE_UPLOADS`: ảnh khách, payment proof và file nội bộ.
- Object key do Worker tạo từ UUID/order scope; filename chỉ là metadata.
- Worker cấp URL upload ngắn hạn sau khi kiểm tra quyền, MIME và size; Worker không đọc toàn bộ file vào memory.
- Complete phải kiểm tra object tồn tại, metadata và checksum trước khi chuyển `media_assets.status` sang `ready`.
- File private chỉ được xem/tải sau object-level authorization và URL ngắn hạn.
- File pending không complete và object orphan được dọn bằng lifecycle/maintenance command theo chính sách vận hành.

Nếu tài khoản Cloudflare chưa có bucket, triển khai sẽ tạo hai bucket riêng và cập nhật `wrangler.jsonc`; sau thay đổi binding phải chạy `wrangler types` trước build/deploy.

## An toàn và lỗi

- Better Auth session cookie `HttpOnly`, `Secure` ở production và cùng origin.
- Origin allowlist chỉ gồm production custom domain và origin local cần thiết.
- Mọi route admin kiểm tra session/role/status ở Worker.
- Mutation kiểm tra Origin/CSRF policy và giới hạn kích thước body.
- Query có `limit` tối đa, cursor và index; không chấp nhận tên cột/sort tùy ý.
- UI có error boundary, retry, skeleton, empty state, toast/status message và focus về vùng lỗi.
- 401 điều hướng đến login với `returnTo` cùng-origin; 403 hiển thị không có quyền; 409 yêu cầu reload; 422 hiển thị lỗi trường hoặc transition.
- Khi email/queue lỗi, dữ liệu nghiệp vụ vẫn giữ trong D1 và admin nhìn thấy trạng thái notification failure.

## Thứ tự triển khai

### Slice A — Shell, dashboard và order operations

Hoàn thiện layout admin, dashboard, order list/detail, state machine, payment, assignment, notes, history, audit và API authorization. Đây là slice ưu tiên vì tài khoản admin và bảng order hiện đã tồn tại.

### Slice B — Catalog và media

Hoàn thiện CRUD category/template, publish rules, public catalog contract, R2 public/private bindings và media library.

### Slice C — CMS, pricing và blog

Hoàn thiện typed block schema, draft/preview/publish/rollback, settings, pricing và blog admin; nối public pages vào dữ liệu publish.

### Slice D — Operations và user management

Hoàn thiện contacts, newsletter, users, audit UI, notifications và các mutation còn lại.

### Slice E — Production verification

Build, type generation, migration check, dry-run/deploy, kiểm tra custom domain, đăng nhập bằng admin thật, kiểm tra từng route/mutation, kiểm tra customer không truy cập admin/private data và rà soát Worker logs.

## Tiêu chí nghiệm thu

1. Admin đăng nhập được bằng session production hiện có và truy cập `/admin`.
2. Admin tìm được một đơn theo mã/email, mở detail và thấy snapshot/form/history/notes.
3. Admin đổi được trạng thái hợp lệ, bị chặn ở transition không hợp lệ và thấy actor/reason trong timeline.
4. Hai request cập nhật cùng `updatedAt` không thể ghi đè im lặng; request sau nhận 409.
5. Admin cập nhật payment, assignment và note; mỗi mutation có audit record.
6. Template draft không xuất hiện public; template publish thiếu screenshot/category không thể publish.
7. Public response không chứa source URL, private R2 key hoặc dữ liệu của customer khác.
8. Admin sửa draft CMS, preview, publish và rollback được mà public chỉ đọc revision publish.
9. Contact/newsletter/user operations có filter, trạng thái và audit.
10. Mobile keyboard/focus/loading/error/empty state hoạt động; không có nút icon không nhãn.
11. `npm run build`, `npx wrangler types --check`, `npx drizzle-kit check` và `npx wrangler deploy --dry-run` hoàn thành trước production deploy.
12. Production smoke test xác nhận `https://dearlove.click/api/health`, auth session, admin dashboard, order list và ít nhất một mutation có rollback/cleanup dữ liệu thử nghiệm phù hợp.

## Quyết định cố định

- Giữ React 18, Vite, React Router, Hono, Better Auth, Drizzle và D1 hiện tại.
- Không tạo ứng dụng admin tách origin trong milestone này.
- Không dùng raw HTML/JS trong CMS.
- Không tạo public admin signup.
- Không xóa cứng template đã được order tham chiếu.
- Không nhúng file binary vào Worker response hoặc CSV export.
- Không claim production hoàn thiện nếu live smoke test chưa có bằng chứng mới.
