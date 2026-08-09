/* ==========================================================================
   admin-core.js
   Gabungan admin-shared.js + admin-sidebar.js.
   Isinya hal-hal yang dipakai bareng di SEMUA halaman admin:
     1) AdminShared  -> konfigurasi Supabase, helper (rupiah/slugify/toast),
        upload gambar. Dipakai Linguahub.html (dashboard) & tambah-produk.html (wizard).
     2) Sidebar behavior -> buka/tutup sidebar mobile, collapse desktop.
        Otomatis no-op kalau elemen #sidebar tidak ada di halaman (aman dipakai di mana saja).
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

  // ---------------- Supabase REST (PostgREST) ----------------
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
      var res = await fetch(SUPABASE_URL + "/rest/v1/product_categories", {
        method: "POST",
        headers: Object.assign({}, SUPABASE_HEADERS, { Prefer: "return=representation" }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menambah kategori (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },
    async createProduct(payload) {
      var res = await fetch(SUPABASE_URL + "/rest/v1/products", {
        method: "POST",
        headers: Object.assign({}, SUPABASE_HEADERS, { Prefer: "return=representation" }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal menyimpan produk (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },
    async updateProduct(id, payload) {
      var res = await fetch(SUPABASE_URL + "/rest/v1/products?id=eq." + encodeURIComponent(id), {
        method: "PATCH",
        headers: Object.assign({}, SUPABASE_HEADERS, { Prefer: "return=representation" }),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Gagal update produk (" + res.status + "): " + (await res.text()));
      var rows = await res.json();
      return rows[0];
    },
    async deleteProduct(id) {
      var res = await fetch(SUPABASE_URL + "/rest/v1/products?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        headers: SUPABASE_HEADERS
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
    toast: toast
  };

  /* ============================== 2) Sidebar ============================== */
  // No-op otomatis kalau halaman tidak punya #sidebar (mis. wizard tanpa sidebar).

  document.addEventListener("DOMContentLoaded", function () {
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
