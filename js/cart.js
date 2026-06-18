/* ==========================================================================
   RAPIDFEET — Cart page logic
   ========================================================================== */

function rfCartLineHTML(line, index) {
  const p = rfGetProduct(line.productId);
  if (!p) return "";
  return `
  <div class="cart-line" data-line-index="${index}">
    <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}"></a>
    <div class="flex-grow-1">
      <div class="d-flex justify-content-between">
        <div>
          <span class="product-card__brand">${p.brand}</span>
          <a href="product.html?id=${p.id}" class="d-block" style="font-weight:600;">${p.name}</a>
          <span class="text-faint" style="font-size:var(--fs-xs)">${line.color} · EU ${line.size}</span>
        </div>
        <strong>${rfFormatVND(p.price * line.qty)}</strong>
      </div>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="qty-stepper">
          <button type="button" data-qty-minus="${index}">−</button>
          <input type="text" value="${line.qty}" readonly>
          <button type="button" data-qty-plus="${index}">+</button>
        </div>
        <button class="remove-line" data-remove-line="${index}"><i class="bi bi-trash3"></i> <span lang-en>Remove</span><span lang-vi>Xóa</span></button>
      </div>
    </div>
  </div>`;
}

function rfRenderCartPage() {
  const empty = document.getElementById("cart-empty");
  const filled = document.getElementById("cart-filled");

  if (RF_STATE.cart.length === 0) {
    empty.style.display = "block";
    filled.style.display = "none";
    return;
  }
  empty.style.display = "none";
  filled.style.display = "flex";

  document.getElementById("cart-lines").innerHTML = RF_STATE.cart
    .map((l, i) => rfCartLineHTML(l, i))
    .join("");

  document.querySelectorAll("[data-qty-minus]").forEach((b) =>
    b.addEventListener("click", () => {
      const i = +b.dataset.qtyMinus;
      rfUpdateCartQty(i, RF_STATE.cart[i].qty - 1);
      rfRenderCartPage();
    }),
  );
  document.querySelectorAll("[data-qty-plus]").forEach((b) =>
    b.addEventListener("click", () => {
      const i = +b.dataset.qtyPlus;
      rfUpdateCartQty(i, RF_STATE.cart[i].qty + 1);
      rfRenderCartPage();
    }),
  );
  document.querySelectorAll("[data-remove-line]").forEach((b) =>
    b.addEventListener("click", () => {
      rfRemoveFromCart(+b.dataset.removeLine);
      rfRenderCartPage();
    }),
  );

  rfRenderSummary();
}

function rfRenderSummary() {
  const subtotal = rfCartSubtotal();
  document.getElementById("summary-subtotal").textContent =
    rfFormatVND(subtotal);

  let discount = 0;
  if (RF_STATE.promo) {
    discount = Math.round(subtotal * RF_STATE.promo.pct);
    document.getElementById("summary-discount-row").style.display = "flex";
    document.getElementById("summary-discount").textContent =
      "-" + rfFormatVND(discount);
    document.getElementById("promo-applied-box").style.display = "flex";
    document.getElementById("promo-input-row").style.display = "none";
    document.getElementById("promo-applied-code").textContent =
      `${RF_STATE.promo.code} (-${Math.round(RF_STATE.promo.pct * 100)}%)`;
  } else {
    document.getElementById("summary-discount-row").style.display = "none";
    document.getElementById("promo-applied-box").style.display = "none";
    document.getElementById("promo-input-row").style.display = "flex";
  }

  const total = Math.max(0, subtotal - discount);
  document.getElementById("summary-total").textContent = rfFormatVND(total);
}

function rfInitCartPage() {
  rfRenderCartPage();

  document.getElementById("apply-promo-btn").addEventListener("click", () => {
    const input = document.getElementById("promo-input");
    const ok = rfApplyPromo(input.value.trim());
    if (ok) {
      rfToast(
        RF_STATE.lang === "vi"
          ? "Đã áp dụng mã giảm giá!"
          : "Promo code applied!",
      );
      rfRenderSummary();
    } else {
      input.classList.add("is-invalid");
      setTimeout(() => input.classList.remove("is-invalid"), 1500);
      rfToast(
        RF_STATE.lang === "vi" ? "Mã không hợp lệ" : "Invalid promo code",
        "bi-x-circle-fill",
      );
    }
  });

  document.getElementById("remove-promo-btn")?.addEventListener("click", () => {
    rfRemovePromo();
    rfRenderSummary();
  });
}
