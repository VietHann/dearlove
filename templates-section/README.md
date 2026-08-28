# Templates Section — Trích xuất từ vngoweb

Section **"Sản phẩm thật, chạm là chạy — Kho giao diện tuyệt đẹp"** được tách ra thành file HTML độc lập, mở trực tiếp được trong browser.

## 📂 Cấu trúc

```
templates-section/
├── index.html        (4.3 KB)   - Markup độc lập
├── styles.css       (14.0 KB)   - Toàn bộ styles (đã tách từ Tailwind v4)
├── script.js        (16.4 KB)   - JS cho carousel 3D + filter
├── images/
│   ├── assets/                  - 39 screenshots của templates
│   └── elements/                - 5 ảnh trang trí (hoa, mây)
└── README.md                    - File này
```

## 🚀 Cách sử dụng

### Cách 1: Mở trực tiếp
```bash
# Mở file trong browser (Chrome/Firefox/Safari)
open templates-section/index.html
# hoặc trên Linux:
xdg-open templates-section/index.html
```

### Cách 2: Serve qua HTTP (khuyến nghị)
```bash
cd templates-section
python3 -m http.server 8000
# Mở http://localhost:8000
```

## 🎨 Nội dung Section

### Header
- Badge: **"Sản phẩm thật, chạm là chạy"** (gradient viet-red/orange)
- Tiêu đề lớn với text gradient: **"Kho giao diện tuyệt đẹp, sẵn sàng sử dụng"**
- Mô tả: "Đây là ảnh chụp thật từ các mẫu website đang bán trên vngoweb..."

### 8 Filter Buttons
- Tất cả (default - active)
- Cafe & Đồ Uống (8)
- Nhà Hàng & Quán Ăn (6)
- Spa & Làm Đẹp (5)
- Gym & Thể Thao (3)
- Thiệp Cưới (4)
- Homestay & Villa (7)
- Nha Khoa (6)

### Carousel 3D với 39 Templates
Mỗi template card có:
- Top bar với 3 dots (gold/orange/cream) + URL `vngoweb.com/{slug}`
- Ảnh screenshot template (300x360 desktop / 300x300 mobile)
- Badge "MỚI" hoặc "BÁN CHẠY" (nếu có)
- Tên template + category
- Giá: "Miễn phí" (green badge) hoặc "{giá}đ" (gold badge)

### Tương tác
- ⬅️➡️ Nút Prev/Next ở 2 bên
- ⬤⬤ Dots navigation bên dưới (39 dots)
- 🖱️ **Kéo chuột (drag)** để xoay carousel
- 🖱️ **Scroll chuột (wheel)** để xoay
- ⌨️ **Arrow Left/Right** trên bàn phím
- 📱 **Touch swipe** trên mobile

## 🎨 Design Tokens (CSS Variables)

```css
:root {
  --color-primary: #e8491f;
  --color-viet-gold: #d9a441;         /* Màu brand chính */
  --color-viet-red: #a4161a;
  --color-viet-maroon: #6e0f12;
  --color-viet-lacquer: #4a0a0c;
  --color-fnb-orange: #ff6b2c;
  --color-fnb-green: #12a150;
  --color-surface: #fffaf2;
  /* ... xem thêm trong styles.css */
}
```

## 📋 Chi tiết 39 Templates

