(function () {
  "use strict";

  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY
  };
  var CACHE_PREFIX = "lingua_cms_";

  var TRUST_ICON_RULES = [
    { match: ["original", "asli", "resmi", "official", "keaslian"], icon: "shield" },
    { match: ["download", "unduh", "instant", "langsung kirim", "otomatis"], icon: "download" },
    { match: ["update", "pembaruan", "berkala", "terbaru", "tren"], icon: "refresh" },
    { match: ["support", "bantuan", "cs", "respon", "layanan", "chat"], icon: "clock" },
    { match: ["garansi", "refund", "uang kembali", "aman", "secure", "terpercaya", "privasi"], icon: "check" },
    { match: ["gratis", "bonus", "hadiah", "free"], icon: "gift" },
    { match: ["rating", "review", "testimoni", "bintang"], icon: "star" },
    { match: ["pembayaran", "payment", "transfer", "qris", "kartu"], icon: "card" }
  ];

  var TRUST_ICON_PATHS = {
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    download: '<path d="M12 3v14M5 12l7 7 7-7"/><path d="M5 21h14"/>',
    refresh: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    clock: '<path d="M21 11.5a8.4 8.4 0 0 1-9.5 8.3A8.5 8.5 0 1 1 21 11.5Z"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v9H5v-9"/><path d="M12 8c-1.5-3-5-4-6-2s1 3 6 2ZM12 8c1.5-3 5-4 6-2s-1 3-6 2Z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8l-6.2 3.3 1.2-6.9-5-4.9 6.9-1Z"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'
  };

  function pickTrustIcon(title, desc) {
    var haystack = (String(title || "") + " " + String(desc || "")).toLowerCase();
    for (var i = 0; i < TRUST_ICON_RULES.length; i++) {
      var rule = TRUST_ICON_RULES[i];
      for (var j = 0; j < rule.match.length; j++) {
        if (haystack.indexOf(rule.match[j]) !== -1) return TRUST_ICON_PATHS[rule.icon];
      }
    }
    return null;
  }

  function setTrustIcon(id, title, desc) {
    var el = document.getElementById(id);
    if (!el) return;
    var path = pickTrustIcon(title, desc);
    if (!path) return;
    var svg =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
    if (el.innerHTML === svg) return;
    el.style.transition = "opacity .15s ease";
    el.style.opacity = "0";
    requestAnimationFrame(function () {
      el.innerHTML = svg;
      requestAnimationFrame(function () {
        el.style.opacity = "1";
      });
    });
  }

  function setText(id, value) {
    if (value == null || value === "") return;
    var el = document.getElementById(id);
    if (!el || el.textContent === value) return;
    el.style.transition = "opacity .15s ease";
    el.style.opacity = "0";
    requestAnimationFrame(function () {
      el.textContent = value;
      requestAnimationFrame(function () {
        el.style.opacity = "1";
      });
    });
  }

  function readCache(section) {
    try {
      var raw = sessionStorage.getItem(CACHE_PREFIX + section);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeCache(section, data) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + section, JSON.stringify(data));
    } catch (e) {}
  }

  function fetchSection(section) {
    var url = SUPABASE_URL + "/rest/v1/lingua_site_content?section=eq." + encodeURIComponent(section) + "&select=data";
    return fetch(url, { headers: SUPABASE_HEADERS })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) { return (rows && rows[0]) ? rows[0].data : null; })
      .catch(function () { return null; });
  }

  function loadSection(section, applyFn) {
    var cached = readCache(section);
    if (cached) applyFn(cached);
    fetchSection(section).then(function (data) {
      if (data == null) return;
      writeCache(section, data);
      applyFn(data);
    });
  }

  function applyBannerUtama(data) {
    if (!data) return;
    setText("heroEyebrow", data.pill);
    setText("heroTitleLine1", data.headline1);
    setText("heroTitleLine2", data.headline2);
    setText("heroDesc", data.subheadline);
  }

  function applyBannerCards(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (card, i) {
      var n = i + 1;
      setText("heroTrust" + n + "Title", card.headline);
      setText("heroTrust" + n + "Desc", card.subheadline);
      setTrustIcon("heroTrust" + n + "Icon", card.headline, card.subheadline);
    });
  }

  function applyBannerAffiliate(data) {
    if (!data) return;
    setText("affCoverTitle", data.headline);
    setText("affCoverSub", data.subheadline);
  }

  function applyCardAffiliate(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (card, i) {
      var n = i + 1;
      if (n > 1) setText("affBenefitCard" + n + "Num", card.bold);
      setText("affBenefitCard" + n + "Title", card.headline);
      setText("affBenefitCard" + n + "Desc", card.subheadline);
    });
  }

  function applyFaqAffiliate(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (item, i) {
      var n = i + 1;
      setText("affPreFaqQ" + n, item.judul);
      setText("affPreFaqA" + n, item.isi);
      setText("affFaqQ" + n, item.judul);
      setText("affFaqA" + n, item.isi);
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function applySyaratKetentuan(list) {
    var container = document.getElementById("affTermsList");
    if (!container || !Array.isArray(list) || list.length === 0) return;
    var html = "";
    list.forEach(function (item, i) {
      html +=
        "<p><strong>" + (i + 1) + ". " + escapeHtml(item.headline) + "</strong><br>" +
        escapeHtml(item.subheadline) + "</p>";
    });
    if (container.innerHTML === html) return;
    container.style.transition = "opacity .15s ease";
    container.style.opacity = "0";
    requestAnimationFrame(function () {
      container.innerHTML = html;
      requestAnimationFrame(function () {
        container.style.opacity = "1";
      });
    });
  }

  function run() {
    if (document.getElementById("heroEyebrow")) {
      loadSection("banner_utama", applyBannerUtama);
      loadSection("banner_cards", applyBannerCards);
    }
    if (document.getElementById("affCoverTitle")) {
      loadSection("banner_affiliate", applyBannerAffiliate);
      loadSection("card_affiliate", applyCardAffiliate);
      loadSection("faq_affiliate", applyFaqAffiliate);
      loadSection("syarat_ketentuan", applySyaratKetentuan);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
