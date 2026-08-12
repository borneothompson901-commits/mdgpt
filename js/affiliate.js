(function () {
  "use strict";

  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_TABLE = "affiliates";
  var REGISTER_ENDPOINT = SUPABASE_URL + "/functions/v1/affiliate-register";
  var STATS_ENDPOINT = SUPABASE_URL + "/rest/v1/rpc/get_affiliate_stats";
  var CONFIG_ENDPOINT = SUPABASE_URL + "/rest/v1/affiliate_config?select=komisi_persen&limit=1";
  var SUPABASE_FN_HEADERS = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + SUPABASE_ANON_KEY
  };
  var DEFAULT_COMMISSION_PERSEN = 10;
  var currentCommissionPersen = DEFAULT_COMMISSION_PERSEN;

  var CATALOG_URL = "https://mdgpt.id/lingua/";
  var COOKIE_NAME = "mdgpt_ref";
  var COOKIE_DAYS = 14;
  var LOCAL_KEY = "mdgpt_affiliate_me";

  var supabaseReady = !!window.supabase;
  var sb = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function digitsOnly(str) {
    return (str || "").replace(/\D/g, "");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidWhatsapp(num) {
    var d = digitsOnly(num);
    return d.length >= 9 && d.length <= 14;
  }

  function normalizeWhatsapp(num) {
    var d = digitsOnly(num);
    if (d.charAt(0) === "0") d = "62" + d.slice(1);
    if (d.slice(0, 2) !== "62") d = "62" + d;
    return d;
  }

  function slugFromName(name) {
    var base = (name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 8);
    if (!base) base = "aff";
    return base;
  }

  function randomSuffix(len) {
    var chars = "abcdefghjkmnpqrstuvwxyz23456789";
    var out = "";
    for (var i = 0; i < len; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }

  function generateRefCode() {
    return randomSuffix(8).toUpperCase();
  }

  function nameFromEmail(email) {
    var local = (email || "").split("@")[0] || "";
    local = local.replace(/[^a-zA-Z0-9]+/g, " ").trim();
    if (!local) return "Affiliate";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
  }

  function saveLocal(data) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function loadCommissionConfig() {
    return fetch(CONFIG_ENDPOINT, { headers: SUPABASE_FN_HEADERS })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (rows) {
        var row = rows && rows[0];
        var persen = row && row.komisi_persen != null ? Number(row.komisi_persen) : DEFAULT_COMMISSION_PERSEN;
        currentCommissionPersen = persen;
        var badge = $("#affBenefitCommission");
        if (badge) badge.textContent = persen + "%";
        return persen;
      })
      .catch(function () {
        return currentCommissionPersen;
      });
  }

  function showToast(msg) {
    var toast = $("#affToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function fieldError(fieldEl, msg) {
    fieldEl.classList.add("has-error");
    var err = fieldEl.querySelector(".aff-field__error");
    if (err) err.textContent = msg;
  }

  function clearFieldError(fieldEl) {
    fieldEl.classList.remove("has-error");
  }

  function renderDashboard(affiliate, viaSession) {
    var formSection = $("#affFormSection");
    if (formSection) formSection.classList.add("is-hidden");

    var benefits = $("#affBenefits");
    if (benefits) benefits.classList.add("is-hidden");

    var dash = $("#affDashboard");
    if (dash) dash.classList.add("is-visible");

    var logoutBtn = $("#affLogoutBtn");
    if (logoutBtn) logoutBtn.hidden = false;

    var cover = $("#affCover");
    if (cover) cover.classList.add("is-dashboard");
    var meta = $("#affProfileMeta");
    if (meta) meta.classList.add("is-visible");

    var firstName = affiliate.name ? affiliate.name.split(" ")[0] : "kamu";
    var welcome = $("#affWelcomeName");
    if (welcome) welcome.textContent = firstName;
    var avatar = $("#affAvatar");
    if (avatar) avatar.textContent = firstName ? firstName.charAt(0) : "A";

    var refUrl = CATALOG_URL + "?ref=" + encodeURIComponent(affiliate.ref_code);
    var linkUrl = $("#affLinkUrl");
    if (linkUrl) {
      linkUrl.textContent = refUrl;
      linkUrl.dataset.url = refUrl;
    }
    var infoName = $("#affInfoName");
    if (infoName) infoName.textContent = affiliate.name || "—";
    var infoEmail = $("#affInfoEmail");
    if (infoEmail) infoEmail.textContent = affiliate.email || "—";
    var infoWa = $("#affInfoWa");
    if (infoWa) infoWa.textContent = affiliate.whatsapp ? "+" + affiliate.whatsapp : "—";
    var infoCommission = $("#affInfoCommission");
    if (infoCommission) {
      infoCommission.textContent = affiliate.commission_rate != null ? Number(affiliate.commission_rate) + "%" : "—";
    }

    var clicks = $("#affStatClicks");
    if (clicks) clicks.textContent = affiliate.total_clicks != null ? affiliate.total_clicks : "0";
    var orders = $("#affStatOrders");
    if (orders) orders.textContent = affiliate.total_orders != null ? affiliate.total_orders : "0";
    var commission = $("#affStatCommission");
    if (commission) commission.textContent = "Rp" + Number(affiliate.total_commission || 0).toLocaleString("id-ID");

    renderClicksChart(affiliate);
  }

  var DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  var WEEK_WEIGHTS = [0.1, 0.12, 0.11, 0.15, 0.16, 0.2, 0.16];

  function seededWeights(seed) {
    var out = WEEK_WEIGHTS.slice();
    var s = 0;
    for (var i = 0; i < seed.length; i++) s += seed.charCodeAt(i);
    var shift = s % out.length;
    return out.slice(shift).concat(out.slice(0, shift));
  }

  function renderClicksChart(affiliate) {
    var container = $("#affChart");
    var totalEl = $("#affChartTotal");
    if (!container) return;

    var total = Number(affiliate.total_clicks || 0);
    if (totalEl) totalEl.textContent = total.toLocaleString("id-ID") + " klik";

    var weights = seededWeights(affiliate.ref_code || "aff");
    var today = new Date().getDay();
    var values = [];
    for (var i = 6; i >= 0; i--) {
      var dayIndex = (today - i + 7) % 7;
      values.push({
        day: DAY_LABELS[dayIndex],
        value: Math.round(total * weights[6 - i])
      });
    }

    var max = Math.max.apply(null, values.map(function (v) { return v.value; })) || 1;

    container.innerHTML = "";
    values.forEach(function (v) {
      var bar = document.createElement("div");
      bar.className = "aff-chart-bar";

      var col = document.createElement("div");
      col.className = "aff-chart-bar__col";
      col.style.height = Math.max(4, Math.round((v.value / max) * 100)) + "%";
      col.title = v.day + ": " + v.value + " klik";

      var label = document.createElement("span");
      label.className = "aff-chart-bar__day";
      label.textContent = v.day;

      bar.appendChild(col);
      bar.appendChild(label);
      container.appendChild(bar);
    });
  }

  function fetchOwnAffiliateRow() {
    if (!sb) return Promise.resolve(null);
    return sb
      .from(SUPABASE_TABLE)
      .select("*")
      .single()
      .then(function (res) {
        return res.error ? null : res.data;
      });
  }

  function loadSessionDashboard() {
    if (!sb) return Promise.resolve(false);
    return sb.auth.getSession().then(function (res) {
      var session = res.data && res.data.session;
      if (!session) return false;
      return fetchOwnAffiliateRow().then(function (row) {
        if (!row) return false;
        saveLocal(row);
        renderDashboard(row, true);
        return true;
      });
    });
  }

  function loginWithPassword(email, password) {
    if (!sb) return Promise.reject(new Error("Layanan login belum siap."));
    return sb.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      if (res.error) throw res.error;
      return loadSessionDashboard();
    });
  }

  function initAuthViewSwitcher() {
    var loginView = $("#affLoginView");
    var signupView = $("#affSignupView");
    var toLogin = $("#affSignupToggle");
    var toSignup = $("#affLoginToggle");
    var visualBrand = $("#affAuthVisualBrand");
    if (!loginView || !signupView) return;

    function showLogin() {
      signupView.hidden = true;
      signupView.classList.remove("is-active");
      loginView.hidden = false;
      loginView.classList.add("is-active");
      if (visualBrand) visualBrand.textContent = "Login";
    }

    function showSignup() {
      loginView.hidden = true;
      loginView.classList.remove("is-active");
      signupView.hidden = false;
      signupView.classList.add("is-active");
      if (visualBrand) visualBrand.textContent = "Sign Up";
    }

    if (toSignup) toSignup.addEventListener("click", showSignup);
    if (toLogin) toLogin.addEventListener("click", showLogin);
  }

  function initPasswordToggles() {
    var toggles = document.querySelectorAll(".aff-eye-toggle");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-target");
        var input = document.getElementById(targetId);
        if (!input) return;
        var showing = btn.classList.toggle("is-visible");
        input.type = showing ? "text" : "password";
        btn.setAttribute("aria-label", showing ? "Sembunyikan password" : "Tampilkan password");
      });
    });
  }

  function initLoginPanel() {
    var emailField = $("#affLoginEmailField");
    var emailInput = $("#affLoginEmail");
    var passwordField = $("#affLoginPasswordField");
    var passwordInput = $("#affLoginPassword");
    var submitBtn = $("#affLoginSubmitBtn");
    var errorEl = $("#affLoginError");
    if (!submitBtn) return;

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.add("is-visible");
    }
    function clearError() {
      errorEl.classList.remove("is-visible");
    }

    submitBtn.addEventListener("click", function () {
      clearError();
      var email = (emailInput.value || "").trim().toLowerCase();
      var password = passwordInput.value || "";
      [emailField, passwordField].forEach(clearFieldError);

      var valid = true;
      if (!isValidEmail(email)) {
        fieldError(emailField, "Format email tidak valid.");
        valid = false;
      }
      if (!password) {
        fieldError(passwordField, "Password salah.");
        valid = false;
      }
      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.querySelector("span").textContent = "Memeriksa...";
      loginWithPassword(email, password)
        .then(function (ok) {
          if (!ok) showError("Email atau password salah.");
        })
        .catch(function (err) {
          showError((err && err.message) || "Email atau password salah.");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.querySelector("span").textContent = "Masuk";
        });
    });

    var logoutBtn = $("#affLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        if (sb) sb.auth.signOut();
        try {
          localStorage.removeItem(LOCAL_KEY);
        } catch (e) {}
        window.location.reload();
      });
    }
  }

  function registerAffiliate(payload) {
    return fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, SUPABASE_FN_HEADERS),
      body: JSON.stringify({
        name: payload.name,
        whatsapp: payload.whatsapp,
        email: payload.email,
        password: payload.password
      })
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data && data.error ? data.error : "Gagal mendaftar.");
        return data;
      });
    });
  }

  function refreshStats(affiliate) {
    if (!affiliate || !affiliate.id) return;
    fetch(STATS_ENDPOINT, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, SUPABASE_FN_HEADERS),
      body: JSON.stringify({ p_affiliate_id: affiliate.id })
    })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (rows) {
        var stats = rows && rows[0];
        if (!stats) return;
        var updated = Object.assign({}, affiliate, stats);
        saveLocal(updated);
        renderDashboard(updated);
      })
      .catch(function () {});
  }

  function init() {
    initAuthViewSwitcher();
    initPasswordToggles();
    initLoginPanel();
    loadCommissionConfig();

    loadSessionDashboard().then(function (loggedIn) {
      if (loggedIn) return;
      var existing = loadLocal();
      if (existing && existing.ref_code) {
        renderDashboard(existing, false);
        refreshStats(existing);
      }
    });

    var form = $("#affForm");
    if (!form) return;

    var waField = $("#affFieldWa");
    var emailField = $("#affFieldEmail");
    var passwordField = $("#affFieldPassword");
    var consentField = $("#affFieldConsent");
    var submitBtn = $("#affSubmitBtn");
    var submitError = $("#affSubmitError");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitError.classList.remove("is-visible");

      var wa = $("#affWa").value.trim();
      var email = $("#affEmail").value.trim();
      var password = $("#affPassword").value;
      var agreed = $("#affConsent").checked;

      var valid = true;
      [waField, emailField, passwordField, consentField].forEach(clearFieldError);

      if (!isValidWhatsapp(wa)) {
        fieldError(waField, "Nomor WhatsApp tidak valid.");
        valid = false;
      }
      if (!isValidEmail(email)) {
        fieldError(emailField, "Format email tidak valid.");
        valid = false;
      }
      if (password.length < 6) {
        fieldError(passwordField, "Password minimal 6 karakter.");
        valid = false;
      }
      if (!agreed) {
        fieldError(consentField, "Kamu harus menyetujui ketentuan affiliate.");
        valid = false;
      }
      if (!valid) return;

      var payload = {
        name: nameFromEmail(email),
        whatsapp: normalizeWhatsapp(wa),
        email: email.toLowerCase(),
        password: password,
        ref_code: generateRefCode(),
        commission_rate: currentCommissionPersen,
        total_clicks: 0,
        total_orders: 0,
        total_commission: 0
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Memproses...";

      registerAffiliate(payload)
        .then(function (affiliate) {
          saveLocal(affiliate);
          renderDashboard(affiliate, true);
          showToast("Clingg! Akun kamu berhasil terdaftar.");
          if (sb) {
            sb.auth.signInWithPassword({ email: payload.email, password: payload.password }).catch(function () {});
          }
        })
        .catch(function (err) {
          var msg = "Gagal mendaftar. Coba lagi sebentar lagi.";
          if (err && /duplicate|unique/i.test(err.message || "")) {
            msg = "Email atau nomor WhatsApp ini sudah terdaftar sebagai affiliate.";
          }
          submitError.textContent = msg;
          submitError.classList.add("is-visible");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Daftar Jadi Affiliate";
        });
    });

    var termsLink = $("#affTermsLink");
    var termsOverlay = $("#affTermsOverlay");
    var termsClose = $("#affTermsClose");
    var termsAgree = $("#affTermsAgree");
    var termsScrollY = 0;

    function lockPageScroll() {
      termsScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + termsScrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.classList.add("aff-scroll-lock");
    }

    function unlockPageScroll() {
      document.body.classList.remove("aff-scroll-lock");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, termsScrollY);
    }

    function openTerms(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (termsOverlay) termsOverlay.hidden = false;
      lockPageScroll();
    }

    function closeTerms(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (termsOverlay) termsOverlay.hidden = true;
      unlockPageScroll();
    }

    if (termsLink) termsLink.addEventListener("click", openTerms);
    if (termsClose) termsClose.addEventListener("click", closeTerms);
    if (termsAgree) termsAgree.addEventListener("click", closeTerms);
    if (termsOverlay) {
      termsOverlay.addEventListener("click", function (e) {
        if (e.target === termsOverlay) closeTerms(e);
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && termsOverlay && !termsOverlay.hidden) closeTerms(e);
    });

    var copyBtn = $("#affCopyBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = $("#affLinkUrl").dataset.url || "";
        if (!url) return;
        var done = function () {
          copyBtn.classList.add("is-copied");
          copyBtn.textContent = "Tersalin";
          showToast("Link disalin ke clipboard");
          setTimeout(function () {
            copyBtn.classList.remove("is-copied");
            copyBtn.textContent = "Salin";
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        }
      });
    }

    var shareBtn = $("#affShareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        var url = $("#affLinkUrl").dataset.url || "";
        var text = encodeURIComponent(
          "Cek katalog produk digital M-DGPT di sini, banyak template & tools siap pakai: " + url
        );
        window.open("https://wa.me/?text=" + text, "_blank");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.MdgptAffiliate = {
    COOKIE_NAME: COOKIE_NAME,
    COOKIE_DAYS: COOKIE_DAYS,
    setCookie: setCookie
  };
})();
