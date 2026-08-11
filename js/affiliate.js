(function () {
  "use strict";

  /* ======================================================================
   * KONFIGURASI SUPABASE
   * Isi 2 nilai di bawah ini dari Project Settings > API di dashboard
   * Supabase kamu. SUPABASE_ANON_KEY aman dipakai di client selama
   * Row Level Security (RLS) sudah diaktifkan (lihat sql/affiliate_schema.sql).
   * ==================================================================== */
  var SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
  var SUPABASE_ANON_KEY = "YOUR-SUPABASE-ANON-PUBLIC-KEY";
  var SUPABASE_TABLE = "affiliates";

  /* Halaman katalog yang dituju oleh link affiliate + lama cookie tracking */
  var CATALOG_URL = "https://mdgpt.id/lingua/";
  var COOKIE_NAME = "mdgpt_ref";
  var COOKIE_DAYS = 14;
  var LOCAL_KEY = "mdgpt_affiliate_me";

  var supabaseReady = !!(window.supabase && SUPABASE_URL.indexOf("YOUR-PROJECT-REF") === -1);
  var sb = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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

  function generateRefCode(name) {
    return (slugFromName(name) + "-" + randomSuffix(5)).toUpperCase();
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
    var codeChip = $("#affRefCode");
    if (codeChip) codeChip.textContent = affiliate.ref_code || "—";

    $("#affStatClicks").textContent = affiliate.total_clicks != null ? affiliate.total_clicks : "0";
    $("#affStatOrders").textContent = affiliate.total_orders != null ? affiliate.total_orders : "0";
    $("#affStatCommission").textContent =
      "Rp" + Number(affiliate.total_commission || 0).toLocaleString("id-ID");
  }

  /* ---------------------------------------------------------------------
   * Supabase: daftar affiliate baru
   * ------------------------------------------------------------------- */
  function registerAffiliate(payload) {
    if (!sb) {
      // Supabase belum dikonfigurasi — tetap lanjutkan secara lokal
      // supaya halaman tetap bisa didemokan sebelum backend disambungkan.
      return Promise.resolve(payload);
    }
    return sb
      .from(SUPABASE_TABLE)
      .insert([payload])
      .select()
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data || payload;
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
        email: email.toLowerCase(),
        ref_code: generateRefCode(name),
        commission_rate: 10,
        total_clicks: 0,
        total_orders: 0,
        total_commission: 0
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

  // Diekspos untuk dipakai ulang oleh halaman lain kalau perlu (misalnya
  // dari catalog page untuk membaca konstanta cookie yang sama).
  window.MdgptAffiliate = {
    COOKIE_NAME: COOKIE_NAME,
    COOKIE_DAYS: COOKIE_DAYS,
    setCookie: setCookie
  };
})();
