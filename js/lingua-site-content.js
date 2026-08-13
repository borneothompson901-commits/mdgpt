(function () {
  "use strict";

  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY
  };
  var CACHE_PREFIX = "lingua_cms_";

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
