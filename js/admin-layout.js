/* ==========================================================================
   RAPIDFEET — Admin shared layout
   ========================================================================== */

function rfAdminGuard() {
  if (localStorage.getItem("rapidfeet_admin_session") !== "1") {
    window.location.href = "admin-login.html";
    return false;
  }
  return true;
}

function rfAdminSidebarHTML(active) {
  const items = [
    {
      href: "admin-dashboard.html",
      icon: "bi-grid-1x2",
      label: "Dashboard",
      key: "dashboard",
    },
    {
      href: "admin-products.html",
      icon: "bi-box-seam",
      label: "Products",
      key: "products",
    },
    {
      href: "admin-orders.html",
      icon: "bi-receipt",
      label: "Orders",
      key: "orders",
    },
    {
      href: "admin-customers.html",
      icon: "bi-people",
      label: "Customers",
      key: "customers",
    },
  ];
  return items
    .map(
      (i) =>
        `<a href="${i.href}" class="${active === i.key ? "active" : ""}"><i class="bi ${i.icon}"></i> ${i.label}</a>`,
    )
    .join("");
}

function rfInjectAdminLayout(active) {
  const sidebarMount = document.getElementById("admin-sidebar-mount");
  if (sidebarMount) {
    sidebarMount.innerHTML = `
    <div style="padding:0 var(--sp-5) var(--sp-5);">
      <img src="assets/logo-full-white.svg" style="height:24px;" alt="Rapidfeet">
      <p class="mt-1" style="font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:rgba(250,250,248,.4);">Admin Console</p>
    </div>
    ${rfAdminSidebarHTML(active)}
    <div style="margin-top:auto; padding:var(--sp-5);">
      <a href="#" id="admin-logout-link" style="color:rgba(250,250,248,.65); font-size:var(--fs-sm);"><i class="bi bi-box-arrow-left"></i> Sign out</a>
    </div>`;
  }
  document
    .getElementById("admin-logout-link")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("rapidfeet_admin_session");
      window.location.href = "admin-login.html";
    });
}