| # | Tên | Category | Giá | Badge |
|---|-----|----------|-----|-------|
| 1 | Garden Oasis | Cafe | Miễn phí | - |
| 2 | Tropical Chill | Cafe | 299,000đ | MỚI |
| 3 | The Ocean Cafe | Cafe | 499,000đ | BÁN CHẠY |
| 4 | Koi Garden | Cafe | 399,000đ | - |
| 5 | Mật Ngọt Tea | Cafe | Miễn phí | MỚI |
| 6 | Oasis Symphony | Cafe | 349,000đ | MỚI |
| 7 | Garden Sanctuary | Cafe | Miễn phí | - |
| 8 | Sage Sanctuary | Cafe | 299,000đ | MỚI |
| 9 | Bếp Việt Premium | Restaurant | 399,000đ | MỚI |
| 10 | Sizzling Hearth | Restaurant | Miễn phí | - |
| 11 | Siam Street Food | Restaurant | 299,000đ | MỚI |
| 12 | Golden Lotus Dining | Restaurant | Miễn phí | - |
| 13 | Siam Teak House | Restaurant | 299,000đ | MỚI |
| 14 | Crimson Sushi | Restaurant | Miễn phí | - |
| 15 | Aura Clinic | Spa | Miễn phí | MỚI |
| 16 | Aura Wellness | Spa | 299,000đ | MỚI |
| 17 | Luminous Precision Clinic | Spa | 299,000đ | MỚI |
| 18 | Zenith | Spa | Miễn phí | - |
| 19 | Ocean Oasis | Spa | 299,000đ | MỚI |
| 20 | Crimson Peak | Gym | Miễn phí | MỚI |
| 21 | Terra Strength | Gym | Miễn phí | MỚI |
| 22 | Aether Fitness | Gym | Miễn phí | MỚI |
| 23 | Thiệp Hồng | Wedding | Miễn phí | MỚI |
| 24 | Ánh Bạc | Wedding | 299,000đ | - |
| 25 | Thành Hỷ | Wedding | 249,000đ | MỚI |
| 26 | Di Sản Vĩnh Cửu | Wedding | 249,000đ | MỚI |
| 27 | Serenity Villa | Homestay | Miễn phí | MỚI |
| 28 | Serenity Villa Deluxe | Homestay | 299,000đ | - |
| 29 | Zenith Wilderness — Phong Nha | Homestay | 349,000đ | - |
| 30 | Rông Homestay | Homestay | 349,000đ | - |
| 31 | Serenity Sea-View Villa | Homestay | 399,000đ | BÁN CHẠY |
| 32 | H'Mong Cliff Villa | Homestay | 399,000đ | - |
| 33 | The Hill Villas | Homestay | 349,000đ | - |
| 34 | Nha Khoa Rạng Ngời | Dental | Miễn phí | MỚI |
| 35 | Nha Khoa Sáng Tâm | Dental | 299,000đ | MỚI |
| 36 | Nha Khoa Tinh Anh | Dental | 299,000đ | MỚI |
| 37 | Nha Khoa Tân Kỷ Nguyên | Dental | 299,000đ | MỚI |
| 38 | Nha Khoa An Nhiên | Dental | 299,000đ | MỚI |
| 39 | Nha Khoa Nụ Cười Vàng | Dental | 299,000đ | MỚI |

## 🛠 Tùy chỉnh

### Thay đổi màu chủ đạo
Sửa biến `--color-viet-gold` trong `styles.css` (line ~50) - tất cả elements sẽ tự cập nhật.

### Thêm/bớt template
Sửa mảng `TEMPLATES` trong `script.js`. Mỗi entry có dạng:
```js
{ name: 'Tên', category: 'cafe', catLabel: 'Cafe & Đồ Uống', 
  price: '299,000đ', badge: 'MỚI', img: 'screen-XXX.png', 
  url: 'vngoweb.com/coffe-X' }
```

### Thay đổi hành vi carousel
Trong `script.js`, hàm `updateCarouselPositions()`:
- `translateX = offset * 170` — khoảng cách giữa các slide
- `translateZ = -Math.abs(offset) * 170` — độ sâu 3D
- `rotateY = -offset * 24` — góc xoay giữa các slide

## 📜 Nguồn

Trích xuất từ `pages/index.html` (lines 831-2389) — section có `aria-label="실제 제품, 터치하면 바로 실행"`.

Phần trên trang gốc có tiêu đề Hàn Quốc, phần dưới có các label Việt Nam.
Bản tách này đã Việt hóa tiêu đề/mô tả để phù hợp với yêu cầu trích xuất của user.