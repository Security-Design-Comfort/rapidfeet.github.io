/* ==========================================================================
   RAPIDFEET — Auth pages logic (mock, no real backend)
   ========================================================================== */

function rfBindPasswordToggles() {
  document.querySelectorAll("[data-toggle-pw]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      const isPw = input.type === "password";
      input.type = isPw ? "text" : "password";
      btn.innerHTML = isPw
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
    });
  });
}

/* Demo-mode social auth: no real OAuth backend exists in this static build,
   so each provider button signs the visitor in as a mock user and redirects,
   mirroring the "any email/password works" pattern used by the standard form. */
function rfBindSocialButtons() {
  document.querySelectorAll(".social-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let provider = "Google";
      if (btn.querySelector(".bi-facebook")) provider = "Facebook";
      else if (btn.querySelector(".bi-instagram")) provider = "Instagram";

      rfLogin(`demo.${provider.toLowerCase()}@rapidfeet.vn`, "Demo User");
      rfToast(
        (RF_STATE.lang === "vi"
          ? "Đăng nhập thành công qua "
          : "Signed in via ") + provider,
      );
      setTimeout(() => (window.location.href = "account.html"), 700);
    });
  });
}

function rfInitLoginPage() {
  rfBindPasswordToggles();
  rfBindSocialButtons();
  const form = document.getElementById("login-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const ok = input.checkValidity();
      input.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;
    rfLogin(form.email.value);
    rfToast(
      RF_STATE.lang === "vi"
        ? "Đăng nhập thành công!"
        : "Signed in successfully!",
    );
    setTimeout(() => (window.location.href = "account.html"), 700);
  });
}

function rfInitRegisterPage() {
  rfBindPasswordToggles();
  rfBindSocialButtons();
  const pwInput = document.getElementById("reg-password");
  const strengthBars = document.querySelectorAll(".pw-strength i");
  pwInput.addEventListener("input", () => {
    const val = pwInput.value;
    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const colors = ["var(--err)", "var(--warn)", "var(--ok)", "var(--ok)"];
    strengthBars.forEach((bar, i) => {
      bar.style.background = i < score ? colors[score - 1] : "var(--border)";
    });
  });

  const form = document.getElementById("register-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("input[required]").forEach((input) => {
      const ok = input.checkValidity();
      input.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    const confirm = document.getElementById("reg-confirm");
    if (pwInput.value !== confirm.value) {
      confirm.classList.add("is-invalid");
      valid = false;
    } else {
      confirm.classList.remove("is-invalid");
    }
    if (!valid) return;
    const location = {
      city: form.city.value || "",
      district: form.district.value || "",
      street: "",
      postal: "",
    };
    rfLogin(form.email.value, form.fullname.value, location);
    rfToast(
      RF_STATE.lang === "vi" ? "Tạo tài khoản thành công!" : "Account created!",
    );
    setTimeout(() => (window.location.href = "account.html"), 700);
  });
}

function rfInitResetPasswordPage() {
  rfBindPasswordToggles();
  const form = document.getElementById("reset-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll("[required]").forEach((input) => {
      const ok = input.checkValidity();
      input.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (form.password.value !== form.confirm.value) {
      form.confirm.classList.add("is-invalid");
      valid = false;
    }
    if (!valid) return;
    document.getElementById("reset-view").style.display = "none";
    document.getElementById("done-view").style.display = "block";
  });
}
