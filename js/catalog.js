/* ==========================================================================
   RAPIDFEET — Catalog page logic (filter, sort, render)
   ========================================================================== */

const RF_PRICE_MAX =
  Math.ceil(Math.max(...RF_PRODUCTS.map((p) => p.price)) / 500000) * 500000;

let RF_FILTERS = {
  categories: [],
  brands: [],
  colors: [],
  sizes: [],
  genders: [],
  priceMax: RF_PRICE_MAX,
  saleOnly: false,
  hideOOS: false,
  query: "",
};

function rfFilterPanelHTML() {
  const maxPrice = RF_PRICE_MAX;
  return `
  <div class="filter-panel">
    <div class="filter-group">
      <div class="filter-group__title"><span lang-en>Category</span><span lang-vi>Danh mục</span></div>
      <div class="filter-group__body">
        ${RF_CATEGORIES.map(
          (c) => `
          <label class="filter-check">
            <input type="checkbox" data-filter="categories" value="${c}">
            <span>${c}</span>
            <span class="count">${RF_PRODUCTS.filter((p) => p.category === c).length}</span>
          </label>`,
        ).join("")}
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group__title"><span lang-en>Brand</span><span lang-vi>Thương hiệu</span></div>
      <div class="filter-group__body">
        ${RF_BRANDS.map(
          (b) => `
          <label class="filter-check">
            <input type="checkbox" data-filter="brands" value="${b}">
            <span>${b}</span>
            <span class="count">${RF_PRODUCTS.filter((p) => p.brand === b).length}</span>
          </label>`,
        ).join("")}
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group__title"><span lang-en>Color</span><span lang-vi>Màu sắc</span></div>
      <div class="filter-group__body">
        <div class="color-grid">
          ${Object.entries(RF_COLORS)
            .filter(([name]) =>
              RF_PRODUCTS.some((p) => p.colors.includes(name)),
            )
            .map(
              ([name, hex]) => `
            <span class="color-swatch" data-filter="colors" data-value="${name}" style="background:${hex}" title="${name}"></span>`,
            )
            .join("")}
        </div>
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group__title"><span lang-en>Size (EU)</span><span lang-vi>Kích cỡ</span></div>
      <div class="filter-group__body">
        <div class="size-grid">
          ${[38, 39, 40, 41, 42, 43, 44].map((s) => `<span class="size-chip" data-filter="sizes" data-value="${s}">${s}</span>`).join("")}
        </div>
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group__title"><span lang-en>Gender</span><span lang-vi>Giới tính</span></div>
      <div class="filter-group__body">
        ${["Men", "Women", "Unisex"]
          .map(
            (g) => `
          <label class="filter-check">
            <input type="checkbox" data-filter="genders" value="${g}">
            <span><span lang-en>${g}</span><span lang-vi>${g === "Men" ? "Nam" : g === "Women" ? "Nữ" : "Unisex"}</span></span>
          </label>`,
          )
          .join("")}
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group__title"><span lang-en>Price range</span><span lang-vi>Khoảng giá</span></div>
      <div class="filter-group__body">
        <div class="price-range-display">
          <span>0đ</span>
          <span id="price-max-label">${rfFormatVND(maxPrice)}</span>
        </div>
        <input type="range" class="form-range" id="price-range" min="0" max="${maxPrice}" step="100000" value="${maxPrice}">
      </div>
    </div>
    <div class="filter-group">
      <label class="filter-check">
        <input type="checkbox" id="sale-only-check">
        <span><span lang-en>On sale only</span><span lang-vi>Chỉ hàng giảm giá</span></span>
      </label>
      <label class="filter-check">
        <input type="checkbox" id="hide-oos-check">
        <span><span lang-en>Hide out of stock</span><span lang-vi>Ẩn hàng đã hết</span></span>
      </label>
    </div>
    <div class="p-3">
      <button class="btn-rf btn-rf-ghost btn-rf-block" id="reset-filters-btn"><i class="bi bi-arrow-counterclockwise"></i> <span lang-en>Reset all</span><span lang-vi>Đặt lại</span></button>
    </div>
  </div>`;
}

function rfApplyFiltersAndSort() {
  let list = RF_PRODUCTS.slice();

  if (RF_FILTERS.categories.length)
    list = list.filter((p) => RF_FILTERS.categories.includes(p.category));
  if (RF_FILTERS.brands.length)
    list = list.filter((p) => RF_FILTERS.brands.includes(p.brand));
  if (RF_FILTERS.colors.length)
    list = list.filter((p) =>
      p.colors.some((c) => RF_FILTERS.colors.includes(c)),
    );
  if (RF_FILTERS.sizes.length)
    list = list.filter((p) =>
      p.sizes.some((s) => RF_FILTERS.sizes.includes(String(s))),
    );
  if (RF_FILTERS.genders.length)
    list = list.filter((p) => RF_FILTERS.genders.includes(p.gender));
  if (RF_FILTERS.saleOnly) list = list.filter((p) => p.onSale);
  if (RF_FILTERS.hideOOS) list = list.filter((p) => p.stock > 0);
  list = list.filter((p) => p.price <= RF_FILTERS.priceMax);
  if (RF_FILTERS.query)
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(RF_FILTERS.query.toLowerCase()) ||
        p.brand.toLowerCase().includes(RF_FILTERS.query.toLowerCase()),
    );

  const sort = document.getElementById("sort-select")?.value || "featured";
  if (sort === "new") list.sort((a, b) => b.isNew - a.isNew);
  else if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  return list;
}

