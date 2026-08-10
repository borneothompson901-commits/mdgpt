(function () {
  "use strict";

  /* ======================================================================
   * KONFIGURASI SUPABASE
   * Sama seperti project yang dipakai cart.js / products-data.js. Pendaftaran
   * TIDAK insert langsung ke tabel dari client — semua lewat edge function
   * `affiliate-register`, yang juga otomatis membuatkan akun Supabase Auth
   * untuk affiliate tsb (tanpa role/hak akses apapun; RLS di tabel affiliates
   * tidak mengizinkan insert/update dari client sama sekali).
   * ==================================================================== */
  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };
  var REGISTER_ENDPOINT = SUPABASE_URL + "/functions/v1/affiliate-register";

  /* Halaman katalog yang dituju oleh link affiliate */
  var CATALOG_URL = "https://mdgpt.id/lingua/";
  var LOCAL_KEY = "mdgpt_affiliate_me";

  /* ---------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------
   * Dashboard render
   * ------------------------------------------------------------------- */
  function renderDashboard(affiliate) {
    $("#affHero").classList.add("is-hidden");
    $("#affBenefitsSection").classList.add("is-hidden");
    $("#affStepsSection").classList.add("is-hidden");
    $("#affFormSection").classList.add("is-hidden");

    var dash = $("#affDashboard");
    dash.classList.add("is-visible");

    $("#affWelcomeName").textContent = affiliate.name ? affiliate.name.split(" ")[0] : "";

    var refUrl = CATALOG_URL + "?ref=" + encodeURIComponent(affiliate.ref_code);
    $("#affLinkUrl").textContent = refUrl;
    $("#affLinkUrl").dataset.url = refUrl;

    $("#affStatClicks").textContent = affiliate.total_clicks != null ? affiliate.total_clicks : "0";
    $("#affStatOrders").textContent = affiliate.total_orders != null ? affiliate.total_orders : "0";
    $("#affStatCommission").textContent =
      "Rp" + Number(affiliate.total_commission || 0).toLocaleString("id-ID");
  }

  /* ---------------------------------------------------------------------
   * Daftar affiliate baru (via edge function, bukan insert langsung)
   * ------------------------------------------------------------------- */
  function registerAffiliate(payload) {
    return fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: SUPABASE_HEADERS,
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          var err = new Error(result.data && result.data.error ? result.data.error : "Gagal mendaftar.");
          err.isServerMessage = true;
          throw err;
        }
        return result.data;
      });
  }

  /* ---------------------------------------------------------------------
   * Ambil statistik terbaru (klik/order/komisi) dari view publik, biar
   * dashboard nggak nyangkut di angka nol/awal pas baru daftar.
   * ------------------------------------------------------------------- */
  function refreshStats(existing) {
    var url = SUPABASE_URL + "/rest/v1/affiliate_public_stats?ref_code=eq." +
      encodeURIComponent(existing.ref_code) + "&select=total_clicks,total_orders,total_commission";
    fetch(url, { headers: SUPABASE_HEADERS })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (rows) {
        if (!rows || !rows[0]) return;
        var merged = Object.assign({}, existing, rows[0]);
        saveLocal(merged);
        renderDashboard(merged);
      })
      .catch(function () {
        /* biarkan angka lama tampil kalau refresh gagal */
      });
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */
  function init() {
    // Kalau sudah pernah daftar di browser ini, langsung tampilkan dashboard
    var existing = loadLocal();
    if (existing && existing.ref_code) {
      renderDashboard(existing);
      refreshStats(existing);
    }

    var form = $("#affForm");
    if (!form) return;

    var nameField = $("#affFieldName");
    var waField = $("#affFieldWa");
    var emailField = $("#affFieldEmail");
    var consentField = $("#affFieldConsent");
    var submitBtn = $("#affSubmitBtn");
    var submitError = $("#affSubmitError");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitError.classList.remove("is-visible");

      var name = $("#affName").value.trim();
      var wa = $("#affWa").value.trim();
      var email = $("#affEmail").value.trim();
      var agreed = $("#affConsent").checked;

      var valid = true;
      [nameField, waField, emailField, consentField].forEach(clearFieldError);

      if (name.length < 3) {
        fieldError(nameField, "Nama minimal 3 karakter.");
        valid = false;
      }
      if (!isValidWhatsapp(wa)) {
        fieldError(waField, "Nomor WhatsApp tidak valid.");
        valid = false;
      }
      if (!isValidEmail(email)) {
        fieldError(emailField, "Format email tidak valid.");
        valid = false;
      }
      if (!agreed) {
        fieldError(consentField, "Kamu harus menyetujui ketentuan affiliate.");
        valid = false;
      }
      if (!valid) return;

      var payload = {
        name: name,
        whatsapp: normalizeWhatsapp(wa),
        email: email.toLowerCase()
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Memproses...";

      registerAffiliate(payload)
        .then(function (affiliate) {
          saveLocal(affiliate);
          renderDashboard(affiliate);
          showToast("Pendaftaran berhasil!");
        })
        .catch(function (err) {
          var msg = (err && err.isServerMessage && err.message) || "Gagal mendaftar. Coba lagi sebentar lagi.";
          submitError.textContent = msg;
          submitError.classList.add("is-visible");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Daftar Jadi Affiliate";
        });
    });

    // Copy link
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

    // Share via WhatsApp
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
})();
