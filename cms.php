<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (!file_exists(__DIR__ . "/cms/auth_guard.php")) {
    die("File auth_guard.php GAK KETEMU di: " . __DIR__ . "/cms/auth_guard.php");
}

require __DIR__ . "/cms/auth_guard.php";
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Panel</title>
  <link rel="stylesheet" href="css/cms.css"/>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>

<div class="overlay" id="overlay"></div>

<aside class="sidebar" id="sidebar">

  <div class="sidebar-header">
    <div class="logo" id="logoFull">
  <img src="assets/icons/logo.png" style="height:32px;width:auto;object-fit:contain;" alt="Logo"/>
</div>
<div class="logo-collapsed" id="logoCollapsed">
  <img src="assets/icons/logo.png" style="height:28px;width:auto;object-fit:contain;" alt="Logo"/>
  <span class="logo-tooltip-text">AdminCMS</span>
</div>
    <div class="logo-collapsed" id="logoCollapsed">
      <span class="logo-tooltip-text">AdminCMS</span>
    </div>
    <div class="header-actions">
      <button class="sidebar-toggle" id="sidebarToggleBtn">
<svg class="sidebar-toggle-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M10 3L6 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

      </button>
      <button class="close-btn" id="closeBtn">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11 4L4 11M4 4l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
  </div>

  <div class="nav-label">Navigation</div>

  <nav class="sidebar-nav">
    <ul>
      <li>
        <a href="#" class="nav-item active" data-page="tim" data-tooltip="Tim">
          <svg class="ni" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2.3" stroke="currentColor" stroke-width="1.35"/><path d="M1 13.5C1 11.015 3.015 9 5.5 9S10 11.015 10 13.5" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/><circle cx="12" cy="5.5" r="1.8" stroke="currentColor" stroke-width="1.2" opacity=".55"/><path d="M14.5 13c0-1.7-1.12-3.1-2.5-3.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity=".55"/></svg>
          <span class="nav-text">Tim</span>
        </a>
      </li>
      <li>
        <a href="#" class="nav-item" data-page="deskripsi" data-tooltip="Deskripsi">
          <svg class="ni" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2.5" stroke="currentColor" stroke-width="1.35"/><path d="M5 5.5h6M5 8h4.5M5 10.5h3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/></svg>
          <span class="nav-text">Deskripsi</span>
        </a>
      </li>
      <li>
        <a href="#" class="nav-item" data-page="webinar" data-tooltip="Webinar">
          <svg class="ni" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="9" rx="2" stroke="currentColor" stroke-width="1.35"/><path d="M5.5 11.5v2M10.5 11.5v2M3.5 13.5h9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="7" r="1.8" stroke="currentColor" stroke-width="1.2"/></svg>
          <span class="nav-text">Webinar</span>
        </a>
      </li>
      <li class="has-dropdown">
        <a href="#" class="nav-item dropdown-toggle" data-dropdown="client" data-tooltip="Client">
          <svg class="ni" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14 5v6L8 14.5 2 11V5L8 1.5z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/></svg>
          <span class="nav-text">Client</span>
          <svg class="arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 4.5l2 2 2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
<ul class="dropdown-menu" id="dropdown-client">
    <li><a href="#" class="nav-sub" data-page="brand">Brand</a></li>
  <li class="has-dropdown">
    <a href="#" class="nav-sub dropdown-toggle">
      Testimoni
      <svg class="arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 4.5l2 2 2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
    <ul class="dropdown-menu">
      <li><a href="#" class="nav-sub" data-page="testimoniA">Testimoni A</a></li>
      <li><a href="#" class="nav-sub" data-page="testimoniB">Testimoni B</a></li>
    </ul>
  </li>
  <li><a href="#" class="nav-sub" data-page="faq">FAQ</a></li>
  <li class="has-dropdown">
    <a href="#" class="nav-sub dropdown-toggle">
      Portofolio
      <svg class="arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M4 4.5l2 2 2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
    <ul class="dropdown-menu">
      <li><a href="#" class="nav-sub" data-page="portofolioA">Sosial Media Client</a></li>
      <li><a href="#" class="nav-sub" data-page="portofolioB">Dokumentasi Event</a></li>
      <li><a href="#" class="nav-sub" data-page="portofolioC">Foto Produk</a></li>
      <li><a href="#" class="nav-sub" data-page="portofolioD">Ads Marketplace</a></li>
    </ul>
  </li>
</ul>
      <li class="has-dropdown">
        <a href="#" class="nav-item dropdown-toggle" data-dropdown="membership" data-tooltip="Membership">
          <svg class="ni" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4.5" width="13" height="8.5" rx="1.5" stroke="currentColor" stroke-width="1.35"/><path d="M5 4.5V3.5a1 1 0 011-1h4a1 1 0 011 1v1" stroke="currentColor" stroke-width="1.25"/><path d="M1.5 8h13" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 1.5"/></svg>
          <span class="nav-text">Membership</span>
          <svg class="arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 4.5l2 2 2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <ul class="dropdown-menu" id="dropdown-membership">
          <li><a href="#" class="nav-sub" data-page="materi">Materi</a></li>
          <li><a href="#" class="nav-sub" data-page="keuntungan">Keuntungan</a></li>
          <li><a href="#" class="nav-sub" data-page="mentor">Mentor</a></li>
          <li><a href="#" class="nav-sub" data-page="biaya">Biaya</a></li>
        </ul>
      </li>
      <li>
        <a href="#" class="nav-item" data-page="cta" data-tooltip="CTA">
