# Video Hero Dearlove Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay hero cũ bằng video nền full hero, nội dung căn giữa, một CTA chính và fallback ảnh khi giảm chuyển động.

**Architecture:** Cô lập thay đổi trong `src/sections/HeroSection.tsx`. Component luôn render video nền muted/loop cho mọi viewport và gọi `play()` khi video sẵn sàng; hero vẫn nằm trong document flow bên dưới sticky header, không đổi route hoặc section khác.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Vite static assets.

## Global Constraints

- Dùng video runtime path `/videos/backset.mp4` từ asset `public/videos/backset.mp4`.
- Xóa marquee và bố cục hai cột khỏi hero.
- Chỉ giữ một CTA chính dẫn đến `#templatesSection`.
- Video luôn được render và cố gắng phát muted/loop trên mọi hệ điều hành, kể cả khi người dùng bật `prefers-reduced-motion`; không dùng ảnh fallback.
- Video trang trí có `aria-hidden="true"`; icon mũi tên có nhãn truy cập được.
- Không tạo tệp kiểm thử riêng theo quy ước project.

---

### Task 1: Thay HeroSection bằng video hero

**Files:**
- Modify: `src/sections/HeroSection.tsx`

**Interfaces:**
- Consumes: `DarkButton`, `IMAGES.hero1`, `ScrollReveal` và section ID `templatesSection`/`problems` hiện có.
- Produces: Hero full-width responsive với video hoặc ảnh fallback, headline, mô tả, CTA và link cuộn.

- [ ] **Step 1: Xác nhận asset và component hiện tại**

Kiểm tra asset tại `/Users/admin/Desktop/dearlove/public/videos/backset.mp4` và xác nhận `HeroSection` hiện đang render `Marquee`, checklist và hai CTA. Không thay đổi `App.tsx`.

- [ ] **Step 2: Render video bắt buộc và gọi play khi sẵn sàng**

Luôn render một phần tử `<video>` muted/loop trên mọi hệ điều hành và viewport. Dùng `preload="metadata"` để không tải toàn bộ metadata dư thừa trước khi browser khởi tạo video, đồng thời gọi `void event.currentTarget.play()` trong `onCanPlay` để hỗ trợ các trình duyệt không tự bắt đầu playback dù video đã muted. Không thêm ảnh fallback vì yêu cầu sản phẩm là hero luôn dùng video.

- [ ] **Step 3: Render video nền và overlay**

Dùng section tương đương:

```tsx
<section className="relative isolate flex min-h-[calc(100svh-88px)] items-center justify-center overflow-hidden bg-[#7c3f06] px-5 py-20 sm:px-8 lg:min-h-[calc(100svh-96px)] lg:px-12">
  {!reducedMotion ? (
    <video
      className="absolute inset-0 -z-20 h-full w-full object-cover"
      src="/videos/backset.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  ) : (
    <img
      className="absolute inset-0 -z-20 h-full w-full object-cover"
      src={IMAGES.hero1}
      alt=""
      aria-hidden="true"
    />
  )}
  <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(77,31,20,.38),rgba(124,63,6,.22)_45%,rgba(43,18,14,.68))]" aria-hidden="true" />
  <div className="absolute inset-0 -z-10 bg-[#fdf2e3]/10" aria-hidden="true" />
</section>
```

Giữ `isolate` và các lớp âm để overlay luôn nằm giữa video/ảnh và nội dung.

- [ ] **Step 4: Căn giữa nội dung và giữ một CTA**

Đặt nội dung trong `div` có `mx-auto max-w-4xl text-center text-white`, gồm eyebrow ngắn, headline lớn, mô tả và duy nhất:

```tsx
<DarkButton href="#templatesSection" className="bg-[#f7c948] text-[#7c3f06] hover:bg-[#ffe08a]">
  Khám phá mẫu thiệp <ArrowRight size={16} aria-hidden="true" />
</DarkButton>
```

Headline dùng font display/italic cho từ nhấn mạnh nhưng phải giữ màu đủ tương phản trên overlay.

- [ ] **Step 5: Giữ mũi tên cuộn ở chính giữa khi animate**

Đặt transform căn giữa trên thẻ link và chỉ đặt `motion-safe:animate-bounce` trên `ChevronDown`. Không animate trực tiếp thẻ link vì animation `transform` sẽ ghi đè `-translate-x-1/2`.

- [ ] **Step 6: Thêm liquid glass cho pill header**

Trong `src/sections/Header.tsx`, dùng class `liquid-glass` cho trạng thái `scrolled`. Trong `src/index.css`, lớp này phải có nền alpha thấp, blur/saturate, border sáng, inner highlight và pseudo-elements không nhận pointer; các phần tử con của nav nằm trên lớp hiệu ứng với `z-index: 1`.

- [ ] **Step 7: Xóa code marquee và import không còn dùng**

Xóa hàm `Marquee`, các import icon/checklist chỉ phục vụ hero cũ (`Heart`, `Sparkles`, `Wand2`, `LayoutTemplate`, `Bell`) và `GradientButton` nếu không còn dùng. Giữ `ArrowRight`, thêm `ChevronDown`, `ScrollReveal`, `DarkButton`, `IMAGES`.

- [ ] **Step 8: Chạy kiểm tra TypeScript**

```bash
npx tsc -b --pretty false
```

Expected: exit code `0`, không có lỗi type/import.

- [ ] **Step 9: Commit component**

```bash
git add src/sections/HeroSection.tsx
git commit -m "feat: replace hero gallery with background video"
```

---

### Task 2: Xác minh responsive, reduced motion và release

**Files:**
- No new files.
- Verify `src/sections/HeroSection.tsx` and the running app.

- [ ] **Step 1: Chạy build production**

```bash
npm run build
```

Expected: build TypeScript/Vite hoàn tất với exit code `0`.

- [ ] **Step 2: Chạy ứng dụng local**

```bash
npm run dev -- --host 127.0.0.1
```

Expected: ứng dụng local mở được và request `/videos/backset.mp4` không trả lỗi 404.

- [ ] **Step 3: Kiểm tra desktop**

Ở viewport khoảng `1440×900`, xác nhận hero rộng toàn màn hình, video phủ đầy vùng hero, overlay làm chữ dễ đọc, headline ở giữa, chỉ có một CTA chính và mũi tên nằm ở đáy hero.

- [ ] **Step 4: Kiểm tra mobile và viewport hẹp**

Ở viewport `390×844` và `375×667`, xác nhận video không tràn ngang, headline không bị cắt, CTA vẫn có vùng chạm đầy đủ và mũi tên không che nội dung.

- [ ] **Step 5: Kiểm tra reduced motion**

Bật `prefers-reduced-motion: reduce` trong DevTools, reload trang và xác nhận phần tử video vẫn được render và phát vì video là yêu cầu bắt buộc; chỉ chuyển động mũi tên và các animation trang trí được vô hiệu hóa bởi CSS/Framer Motion hiện có.

- [ ] **Step 6: Chạy kiểm tra đầy đủ**

```bash
npm test
```

Expected: build, Drizzle check, Wrangler type check và deploy dry-run hoàn tất với exit code `0`; các cảnh báo dependency/bundle nếu có không phải lỗi triển khai.

- [ ] **Step 7: Commit, push và deploy production**

```bash
git status --short --branch
git push origin feat/cloudflare-milestone-0
npm run cf:deploy
curl -fsS https://dearlove.click/api/health
```

Expected: push thành công, deploy Cloudflare trả version mới và health production trả JSON `ok: true` với `environment: "production"`.
