/* ==========================================================================
   RAPIDFEET — Account dashboard logic
   ========================================================================== */

function rfOrderRowHTML(order) {
  const date = new Date(order.date).toLocaleDateString(
    RF_STATE.lang === "vi" ? "vi-VN" : "en-US",
    { year: "numeric", month: "short", day: "numeric" },
  );
  const statusLabels = {
    pending: { en: "Pending", vi: "Đang xử lý" },
    shipped: { en: "Shipped", vi: "Đang giao" },
    delivered: { en: "Delivered", vi: "Đã giao" },
    cancelled: { en: "Cancelled", vi: "Đã hủy" },
  };
  const s = statusLabels[order.status] || statusLabels.pending;
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  return `
  <div class="order-row">
    <div>
      <div style="font-weight:700;">#${order.id}</div>
      <div class="text-faint" style="font-size:var(--fs-xs)">${date} · ${itemCount} <span lang-en>items</span><span lang-vi>sản phẩm</span></div>
    </div>
    <span class="status-pill ${order.status}"><span lang-en>${s.en}</span><span lang-vi>${s.vi}</span></span>
    <strong>${rfFormatVND(order.total)}</strong>
    <button class="btn-rf btn-rf-outline btn-rf-sm" data-view-order="${order.id}"><span lang-en>View details</span><span lang-vi>Xem chi tiết</span></button>
  </div>`;
}

function rfInitAccountPage() {
  if (!rfIsLoggedIn()) {
    document.getElementById("account-guest").style.display = "block";
    document.getElementById("account-content").style.display = "none";
    return;
  }
  document.getElementById("account-content").style.display = "block";

  const user = RF_STATE.user;
  document.getElementById("avatar-initial").textContent = user.name
    .charAt(0)
    .toUpperCase();
  document.getElementById("account-name-display").textContent = user.name;
  document.getElementById("account-email-display").textContent = user.email;
  document.getElementById("profile-name").value = user.name;
  document.getElementById("profile-email").value = user.email;
  document.getElementById("profile-phone").value = user.phone || "";
  document.getElementById("profile-dob").value = user.dob || "";

  // Tabs
  document.querySelectorAll("[data-account-tab]").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll("[data-account-tab]")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.dataset.accountTab;
      document.querySelectorAll("[data-account-panel]").forEach((p) => {
        p.style.display = p.dataset.accountPanel === target ? "block" : "none";
      });
    });
  });

  // Open tab from URL hash (e.g. account.html#orders from checkout confirmation)
  const hashTab = window.location.hash.replace("#", "");
  if (hashTab) {
    const matchingTab = document.querySelector(
      `[data-account-tab="${hashTab}"]`,
    );
    if (matchingTab) matchingTab.click();
  }

  // Orders
  const ordersList = document.getElementById("orders-list");
  const ordersEmpty = document.getElementById("orders-empty");
  if (RF_STATE.orders.length === 0) {
    ordersEmpty.style.display = "block";
  } else {
    ordersList.innerHTML = RF_STATE.orders
      .slice()
      .reverse()
      .map(rfOrderRowHTML)
      .join("");
    ordersList.querySelectorAll("[data-view-order]").forEach((btn) => {
      btn.addEventListener("click", () =>
        rfToast(
          (RF_STATE.lang === "vi" ? "Đơn hàng " : "Order ") +
            "#" +
            btn.dataset.viewOrder,
        ),
      );
    });
  }

  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();
    RF_STATE.user.name = document.getElementById("profile-name").value;
    RF_STATE.user.email = document.getElementById("profile-email").value;
    RF_STATE.user.phone = document.getElementById("profile-phone").value;
    RF_STATE.user.dob = document.getElementById("profile-dob").value;
    rfSaveStore();
    document.getElementById("account-name-display").textContent =
      RF_STATE.user.name;
    document.getElementById("avatar-initial").textContent = RF_STATE.user.name
      .charAt(0)
      .toUpperCase();
    rfToast(RF_STATE.lang === "vi" ? "Đã lưu thay đổi!" : "Changes saved!");
  });

  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    rfLogout();
    rfToast(RF_STATE.lang === "vi" ? "Đã đăng xuất" : "Signed out");
    setTimeout(() => (window.location.href = "index.html"), 600);
  });
}
