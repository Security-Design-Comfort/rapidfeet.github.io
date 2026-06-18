/* ==========================================================================
   RAPIDFEET — Shared Header & Footer (injected into every page)
   Use data-active="home|catalog|..." on <body> to highlight current nav link.
   ========================================================================== */

function rfHeaderHTML(active) {
  const nav = [
    { href: "index.html", en: "Home", vi: "Trang chủ", key: "home" },
    { href: "catalog.html", en: "Catalog", vi: "Sản phẩm", key: "catalog" },
    { href: "about.html", en: "About", vi: "Giới thiệu", key: "about" },
    { href: "contact.html", en: "Contact", vi: "Liên hệ", key: "contact" },
  ];
  const navHTML = nav
    .map(
      (n) =>
        `<a href="${n.href}" class="${active === n.key ? "active" : ""}"><span lang-en>${n.en}</span><span lang-vi>${n.vi}</span></a>`,
    )
    .join("");

  // Mobile drawer CTA: send signed-in visitors to their account instead of back to login.
  const mobileAuthHref =
    typeof rfIsLoggedIn === "function" && rfIsLoggedIn()
      ? "account.html"
      : "login.html";

  return `
  <a href="#main" class="skip-link">Skip to content</a>
  <header class="rf-header">
    <div class="container-rf rf-header__row">
      <a href="index.html" class="rf-logo" aria-label="Rapidfeet home">
        <img src="assets/logo-full-black.svg" class="logo-light" alt="Rapidfeet">
        <img src="assets/logo-full-white.svg" class="logo-dark" alt="Rapidfeet">
      </a>
      <nav class="rf-nav">${navHTML}</nav>
      <div class="rf-header__actions">
        <div class="rf-search" data-search-wrap>
          <button class="rf-icon-btn" data-search-toggle aria-label="Search">
            <i class="bi bi-search"></i>
          </button>
          <form class="rf-search__form" data-search-form>
            <input type="text" data-search-input placeholder="Search shoes, brands..." aria-label="Search">
            <button type="submit" aria-label="Submit search"><i class="bi bi-arrow-right"></i></button>
          </form>
        </div>
        <div class="rf-lang-toggle">
          <button data-lang-btn="en">EN</button>
          <button data-lang-btn="vi">VI</button>
        </div>
        <button class="rf-icon-btn rf-theme-toggle" data-theme-toggle aria-label="Toggle dark mode">
          <i class="bi bi-moon-fill"></i>
          <i class="bi bi-sun-fill"></i>
        </button>
        <a href="account.html" class="rf-icon-btn" aria-label="Account">
          <i class="bi bi-person"></i>
        </a>
        <a href="wishlist.html" class="rf-icon-btn" aria-label="Wishlist">
          <i class="bi bi-heart"></i>
        </a>
        <a href="cart.html" class="rf-icon-btn" aria-label="Cart">
          <i class="bi bi-bag"></i>
          <span class="rf-cart-badge" data-cart-badge style="display:none">0</span>
        </a>
        <button class="rf-icon-btn rf-burger" data-burger aria-label="Open menu">
          <i class="bi bi-list" style="font-size:1.5rem"></i>
        </button>
      </div>
    </div>
  </header>

  <div class="rf-mobile-nav">
    <div class="rf-mobile-nav__top">
      <button class="rf-icon-btn" data-close-mobile aria-label="Close menu"><i class="bi bi-x-lg"></i></button>
    </div>
    <form class="rf-mobile-search" data-search-form>
      <i class="bi bi-search"></i>
      <input type="text" data-search-input placeholder="Search shoes, brands..." aria-label="Search">
    </form>
    <nav>${navHTML}</nav>
    <div class="d-flex gap-2 mt-5">
      <a href="${mobileAuthHref}" class="btn-rf btn-rf-primary btn-rf-block"><span data-requires-auth-label></span></a>
    </div>
  </div>`;
}

