# Dearlove Admin Invitation Template Studio Design

**Ngày:** 2026-09-11
**Trạng thái:** Đã được phê duyệt để triển khai

## Mục tiêu

Đưa bộ 122 mẫu thiệp đã chuẩn hóa trong `/Users/admin/Desktop/local_invite/templates` vào khu vực admin Dearlove dưới dạng một studio nội bộ để admin chọn mẫu, xem manifest, nhập nội dung, chọn ảnh và xem bản preview.

## Phạm vi

- Thêm route admin `/admin/invitation-templates`.
- Danh sách mẫu lấy từ registry FastAPI hiện có qua Worker proxy.
- Form được sinh từ `manifest.json`: field text/time/phone/email và field ảnh.
- Preview text dùng JSON render; preview có ảnh dùng multipart upload tới renderer.
- Preview hiển thị trong iframe sandbox, không tạo public route và không đưa source template vào catalog public.
- Bổ sung token nội bộ tùy chọn cho FastAPI; secret không nằm trong source control.

## Kiến trúc

React admin gọi các endpoint `/api/v1/admin/invitation-templates/*`. Worker kiểm tra session admin bằng `requireAdmin`, đọc URL renderer từ biến môi trường và chuyển tiếp request tới FastAPI. Worker chỉ trả metadata, schema và HTML preview cho admin đã xác thực; không proxy endpoint source HTML public.

FastAPI giữ `TemplateRegistry` và `InvitationRenderer` hiện tại. Khi `INVITATION_RENDERER_TOKEN` được cấu hình, middleware FastAPI yêu cầu header `X-Invitation-Renderer-Token` trên toàn bộ `/api/*` ngoại trừ health. Worker gửi token từ secret `INVITATION_RENDERER_TOKEN` nếu secret đã được cấu hình.

## API admin

- `GET /api/v1/admin/invitation-templates` — danh sách summary.
- `GET /api/v1/admin/invitation-templates/:templateId/schema` — manifest field đầy đủ.
- `POST /api/v1/admin/invitation-templates/:templateId/preview` — render JSON, trả `{ html, warnings }`.
- `POST /api/v1/admin/invitation-templates/:templateId/preview/upload` — render multipart với ảnh, trả `{ html, warnings }`.
- `GET /api/v1/admin/invitation-templates/status` — báo renderer đã cấu hình/sẵn sàng, không lộ URL hoặc token.

Khi renderer không được cấu hình, Worker trả lỗi rõ ràng `INVITATION_RENDERER_NOT_CONFIGURED`; UI hiển thị hướng dẫn cấu hình thay vì danh sách rỗng.

## UI

- Sidebar có mục “Template Studio”.
- Cột trái: tìm kiếm và danh sách mẫu, hiển thị tên, ID, số field text/ảnh.
- Cột phải: schema/form của mẫu đã chọn, nút preview, trạng thái lỗi/loading.
- Field dùng label từ manifest, giá trị mặc định, input type phù hợp và textarea cho nội dung dài.
- Ảnh được chọn bằng file input theo đúng image field ID.
- Preview dùng `iframe sandbox` với `srcDoc`, có tiêu đề truy cập được và không cho script trong template chạy.
- Layout desktop hai cột; mobile xếp danh sách, form và preview thành một cột.

## An toàn

- Tất cả endpoint Worker yêu cầu admin session; API không dựa vào guard React.
- Template ID được encode và renderer chỉ nhận ID hợp lệ.
- File preview chỉ chuyển qua request multipart tới renderer, không lưu vào D1/R2 trong slice này.
- Token nội bộ lấy từ secret, không trả về client, log hoặc audit metadata.
- HTML preview không được mount trực tiếp vào DOM chính; iframe sandbox ngăn script/form navigation.
- Renderer URL là cấu hình server-side, không nhận từ query/body người dùng.

## Tiêu chí nghiệm thu

1. Admin mở `/admin/invitation-templates` và thấy danh sách mẫu khi renderer sẵn sàng.
2. Chọn một mẫu hiển thị đúng field text/ảnh từ manifest.
3. Preview JSON thay đúng text và giữ cảnh báo renderer nếu có.
4. Preview upload nhận ảnh theo đúng image field ID.
5. Người chưa đăng nhập nhận 401; customer không thể gọi endpoint admin.
6. Public catalog và public route không lộ source HTML hay manifest private.
7. Renderer chưa cấu hình hiển thị lỗi có hướng dẫn, không crash admin shell.
8. Desktop/mobile không tràn ngang; preview iframe có nhãn và sandbox.
9. Build TypeScript/Vite, pytest local_invite và Cloudflare dry-run hoàn tất.
