/* ==========================================================================
   RAPIDFEET — Store (theme, language, cart, wishlist, mock auth)
   Persisted to localStorage so state survives navigation across pages.
   ========================================================================== */

const RF_STORE_KEY = "rapidfeet_store_v1";

function rfLoadStore() {
  try {
    const raw = localStorage.getItem(RF_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore corrupt storage */
  }
  return {
    theme:
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    lang: "en",
    cart: [], // {productId, color, size, qty}
    wishlist: [], // productId[]
    user: null, // {name, email}
    orders: [], // mock order history
    promo: null,
  };
}

let RF_STATE = rfLoadStore();

function rfSaveStore() {
  localStorage.setItem(RF_STORE_KEY, JSON.stringify(RF_STATE));
}

/* ---------------- THEME ---------------- */
function rfApplyTheme() {
  document.documentElement.setAttribute("data-theme", RF_STATE.theme);
}
function rfToggleTheme() {
  RF_STATE.theme = RF_STATE.theme === "dark" ? "light" : "dark";
  rfSaveStore();
  rfApplyTheme();
}

/* ---------------- LANGUAGE ---------------- */
function rfApplyLang() {
  document.documentElement.setAttribute("data-lang", RF_STATE.lang);
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.langBtn === RF_STATE.lang);
  });
}
function rfSetLang(lang) {
  RF_STATE.lang = lang;
  rfSaveStore();
  rfApplyLang();
}

/* ---------------- CART ---------------- */
function rfCartCount() {
  return RF_STATE.cart.reduce((sum, l) => sum + l.qty, 0);
}
function rfAddToCart(productId, color, size, qty = 1) {
  const existing = RF_STATE.cart.find(
    (l) => l.productId === productId && l.color === color && l.size === size,
  );
  if (existing) {
    existing.qty += qty;
  } else {
    RF_STATE.cart.push({ productId, color, size, qty });
  }
  rfSaveStore();
  rfRenderCartBadge();
}
function rfRemoveFromCart(index) {
  RF_STATE.cart.splice(index, 1);
  rfSaveStore();
  rfRenderCartBadge();
}
function rfUpdateCartQty(index, qty) {
  if (qty < 1) qty = 1;
  RF_STATE.cart[index].qty = qty;
  rfSaveStore();
  rfRenderCartBadge();
}
function rfCartSubtotal() {
  return RF_STATE.cart.reduce((sum, l) => {
    const p = rfGetProduct(l.productId);
    return p ? sum + p.price * l.qty : sum;
  }, 0);
}
function rfRenderCartBadge() {
  document.querySelectorAll("[data-cart-badge]").forEach((el) => {
    const count = rfCartCount();
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ---------------- WISHLIST ---------------- */
function rfToggleWishlist(productId) {
  const idx = RF_STATE.wishlist.indexOf(productId);
  if (idx > -1) RF_STATE.wishlist.splice(idx, 1);
  else RF_STATE.wishlist.push(productId);
  rfSaveStore();
  document
    .querySelectorAll(`[data-wish-btn="${productId}"]`)
    .forEach((b) =>
      b.classList.toggle("active", RF_STATE.wishlist.includes(productId)),
    );
}
function rfIsWishlisted(productId) {
  return RF_STATE.wishlist.includes(productId);
}

/* ---------------- MOCK AUTH ---------------- */
function rfLogin(email, name, location) {
  const existingLocation = RF_STATE.user?.location;
  RF_STATE.user = {
    name: name || email.split("@")[0],
    email,
    location: location || existingLocation || null,
  };
  rfSaveStore();
}
function rfLogout() {
  RF_STATE.user = null;
  rfSaveStore();
}
function rfIsLoggedIn() {
  return !!RF_STATE.user;
}

/* ---------------- PROMO ---------------- */
const RF_PROMO_CODES = { RAPID10: 0.1, FEET20: 0.2, WELCOME15: 0.15 };
function rfApplyPromo(code) {
  const pct = RF_PROMO_CODES[code.toUpperCase()];
  if (pct) {
    RF_STATE.promo = { code: code.toUpperCase(), pct };
    rfSaveStore();
    return true;
  }
  return false;
}
function rfRemovePromo() {
  RF_STATE.promo = null;
  rfSaveStore();
}

/* ---------------- TOAST ---------------- */
function rfToast(msg, icon = "bi-check-circle-fill") {
  let wrap = document.querySelector(".rf-toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "rf-toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = "rf-toast";
  t.innerHTML = `<i class="bi ${icon}"></i><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(30px)";
    setTimeout(() => t.remove(), 250);
  }, 2800);
}

/* ---------------- INIT (call on every page) ---------------- */
function rfInit() {
  rfApplyTheme();
  rfApplyLang();
  rfRenderCartBadge();

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", rfToggleTheme);
  });
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => rfSetLang(btn.dataset.langBtn));
  });

  // header scroll shadow
  const header = document.querySelector(".rf-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    });
  }

  // mobile nav
  const burger = document.querySelector("[data-burger]");
  const mobileNav = document.querySelector(".rf-mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", () => mobileNav.classList.add("open"));
    mobileNav
      .querySelector("[data-close-mobile]")
      ?.addEventListener("click", () => mobileNav.classList.remove("open"));
  }

  // search: desktop expandable icon + mobile drawer field, both submit to catalog.html?q=
  const searchWrap = document.querySelector("[data-search-wrap]");
  const searchToggle = document.querySelector("[data-search-toggle]");
  if (searchWrap && searchToggle) {
    searchToggle.addEventListener("click", () => {
      searchWrap.classList.toggle("open");
      if (searchWrap.classList.contains("open"))
        searchWrap.querySelector("[data-search-input]").focus();
    });
    document.addEventListener("click", (e) => {
      if (!searchWrap.contains(e.target)) searchWrap.classList.remove("open");
    });
  }
  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = form.querySelector("[data-search-input]").value.trim();
      if (q) window.location.href = "catalog.html?q=" + encodeURIComponent(q);
    });
  });

  // reveal-on-scroll
  let rfRevealObserver = null;
  function rfObserveReveals() {
    if (!rfRevealObserver) {
      rfRevealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("is-visible");
              rfRevealObserver.unobserve(en.target);
            }
          });
        },
        { threshold: 0.12 },
      );
    }
    document
      .querySelectorAll("[data-reveal]:not(.is-visible)")
      .forEach((el) => rfRevealObserver.observe(el));
  }
  window.rfObserveReveals = rfObserveReveals;
  rfObserveReveals();

  // account-only nav links: reflect login state
  document.querySelectorAll("[data-requires-auth-label]").forEach((el) => {
    el.textContent = rfIsLoggedIn()
      ? RF_STATE.lang === "vi"
        ? "Tài khoản"
        : "Account"
      : RF_STATE.lang === "vi"
        ? "Đăng nhập"
        : "Sign in";
  });
}

document.addEventListener("DOMContentLoaded", rfInit);
