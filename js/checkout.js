/* ==========================================================================
   RAPIDFEET — Checkout flow logic
   ========================================================================== */

let RF_CHECKOUT_DATA = { shipping: {}, payment: { method: "cod", bank: null } };

function rfGoToStep(step) {
  document
    .querySelectorAll("[data-step]")
    .forEach((el) => (el.style.display = "none"));
  document.querySelector(`[data-step="${step}"]`).style.display = "block";
  document.querySelectorAll("[data-step-indicator]").forEach((el) => {
    const n = +el.dataset.stepIndicator;
    el.classList.remove("active", "done");
    if (n < step || step === "done" || step === "waiting")
      el.classList.add("done");
    else if (n === step) el.classList.add("active");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function rfRenderCheckoutSummary() {
  const subtotal = rfCartSubtotal();
  let discount = RF_STATE.promo ? Math.round(subtotal * RF_STATE.promo.pct) : 0;
  document.getElementById("co-subtotal").textContent = rfFormatVND(subtotal);
  if (discount > 0) {
    document.getElementById("co-discount-row").style.display = "flex";
    document.getElementById("co-discount").textContent =
      "-" + rfFormatVND(discount);
  }
  document.getElementById("co-total").textContent = rfFormatVND(
    Math.max(0, subtotal - discount),
  );

  document.getElementById("checkout-lines-mini").innerHTML = RF_STATE.cart
    .map((l) => {
      const p = rfGetProduct(l.productId);
      if (!p) return "";
      return `<div class="d-flex justify-content-between align-items-center mb-2">
      <div class="d-flex gap-2 align-items-center">
        <img src="${p.image}" style="width:44px;height:44px;object-fit:cover;">
        <div>
          <div style="font-size:var(--fs-sm); font-weight:600;">${p.name}</div>
          <div class="text-faint" style="font-size:var(--fs-xs)">${l.color} · EU ${l.size} · x${l.qty}</div>
        </div>
      </div>
      <span style="font-size:var(--fs-sm); font-weight:700;">${rfFormatVND(p.price * l.qty)}</span>
    </div>`;
    })
    .join("");
}

function rfInitCheckout() {
  if (RF_STATE.cart.length === 0) {
    document.getElementById("checkout-empty").style.display = "block";
    document.getElementById("checkout-content").style.display = "none";
    document.querySelector(".rf-stepper").style.display = "none";
    return;
  }
  document.getElementById("checkout-content").style.display = "flex";
  rfRenderCheckoutSummary();

  // Step 1 -> 2 with validation
  document.getElementById("to-step-2").addEventListener("click", () => {
    const form = document.getElementById("shipping-form");
    let valid = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const ok = input.checkValidity();
      input.classList.toggle("is-invalid", !ok);
      input.classList.toggle("is-valid", ok);
      if (!ok) valid = false;
    });
    if (!valid) return;
    const fd = new FormData(form);
    RF_CHECKOUT_DATA.shipping = Object.fromEntries(fd.entries());
    rfGoToStep(2);
  });

  // Payment method toggles
  document.querySelectorAll("[data-pay-method]").forEach((el) => {
    el.addEventListener("click", () => {
      document
        .querySelectorAll("[data-pay-method]")
        .forEach((p) => p.classList.remove("selected"));
      el.classList.add("selected");
      el.querySelector("input[type=radio]").checked = true;
      const method = el.dataset.payMethod;
      RF_CHECKOUT_DATA.payment.method = method;
      RF_CHECKOUT_DATA.payment.bank = null;
      document.getElementById("ewallet-options").style.display =
        method === "ewallet" ? "grid" : "none";
      document.getElementById("bank-options").style.display =
        method === "bank" ? "grid" : "none";
      document
        .querySelectorAll("[data-bank]")
        .forEach((t) => t.classList.remove("selected"));
      document.getElementById("qr-payment-box").style.display = "none";
    });
  });
  const bankLabels = {
    momo: "MoMo",
    zalopay: "ZaloPay",
    vnpay: "VNPay",
    vcb: "Vietcombank",
    tcb: "Techcombank",
    bidv: "BIDV",
    acb: "ACB",
    mb: "MB Bank",
    vpb: "VPBank",
    stb: "Sacombank",
    tpb: "TPBank",
  };
  document.querySelectorAll("[data-bank]").forEach((tile) => {
    tile.addEventListener("click", () => {
      const group = tile.closest(".bank-grid");
      group
        .querySelectorAll("[data-bank]")
        .forEach((t) => t.classList.remove("selected"));
      tile.classList.add("selected");
      RF_CHECKOUT_DATA.payment.bank = tile.dataset.bank;
      const subtotal = rfCartSubtotal();
      const discount = RF_STATE.promo
        ? Math.round(subtotal * RF_STATE.promo.pct)
        : 0;
      document.getElementById("qr-amount-display").textContent = rfFormatVND(
        Math.max(0, subtotal - discount),
      );
      document.getElementById("qr-method-label").textContent =
        `· ${bankLabels[tile.dataset.bank] || tile.dataset.bank}`;
      document.getElementById("qr-payment-box").style.display = "block";
    });
  });
  // default select COD visually
  document.querySelector('[data-pay-method="cod"]').classList.add("selected");

  document
    .getElementById("to-step-1-back")
    .addEventListener("click", () => rfGoToStep(1));
  document
    .getElementById("to-step-2-back")
    .addEventListener("click", () => rfGoToStep(2));

  // Step 2 -> 3
  document.getElementById("to-step-3").addEventListener("click", () => {
    const method = RF_CHECKOUT_DATA.payment.method;
    if (
      (method === "ewallet" || method === "bank") &&
      !RF_CHECKOUT_DATA.payment.bank
    ) {
      rfToast(
        RF_STATE.lang === "vi"
          ? "Vui lòng chọn một ví/ngân hàng"
          : "Please select a wallet or bank",
        "bi-exclamation-circle-fill",
      );
      return;
    }
    const s = RF_CHECKOUT_DATA.shipping;
    document.getElementById("review-shipping-box").innerHTML = `
      <h6 class="mb-2"><span lang-en>Ship to</span><span lang-vi>Giao đến</span></h6>
      <p class="mb-0" style="font-size:var(--fs-sm)">${s.fullname} · ${s.phone}<br>${s.address}, ${s.district}, ${s.city}</p>`;

    const methodLabels = {
      cod: { en: "Cash on delivery", vi: "Thanh toán khi nhận hàng" },
      ewallet: { en: "E-wallet", vi: "Ví điện tử" },
      bank: { en: "Bank transfer / Card", vi: "Chuyển khoản / Thẻ" },
    };
    const m = methodLabels[method];
    const bankExtra = RF_CHECKOUT_DATA.payment.bank
      ? ` — ${bankLabels[RF_CHECKOUT_DATA.payment.bank] || RF_CHECKOUT_DATA.payment.bank}`
      : "";
    document.getElementById("review-payment-box").innerHTML = `
      <h6 class="mb-2"><span lang-en>Payment</span><span lang-vi>Thanh toán</span></h6>
      <p class="mb-0" style="font-size:var(--fs-sm)"><span lang-en>${m.en}</span><span lang-vi>${m.vi}</span>${bankExtra}</p>`;

    rfGoToStep(3);
  });

  // Place order
  document.getElementById("place-order-btn").addEventListener("click", () => {
    const orderId = "RF" + Date.now().toString().slice(-8);
    RF_STATE.orders.push({
      id: orderId,
      date: new Date().toISOString(),
      items: RF_STATE.cart.slice(),
      total: Math.max(
        0,
        rfCartSubtotal() -
          (RF_STATE.promo
            ? Math.round(rfCartSubtotal() * RF_STATE.promo.pct)
            : 0),
      ),
      status: "pending",
      shipping: RF_CHECKOUT_DATA.shipping,
      payment: RF_CHECKOUT_DATA.payment,
    });
    RF_STATE.cart = [];
    RF_STATE.promo = null;
    rfSaveStore();
    rfRenderCartBadge();
    document.getElementById("confirm-order-id").textContent = "#" + orderId;
    rfSendOrderEmail(orderId);

    const isQR =
      RF_CHECKOUT_DATA.payment.method === "ewallet" ||
      RF_CHECKOUT_DATA.payment.method === "bank";
    if (isQR) {
      rfGoToStep("waiting");
      setTimeout(() => rfGoToStep("done"), 1800);
    } else {
      rfGoToStep("done");
    }
  });
}