function rfRenderActiveChips() {
  const wrap = document.getElementById("active-chips");
  let chips = [];
  if (RF_FILTERS.query) {
    chips.push(
      `<span class="chip active" data-remove-chip="query" data-remove-value="${RF_FILTERS.query}"><i class="bi bi-search" style="font-size:10px;"></i> "${RF_FILTERS.query}" <i class="bi bi-x chip-x"></i></span>`,
    );
  }
  ["categories", "brands", "colors", "genders"].forEach((key) => {
    RF_FILTERS[key].forEach((val) => {
      chips.push(
        `<span class="chip active" data-remove-chip="${key}" data-remove-value="${val}">${val} <i class="bi bi-x chip-x"></i></span>`,
      );
    });
  });
  RF_FILTERS.sizes.forEach((val) => {
    chips.push(
      `<span class="chip active" data-remove-chip="sizes" data-remove-value="${val}">EU ${val} <i class="bi bi-x chip-x"></i></span>`,
    );
  });
  if (RF_FILTERS.saleOnly) {
    chips.push(
      `<span class="chip active" data-remove-chip="saleOnly" data-remove-value="true">Sale <i class="bi bi-x chip-x"></i></span>`,
    );
  }
  if (RF_FILTERS.hideOOS) {
    const label = RF_STATE.lang === "vi" ? "Ẩn hết hàng" : "Hide out of stock";
    chips.push(
      `<span class="chip active" data-remove-chip="hideOOS" data-remove-value="true">${label} <i class="bi bi-x chip-x"></i></span>`,
    );
  }
  wrap.innerHTML = chips.join("");
  wrap.style.display = chips.length ? "flex" : "none";

  wrap.querySelectorAll("[data-remove-chip]").forEach((el) => {
    el.addEventListener("click", () => {
      const key = el.dataset.removeChip;
      if (key === "saleOnly") {
        RF_FILTERS.saleOnly = false;
        document.getElementById("sale-only-check").checked = false;
      } else if (key === "hideOOS") {
        RF_FILTERS.hideOOS = false;
        document
          .querySelectorAll("#hide-oos-check")
          .forEach((c) => (c.checked = false));
      } else if (key === "query") {
        RF_FILTERS.query = "";
      } else {
        const val = el.dataset.removeValue;
        RF_FILTERS[key] = RF_FILTERS[key].filter((v) => String(v) !== val);
        syncFilterPanelUI();
      }
      rfRenderCatalog();
    });
  });
}

function syncFilterPanelUI() {
  document.querySelectorAll("[data-filter]").forEach((el) => {
    const key = el.dataset.filter;
    const val = el.value || el.dataset.value;
    const isActive = RF_FILTERS[key]?.includes(val);
    if (el.type === "checkbox") el.checked = isActive;
    else el.classList.toggle("active", isActive);
  });
}

function rfRenderCatalog() {
  const list = rfApplyFiltersAndSort();
  const grid = document.getElementById("product-grid");
  const empty = document.getElementById("empty-state");
  grid.innerHTML = list.map((p) => rfProductCardHTML(p)).join("");
  grid.style.display = list.length ? "flex" : "none";
  empty.style.display = list.length ? "none" : "block";

  const countEl = document.getElementById("result-count");
  if (countEl) {
    countEl.innerHTML =
      RF_STATE.lang === "vi"
        ? `${list.length} sản phẩm`
        : `${list.length} products`;
  }

  // Update catalog heading to reflect current active query / category filter
  const titleEl = document.getElementById("catalog-title");
  if (titleEl) {
    const params = new URLSearchParams(window.location.search);
    if (RF_FILTERS.query) {
      titleEl.innerHTML = `<span lang-en>Results for &ldquo;${RF_FILTERS.query}&rdquo;</span><span lang-vi>Kết quả cho &ldquo;${RF_FILTERS.query}&rdquo;</span>`;
    } else if (RF_FILTERS.categories.length === 1) {
      const c = RF_FILTERS.categories[0];
      const viName =
        { Running: "Chạy bộ", Lifestyle: "Đời thường", Basketball: "Bóng rổ" }[
          c
        ] || c;
      titleEl.innerHTML = `<span lang-en>${c}</span><span lang-vi>${viName}</span>`;
    } else {
      titleEl.innerHTML = `<span lang-en>All shoes</span><span lang-vi>Tất cả giày</span>`;
    }
  }

  rfRenderActiveChips();
  rfBindProductCardEvents();
  window.rfObserveReveals?.();
}

