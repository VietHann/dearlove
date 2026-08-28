/* ============================================================
   Templates Section - JavaScript
   - Filter categories (Tất cả + 7 categories)
   - 3D Carousel với 39 templates
   - Prev/Next buttons
   - Dots navigation
   - Auto-arrange slides theo category
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // DATA: 39 templates (trích xuất chính xác từ pages/index.html section 831-2389)
  // Thứ tự khớp với carousel gốc
  // ============================================================
  const TEMPLATES = [
    // ===== Cafe (8) =====
    { name: 'Garden Oasis',            category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: 'Miễn phí',  badge: null,        img: 'screen-D5A5CUxl.png',  url: 'vngoweb.com/coffe-1' },
    { name: 'Tropical Chill',          category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: '299,000đ',  badge: 'MỚI',       img: 'screen-E1F9MOF-.png', url: 'vngoweb.com/coffe-2' },
    { name: 'The Ocean Cafe',          category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: '499,000đ',  badge: 'BÁN CHẠY',  img: 'screen-CSqla4Re.png',  url: 'vngoweb.com/coffe-3' },
    { name: 'Koi Garden',              category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: '399,000đ',  badge: null,        img: 'screen-CgCCgAYu.png',  url: 'vngoweb.com/coffe-4' },
    { name: 'Mật Ngọt Tea',            category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: 'Miễn phí',  badge: 'MỚI',       img: 'screen-COd9dlwS.png',  url: 'vngoweb.com/coffe-5' },
    { name: 'Oasis Symphony',          category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: '349,000đ',  badge: 'MỚI',       img: 'screen-C3MeFa6u.png',  url: 'vngoweb.com/coffe-6' },
    { name: 'Garden Sanctuary',        category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: 'Miễn phí',  badge: null,        img: 'screen-D4bCK53t.png',  url: 'vngoweb.com/coffe-7' },
    { name: 'Sage Sanctuary',          category: 'cafe',      catLabel: 'Cafe & Đồ Uống',     price: '299,000đ',  badge: 'MỚI',       img: 'screen-CHaUdNcQ.png',  url: 'vngoweb.com/coffe-8' },

    // ===== Restaurant (6) =====
    { name: 'Bếp Việt Premium',        category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: '399,000đ', badge: 'MỚI', img: 'screen-t1QviRV4.png',  url: 'vngoweb.com/restaurant-2' },
    { name: 'Sizzling Hearth',         category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: 'Miễn phí', badge: null,  img: 'screen-De9bFzaH.png',  url: 'vngoweb.com/restaurant-3' },
    { name: 'Siam Street Food',        category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: '299,000đ', badge: 'MỚI', img: 'screen-BpAogSip.png',  url: 'vngoweb.com/restaurant-4' },
    { name: 'Golden Lotus Dining',     category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: 'Miễn phí', badge: null,  img: 'screen-DZ-rpQ-Z.png',  url: 'vngoweb.com/restaurant-5' },
    { name: 'Siam Teak House',         category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: '299,000đ', badge: 'MỚI', img: 'screen-bgCJtZ2a.png',  url: 'vngoweb.com/restaurant-6' },
    { name: 'Crimson Sushi',           category: 'restaurant', catLabel: 'Nhà Hàng & Quán Ăn', price: 'Miễn phí', badge: null,  img: 'screen-VqM2YBzf.png',  url: 'vngoweb.com/restaurant-7' },

    // ===== Spa (5) =====
    { name: 'Aura Clinic',             category: 'spa', catLabel: 'Spa & Làm Đẹp', price: 'Miễn phí', badge: 'MỚI', img: 'screen-BKf7lZ4i.png',  url: 'vngoweb.com/spa-1' },
    { name: 'Aura Wellness',           category: 'spa', catLabel: 'Spa & Làm Đẹp', price: '299,000đ', badge: 'MỚI', img: 'screen-Bg6mAIDY.png',  url: 'vngoweb.com/spa-2' },
    { name: 'Luminous Precision Clinic', category: 'spa', catLabel: 'Spa & Làm Đẹp', price: '299,000đ', badge: 'MỚI', img: 'screen-Dz_o2gGA.png', url: 'vngoweb.com/spa-4' },
    { name: 'Zenith',                  category: 'spa', catLabel: 'Spa & Làm Đẹp', price: 'Miễn phí', badge: null,  img: 'screen-oQ5tO4eU.png',  url: 'vngoweb.com/spa-5' },
    { name: 'Ocean Oasis',             category: 'spa', catLabel: 'Spa & Làm Đẹp', price: '299,000đ', badge: 'MỚI', img: 'screen--Nx0rWgk.png', url: 'vngoweb.com/spa-6' },

    // ===== Gym (3) =====
    { name: 'Crimson Peak',            category: 'gym', catLabel: 'Gym & Thể Thao', price: 'Miễn phí', badge: 'MỚI', img: 'screen-B7cs4Wz9.png', url: 'vngoweb.com/gym-2' },
    { name: 'Terra Strength',          category: 'gym', catLabel: 'Gym & Thể Thao', price: 'Miễn phí', badge: 'MỚI', img: 'screen-B5gDw83U.png', url: 'vngoweb.com/gym-3' },
    { name: 'Aether Fitness',          category: 'gym', catLabel: 'Gym & Thể Thao', price: 'Miễn phí', badge: 'MỚI', img: 'screen-BJQ9HPvx.png', url: 'vngoweb.com/gym-4' },

    // ===== Wedding (4) =====
    { name: 'Thiệp Hồng',              category: 'wedding', catLabel: 'Thiệp Cưới', price: 'Miễn phí', badge: 'MỚI', img: 'screen-Co7xW3hO.png', url: 'vngoweb.com/wedding-1' },
    { name: 'Ánh Bạc',                 category: 'wedding', catLabel: 'Thiệp Cưới', price: '299,000đ', badge: null,    img: 'screen-BePdfixw.png', url: 'vngoweb.com/wedding-2' },
    { name: 'Thành Hỷ',                category: 'wedding', catLabel: 'Thiệp Cưới', price: '249,000đ', badge: 'MỚI', img: 'screen-BH9TbqLT.png', url: 'vngoweb.com/wedding-3' },
    { name: 'Di Sản Vĩnh Cửu',         category: 'wedding', catLabel: 'Thiệp Cưới', price: '249,000đ', badge: 'MỚI', img: 'screen-DV6BzFar.png', url: 'vngoweb.com/wedding-4' },

    // ===== Homestay (7) =====
    { name: 'Serenity Villa',          category: 'homestay', catLabel: 'Homestay & Villa', price: 'Miễn phí', badge: 'MỚI', img: 'screen-B2dGAM8f.png',  url: 'vngoweb.com/villa-1' },
    { name: 'Serenity Villa Deluxe',   category: 'homestay', catLabel: 'Homestay & Villa', price: '299,000đ', badge: null,    img: 'screen-B3A56fHh.png',  url: 'vngoweb.com/villa-2' },
    { name: 'Zenith Wilderness — Phong Nha', category: 'homestay', catLabel: 'Homestay & Villa', price: '349,000đ', badge: null, img: 'screen-HY3xN3I1.png', url: 'vngoweb.com/villa-3' },
    { name: 'Rông Homestay',           category: 'homestay', catLabel: 'Homestay & Villa', price: '349,000đ', badge: null,    img: 'screen-DQ6nrdS7.png',  url: 'vngoweb.com/villa-4' },
    { name: 'Serenity Sea-View Villa', category: 'homestay', catLabel: 'Homestay & Villa', price: '399,000đ', badge: 'BÁN CHẠY', img: 'screen-Df6qR7x8.png', url: 'vngoweb.com/villa-5' },
    { name: "H'Mong Cliff Villa",      category: 'homestay', catLabel: 'Homestay & Villa', price: '399,000đ', badge: null,    img: 'screen-DQwz8IfJ.png',  url: 'vngoweb.com/villa-6' },
    { name: 'The Hill Villas',         category: 'homestay', catLabel: 'Homestay & Villa', price: '349,000đ', badge: null,    img: 'screen-Buo06aMu.png',  url: 'vngoweb.com/villa-7' },

    // ===== Dental (6) =====
    { name: 'Nha Khoa Rạng Ngời',      category: 'dental', catLabel: 'Nha Khoa', price: 'Miễn phí', badge: 'MỚI', img: 'screen-Cat78Xki.png', url: 'vngoweb.com/dentalClinic-1' },
    { name: 'Nha Khoa Sáng Tâm',       category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-BhIHP8Qk.png', url: 'vngoweb.com/dentalClinic-2' },
    { name: 'Nha Khoa Tinh Anh',       category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-CErosBWf.png', url: 'vngoweb.com/dentalClinic-3' },
    { name: 'Nha Khoa Tân Kỷ Nguyên', category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-DoNDlm7d.png', url: 'vngoweb.com/dentalClinic-4' },
    { name: 'Nha Khoa An Nhiên',       category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-CHn5BFph.png', url: 'vngoweb.com/dentalClinic-5' },
    { name: 'Nha Khoa Nụ Cười Vàng',  category: 'dental', catLabel: 'Nha Khoa', price: '299,000đ', badge: 'MỚI', img: 'screen-D7snLyZZ.png', url: 'vngoweb.com/dentalClinic-6' },
  ];

  // ============================================================
  // STATE
  // ============================================================
  let currentCategory = 'all';
  let activeList = TEMPLATES;
  let rotation = 0; // index của slide trung tâm
  let dragStartX = 0;
  let isDragging = false;

  // ============================================================
  // DOM refs
  // ============================================================
  const stage = document.getElementById('carouselStage');
  const filterBar = document.getElementById('filterBar');
  const dotsContainer = document.getElementById('dotsContainer');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const IMAGES_PATH = 'images/assets/';

  // ============================================================
  // FILTER BAR
  // ============================================================
  const FILTERS = [
    { key: 'all',        label: 'Tất cả' },
    { key: 'cafe',       label: 'Cafe & Đồ Uống' },
    { key: 'restaurant', label: 'Nhà Hàng & Quán Ăn' },
    { key: 'spa',        label: 'Spa & Làm Đẹp' },
    { key: 'gym',        label: 'Gym & Thể Thao' },
    { key: 'wedding',    label: 'Thiệp Cưới' },
    { key: 'homestay',   label: 'Homestay & Villa' },
    { key: 'dental',     label: 'Nha Khoa' },
  ];

  function renderFilters() {
    if (!filterBar) return;
    filterBar.innerHTML = FILTERS.map(f =>
      `<button class="filter-btn ${f.key === currentCategory ? 'active' : ''}" data-cat="${f.key}">${f.label}</button>`
    ).join('');
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.cat;
        activeList = currentCategory === 'all'
          ? TEMPLATES
          : TEMPLATES.filter(t => t.category === currentCategory);
        rotation = 0;
        renderCarousel();
        renderFilters();
        renderDots();
      });
    });
  }

  // ============================================================
  // CAROUSEL 3D
  // ============================================================
  function renderCarousel() {
    if (!stage) return;
    const n = activeList.length;
    if (n === 0) {
      stage.innerHTML = '<p style="color:var(--color-on-surface-variant);font-size:14px;">Không có mẫu nào trong danh mục này.</p>';
      return;
    }
    stage.innerHTML = activeList.map((t, i) => buildSlideHTML(t)).join('');
    updateCarouselPositions();
  }

  function buildSlideHTML(t) {
    const isFree = t.price === 'Miễn phí';
    const priceClass = isFree ? 'tmpl-card__price--free' : 'tmpl-card__price--paid';
    const badge = t.badge ? `<span class="tmpl-badge">${t.badge}</span>` : '';
    const imgSrc = IMAGES_PATH + t.img;

    return `
      <div class="carousel-3d__slide">
        <button class="tmpl-card" aria-label="${t.name} template preview">
          <div class="tmpl-card__frame">
            <div class="tmpl-card__topbar">
              <span class="dot dot--gold"></span>
              <span class="dot dot--orange"></span>
              <span class="dot dot--cream"></span>
              <span class="tmpl-url">${t.url}</span>
            </div>
            <div class="tmpl-card__screen">
              <img src="${imgSrc}" alt="${t.name} preview" loading="lazy" />
              ${badge}
              <div class="tmpl-card__hover">
                <span class="tmpl-card__hover-btn">
                  Xem trước
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </span>
              </div>
            </div>
            <div class="tmpl-card__footer">
              <div style="min-width: 0;">
                <p class="tmpl-card__name">${t.name}</p>
                <p class="tmpl-card__category">${t.catLabel}</p>
              </div>
              <span class="tmpl-card__price ${priceClass}">${t.price}</span>
            </div>
          </div>
        </button>
      </div>
    `;
  }

  function updateCarouselPositions() {
    const n = activeList.length;
    const slides = stage.querySelectorAll('.carousel-3d__slide');
    slides.forEach((slide, i) => {
      let offset = i - rotation;
      if (offset > n / 2) offset -= n;
      if (offset < -n / 2) offset += n;

      const translateX = offset * 170;
      const translateZ = -Math.abs(offset) * 170;
      const rotateY = -offset * 24;
      const scale = offset === 0 ? 1 : 0.92;
      const opacity = Math.abs(offset) <= 2 ? (1 - Math.abs(offset) * 0.12) : 0;
      const filter = offset === 0 ? 'none' : 'saturate(0.85) brightness(0.92)';
      const zIndex = n - Math.abs(offset);
      const pointerEvents = Math.abs(offset) <= 2 ? 'auto' : 'none';

      slide.style.transform =
        `translate(-50%, -50%) ` +
        `translateX(${translateX}px) ` +
        `translateZ(${translateZ}px) ` +
        `rotateY(${rotateY}deg) ` +
        `scale(${scale})`;
      slide.style.opacity = opacity;
      slide.style.filter = filter;
      slide.style.zIndex = zIndex;
      slide.style.pointerEvents = pointerEvents;
    });
    updateDotsActive();
  }

  // ============================================================
  // DOTS
  // ============================================================
  function renderDots() {
    if (!dotsContainer) return;
    const n = activeList.length;
    dotsContainer.innerHTML = activeList.map((t, i) =>
      `<button class="dot-btn" data-index="${i}" aria-label="${t.name}"></button>`
    ).join('');
    dotsContainer.querySelectorAll('.dot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        rotation = parseInt(btn.dataset.index, 10);
        updateCarouselPositions();
      });
    });
    updateDotsActive();
  }

  function updateDotsActive() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.dot-btn');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === rotation);
    });
  }

  // ============================================================
  // PREV / NEXT
  // ============================================================
  function rotateBy(delta) {
    const n = activeList.length;
    if (n === 0) return;
    rotation = (rotation + delta + n) % n;
    updateCarouselPositions();
  }

  // ============================================================
  // DRAG / SCROLL
  // ============================================================
  function setupDrag() {
    if (!stage) return;
    stage.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 60) {
        rotateBy(dx > 0 ? -1 : 1);
        dragStartX = e.clientX;
      }
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    stage.addEventListener('touchstart', (e) => {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - dragStartX;
      if (Math.abs(dx) > 60) {
        rotateBy(dx > 0 ? -1 : 1);
        dragStartX = e.touches[0].clientX;
      }
    }, { passive: true });
    stage.addEventListener('touchend', () => { isDragging = false; });

    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaX) > 10 || Math.abs(e.deltaY) > 10) {
        rotateBy((e.deltaX + e.deltaY) > 0 ? 1 : -1);
      }
    }, { passive: false });
  }

  // ============================================================
  // INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    renderFilters();
    renderCarousel();
    renderDots();
    setupDrag();
    if (btnPrev) btnPrev.addEventListener('click', () => rotateBy(-1));
    if (btnNext) btnNext.addEventListener('click', () => rotateBy(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') rotateBy(-1);
      if (e.key === 'ArrowRight') rotateBy(1);
    });
  });

})();