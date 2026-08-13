(function () {
  "use strict";

  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_TABLE = "affiliates";
  var REGISTER_ENDPOINT = SUPABASE_URL + "/functions/v1/affiliate-register";
  var STATS_ENDPOINT = SUPABASE_URL + "/rest/v1/rpc/get_affiliate_stats";
  var DAILY_CLICKS_ENDPOINT = SUPABASE_URL + "/rest/v1/rpc/get_affiliate_clicks_daily";
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
        var infoCommission = $("#affInfoCommission");
        if (infoCommission) infoCommission.textContent = persen + "%";
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

  function setCtaLoggedIn(isLoggedIn) {
    var guestText = $("#affCtaGuestText");
    var loggedInText = $("#affCtaLoggedInText");
    var joinBtn = $("#affJoinCtaBtn");
    var contactBtn = $("#affContactCtaBtn");
    if (guestText) guestText.classList.toggle("is-hidden", isLoggedIn);
    if (joinBtn) joinBtn.classList.toggle("is-hidden", isLoggedIn);
    if (loggedInText) loggedInText.classList.toggle("is-hidden", !isLoggedIn);
    if (contactBtn) contactBtn.classList.toggle("is-hidden", !isLoggedIn);
  }

  function renderDashboard(affiliate, viaSession) {
    document.body.classList.remove("aff-auth-page");
    setCtaLoggedIn(true);

    var formSection = $("#affFormSection");
    if (formSection) formSection.classList.add("is-hidden");

    var benefits = $("#affBenefits");
    if (benefits) benefits.classList.add("is-hidden");

    var preFaq = $("#affPreFaqSection");
    if (preFaq) preFaq.classList.add("is-hidden");

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
    var infoEmail = $("#affInfoEmail");
    if (infoEmail) infoEmail.textContent = affiliate.email || "—";
    var infoWa = $("#affInfoWa");
    if (infoWa) infoWa.textContent = affiliate.whatsapp ? "+" + affiliate.whatsapp : "—";
    var infoCommission = $("#affInfoCommission");
    if (infoCommission) {
      infoCommission.textContent = currentCommissionPersen + "%";
    }

    var clicks = $("#affStatClicks");
    if (clicks) clicks.textContent = affiliate.total_clicks != null ? affiliate.total_clicks : "0";
    var orders = $("#affStatOrders");
    if (orders) orders.textContent = affiliate.total_orders != null ? affiliate.total_orders : "0";
    var commission = $("#affStatCommission");
    if (commission) commission.textContent = "Rp" + Number(affiliate.total_commission || 0).toLocaleString("id-ID");

    renderClicksChart(affiliate);
  }

  var lastChartAffiliate = null;
  var lastChartData = null;

  function fetchDailyClicks(affiliateId) {
    return fetch(DAILY_CLICKS_ENDPOINT, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, SUPABASE_FN_HEADERS),
      body: JSON.stringify({ p_affiliate_id: affiliateId })
    })
      .then(function (res) {
        return res.ok ? res.json() : [];
      })
      .catch(function () {
        return [];
      });
  }

  function formatDayLabel(dateStr) {
    // dateStr is "YYYY-MM-DD" from Postgres date; parse as local calendar date.
    var parts = dateStr.split("-");
    return parts[2] + "/" + parts[1];
  }

  function renderClicksChart(affiliate) {
    var container = $("#affChart");
    var totalEl = $("#affChartTotal");
    if (!container) return;

    lastChartAffiliate = affiliate;

    var total = Number(affiliate.total_clicks || 0);
    if (totalEl) totalEl.textContent = total.toLocaleString("id-ID") + " klik";

    if (!affiliate.id) return;

    fetchDailyClicks(affiliate.id).then(function (rows) {
      // rows: [{click_date: "2026-08-11", click_count: 3}, ...] — one row per
      // calendar day since the affiliate joined, real counts straight from
      // affiliate_clicks (no synthetic split, no rounding of an estimate).
      if (!rows || !rows.length) {
        container.innerHTML = '<p class="aff-chart-empty">Belum ada data klik.</p>';
        return;
      }
      var values = rows.map(function (r) {
        return { day: formatDayLabel(r.click_date), value: Number(r.click_count || 0) };
      });
      lastChartData = values;
      drawClicksChart(container, values);
    });
  }

  function drawClicksChart(container, values) {
    var max = Math.max.apply(null, values.map(function (v) { return v.value; })) || 1;
    var width = container.clientWidth || 300;
    var height = 130;
    var padX = 12;
    var padY = 16;
    var span = Math.max(values.length - 1, 1);
    var stepX = (width - padX * 2) / span;

    var points = values.map(function (v, i) {
      return {
        x: values.length === 1 ? width / 2 : padX + stepX * i,
        y: padY + (1 - v.value / max) * (height - padY * 2),
        day: v.day,
        value: v.value
      };
    });

    var linePath = points
      .map(function (p, i) {
        return (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1);
      })
      .join(" ");

    var baseline = (height - padY).toFixed(1);
    var areaPath =
      linePath +
      " L" + points[points.length - 1].x.toFixed(1) + "," + baseline +
      " L" + points[0].x.toFixed(1) + "," + baseline +
      " Z";

    var dots = points
      .map(function (p) {
        return (
          '<circle class="aff-chart-dot" cx="' + p.x.toFixed(1) +
          '" cy="' + p.y.toFixed(1) + '" r="1.8"><title>' + p.day + ": " + p.value + " klik</title></circle>"
        );
      })
      .join("");

    var svg =
      '<svg class="aff-chart-svg" width="' + width + '" height="' + height +
      '" viewBox="0 0 ' + width + " " + height + '">' +
      '<path class="aff-chart-area" d="' + areaPath + '"></path>' +
      '<path class="aff-chart-line" d="' + linePath + '"></path>' +
      dots +
      "</svg>";

    // With many days on the axis, showing every label would overlap; keep
    // the real per-day points but thin out which labels are printed.
    var maxLabels = Math.max(Math.floor(width / 40), 2);
    var labelStride = Math.max(Math.ceil(values.length / maxLabels), 1);

    var labels =
      '<div class="aff-chart-labels">' +
      values
        .map(function (v, i) {
          var showLabel = i % labelStride === 0 || i === values.length - 1;
          return showLabel
            ? "<span>" + v.day + "</span>"
            : '<span class="is-hidden-label">' + v.day + "</span>";
        })
        .join("") +
      "</div>";

    container.innerHTML = svg + labels;
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

  var chartResizeTimer;
  window.addEventListener("resize", function () {
    if (!lastChartData) return;
    clearTimeout(chartResizeTimer);
    chartResizeTimer = setTimeout(function () {
      drawClicksChart($("#affChart"), lastChartData);
    }, 150);
  });

  window.MdgptAffiliate = {
    COOKIE_NAME: COOKIE_NAME,
    COOKIE_DAYS: COOKIE_DAYS,
    setCookie: setCookie
  };
})();
