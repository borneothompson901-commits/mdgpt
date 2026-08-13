(function (global) {
  "use strict";

  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };

  var UPLOAD_ENDPOINT = "/api/upload-file.php";

  var AFFILIATE_ADMIN_FN = SUPABASE_URL + "/functions/v1/affiliate-admin";

  function rupiah(n) {
    return "Rp" + (parseInt(n, 10) || 0).toLocaleString("id-ID");
  }

  function slugify(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  var SESSION_KEY = "admin_session_v1";

  function loadSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function mapTokenResponse(j, fallbackEmail, fallbackRefresh) {
    return {
      access_token: j.access_token,
      refresh_token: j.refresh_token || fallbackRefresh,
      expires_at: Math.floor(Date.now() / 1000) + (j.expires_in || 3600),
      email: (j.user && j.user.email) || fallbackEmail
    };
  }

  async function signIn(email, password) {
    var res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    });
    var j = {};
    try { j = await res.json(); } catch (e) {  }
    if (!res.ok) {
      throw new Error(j.error_description || j.msg || "Email atau password salah.");
    }
    var session = mapTokenResponse(j, email, null);
    saveSession(session);
    return session;
  }

  async function refreshSession(session) {
    var res = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    var j = await res.json();
    var fresh = mapTokenResponse(j, session.email, session.refresh_token);
    saveSession(fresh);
    return fresh;
  }

  async function getValidSession() {
    var session = loadSession();
    if (!session || !session.access_token) return null;
    if (session.expires_at - 30 > Math.floor(Date.now() / 1000)) return session;
    return await refreshSession(session);
  }

  function signOut() {
    var session = loadSession();
    clearSession();
    if (session && session.access_token) {
      fetch(SUPABASE_URL + "/auth/v1/logout", {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + session.access_token }
      }).catch(function () {  });
    }
    location.href = "login.html";
  }

  async function requireAuth() {
    var session = await getValidSession();
    if (!session) {
      var next = encodeURIComponent(location.pathname + location.search);
      location.href = "login.html?next=" + next;
      return null;
    }
    var nameEl = document.querySelector(".user-name");
    if (nameEl) nameEl.textContent = session.email;
    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        signOut();
      });
    }
    return session;
  }

  async function writeHeaders(extra) {
    var session = await getValidSession();
    var token = (session && session.access_token) || SUPABASE_KEY;
    return Object.assign(
      { apikey: SUPABASE_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" },
      extra || {}
    );
  }

  var db = {

    async listProducts() {
      var res = await fetch(SUPABASE_URL + "/rest/v1/products?select=*&order=id.desc", { headers: SUPABASE_HEADERS });
      if (!res.ok) throw new Error("Gagal memuat produk (" + res.status + ")");
      return res.json();
    },
    async getProduct(id) {
      var res = await fetch(SUPABASE_URL + "/rest/v1/products?id=eq." + encodeURIComponent(id) + "&select=*", { headers: SUPABASE_HEADERS });
      if (!res.ok) throw new Error("Gagal memuat produk (" + res.status + ")");
      var rows = await res.json();
      return rows[0] || null;
    },
    async listCategories() {
      var res = await fetch(SUPABASE_URL + "/rest/v1/product_categories?select=*&order=sort_order.asc", { headers: SUPABASE_HEADERS });
      if (!res.ok) throw new Error("Gagal memuat kategori (" + res.status + ")");
      return res.json();
    },

    async createCategory(payload) {
      var headers = await writeHeaders({ Prefer: "return=representation" });
      var res = await fetch(SUPABASE_URL + "/rest/v1/product_categories", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menambah kategori (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },
    async createProduct(payload) {
      var headers = await writeHeaders({ Prefer: "return=representation" });
      var res = await fetch(SUPABASE_URL + "/rest/v1/products", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menyimpan produk (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },
    async updateProduct(id, payload) {
      var headers = await writeHeaders({ Prefer: "return=representation" });
      var res = await fetch(SUPABASE_URL + "/rest/v1/products?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal update produk (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },
    async deleteProduct(id) {
      var headers = await writeHeaders();
      var res = await fetch(SUPABASE_URL + "/rest/v1/products?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: headers
      });
      if (!res.ok) throw new Error("Gagal hapus produk (" + res.status + ")");
      return true;
    },

    async getCheckoutConfig() {
      var res = await fetch(SUPABASE_URL + "/rest/v1/checkout_config?select=*&limit=1", { headers: SUPABASE_HEADERS });
      if (!res.ok) throw new Error("Gagal memuat pengaturan (" + res.status + ")");
      var rows = await res.json();
      return rows[0] || { ongkir_rate_persen: 0, biaya_layanan: 0, pajak_persen: 0 };
    },
    async updateCheckoutConfig(payload) {
      var headers = await writeHeaders({ Prefer: "return=representation" });
      payload = Object.assign({}, payload, { updated_at: new Date().toISOString() });
      var res = await fetch(SUPABASE_URL + "/rest/v1/checkout_config?id=eq.true", {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal simpan pengaturan (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },

    async getAffiliateConfig() {
      var res = await fetch(SUPABASE_URL + "/rest/v1/affiliate_config?select=*&limit=1", { headers: SUPABASE_HEADERS });
      if (!res.ok) throw new Error("Gagal memuat pengaturan affiliate (" + res.status + ")");
      var rows = await res.json();
      return rows[0] || { komisi_persen: 10 };
    },
    async updateAffiliateConfig(payload) {
      var headers = await writeHeaders({ Prefer: "return=representation" });
      payload = Object.assign({}, payload, { updated_at: new Date().toISOString() });
      var res = await fetch(SUPABASE_URL + "/rest/v1/affiliate_config?id=eq.true", {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal simpan pengaturan affiliate (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },

    async listTransactions() {
      var headers = await writeHeaders();
      var res = await fetch(
        SUPABASE_URL + "/rest/v1/orders?select=*&order=created_at.desc&limit=200",
        { headers: headers }
      );
      if (!res.ok) throw new Error("Gagal memuat transaksi (" + res.status + ")");
      return res.json();
    },
    async getTransaction(id) {
      var headers = await writeHeaders();
      var res = await fetch(
        SUPABASE_URL + "/rest/v1/orders?id=eq." + encodeURIComponent(id) + "&select=*",
        { headers: headers }
      );
      if (!res.ok) throw new Error("Gagal memuat detail transaksi (" + res.status + ")");
      var rows = await res.json();
      return rows[0] || null;
    },

    async listAffiliates() {
      var headers = await writeHeaders();
      var res = await fetch(
        SUPABASE_URL + "/rest/v1/affiliates?select=*&order=created_at.desc",
        { headers: headers }
      );
      if (!res.ok) throw new Error("Gagal memuat affiliate (" + res.status + "): " + (await res.text()));
      return res.json();
    },

    async listAffiliateOrders(affiliateId) {
      var headers = await writeHeaders();
      var res = await fetch(
        SUPABASE_URL + "/rest/v1/orders?affiliate_id=eq." + encodeURIComponent(affiliateId) + "&select=id,created_at,items,commission_amount,commission_status&order=created_at.desc",
        { headers: headers }
      );
      if (!res.ok) throw new Error("Gagal memuat order affiliate (" + res.status + "): " + (await res.text()));
      return res.json();
    },
    async updateOrderCommissionStatus(orderId, status) {
      return db._callAffiliateAdminFn({ action: "update_order_commission_status", order_id: orderId, status: status });
    },

    async _callAffiliateAdminFn(payload) {
      var session = await getValidSession();
      if (!session) throw new Error("Sesi admin habis, silakan login ulang.");
      var res = await fetch(AFFILIATE_ADMIN_FN, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + session.access_token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      var j = {};
      try { j = await res.json(); } catch (e) {  }
      if (!res.ok) throw new Error(j.error || "Permintaan gagal (" + res.status + ")");
      return j;
    },
    async updateAffiliateContact(id, payload) {
      return db._callAffiliateAdminFn({
        action: "update_contact",
        affiliate_id: id,
        email: payload.email,
        whatsapp: payload.whatsapp
      });
    },

    async resetAffiliatePassword(affiliateId, newPassword) {
      return db._callAffiliateAdminFn({ action: "reset_password", affiliate_id: affiliateId, new_password: newPassword });
    },

    async deleteAffiliate(affiliateId) {
      return db._callAffiliateAdminFn({ action: "delete", affiliate_id: affiliateId });
    }
  };

  async function uploadImage(file) {
    var fd = new FormData();
    fd.append("file", file);
    var session = await getValidSession();
    var fetchOpts = { method: "POST", body: fd };
    if (session && session.access_token) {
      fetchOpts.headers = { Authorization: "Bearer " + session.access_token };
    }
    var res = await fetch(UPLOAD_ENDPOINT, fetchOpts);
    var j = null;
    try { j = await res.json(); } catch (e) {  }
    if (!res.ok || !j || j.error) {
      throw new Error((j && j.error) || "Upload gagal (" + res.status + ")");
    }

    return j.path || j.url || j.publicpath || j.filepath;
  }

  function toast(msg, type) {
    var el = document.getElementById("appToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "appToast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = "toast show" + (type ? " " + type : "");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = "toast"; }, 2600);
  }

  global.AdminShared = {
    SUPABASE_URL: SUPABASE_URL,
    db: db,
    rupiah: rupiah,
    slugify: slugify,
    uploadImage: uploadImage,
    toast: toast,
    auth: {
      signIn: signIn,
      signOut: signOut,
      requireAuth: requireAuth,
      getValidSession: getValidSession
    }
  };

  document.addEventListener("DOMContentLoaded", function () {

    if (document.body.getAttribute("data-public") !== "true") {
      requireAuth();
    }

    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("overlay");
    var hamburger = document.getElementById("hamburgerBtn");
    var closeBtn = document.getElementById("closeBtn");
    var collapseBtn = document.getElementById("sidebarToggleBtn");
    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.add("open");
      if (overlay) overlay.classList.add("open");
    }
    function closeSidebar() {
      sidebar.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
    }
    if (hamburger) hamburger.addEventListener("click", openSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);
    if (collapseBtn) {
      collapseBtn.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-collapsed");
      });
    }
  });
})(window);
