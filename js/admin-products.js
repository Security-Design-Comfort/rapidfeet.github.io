/* ==========================================================================
   RAPIDFEET — Admin Products CRUD (mock, localStorage-backed)
   ========================================================================== */

const RF_ADMIN_PRODUCTS_KEY = "rapidfeet_admin_products_v1";

function rfLoadAdminProducts() {
  try {
    const raw = localStorage.getItem(RF_ADMIN_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return RF_PRODUCTS.slice(); // seed from base catalog
}
let RF_ADMIN_PRODUCTS = rfLoadAdminProducts();
function rfSaveAdminProducts() {
  localStorage.setItem(
    RF_ADMIN_PRODUCTS_KEY,
    JSON.stringify(RF_ADMIN_PRODUCTS),
  );
}

function rfStockPillHTML(stock) {
  if (stock === 0) return `<span class="stock-pill out">Out of stock</span>`;
  if (stock < 6) return `<span class="stock-pill low">${stock} left</span>`;
  return `<span class="stock-pill in">In stock</span>`;
}

function rfAdminRowHTML(p) {
  return `
  <tr data-row-id="${p.id}">
    <td><img src="${p.image}" alt="${p.name}"></td>
    <td><strong>${p.name}</strong><div class="text-faint" style="font-size:11px;">${p.sku}</div></td>
    <td>${p.brand}</td>
    <td>${p.category}</td>
    <td>${rfFormatVND(p.price)}</td>
    <td>${p.stock}</td>
    <td><div class="d-flex gap-1">${p.colors
      .slice(0, 3)
      .map(
        (c) =>
          `<span style="width:14px;height:14px;border-radius:50%;background:${RF_COLORS[c] || "#ccc"};border:1px solid var(--border);display:inline-block;" title="${c}"></span>`,
      )
      .join("")}</div></td>
    <td>${rfStockPillHTML(p.stock)}</td>
    <td>
      <div class="admin-row-actions">
        <button data-edit="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button>
        <button data-delete="${p.id}" class="danger" title="Delete"><i class="bi bi-trash3"></i></button>
      </div>
    </td>
  </tr>`;
}

let RF_PENDING_DELETE_ID = null;

function rfRenderAdminTable() {
  const search = document.getElementById("admin-search").value.toLowerCase();
  const catFilter = document.getElementById("admin-filter-category").value;
  const stockFilter = document.getElementById("admin-filter-stock").value;

  let list = RF_ADMIN_PRODUCTS.filter((p) => {
    if (
      search &&
      !(
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
      )
    )
      return false;
    if (catFilter && p.category !== catFilter) return false;
    if (stockFilter === "in" && p.stock < 6) return false;
    if (stockFilter === "low" && !(p.stock > 0 && p.stock < 6)) return false;
    if (stockFilter === "out" && p.stock !== 0) return false;
    return true;
  });

  document.getElementById("admin-products-body").innerHTML = list
    .map(rfAdminRowHTML)
    .join("");
  document.getElementById("admin-no-results").style.display = list.length
    ? "none"
    : "block";
  document.getElementById("admin-result-count").textContent = list.length;
  document.getElementById("admin-total-count").textContent =
    RF_ADMIN_PRODUCTS.length;

  document
    .querySelectorAll("[data-edit]")
    .forEach((btn) =>
      btn.addEventListener("click", () => rfOpenProductModal(btn.dataset.edit)),
    );
  document.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => {
      RF_PENDING_DELETE_ID = btn.dataset.delete;
      document.getElementById("delete-modal").classList.add("open");
    }),
  );
}

function rfOpenProductModal(id) {
  const form = document.getElementById("product-form");
  form.reset();
  if (id) {
    const p = RF_ADMIN_PRODUCTS.find((x) => x.id === id);
    document.getElementById("modal-title").textContent = "Edit Product";
    document.getElementById("pf-id").value = p.id;
    document.getElementById("pf-name").value = p.name;
    document.getElementById("pf-sku").value = p.sku;
    document.getElementById("pf-brand").value = p.brand;
    document.getElementById("pf-category").value = p.category;
    document.getElementById("pf-price").value = p.price;
    document.getElementById("pf-stock").value = p.stock;
    document.getElementById("pf-gender").value = p.gender;
    document.getElementById("pf-image").value = p.image;
    document.getElementById("pf-colors").value = p.colors.join(", ");
    document.getElementById("pf-sizes").value = p.sizes.join(", ");
    document.getElementById("pf-desc-en").value = p.description_en || "";
  } else {
    document.getElementById("modal-title").textContent = "Add Product";
    document.getElementById("pf-id").value = "";
    document.getElementById("pf-image").value = rfImg(
      "admin-new-" + Date.now(),
    );
  }
  document.getElementById("product-modal").classList.add("open");
}

function rfInitAdminProducts() {
  // populate dropdowns
  const catSelect = document.getElementById("admin-filter-category");
  RF_CATEGORIES.forEach((c) =>
    catSelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${c}">${c}</option>`,
    ),
  );
  const pfBrand = document.getElementById("pf-brand");
  RF_BRANDS.forEach((b) =>
    pfBrand.insertAdjacentHTML(
      "beforeend",
      `<option value="${b}">${b}</option>`,
    ),
  );
  const pfCategory = document.getElementById("pf-category");
  RF_CATEGORIES.forEach((c) =>
    pfCategory.insertAdjacentHTML(
      "beforeend",
      `<option value="${c}">${c}</option>`,
    ),
  );

  rfRenderAdminTable();

  document
    .getElementById("admin-search")
    .addEventListener("input", rfRenderAdminTable);
  document
    .getElementById("admin-filter-category")
    .addEventListener("change", rfRenderAdminTable);
  document
    .getElementById("admin-filter-stock")
    .addEventListener("change", rfRenderAdminTable);

  document
    .getElementById("add-product-btn")
    .addEventListener("click", () => rfOpenProductModal(null));
  document
    .getElementById("close-modal-btn")
    .addEventListener("click", () =>
      document.getElementById("product-modal").classList.remove("open"),
    );
  document
    .getElementById("cancel-modal-btn")
    .addEventListener("click", () =>
      document.getElementById("product-modal").classList.remove("open"),
    );

  document.getElementById("save-product-btn").addEventListener("click", () => {
    const form = document.getElementById("product-form");
    let valid = true;
    [
      "pf-name",
      "pf-sku",
      "pf-brand",
      "pf-category",
      "pf-price",
      "pf-stock",
    ].forEach((id) => {
      const el = document.getElementById(id);
      const ok = el.checkValidity();
      el.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;

    const id = document.getElementById("pf-id").value;
    const colors = document
      .getElementById("pf-colors")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const sizes = document
      .getElementById("pf-sizes")
      .value.split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const data = {
      id: id || "P" + Date.now(),
      name: document.getElementById("pf-name").value,
      sku: document.getElementById("pf-sku").value,
      brand: document.getElementById("pf-brand").value,
      category: document.getElementById("pf-category").value,
      price: parseInt(document.getElementById("pf-price").value),
      oldPrice: null,
      stock: parseInt(document.getElementById("pf-stock").value),
      gender: document.getElementById("pf-gender").value,
      image:
        document.getElementById("pf-image").value ||
        rfImg("admin-" + Date.now()),
      gallery: [
        document.getElementById("pf-image").value ||
          rfImg("admin-" + Date.now()),
      ],
      colors: colors.length ? colors : ["Jet Black"],
      sizes: sizes.length ? sizes : [40, 41, 42],
      rating: 4.5,
      reviews: 0,
      isNew: !id,
      onSale: false,
      description_en: document.getElementById("pf-desc-en").value,
      description_vi: document.getElementById("pf-desc-en").value,
    };

    if (id) {
      const idx = RF_ADMIN_PRODUCTS.findIndex((x) => x.id === id);
      RF_ADMIN_PRODUCTS[idx] = { ...RF_ADMIN_PRODUCTS[idx], ...data };
    } else {
      RF_ADMIN_PRODUCTS.unshift(data);
    }
    rfSaveAdminProducts();
    document.getElementById("product-modal").classList.remove("open");
    rfRenderAdminTable();
    rfToast(id ? "Product updated" : "Product added", "bi-check-circle-fill");
  });

  document.getElementById("cancel-delete-btn").addEventListener("click", () => {
    document.getElementById("delete-modal").classList.remove("open");
    RF_PENDING_DELETE_ID = null;
  });
  document
    .getElementById("confirm-delete-btn")
    .addEventListener("click", () => {
      RF_ADMIN_PRODUCTS = RF_ADMIN_PRODUCTS.filter(
        (p) => p.id !== RF_PENDING_DELETE_ID,
      );
      rfSaveAdminProducts();
      document.getElementById("delete-modal").classList.remove("open");
      rfRenderAdminTable();
      rfToast("Product deleted", "bi-trash3-fill");
    });
}
