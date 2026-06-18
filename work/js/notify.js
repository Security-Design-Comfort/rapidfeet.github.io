/* ==========================================================================
   RAPIDFEET — Email notifications (contact form, checkout, account forms)
   ========================================================================== */

const RF_NOTIFY_ENDPOINT = "https://formspree.io/f/mzdqldzb";
const RF_NOTIFY_FALLBACK_EMAIL = "vietdv.25ns@vku.udn.vn";

function rfNotifyConfigured() {
  return !RF_NOTIFY_ENDPOINT.includes("YOUR_FORM_ID");
}

/* Sends `fields` (plain object) to the configured form backend.
   Returns a Promise<boolean> — true if it was handed off successfully. */
async function rfSendNotification(fields, subjectLine) {
  if (rfNotifyConfigured()) {
    try {
      const res = await fetch(RF_NOTIFY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ...fields, _subject: subjectLine }),
      });
      if (res.ok) return true;
      console.warn(
        "rfSendNotification: form backend responded with",
        res.status,
      );
      return false;
    } catch (err) {
      console.warn("rfSendNotification: request failed", err);
      return false;
    }
  } else {
    // Fallback: open a pre-filled mailto: link so the message still reaches
    // the site owner's inbox, just via the visitor's own email client.
    const bodyLines = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    const mailto = `mailto:${RF_NOTIFY_FALLBACK_EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyLines)}`;
    window.open(mailto, "_blank");
    return true;
  }
}

/* ---------------- CONTACT FORM ---------------- */
function rfInitContactNotifications() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((el) => {
      if (!el.checkValidity()) {
        valid = false;
        el.classList.add("is-invalid");
      } else el.classList.remove("is-invalid");
    });
    if (!valid) return;

    const fd = new FormData(form);
    const fields = Object.fromEntries(fd.entries());
    const btn = document.getElementById("contact-submit-btn");
    if (btn) {
      btn.disabled = true;
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    }

    const ok = await rfSendNotification(
      fields,
      `New contact message from ${fields.name || "a visitor"} — Rapidfeet`,
    );

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText;
    }
    if (ok) {
      rfToast(RF_STATE.lang === "vi" ? "Đã gửi tin nhắn!" : "Message sent!");
      form.reset();
    } else {
      rfToast(
        RF_STATE.lang === "vi"
          ? "Gửi thất bại, vui lòng thử lại"
          : "Failed to send, please try again",
        "bi-x-circle-fill",
      );
    }
  });
}

/* ---------------- CHECKOUT ORDER ---------------- */
/* Called from checkout.js right after an order is placed. Fire-and-forget —
   never blocks the confirmation screen on whether the email succeeds. */
function rfSendOrderEmail(orderId) {
  const s = RF_CHECKOUT_DATA?.shipping || {};
  const p = RF_CHECKOUT_DATA?.payment || {};
  const lines = RF_STATE.cart.length
    ? RF_STATE.cart
    : RF_STATE.orders[RF_STATE.orders.length - 1]?.items || [];
  const itemsSummary = lines
    .map((l) => {
      const prod = rfGetProduct(l.productId);
      return prod
        ? `${prod.name} (${l.color}, EU ${l.size}) x${l.qty}`
        : `${l.productId} x${l.qty}`;
    })
    .join("; ");

  const fields = {
    order_id: orderId,
    customer_name: s.fullname || "",
    phone: s.phone || "",
    email: s.email || "",
    address: [s.address, s.district, s.city].filter(Boolean).join(", "),
    payment_method: p.method || "",
    items: itemsSummary || "(cart already cleared)",
  };
  rfSendNotification(fields, `New order ${orderId} — Rapidfeet`).catch(
    () => {},
  );
}

document.addEventListener("DOMContentLoaded", rfInitContactNotifications);
