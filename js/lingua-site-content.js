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
    { match: ["download", "unduh", "instant", "langsung kirim"], icon: "download" },
    { match: ["otomatis", "auto", "otomasi"], icon: "settings" },
    { match: ["update", "pembaruan", "berkala", "terbaru"], icon: "refresh_cw" },
    { match: ["tren", "trending", "viral", "populer"], icon: "flame" },
    { match: ["support", "bantuan", "cs", "respon", "layanan", "chat"], icon: "clock" },
    { match: ["telepon", "hubungi", "call center"], icon: "phone" },
    { match: ["email", "surel"], icon: "mail" },
    { match: ["garansi", "refund", "uang kembali"], icon: "shield_check" },
    { match: ["aman", "secure", "terpercaya", "trusted"], icon: "lock" },
    { match: ["privasi", "privacy", "kerahasiaan"], icon: "key" },
    { match: ["gratis", "free", "cuma-cuma"], icon: "gift" },
    { match: ["bonus", "hadiah", "reward"], icon: "award" },
    { match: ["rating", "review", "testimoni", "bintang"], icon: "star" },
    { match: ["pembayaran", "payment", "transfer", "qris"], icon: "credit_card" },
    { match: ["kartu", "cicilan", "kredit"], icon: "wallet" },
    { match: ["member", "komunitas", "eksklusif untuk member"], icon: "users" },
    { match: ["premium", "eksklusif", "elite"], icon: "gem" },
    { match: ["vip", "prioritas"], icon: "crown" },
    { match: ["cepat", "instan", "kilat"], icon: "rocket" },
    { match: ["lisensi", "berlisensi", "hak cipta"], icon: "briefcase" },
    { match: ["sertifikat", "certified", "terverifikasi"], icon: "award" },
    { match: ["kualitas", "quality", "premium grade"], icon: "trophy" },
    { match: ["panduan", "tutorial", "cara pakai"], icon: "compass" },
    { match: ["cloud", "penyimpanan", "backup"], icon: "cloud" },
    { match: ["global", "internasional", "worldwide"], icon: "globe" }
  ];

  function pickTrustIcon(title, desc) {
    var haystack = (String(title || "") + " " + String(desc || "")).toLowerCase();
    for (var i = 0; i < TRUST_ICON_RULES.length; i++) {
      var rule = TRUST_ICON_RULES[i];
      for (var j = 0; j < rule.match.length; j++) {
        if (haystack.indexOf(rule.match[j]) !== -1) return ICON_LIBRARY[rule.icon];
      }
    }
    return null; // tidak ada match -> biarkan icon default (hasil hardcode di HTML) tetap dipakai
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

  function setAttr(id, attr, value) {
    if (value == null || value === "") return;
    var el = document.getElementById(id);
    if (!el || el.getAttribute(attr) === value) return;
    el.setAttribute(attr, value);
  }

  function applyCampaignCards(list) {
    if (!Array.isArray(list)) return;
    list.forEach(function (card, i) {
      var n = i + 1;
      setText("campaignCard" + n + "Headline", card.headline);
      setText("campaignCard" + n + "Sub", card.subheadline);
      setText("campaignCard" + n + "CtaText", card.ctaText);
      setAttr("campaignCard" + n, "href", card.ctaUrl);
      setAttr("campaignCard" + n + "Img", "src", card.image);
    });
  }

  function run() {
    if (document.getElementById("heroEyebrow")) {
      loadSection("banner_utama", applyBannerUtama);
      loadSection("banner_cards", applyBannerCards);
    }
    if (document.getElementById("campaignCard1")) {
      loadSection("campaign_card", applyCampaignCards);
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
