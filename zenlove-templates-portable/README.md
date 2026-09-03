# Zenlove — Portable Templates Page

Bản clone đã được "gỡ rối" để đưa vào dự án mới.

## 📂 Cấu trúc

```
zenlove-templates-portable/
├── index.html              # Trang templates (đã làm sạch analytics)
├── assets/
│   ├── manifest.webmanifest
│   ├── css/                # 9 file CSS (đã flatten, không còn _next/static/css)
│   ├── js/                 # 64 file JS (đã flatten, không còn _next/static/chunks)
│   ├── fonts/              # 8 font TTF (đã flatten, không còn _next/static/media)
│   └── img/
│       ├── favicon.ico
│       ├── logo/           # 4 file SVG logo
│       └── landing/        # 2 file ảnh landing
```

## ✅ Đã loại bỏ (analytics / phần không cần thiết)

- ❌ `googletagmanager.com/gtag/js` (Google Analytics)
- ❌ `_next-ga-init` và `_next-ga` scripts
- ❌ `cloudflareinsights.com/beacon.min.js` (Cloudflare Web Analytics)
- ❌ `<link rel="author">`, `<link rel="canonical">` trỏ đến `__asset.bin` (RSC endpoints — không có file thật)
- ❌ Các `href="...__asset.bin"` được thay bằng `href="#"` (RSC navigation không hoạt động trong static)

## 🔁 Đã đổi đường dẫn

Toàn bộ đường dẫn được làm phẳng để dễ import:

| Trước (trong clone gốc)               | Sau (trong bản portable)         |
|--------------------------------------|----------------------------------|
| `../../assets/css/_next/static/css/`  | `assets/css/`                    |
| `../../assets/js/_next/static/chunks/`| `assets/js/`                     |
| `../../assets/fonts/_next/static/media/` | `assets/fonts/`               |
| `../../assets/images/assets/logo/`    | `assets/img/logo/`               |
| `../../assets/images/assets/landing/` | `assets/img/landing/`            |
| `../../assets/images/favicon.ico`     | `assets/img/favicon.ico`         |

## ⚠️ Lưu ý khi dùng

1. **Mở qua web server, KHÔNG mở trực tiếp file://** — `index.html` chứa nhiều `<script>` lẫn CSS nên cần HTTP server để browser không chặn tải tài nguyên:
   ```bash
   cd zenlove-templates-portable
   python3 -m http.server 8080
   # Mở http://localhost:8080/
   ```

2. **Một số URL vẫn trỏ ra ngoài** (cố ý giữ lại vì là CDN của ZenLove):
   - Ảnh thumbnail mẫu thiệp: `https://cdn-resource.zenlove.me/templates/...` (24 ảnh)
   - `og:image`, `twitter:image`, schema.org JSON-LD: `https://zenlove.me/assets/thumb_default.png`
   - Link mạng xã hội (Facebook, Instagram, TikTok, Threads, YouTube, LinkedIn)

   Bạn có thể thay bằng CDN/placeholder của riêng mình nếu muốn chạy hoàn toàn offline.

3. **RSC payload trong `<script>self.__next_f.push(...)`** vẫn được giữ lại (chứa data SSR).
   Khi mở tĩnh, Next.js runtime không xử lý payload này, nên trang sẽ chỉ hiển thị HTML
   thuần — **không có tương tác SPA** (filter, sort, pagination). Nếu cần tương tác,
   hãy tích hợp React/Next.js thật vào dự án mới.

## 📦 Thông số

- Kích thước: **~5.6 MB**
- Tổng file asset: **89 file**
- File HTML gốc: **2.213 dòng** → Sau cleanup: **2.197 dòng** (-16 dòng, ~4 KB phần thừa đã bỏ)

## 🚀 Cách dùng trong dự án mới

```bash
# 1. Copy folder vào dự án
cp -r zenlove-templates-portable /path/to/new-project/public/templates-page

# 2. Nếu dùng React/Next.js, có thể mount vào route:
# pages/templates/index.tsx
export { default } from './zenlove-templates-portable/index.html';
# (Hoặc iframe, hoặc fetch HTML rồi inject)
```

## 🧪 Đã kiểm thử

- ✅ HTTP 200 cho 89/89 asset quan trọng
- ✅ Trang render đầy đủ trên trình duyệt (navigation, 24 card mẫu, breadcrumb, footer)
- ✅ Không còn script analytics/tracking
- ✅ Không còn đường dẫn tương đối `../../`
