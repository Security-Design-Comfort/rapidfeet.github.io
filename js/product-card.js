/* ==========================================================================
   RAPIDFEET — Product Card component (shared across home/catalog/search)
   ========================================================================== */

function rfProductCardHTML(p, colClass = "col-md-3 col-6") {
  const badge = p.isNew
    ? `<span class="product-card__badge"><span lang-en>New</span><span lang-vi>Mới</span></span>`
    : p.onSale
      ? `<span class="product-card__badge badge-volt"><span lang-en>Sale</span><span lang-vi>Giảm</span></span>`
      : p.stock === 0
        ? `<span class="product-card__badge badge-ink"><span lang-en>Sold out</span><span lang-vi>Hết hàng</span></span>`
        : "";
  const dots = p.colors
    .slice(0, 4)
    .map(
      (c) =>
        `<span class="product-card__dot" style="background:${RF_COLORS[c]}" title="${c}"></span>`,
    )
    .join("");
  const wished = rfIsWishlisted(p.id) ? "active" : "";
  const soldOut = p.stock === 0;
  const priceRow = p.oldPrice
    ? `<span class="product-card__price">${rfFormatVND(p.price)}</span><span class="product-card__price-old">${rfFormatVND(p.oldPrice)}</span>`
    : `<span class="product-card__price">${rfFormatVND(p.price)}</span>`;

  return `
  <div class="${colClass}" data-reveal>
    <div class="product-card">
      <div class="product-card__media">
        ${badge}
        <button class="product-card__wish ${wished}" data-wish-btn="${p.id}" aria-label="Wishlist"><i class="bi bi-heart-fill"></i></button>
        <button class="product-card__quickadd-icon" data-quickadd="${p.id}" aria-label="Quick add" ${soldOut ? "disabled" : ""}><i class="bi bi-bag-plus"></i></button>
        <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"></a>
        <div class="product-card__quickadd">
          <button class="btn-rf btn-rf-primary btn-rf-block btn-rf-sm" data-quickadd="${p.id}" ${soldOut ? "disabled" : ""}>
            <i class="bi bi-bag-plus"></i> <span lang-en>Quick add</span><span lang-vi>Thêm nhanh</span>
          </button>
        </div>
      </div>
      <a href="product.html?id=${p.id}" class="product-card__body" style="text-decoration:none;color:inherit;">
        <span class="product-card__brand">${p.brand}</span>
        <span class="product-card__name">${p.name}</span>
        <div class="product-card__colors">${dots}</div>
        <div class="product-card__price-row">${priceRow}</div>
      </a>
    </div>
  </div>`;
}

function rfBindProductCardEvents() {
  document.querySelectorAll("[data-wish-btn]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      rfToggleWishlist(btn.dataset.wishBtn);
      const nowWished = rfIsWishlisted(btn.dataset.wishBtn);
      const p = rfGetProduct(btn.dataset.wishBtn);
      if (nowWished) {
        rfToast(
          (RF_STATE.lang === "vi"
            ? "Đã lưu vào yêu thích: "
            : "Saved to wishlist: ") + (p ? p.name : ""),
          "bi-heart-fill",
        );
      }
    });
  });
  document.querySelectorAll("[data-quickadd]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.disabled) return;
      const p = rfGetProduct(btn.dataset.quickadd);
      if (!p) {
        return;
      }
      if (p.stock === 0) {
        rfToast(
          (RF_STATE.lang === "vi" ? "Hết hàng: " : "Out of stock: ") + p.name,
          "bi-x-circle-fill",
        );
        return;
      }
      rfAddToCart(p.id, p.colors[0], p.sizes[0], 1);
      rfToast(
        (RF_STATE.lang === "vi" ? "Đã thêm: " : "Added: ") + p.name,
        "bi-bag-check-fill",
      );
    });
  });
}
