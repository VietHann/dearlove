# Thiết kế khoảng đệm cho thanh điều hướng nổi

**Ngày:** 2026-09-11
**Trạng thái:** Đã được phê duyệt

## Mục tiêu

Khi người dùng cuộn trang, thanh điều hướng Dearlove chuyển sang dạng pill nổi và có khoảng cách rõ ràng với mép trên màn hình. Hiệu ứng phải áp dụng nhất quán trên desktop và mobile, không tạo cảm giác thanh bị dính vào mép hoặc che nội dung.

## Phạm vi

- Chỉ thay đổi trạng thái điều hướng sau khi cuộn trong `src/sections/Header.tsx`.
- Giữ nguyên trạng thái thanh đầy chiều rộng khi ở đầu trang.
- Giữ nguyên các route, nội dung, nút bấm và hành vi menu hiện tại.
- Không thêm thư viện hoặc tệp kiểm thử riêng.

## Thiết kế được chọn

Khi `scrolled` là `true`, phần `header` trong luồng bố cục sẽ tạo vùng đệm dọc khoảng `16px` ở trên và dưới. Thanh `nav` giữ chiều cao pill hiện tại, không dùng margin để tạo khoảng cách với phần tử sticky. Nền header trong suốt để khoảng hở nhìn thấy được; pill dùng viền, nền bán trong suốt, blur và shadow hiện có để duy trì cảm giác nổi.

Khoảng đệm dùng CSS theo trạng thái thay vì fixed overlay, vì vậy nội dung không bị che và chiều cao header thay đổi một cách có chủ đích. Cùng một quy tắc áp dụng cho mọi viewport; các nút mobile vẫn giữ kích thước chạm tối thiểu hiện tại.

## Chuyển động và accessibility

- Framer Motion tiếp tục điều khiển việc chuyển đổi chiều cao, bán kính và kích thước.
- Vùng đệm cũng chuyển đổi mượt theo cùng trạng thái cuộn.
- `prefers-reduced-motion` hiện có tiếp tục vô hiệu hóa chuyển động CSS/animation ở cấp toàn cục.
- Không thay đổi nhãn, thứ tự tab hoặc cấu trúc semantic của navigation.

## Tiêu chí nghiệm thu

1. Ở đầu trang, thanh điều hướng vẫn nằm sát bố cục ban đầu như hiện tại.
2. Sau khi cuộn, có khoảng hở nhìn thấy được giữa pill và mép trên màn hình.
3. Có khoảng hở phía dưới pill trước nội dung tiếp theo.
4. Desktop và mobile đều giữ được khoảng hở, không gây tràn ngang.
5. Mobile menu vẫn mở và đóng bình thường.
6. Build TypeScript/Vite hoàn tất không lỗi.
7. Thay đổi được commit bằng conventional commit và kiểm tra được remote trước khi push.
