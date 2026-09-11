# Thanh điều hướng nổi có khoảng đệm — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo khoảng hở rõ ràng quanh thanh điều hướng dạng pill sau khi người dùng cuộn trang trên desktop và mobile.

**Architecture:** Giữ `Header` và Framer Motion hiện tại. Trạng thái `scrolled` sẽ thêm padding dọc vào phần `header`, còn `nav` chuyển về margin bằng 0 để khoảng hở thuộc về vùng sticky thay vì nằm trên chính pill. Trạng thái đầu trang không thay đổi.

**Tech Stack:** React 18, TypeScript, React Router, Framer Motion, Tailwind CSS.

## Global Constraints

- Chỉ thay đổi hành vi hiển thị trong `src/sections/Header.tsx`.
- Áp dụng cùng một khoảng đệm cho desktop và mobile.
- Không thay đổi route, nội dung, API, session hoặc cấu trúc menu.
- Giữ focus, nhãn nút, vùng chạm và `prefers-reduced-motion` hiện có.
- Không tạo tệp kiểm thử riêng theo yêu cầu dự án.
- Dùng conventional commit cho thay đổi mã nguồn.

---

### Task 1: Cập nhật vùng đệm sticky của Header

**Files:**
- Modify: `src/sections/Header.tsx`

**Interfaces:**
- Consumes: state `scrolled` hiện có và animation props của `motion.nav`.
- Produces: `header` có padding dọc khi `scrolled === true`; `nav` pill không còn dùng margin để tạo khoảng cách.

- [ ] **Step 1: Ghi nhận trạng thái hiện tại của Header**

Xác nhận trong `Header.tsx` rằng trạng thái cuộn hiện điều khiển các thuộc tính `maxWidth`, `height`, `marginTop`, `marginBottom` và `borderRadius` của `motion.nav`. Không thay đổi listener scroll hoặc logic session.

- [ ] **Step 2: Thêm vùng đệm theo trạng thái cuộn**

Đổi class động của `header` thành quy tắc tương đương:

```tsx
<header
  className={`sticky top-0 z-50 transition-all duration-300 ${
    scrolled
      ? 'bg-transparent py-4'
      : 'border-b border-[#d9a441]/20 bg-[#fcfbf8]/90 backdrop-blur-xl'
  }`}
>
```

`py-4` tạo 16px khoảng hở ở trên và dưới pill trên mọi viewport. Khi ở đầu trang, không thêm padding để giữ nguyên bố cục ban đầu.

- [ ] **Step 3: Đưa margin của nav về 0**

Trong `animate` của `motion.nav`, giữ các giá trị kích thước hiện tại và đổi hai thuộc tính margin thành:

```tsx
marginTop: 0,
marginBottom: 0,
```

Không thêm `position: fixed`; `header` sticky vẫn giữ chỗ trong document và tránh che nội dung.

- [ ] **Step 4: Kiểm tra thay đổi tĩnh**

Chạy:

```bash
npx tsc -b --pretty false
```

Expected: lệnh hoàn tất với exit code `0` và không có lỗi TypeScript.

- [ ] **Step 5: Commit thay đổi Header**

```bash
git add src/sections/Header.tsx
git commit -m "fix: add floating spacing to sticky navigation"
```

---

### Task 2: Xác minh build và hiển thị responsive

**Files:**
- No new files.
- Read-only verification of `src/sections/Header.tsx` and the running app.

**Interfaces:**
- Verifies: khoảng hở 16px phía trên/dưới pill, trạng thái đầu trang, mobile menu và không tràn ngang.

- [ ] **Step 1: Chạy build production**

```bash
npm run build
```

Expected: build TypeScript/Vite hoàn tất với exit code `0`.

- [ ] **Step 2: Mở ứng dụng local**

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite phục vụ ứng dụng local và hiển thị URL local trong output.

- [ ] **Step 3: Kiểm tra desktop sau khi cuộn**

Mở trang chủ ở viewport desktop, chụp trạng thái trước khi cuộn và sau khi cuộn. Xác nhận:

- đầu trang vẫn có nav đầy chiều rộng như cũ;
- sau khi cuộn, pill cách mép trên khoảng 16px;
- pill có khoảng hở phía dưới trước nội dung tiếp theo;
- pill không che nội dung và không tràn ngang.

- [ ] **Step 4: Kiểm tra mobile sau khi cuộn**

Đổi viewport xuống khoảng 390px, cuộn trang và xác nhận:

- pill vẫn có khoảng hở trên/dưới;
- nút menu vẫn có kích thước chạm hiện tại;
- mở/đóng menu không bị che hoặc tràn ngang;
- các nhãn điều hướng vẫn đọc được.

- [ ] **Step 5: Kiểm tra Git remote và push**

```bash
git status --short --branch
git remote -v
git log --oneline -3
```

Nếu worktree chỉ có thay đổi dự kiến và remote push khả dụng, push branch hiện tại:

```bash
git push origin feat/cloudflare-milestone-0
```

Expected: remote nhận commit `fix: add floating spacing to sticky navigation`. Nếu push bị từ chối do quyền hoặc remote policy, giữ nguyên commit local và báo chính xác lỗi trả về.