function rfFooterHTML() {
  return `
  <footer class="rf-footer">
    <div class="container-rf">
      <div class="row g-5 pb-5">
        <div class="col-lg-4 col-md-12">
          <img src="assets/logo-full-black.svg" class="logo-light mb-3" style="height:26px" alt="Rapidfeet">
          <img src="assets/logo-full-white.svg" class="logo-dark mb-3" style="height:26px" alt="Rapidfeet">
          <p class="text-soft" style="max-width:320px; font-size:.9rem;">
            <span lang-en>The perfect pair of shoes creates your own unique style. Lightweight performance footwear for the city and beyond.</span>
            <span lang-vi>Đôi giày hoàn hảo tạo nên phong cách riêng của bạn. Giày thể thao nhẹ cho thành phố và hơn thế nữa.</span>
          </p>
          <div class="rf-footer__socials mt-4">
            <a href="https://www.instagram.com/iamnotneku/" aria-label="Instagram" target="_blank"><i class="bi bi-instagram"></i></a>
            <a href="https://www.facebook.com/profile.php?id=61579204066861" aria-label="Facebook" target="_blank"><i class="bi bi-facebook"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-6 col-md-3">
          <h6><span lang-en>Shop</span><span lang-vi>Mua sắm</span></h6>
          <ul>
            <li><a href="catalog.html"><span lang-en>All shoes</span><span lang-vi>Tất cả</span></a></li>
            <li><a href="catalog.html?cat=Running"><span lang-en>Running</span><span lang-vi>Chạy bộ</span></a></li>
            <li><a href="catalog.html?cat=Basketball"><span lang-en>Basketball</span><span lang-vi>Bóng rổ</span></a></li>
            <li><a href="catalog.html?sale=1"><span lang-en>Sale</span><span lang-vi>Giảm giá</span></a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-6 col-md-3">
          <h6><span lang-en>Help</span><span lang-vi>Hỗ trợ</span></h6>
          <ul>
            <li><a href="warranty.html"><span lang-en>Warranty policy</span><span lang-vi>Chính sách bảo hành</span></a></li>
            <li><a href="returns.html"><span lang-en>Return policy</span><span lang-vi>Chính sách đổi trả</span></a></li>
            <li><a href="size-guide.html"><span lang-en>Size guide</span><span lang-vi>Hướng dẫn chọn size</span></a></li>
            <li><a href="contact.html"><span lang-en>Contact us</span><span lang-vi>Liên hệ</span></a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-6 col-md-3">
          <h6><span lang-en>Company</span><span lang-vi>Công ty</span></h6>
          <ul>
            <li><a href="about.html"><span lang-en>About us</span><span lang-vi>Giới thiệu</span></a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-6 col-md-3">
          <h6><span lang-en>Newsletter</span><span lang-vi>Bản tin</span></h6>
          <p class="text-soft" style="font-size:.85rem;"><span lang-en>10% off your first order.</span><span lang-vi>Giảm 10% đơn đầu tiên.</span></p>
          <a href="#newsletter" class="btn-rf btn-rf-outline btn-rf-sm"><span lang-en>Subscribe</span><span lang-vi>Đăng ký</span></a>
        </div>
      </div>
      <div class="rf-footer__bottom">
        <span class="text-faint" style="font-size:.8rem;">© 2026 Rapidfeet. <span lang-en>All rights reserved.</span><span lang-vi>Đã đăng ký bản quyền.</span></span>
      </div>
    </div>
  </footer>`;
}

function rfInjectLayout(active) {
  // 1. Safe DOM element mounting
  try {
    const headerMount = document.getElementById("rf-header-mount");
    const footerMount = document.getElementById("rf-footer-mount");
    if (headerMount) headerMount.outerHTML = rfHeaderHTML(active);
    if (footerMount) footerMount.outerHTML = rfFooterHTML();
  } catch (mountError) {
    console.error("HTML injection failed:", mountError);
  }

  // 2. Completely isolated interaction setup (Cannot block your homepage grid)
  try {
    const burgerBtn = document.querySelector("[data-burger]");
    const closeBtn = document.querySelector("[data-close-mobile]");
    const mobileNav = document.querySelector(".rf-mobile-nav");

    if (burgerBtn && mobileNav) {
      burgerBtn.onclick = function () {
        mobileNav.classList.add("active");
      };
    }
    if (closeBtn && mobileNav) {
      closeBtn.onclick = function () {
        mobileNav.classList.remove("active");
      };
    }
  } catch (interactionError) {
    console.warn("Mobile menu events skipped safely:", interactionError);
  }

  // 3. Inject responsive mobile search styles
  try {
    const stylePatch = document.createElement("style");
    stylePatch.innerHTML = `
      @media (max-width: 576px) {
        .rf-search__form {
          position: fixed !important;
          top: 60px !important;
          left: 50% !important;
          right: auto !important;
          transform: translateX(-50%) !important;
          width: calc(100vw - 32px) !important;
          min-width: 280px !important;
          max-width: 480px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
          border-radius: 4px !important;
          box-sizing: border-box !important;
          z-index: 9999 !important;
        }
        .rf-search__form input {
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(stylePatch);
  } catch (styleError) {
    console.warn("Style patch skipped safely:", styleError);
  }
}
