/* ==========================================================================
   admin-core.js
   Gabungan admin-shared.js + admin-sidebar.js + auth session.
   Isinya hal-hal yang dipakai bareng di SEMUA halaman admin:
     1) AdminShared  -> konfigurasi Supabase, helper (rupiah/slugify/toast),
        upload gambar, auth (login/logout/session). Dipakai Linguahub.html
        (dashboard), tambah-produk.html (wizard), & login.html.
     2) Sidebar behavior -> buka/tutup sidebar mobile, collapse desktop.
        Otomatis no-op kalau elemen #sidebar tidak ada di halaman (aman dipakai di mana saja).
     3) Auth gate -> kalau halaman ada #sidebar (halaman admin, bukan login.html),
        otomatis cek session & redirect ke login.html kalau belum login.
   ========================================================================== */
(function (global) {
  "use strict";

  /* ============================== 1) AdminShared ============================== */

  // -- Samakan dengan js/products-data.js --
  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY,
    "Content-Type": "application/json"
  };

  // Endpoint upload file yang sudah ada di project (butuh login admin/session).
  var UPLOAD_ENDPOINT = "/api/upload-file.php";

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

  /* ---------------- Auth (Supabase Auth: email/password) ----------------
     Kenapa perlu: tabel products/product_categories cuma boleh diBACA
     publik (anon). Untuk insert/update/delete, Postgres RLS mensyaratkan
     role "authenticated" — jadi request tulis harus bawa access_token
     user yang login, bukan cuma publishable key. */
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
    try { j = await res.json(); } catch (e) { /* noop */ }
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

  // Return session yang valid (refresh dulu kalau mepet expired). null kalau belum login.
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
      }).catch(function () { /* noop, tetap logout di sisi client */ });
    }
    location.href = "login.html";
  }

  // Panggil di halaman admin (yang ada #sidebar). Redirect ke login.html kalau belum login.
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

  // Header buat request TULIS (insert/update/delete): pakai access_token user
  // kalau ada session, supaya kena role "authenticated" di RLS.
  async function writeHeaders(extra) {
    var session = await getValidSession();
    var token = (session && session.access_token) || SUPABASE_KEY;
    return Object.assign(
      { apikey: SUPABASE_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" },
      extra || {}
    );
  }

  // ---------------- Supabase REST (PostgREST) ----------------
  var db = {
    // Baca: publik, cukup publishable key.
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
    // Tulis: butuh session login (authenticated), lihat writeHeaders().
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
    }
  };

  // ---------------- Upload gambar ----------------
  // Mengembalikan path publik (mis. /uploads/xxxx.jpg) sesuai respons
  // api/upload-file.php yang sudah ada di project.
  async function uploadImage(file) {
    var fd = new FormData();
    fd.append("file", file);
    var res = await fetch(UPLOAD_ENDPOINT, { method: "POST", body: fd });
    var j = null;
    try { j = await res.json(); } catch (e) { /* noop */ }
    if (!res.ok || !j || j.error) {
      throw new Error((j && j.error) || "Upload gagal (" + res.status + ")");
    }
    // Sesuaikan dengan bentuk respons upload-file.php di project kamu,
    // umumnya { success:true, path:"/uploads/xxx.jpg" } atau { url:"..." }.
    return j.path || j.url || j.publicpath || j.filepath;
  }

  // ---------------- Toast ----------------
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

  /* ============================== 2) Sidebar + Auth gate ============================== */
  // No-op otomatis kalau halaman tidak punya #sidebar (mis. login.html).

  document.addEventListener("DOMContentLoaded", function () {
    // Semua halaman admin (linguahub.html, tambah-produk.html, dst) wajib login,
    // KECUALI login.html sendiri (dikasih flag data-public di <body>).
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
