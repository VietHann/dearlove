# Video Hero Dearlove Design

**Ngày:** 2026-09-11
**Trạng thái:** Đã được phê duyệt để triển khai

## Mục tiêu

Thay phần hero chia hai cột và marquee ảnh bằng một hero toàn màn hình dùng video nền tại `/videos/backset.mp4`.

## Thiết kế

- Hero chiếm toàn bộ chiều cao khả dụng của viewport bên dưới header và rộng toàn màn hình.
- Video dùng `autoplay`, `muted`, `loop`, `playsInline`, `preload="metadata"` và phủ kín bằng `object-fit: cover`.
- Overlay gradient kem/tối giúp headline và CTA đọc rõ trên các khung hình khác nhau.
- Nội dung căn giữa theo cả hai trục, gồm một headline lớn, mô tả ngắn và duy nhất một CTA chính dẫn đến `#templatesSection`.
- Mũi tên ở cuối hero là liên kết tới `#problems`, có nhãn hỗ trợ trình đọc màn hình và chuyển động nhẹ.
- Khi `prefers-reduced-motion: reduce` được bật, không phát video và hiển thị ảnh tĩnh `/images/wedding-1.jpg`.

## Phạm vi mã nguồn

- Sửa `src/sections/HeroSection.tsx`.
- Không thay đổi route, header, API hoặc các section phía dưới.
- Giữ các asset ảnh hiện tại vì ảnh được dùng làm fallback giảm chuyển động và ở các khu vực khác.
- Giữ asset video tại `public/videos/backset.mp4`, được truy cập runtime bằng `/videos/backset.mp4`.

## Accessibility và responsive

- Video là nội dung trang trí nên có `aria-hidden="true"`, không thêm thông tin bắt buộc chỉ có trong video.
- CTA là link có nhãn hiển thị rõ và vùng chạm tối thiểu theo component hiện tại.
- Mũi tên cuộn có nhãn `Cuộn xuống phần tiếp theo`.
- Text dùng màu sáng trên overlay tối; nội dung có giới hạn chiều rộng để không bị kéo dài trên màn hình lớn.
- Hero dùng `min-height: calc(100svh - header-height)` và không tạo tràn ngang.
- Không có autoplay khi người dùng bật giảm chuyển động.

## Tiêu chí nghiệm thu

1. Phần marquee/hai cột cũ không còn được render.
2. Video được tải từ `/videos/backset.mp4` và phủ toàn bộ hero.
3. Nội dung hero căn giữa, headline nổi bật và chỉ có một CTA chính.
4. Mũi tên cuối hero cuộn đến phần tiếp theo.
5. Desktop, mobile và viewport hẹp không bị tràn ngang.
6. Reduced motion hiển thị ảnh tĩnh thay vì phát video.
7. TypeScript/Vite build hoàn tất.