function rfBindFilterEvents(container) {
  container.querySelectorAll("input[data-filter]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const key = cb.dataset.filter;
      if (cb.checked) RF_FILTERS[key].push(cb.value);
      else RF_FILTERS[key] = RF_FILTERS[key].filter((v) => v !== cb.value);
      // mirror to the other panel (desktop/mobile)
      document
        .querySelectorAll(`input[data-filter="${key}"][value="${cb.value}"]`)
        .forEach((other) => (other.checked = cb.checked));
      rfRenderCatalog();
    });
  });
  container
    .querySelectorAll('[data-filter="colors"], [data-filter="sizes"]')
    .forEach((el) => {
      el.addEventListener("click", () => {
        const key = el.dataset.filter;
        const val = el.dataset.value;
        const idx = RF_FILTERS[key].indexOf(val);
        if (idx > -1) RF_FILTERS[key].splice(idx, 1);
        else RF_FILTERS[key].push(val);
        document
          .querySelectorAll(`[data-filter="${key}"][data-value="${val}"]`)
          .forEach((other) =>
            other.classList.toggle("active", RF_FILTERS[key].includes(val)),
          );
        rfRenderCatalog();
      });
    });
  const priceRange = container.querySelector("#price-range");
  if (priceRange) {
    priceRange.addEventListener("input", () => {
      RF_FILTERS.priceMax = parseInt(priceRange.value);
      document
        .querySelectorAll("#price-max-label")
        .forEach((l) => (l.textContent = rfFormatVND(RF_FILTERS.priceMax)));
      document
        .querySelectorAll("#price-range")
        .forEach((r) => (r.value = priceRange.value));
      rfRenderCatalog();
    });
  }
  const saleCheck = container.querySelector("#sale-only-check");
  if (saleCheck) {
    saleCheck.addEventListener("change", () => {
      RF_FILTERS.saleOnly = saleCheck.checked;
      document
        .querySelectorAll("#sale-only-check")
        .forEach((c) => (c.checked = saleCheck.checked));
      rfRenderCatalog();
    });
  }
  const hideOOSCheck = container.querySelector("#hide-oos-check");
  if (hideOOSCheck) {
    hideOOSCheck.addEventListener("change", () => {
      RF_FILTERS.hideOOS = hideOOSCheck.checked;
      document
        .querySelectorAll("#hide-oos-check")
        .forEach((c) => (c.checked = hideOOSCheck.checked));
      rfRenderCatalog();
    });
  }
  const resetBtn = container.querySelector("#reset-filters-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      RF_FILTERS = {
        categories: [],
        brands: [],
        colors: [],
        sizes: [],
        genders: [],
        priceMax: RF_PRICE_MAX,
        saleOnly: false,
        hideOOS: false,
        query: RF_FILTERS.query,
      };
      document.getElementById("filter-panel-content").innerHTML =
        rfFilterPanelHTML();
      document.getElementById("filter-panel-content-mobile").innerHTML =
        rfFilterPanelHTML();
      rfBindFilterEvents(document.getElementById("filter-panel-content"));
      rfBindFilterEvents(
        document.getElementById("filter-panel-content-mobile"),
      );
      rfBindCollapseToggles();
      rfRenderCatalog();
    });
  }
}

function rfBindCollapseToggles() {
  document.querySelectorAll(".filter-group__title").forEach((title) => {
    title.addEventListener("click", () => {
      title.closest(".filter-group").classList.toggle("collapsed");
    });
  });
}

function rfInitCatalog() {
  // read URL params for deep-linking from home page tiles
  const params = new URLSearchParams(window.location.search);
  if (params.get("cat")) RF_FILTERS.categories.push(params.get("cat"));
  if (params.get("sale")) RF_FILTERS.saleOnly = true;
  if (params.get("q")) RF_FILTERS.query = params.get("q");
  if (params.get("sort"))
    document.getElementById("sort-select").value =
      params.get("sort") === "new" ? "new" : "featured";

  document.getElementById("filter-panel-content").innerHTML =
    rfFilterPanelHTML();
  document.getElementById("filter-panel-content-mobile").innerHTML =
    rfFilterPanelHTML();
  syncFilterPanelUI();
  if (RF_FILTERS.saleOnly) {
    document
      .querySelectorAll("#sale-only-check")
      .forEach((c) => (c.checked = true));
  }

  rfBindFilterEvents(document.getElementById("filter-panel-content"));
  rfBindFilterEvents(document.getElementById("filter-panel-content-mobile"));
  rfBindCollapseToggles();

  document
    .getElementById("sort-select")
    .addEventListener("change", rfRenderCatalog);
  document
    .getElementById("clear-filters-empty")
    ?.addEventListener("click", () =>
      document.getElementById("reset-filters-btn").click(),
    );

  rfRenderCatalog();
}
