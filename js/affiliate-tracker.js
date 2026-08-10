(function () {
  "use strict";

  /* Lightweight affiliate click tracker, shared across every /lingua page.
   * - Reads ?ref=CODE from the URL.
   * - Records one click against that affiliate (via a SECURITY DEFINER RPC,
   *   so the public/anon key can only ever increment a counter).
   * - Sets a first-party cookie for 14 days. Checkout (cart.js) reads this
   *   cookie and sends it along when creating a payment, so the sale gets
   *   attributed to the affiliate as long as checkout happens within that
   *   14-day window from the click.
   */
  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };

  var COOKIE_NAME = "mdgpt_ref";
  var COOKIE_DAYS = 14;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
  }

  function trackClick(refCode) {
    fetch(SUPABASE_URL + "/rest/v1/rpc/track_affiliate_click", {
      method: "POST",
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ p_ref_code: refCode })
    }).catch(function () {
      /* best-effort; a failed click count shouldn't block browsing */
    });
  }

  function init() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return;
    }
    var ref = params.get("ref");
    if (!ref) return;

    ref = ref.trim();
    if (!ref) return;

    var existing = getCookie(COOKIE_NAME);
    // Only count a fresh click (and re-arm the 14-day window) when this is a
    // new/different ref than what's already stored, so reloading the page
    // doesn't inflate the click counter.
    if (existing !== ref) {
      trackClick(ref);
    }
    setCookie(COOKIE_NAME, ref, COOKIE_DAYS);
  }

  init();

  window.MdgptRefTracker = {
    COOKIE_NAME: COOKIE_NAME,
    COOKIE_DAYS: COOKIE_DAYS,
    getRefCode: function () {
      return getCookie(COOKIE_NAME);
    }
  };
})();