<svg class="ni" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M2 6V10C2 11.1 2.9 12 4 12H8L12 15V1L8 4H4C2.9 4 2 4.9 2 6Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>
</svg>
          <span class="nav-text">CTA</span>
        </a>
      </li>
    </ul>
  </nav>

  <div class="sidebar-bottom">
    <a href="/" target="_blank" class="view-site-btn">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 7C4.5 5.5 5.5 3.5 7 3.5S9.5 5.5 9.5 7 8.5 10.5 7 10.5 4.5 8.5 4.5 7z" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 7h11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      <span class="nav-text">Lihat Website</span>
      <svg class="nav-text" width="11" height="11" viewBox="0 0 11 11" fill="none" style="margin-left:auto"><path d="M2 9l7-7M4 2h5v5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
    <div class="user-row" id="userRow" style="cursor:pointer;position:relative;">
  <div class="user-avatar">A</div>
  <div class="user-meta">
    <div class="user-name">Admin</div>
    <div class="user-role">M-DGPT Admin</div>
  </div>
  <div class="user-popup" id="userPopup" style="display:none;position:absolute;bottom:110%;left:0;right:0;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:100;">
    <a href="cms/logout.php" class="user-popup-btn" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;color:var(--danger,#DC2626);font-size:.85rem;font-weight:500;text-decoration:none;transition:background .15s;">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9.5 9.5L12 7l-2.5-2.5M12 7H5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Logout
    </a>
  </div>
</div>
  </div>

</aside>

<main class="main" id="main">

  <header class="topbar">
    <div class="topbar-left">
      <button class="hamburger" id="hamburgerBtn">
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
      </button>
      <nav class="breadcrumb">
        <span class="bc-root">Panel</span>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4.5 3l4 3.5-4 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <span class="bc-current" id="breadcrumbText">Tim</span>
      </nav>
    </div>
    <div class="topbar-right" style="margin-left:auto;display:flex;align-items:center;padding-right:20px">
    <button class="btn btn-primary" id="btnSimpanPerubahan" style="gap:6px;display:flex;align-items:center">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Simpan Perubahan
    </button>
  </div>
  </header>

  <div class="content" id="content">
    <div class="content-inner">
    <div class="page-head">
      <div>
        <h1 class="page-title" id="pageTitle">Tim</h1>
        <p class="page-sub" id="pageSub">Kelola data tim</p>
      </div>
    </div>
    <div class="card">
      <div class="card-toolbar" id="cardToolbar">
        <label class="search-wrap" id="searchWrap">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          <input type="text" class="search-input" id="searchInput" placeholder="Cari data…"/>
        </label>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr id="tableHead"></tr></thead>
          <tbody id="tableBody"></tbody>
        </table>
        <div class="empty-state" id="emptyState" style="display:none">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="6" y="10" width="32" height="25" rx="4" stroke="#CBD5E1" stroke-width="1.8"/><path d="M15 21h14M15 27h9" stroke="#CBD5E1" stroke-width="1.6" stroke-linecap="round"/></svg>
          <p>Belum ada data</p>
        </div>
      </div>
    </div>
  </div>
  </div>
</main>

<!-- Add / Edit Modal -->
<div class="modal-backdrop" id="modalBackdrop">
  <div class="modal" id="modalBox">
    <div class="modal-header">
      <h3 id="modalTitle">Tambah</h3>
      <button class="modal-close" id="modalClose">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11 4L4 11M4 4l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="modalCancel">Batal</button>
      <button class="btn btn-primary" id="modalSave">Simpan</button>
    </div>
  </div>
</div>
<div class="modal-backdrop" id="confirmBackdrop">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3 id="confirmTitle">Hapus data ini?</h3>
      <button class="modal-close" id="confirmClose">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M11 4L4 11M4 4l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <p class="delete-warn">Tindakan ini tidak dapat dibatalkan.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" id="confirmCancel">Batal</button>
      <button class="btn btn-danger" id="confirmDelete">Hapus</button>
    </div>
  </div>
</div>
<div id="pageLoader" style="
  position:fixed;inset:0;z-index:9999;
  background:#fff;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:16px;
">
  <img src="assets/icons/logo.png" style="width:160px;height:90px;object-fit:contain;" alt="Logo"/>
  <div style="display:flex;gap:6px;align-items:center">
    <div class="loader-dot"></div>
    <div class="loader-dot"></div>
    <div class="loader-dot"></div>
  </div>
</div>
<script src="js/cms.js"></script>
<script>
(function() {
  var row   = document.getElementById('userRow');
  var popup = document.getElementById('userPopup');
  if (!row || !popup) return;

  row.addEventListener('click', function(e) {
    e.stopPropagation();
    var rect = row.getBoundingClientRect();
    popup.style.position  = 'fixed';
    popup.style.bottom    = (window.innerHeight - rect.top + 6) + 'px';
    popup.style.left      = rect.left + 'px';
    popup.style.width     = rect.width + 'px';
    popup.style.display   = popup.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', function() {
    popup.style.display = 'none';
  });
})();
</script>
</body>
</html>
