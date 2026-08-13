(function () {
  "use strict";

  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY
  };

  function setText(id, value) {
    if (value == null || value === "") return;
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function fetchSection(section) {
    var url = SUPABASE_URL + "/rest/v1/lingua_site_content?section=eq." + encodeURIComponent(section) + "&select=data";
    return fetch(url, { headers: SUPABASE_HEADERS })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (rows) { return (rows && rows[0]) ? rows[0].data : null; })
      .catch(function () { return null; });
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
    container.innerHTML = html;
  }

  function run() {
    if (document.getElementById("heroEyebrow")) {
      fetchSection("banner_utama").then(applyBannerUtama);
      fetchSection("banner_cards").then(applyBannerCards);
    }
    if (document.getElementById("affCoverTitle")) {
      fetchSection("banner_affiliate").then(applyBannerAffiliate);
      fetchSection("card_affiliate").then(applyCardAffiliate);
      fetchSection("faq_affiliate").then(applyFaqAffiliate);
      fetchSection("syarat_ketentuan").then(applySyaratKetentuan);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
