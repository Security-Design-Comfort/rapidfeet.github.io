/* ==========================================================================
   RAPIDFEET — Product Detail Page logic
   ========================================================================== */

function rfMockReviews(p) {
  const names = [
    "Minh T.",
    "Sarah K.",
    "David L.",
    "Linh Nguyen",
    "Carlos M.",
    "Anna P.",
  ];
  const en = [
    "Super comfortable out of the box, no break-in period needed.",
    "Runs slightly narrow, sized up half a size and it's perfect.",
    "Great for daily wear, the knit upper breathes really well.",
    "Sole grip is excellent on wet pavement, very happy with this pair.",
  ];
  const vi = [
    "Rất thoải mái ngay khi mới mang, không cần thời gian làm mềm.",
    "Giày hơi chật, mình lên nửa size là vừa hoàn hảo.",
    "Phù hợp mặc hàng ngày, phần upper dệt kim rất thoáng khí.",
    "Đế bám rất tốt trên mặt đường ướt, rất hài lòng với sản phẩm.",
  ];
  return [0, 1, 2].map((i) => ({
    name: names[(p.id.charCodeAt(2) + i) % names.length],
    rating: 4 + (i % 2),
    en: en[i % en.length],
    vi: vi[i % vi.length],
    date: `2026-0${(i % 6) + 1}-1${i}`,
  }));
}

function rfInitProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const p = rfGetProduct(id) || RF_PRODUCTS[0];

  document.title = `${p.name} — Rapidfeet`;
  document.getElementById("bc-product-name").textContent = p.name;

  let selectedColor = p.colors[0];
  let selectedSize = null;
  let qty = 1;

  const root = document.getElementById("pdp-root");
  root.innerHTML = `
    <div class="row g-5">
      <div class="col-lg-6">
        <div class="pdp-gallery">
          <div class="pdp-thumbs" id="pdp-thumbs">
            ${p.gallery.map((g, i) => `<img src="${g}" class="${i === 0 ? "active" : ""}" data-thumb="${i}" alt="${p.name} shoe gallery view ${i + 1} showing the silhouette and texture on a studio background">`).join("")}
          </div>
          <div class="pdp-main-img flex-grow-1">
            <img src="${p.gallery[0]}" id="pdp-main-img" alt="Primary display of ${p.name} shoe on a studio background highlighting the upper and outsole">
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <span class="product-card__brand" style="font-size:var(--fs-sm);">${p.brand}</span>
        <h1 class="display italic-slant mt-1" style="font-size:var(--fs-xl); line-height:1.05;">${p.name}</h1>
        <div class="d-flex align-items-center gap-2 mt-2">
          <span class="review-stars">${'<i class="bi bi-star-fill"></i>'.repeat(Math.round(p.rating))}${'<i class="bi bi-star"></i>'.repeat(5 - Math.round(p.rating))}</span>
          <span class="text-faint" style="font-size:var(--fs-sm)">${p.rating} (${p.reviews} <span lang-en>reviews</span><span lang-vi>đánh giá</span>)</span>
        </div>

        <div class="d-flex align-items-baseline gap-3 mt-4">
          <span style="font-size:var(--fs-lg); font-weight:800;">${rfFormatVND(p.price)}</span>
          ${p.oldPrice ? `<span class="product-card__price-old" style="font-size:var(--fs-md);">${rfFormatVND(p.oldPrice)}</span><span class="chip active" style="background:var(--ember);border-color:var(--ember)">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}
        </div>

        <p class="text-soft mt-4" id="pdp-description" style="font-size:var(--fs-base);"></p>

        <div class="divider my-4"></div>

        <div class="mb-4">
          <label class="d-block mb-2" style="font-size:var(--fs-xs); font-weight:700; text-transform:uppercase; letter-spacing:.04em;">
            <span lang-en>Color</span><span lang-vi>Màu</span>: <span id="selected-color-label">${selectedColor}</span>
          </label>
          <div class="color-grid">
            ${p.colors.map((c) => `<span class="color-swatch ${c === selectedColor ? "active" : ""}" data-pdp-color="${c}" style="background:${RF_COLORS[c]}" title="${c}"></span>`).join("")}
          </div>
        </div>

        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label style="font-size:var(--fs-xs); font-weight:700; text-transform:uppercase; letter-spacing:.04em;"><span lang-en>Size (EU)</span><span lang-vi>Kích cỡ</span></label>
            <a href="size-guide.html" class="text-faint" style="font-size:var(--fs-xs); text-decoration:underline;"><span lang-en>Size guide</span><span lang-vi>Hướng dẫn chọn size</span></a>
          </div>
          <div class="size-grid" style="grid-template-columns:repeat(7,1fr);">
            ${[38, 39, 40, 41, 42, 43, 44]
              .map((s) => {
                const avail = p.sizes.includes(s);
                return `<span class="size-chip ${avail ? "" : "disabled"}" data-pdp-size="${s}" ${avail ? "" : 'title="Out of stock"'}>${s}</span>`;
              })
              .join("")}
          </div>
          <p class="invalid-feedback" id="size-error" style="display:none; color:var(--err); font-size:var(--fs-xs); margin-top:8px;"><span lang-en>Please select a size</span><span lang-vi>Vui lòng chọn kích cỡ</span></p>
        </div>

        <div class="mb-4">
          <label class="d-block mb-2" style="font-size:var(--fs-xs); font-weight:700; text-transform:uppercase; letter-spacing:.04em;"><span lang-en>Quantity</span><span lang-vi>Số lượng</span></label>
          <div class="qty-stepper">
            <button id="qty-minus" type="button">−</button>
            <input type="text" id="qty-input" value="1" readonly>
            <button id="qty-plus" type="button">+</button>
          </div>
        </div>

        <div class="d-flex gap-3">
          <button class="btn-rf btn-rf-primary btn-rf-lg flex-grow-1" id="add-to-cart-btn">
            <i class="bi bi-bag-plus"></i> <span lang-en>Add to cart</span><span lang-vi>Thêm vào giỏ</span>
          </button>
          <button class="btn-rf-icon-circle" id="pdp-wish-btn" aria-label="Wishlist"><i class="bi bi-heart-fill"></i></button>
        </div>

        <p class="text-faint mt-3" style="font-size:var(--fs-xs);" id="stock-label"></p>

        <div class="mt-5">
          <div class="accordion-rf-item open">
            <button class="accordion-rf-btn"><span><span lang-en>Product details</span><span lang-vi>Chi tiết sản phẩm</span></span><i class="bi bi-chevron-down"></i></button>
            <div class="accordion-rf-body">
              <p><span lang-en>SKU:</span><span lang-vi>Mã SP:</span> ${p.sku}</p>
              <p><span lang-en>Category:</span><span lang-vi>Danh mục:</span> ${p.category}</p>
              <p><span lang-en>Gender:</span><span lang-vi>Giới tính:</span> ${p.gender}</p>
            </div>
          </div>
          <div class="accordion-rf-item">
            <button class="accordion-rf-btn"><span><span lang-en>Shipping & returns</span><span lang-vi>Vận chuyển & đổi trả</span></span><i class="bi bi-chevron-down"></i></button>
            <div class="accordion-rf-body">
              <p><span lang-en>Free shipping on orders over 1,000,000đ. Cash on delivery available nationwide. 30-day return window — see our</span><span lang-vi>Miễn phí vận chuyển cho đơn trên 1.000.000đ. Hỗ trợ thanh toán khi nhận hàng toàn quốc. Đổi trả trong 30 ngày — xem</span> <a href="returns.html" style="text-decoration:underline;"><span lang-en>return policy</span><span lang-vi>chính sách đổi trả</span></a>.</p>
            </div>
          </div>
          <div class="accordion-rf-item">
            <button class="accordion-rf-btn"><span><span lang-en>Reviews (${p.reviews})</span><span lang-vi>Đánh giá (${p.reviews})</span></span><i class="bi bi-chevron-down"></i></button>
            <div class="accordion-rf-body" id="reviews-body"></div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("pdp-description").innerHTML =
    `<span lang-en>${p.description_en}</span><span lang-vi>${p.description_vi}</span>`;
  document.getElementById("stock-label").innerHTML =
    p.stock === 0
      ? `<span lang-en>Out of stock</span><span lang-vi>Hết hàng</span>`
      : p.stock < 5
        ? `<span lang-en>Only ${p.stock} left in stock</span><span lang-vi>Chỉ còn ${p.stock} sản phẩm</span>`
        : `<span lang-en>In stock, ready to ship</span><span lang-vi>Còn hàng, sẵn sàng giao</span>`;

  const reviews = rfMockReviews(p);
  document.getElementById("reviews-body").innerHTML = reviews
    .map(
      (r) => `
    <div class="review-card">
      <div class="d-flex justify-content-between">
        <strong style="font-size:var(--fs-sm)">${r.name}</strong>
        <span class="text-faint" style="font-size:var(--fs-xs)">${r.date}</span>
      </div>
      <div class="review-stars mb-1">${'<i class="bi bi-star-fill"></i>'.repeat(r.rating)}${'<i class="bi bi-star"></i>'.repeat(5 - r.rating)}</div>
      <p class="text-soft" style="font-size:var(--fs-sm)"><span lang-en>${r.en}</span><span lang-vi>${r.vi}</span></p>
    </div>`,
    )
    .join("");

  // ---- Gallery thumbs ----
  document.querySelectorAll("[data-thumb]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document
        .querySelectorAll("[data-thumb]")
        .forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      document.getElementById("pdp-main-img").src = thumb.src;
    });
  });

  // ---- Color select ----
  document.querySelectorAll("[data-pdp-color]").forEach((sw) => {
    sw.addEventListener("click", () => {
      selectedColor = sw.dataset.pdpColor;
      document
        .querySelectorAll("[data-pdp-color]")
        .forEach((s) => s.classList.toggle("active", s === sw));
      document.getElementById("selected-color-label").textContent =
        selectedColor;
    });
  });

  // ---- Size select ----
  document.querySelectorAll("[data-pdp-size]").forEach((chip) => {
    if (chip.classList.contains("disabled")) return;
    chip.addEventListener("click", () => {
      selectedSize = chip.dataset.pdpSize;
      document
        .querySelectorAll("[data-pdp-size]")
        .forEach((c) => c.classList.toggle("active", c === chip));
      document.getElementById("size-error").style.display = "none";
    });
  });

  // ---- Qty stepper ----
  document.getElementById("qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    document.getElementById("qty-input").value = qty;
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qty = Math.min(p.stock || 10, qty + 1);
    document.getElementById("qty-input").value = qty;
  });

  // ---- Add to cart ----
  document.getElementById("add-to-cart-btn").addEventListener("click", () => {
    if (p.stock === 0) return;
    if (!selectedSize) {
      document.getElementById("size-error").style.display = "block";
      return;
    }
    rfAddToCart(p.id, selectedColor, selectedSize, qty);
    rfToast(
      (RF_STATE.lang === "vi" ? "Đã thêm vào giỏ: " : "Added to cart: ") +
        p.name,
      "bi-bag-check-fill",
    );
  });
  if (p.stock === 0) {
    document.getElementById("add-to-cart-btn").disabled = true;
    document.getElementById("add-to-cart-btn").innerHTML =
      `<span lang-en>Sold out</span><span lang-vi>Hết hàng</span>`;
  }

  // ---- Wishlist ----
  const wishBtn = document.getElementById("pdp-wish-btn");
  wishBtn.classList.toggle("active", rfIsWishlisted(p.id));
  if (rfIsWishlisted(p.id)) wishBtn.style.color = "var(--ember)";
  wishBtn.addEventListener("click", () => {
    rfToggleWishlist(p.id);
    wishBtn.classList.toggle("active");
    wishBtn.style.color = rfIsWishlisted(p.id) ? "var(--ember)" : "";
  });

  // ---- Accordion ----
  document.querySelectorAll(".accordion-rf-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      btn.closest(".accordion-rf-item").classList.toggle("open"),
    );
  });

  // ---- Related products ----
  const related = RF_PRODUCTS.filter(
    (rp) => rp.category === p.category && rp.id !== p.id,
  ).slice(0, 4);
  document.getElementById("related-grid").innerHTML = related
    .map((rp) => rfProductCardHTML(rp))
    .join("");
  rfBindProductCardEvents();
}
