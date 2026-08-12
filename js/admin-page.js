(function () {
  "use strict";

  if (document.getElementById("productTbody")) {
    var db = AdminShared.db;
    var rupiah = AdminShared.rupiah;

    var state = { products: [], categories: [], search: "", kategori: "", tipe: "" };

    var tbody = document.getElementById("productTbody");
    var emptyState = document.getElementById("emptyState");
    var filterKategoriXSelect, filterTipeXSelect;
    var searchInput = document.getElementById("searchInput");

    var PAGE_TITLES = { overview: "Overview", produk: "Produk", transaksi: "Transaksi", affiliate: "Affiliate" };
    document.querySelectorAll(".nav-item[data-page]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var page = link.dataset.page;
        document.querySelectorAll(".nav-item[data-page]").forEach(function (l) { l.classList.toggle("active", l === link); });
        document.querySelectorAll(".page-section[data-page-section]").forEach(function (sec) {
          sec.hidden = sec.dataset.pageSection !== page;
        });
        var bc = document.getElementById("bcCurrent");
        if (bc) bc.textContent = PAGE_TITLES[page] || page;
        var sidebar = document.getElementById("sidebar");
        var overlay = document.getElementById("overlay");
        if (sidebar && sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
          if (overlay) overlay.classList.remove("open");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    var iconBox = function () {
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 11l3.5-3.5 2.5 2.5L11 6.5l3.5 3.5" stroke="currentColor" stroke-width="1.2"/></svg>';
    };

    function totalStock(p) {
      if (p.variantPricing && Object.keys(p.variantPricing).length) {
        return Object.values(p.variantPricing).reduce(function (sum, v) { return sum + (parseInt(v.stock, 10) || 0); }, 0);
      }
      return parseInt(p.stock, 10) || 0;
    }

    function renderStats() {
      var products = state.products;
      document.getElementById("statTotal").textContent = products.length;
      document.getElementById("statDigital").textContent = products.filter(function (p) { return p.type === "digital"; }).length;
      document.getElementById("statFisik").textContent = products.filter(function (p) { return p.type === "fisik"; }).length;
      document.getElementById("statLowStock").textContent = products.filter(function (p) { return p.type === "fisik" && totalStock(p) > 0 && totalStock(p) <= 5; }).length;
      document.getElementById("navProdukCount").textContent = products.length;
    }

    function renderOverviewLists() {
      var lowList = document.getElementById("lowStockList");
      var outList = document.getElementById("outStockList");
      if (!lowList || !outList) return;

      var stockables = state.products.filter(function (p) {
        return p.type === "fisik" || (p.variantGroups && p.variantGroups.length > 0);
      });
      var low = stockables.filter(function (p) { var s = totalStock(p); return s > 0 && s <= 5; });
      var out = stockables.filter(function (p) { return totalStock(p) <= 0; });

      document.getElementById("lowStockCount").textContent = low.length;
      document.getElementById("outStockCount").textContent = out.length;

      function itemRow(p) {
        var stock = totalStock(p);
        return '<div class="overview-item">' +
          '<span class="overview-item__name" title="' + escapeHtml(p.title || "(Tanpa nama)") + '">' + escapeHtml(p.title || "(Tanpa nama)") + '</span>' +
          renderStockBadge(stock) +
        '</div>';
      }

      lowList.innerHTML = low.map(itemRow).join("");
      document.getElementById("lowStockEmpty").hidden = low.length !== 0;
      outList.innerHTML = out.map(itemRow).join("");
      document.getElementById("outStockEmpty").hidden = out.length !== 0;
    }

    function renderTopSold() {
      var list = document.getElementById("topSoldList");
      var empty = document.getElementById("topSoldEmpty");
      if (!list || !empty) return;

      var top = state.products
        .filter(function (p) { return (parseInt(p.sold, 10) || 0) > 0; })
        .sort(function (a, b) { return (parseInt(b.sold, 10) || 0) - (parseInt(a.sold, 10) || 0); })
        .slice(0, 5);

      list.innerHTML = top.map(function (p, idx) {
        return '<div class="overview-item">' +
          '<span class="overview-item__rank">' + (idx + 1) + '</span>' +
          '<span class="overview-item__name" title="' + escapeHtml(p.title || "(Tanpa nama)") + '">' + escapeHtml(p.title || "(Tanpa nama)") + '</span>' +
          '<span class="badge badge-purple">' + (parseInt(p.sold, 10) || 0) + ' terjual</span>' +
        '</div>';
      }).join("");
      empty.hidden = top.length !== 0;
    }

    function matchesFilter(p) {
      if (state.search && (p.title || "").toLowerCase().indexOf(state.search.toLowerCase()) === -1) return false;
      if (state.kategori && p.category !== state.kategori) return false;
      if (state.tipe && p.type !== state.tipe) return false;
      return true;
    }

    function render() {
      var list = state.products.filter(matchesFilter);
      tbody.innerHTML = "";
      emptyState.hidden = list.length !== 0;

      list.forEach(function (p) {
        var img = (p.images && p.images[0]) || "";
        var catLabel = (state.categories.find(function (c) { return c.key === p.category; }) || {}).label || p.category || "-";
        var stock = totalStock(p);
        var hasVariant = p.variantGroups && p.variantGroups.length > 0;
        var priceLabel = hasVariant
          ? rupiah(Math.min.apply(null, Object.values(p.variantPricing || {}).map(function (v) { return v.price || p.price || 0; }).concat([p.price || Infinity])))
          : rupiah(p.price);

        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td><div class="prod-cell">' +
            '<div class="thumb">' + (img ? '<img src="' + img + '" alt="">' : iconBox()) + '</div>' +
            '<div><div class="prod-name" title="' + escapeHtml(p.title || "(Tanpa nama)") + '">' + escapeHtml(p.title || "(Tanpa nama)") + '</div>' +
            '<div class="prod-sku">#' + p.id + (hasVariant ? ' &middot; ' + p.variantGroups.length + ' grup varian' : '') + '</div></div>' +
          '</div></td>' +
          '<td>' + (p.type === "fisik" || hasVariant ? renderStockBadge(stock) : '<span class="badge badge-gray">&mdash;</span>') + '</td>' +
          '<td class="col-harga">' + priceLabel + (hasVariant ? '<div class="prod-sku">mulai dari</div>' : '') + '</td>' +
          '<td class="col-sold">' + (parseInt(p.sold, 10) || 0) + '</td>' +
          '<td class="col-jenis">' + tplJenisXSelect(p) + '</td>' +
          '<td class="row-actions"><div class="actions">' +
            '<button class="btn-icon edit" data-edit="' + p.id + '" title="Edit">' +
              '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.3 2.3a1.4 1.4 0 0 1 2 2L6 11.6l-2.7.7.7-2.7 7.3-7.3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
            '</button>' +
            '<button class="btn-icon del" data-del="' + p.id + '" data-name="' + escapeHtml(p.title || "") + '" title="Hapus">' +
              '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6.8 7.5v4M9.2 7.5v4M3.5 4.5l.6 8.2a1 1 0 0 0 1 .9h5.8a1 1 0 0 0 1-.9l.6-8.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
          '</div></td>';
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll("[data-edit]").forEach(function (btn) {
        btn.addEventListener("click", function () { location.href = "tambah-produk.html?id=" + btn.dataset.edit; });
      });
      tbody.querySelectorAll("[data-del]").forEach(function (btn) {
        btn.addEventListener("click", function () { openDeleteModal(btn.dataset.del, btn.dataset.name); });
      });
      bindJenisXSelects();
    }

    function renderStockBadge(stock) {
      if (stock <= 0) return '<span class="badge badge-red">Habis</span>';
      if (stock <= 5) return '<span class="badge badge-orange">' + stock + ' tersisa</span>';
      return '<span class="badge badge-gray">' + stock + '</span>';
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    async function loadAll() {
      try {
        var res = await Promise.all([db.listProducts(), db.listCategories()]);
        var products = res[0], categories = res[1];
        state.products = products.map(mapRow);
        state.categories = categories;
        var usedKeys = {};
        state.products.forEach(function (p) { if (p.category) usedKeys[p.category] = true; });
        var visibleCats = categories.filter(function (c) { return usedKeys[c.key]; });
        filterKategoriXSelect.setOptions(
          [{ value: "", label: "Semua Kategori" }].concat(
            visibleCats.map(function (c) { return { value: c.key, label: c.label }; })
          )
        );
        renderStats();
        render();
        renderOverviewLists();
        renderTopSold();
      } catch (e) {
        console.error(e);
        AdminShared.toast(e.message || "Gagal memuat produk", "error");
      }
    }

    function mapRow(row) {
      return {
        id: row.id, type: row.type, weight: row.weight, category: row.category,
        price: row.price, stock: row.stock, title: row.title, sold: row.sold,
        rating: Number(row.rating || 0), images: row.images || [],
        variantGroups: row.variant_groups || [], variantPricing: row.variant_pricing || {},
        isBest: row.is_best === true,
        isRekomendasi: row.is_rekomendasi === true
      };
    }

    var JENIS_LABELS = {
      best_seller: { full: "Best Seller", abbr: "BR" },
      rekomendasi: { full: "Rekomendasi", abbr: "Rk" },
      basic: { full: "Basic", abbr: "Bs" }
    };
    var JENIS_ORDER = ["best_seller", "rekomendasi", "basic"];

    function jenisOf(p) {
      if (p.isBest) return "best_seller";
      if (p.isRekomendasi) return "rekomendasi";
      return "basic";
    }

    function jenisValueHtml(val) {
      var l = JENIS_LABELS[val];
      return '<span class="jenis-full">' + l.full + '</span><span class="jenis-abbr">' + l.abbr + '</span>';
    }

    function tplJenisXSelect(p) {
      var current = jenisOf(p);
      return '' +
        '<div class="xselect jenis-xselect" data-jenis-id="' + p.id + '">' +
          '<button type="button" class="xselect__trigger">' +
            '<span class="xselect__value">' + jenisValueHtml(current) + '</span>' +
            '<svg class="xselect__chev" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<div class="xselect__menu" hidden>' +
            JENIS_ORDER.map(function (val) {
              return '<button type="button" class="xselect__option' + (val === current ? " selected" : "") + '" data-jenis-val="' + val + '">' + JENIS_LABELS[val].full + '</button>';
            }).join("") +
          '</div>' +
        '</div>';
    }

    function bindJenisXSelects() {
      tbody.querySelectorAll(".jenis-xselect").forEach(function (xs) {
        var id = xs.dataset.jenisId;
        var trigger = xs.querySelector(".xselect__trigger");
        var menu = xs.querySelector(".xselect__menu");
        var valueEl = xs.querySelector(".xselect__value");

        function closeMenu() { menu.hidden = true; xs.classList.remove("open"); }
        function positionMenu() {
          var rect = trigger.getBoundingClientRect();
          var menuWidth = menu.offsetWidth || 132;
          var left = rect.right - menuWidth;
          var maxLeft = window.innerWidth - menuWidth - 8;
          if (left > maxLeft) left = maxLeft;
          if (left < 8) left = 8;
          menu.style.top = (rect.bottom + 6) + "px";
          menu.style.left = left + "px";
        }
        function openMenu() {
          tbody.querySelectorAll(".jenis-xselect.open").forEach(function (o) { if (o !== xs) { o.classList.remove("open"); o.querySelector(".xselect__menu").hidden = true; } });
          menu.hidden = false;
          xs.classList.add("open");
          positionMenu();
        }

        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          if (menu.hidden) openMenu(); else closeMenu();
        });

        menu.querySelectorAll("[data-jenis-val]").forEach(function (opt) {
          opt.addEventListener("click", async function (e) {
            e.stopPropagation();
            var val = opt.dataset.jenisVal;
            var product = state.products.find(function (p) { return String(p.id) === String(id); });
            if (!product) return;
            var prevBest = product.isBest, prevRek = product.isRekomendasi;
            if (jenisOf(product) === val) { closeMenu(); return; }

            valueEl.innerHTML = jenisValueHtml(val);
            menu.querySelectorAll(".xselect__option").forEach(function (o) { o.classList.toggle("selected", o === opt); });
            closeMenu();

            product.isBest = val === "best_seller";
            product.isRekomendasi = val === "rekomendasi";

            try {
              await db.updateProduct(id, { is_best: product.isBest, is_rekomendasi: product.isRekomendasi });
              AdminShared.toast("Jenis produk diperbarui", "success");
            } catch (err) {
              console.error(err);
              product.isBest = prevBest;
              product.isRekomendasi = prevRek;
              valueEl.innerHTML = jenisValueHtml(jenisOf(product));
              menu.querySelectorAll(".xselect__option").forEach(function (o) { o.classList.toggle("selected", o.dataset.jenisVal === jenisOf(product)); });
              AdminShared.toast(err.message || "Gagal memperbarui jenis produk", "error");
            }
          });
        });
      });
    }

    document.addEventListener("click", function () {
      tbody.querySelectorAll(".jenis-xselect.open").forEach(function (xs) {
        xs.classList.remove("open");
        xs.querySelector(".xselect__menu").hidden = true;
      });
    });
    window.addEventListener("scroll", function () {
      tbody.querySelectorAll(".jenis-xselect.open").forEach(function (xs) {
        xs.classList.remove("open");
        xs.querySelector(".xselect__menu").hidden = true;
      });
    }, true);

    function escAttr(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function buildFilterXSelect(rootId, placeholder, onChange) {
      var root = document.getElementById(rootId);
      var trigger = document.getElementById(rootId + "_trigger");
      var menu = document.getElementById(rootId + "_menu");
      var valueEl = trigger.querySelector(".xselect__value");
      var currentValue = "";
      var currentOptions = [];

      function renderMenu() {
        menu.innerHTML = currentOptions.map(function (o) {
          return '<button type="button" class="xselect__option' + (o.value === currentValue ? " selected" : "") + '" data-val="' + escAttr(o.value) + '">' + escapeHtml(o.label) + '</button>';
        }).join("");
        menu.querySelectorAll("[data-val]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            setValue(btn.dataset.val);
            closeMenu();
          });
        });
      }

      function setValue(val) {
        currentValue = val;
        var found = currentOptions.find(function (o) { return o.value === val; });
        if (found && val !== "") {
          valueEl.textContent = found.label;
          valueEl.classList.remove("is-placeholder");
        } else {
          valueEl.textContent = placeholder;
          valueEl.classList.add("is-placeholder");
        }
        renderMenu();
        onChange(val);
      }

      function openMenu() { renderMenu(); menu.hidden = false; root.classList.add("open"); }
      function closeMenu() { menu.hidden = true; root.classList.remove("open"); }

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        if (menu.hidden) openMenu(); else closeMenu();
      });
      document.addEventListener("click", function (e) {
        if (!root.contains(e.target)) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });

      return {
        setOptions: function (opts) { currentOptions = opts; renderMenu(); },
        setValue: setValue
      };
    }

    searchInput.addEventListener("input", function () { state.search = this.value; render(); });
    filterKategoriXSelect = buildFilterXSelect("xselect_filterKategori", "Semua Kategori", function (val) { state.kategori = val; render(); });
    filterTipeXSelect = buildFilterXSelect("xselect_filterTipe", "Semua Tipe", function (val) { state.tipe = val; render(); });
    filterTipeXSelect.setOptions([
      { value: "", label: "Semua Tipe" },
      { value: "digital", label: "Digital" },
      { value: "fisik", label: "Fisik" }
    ]);

    var gateModal = document.getElementById("gateModal");
    var gateTitle = document.getElementById("gateTitle");
    var gatePanel1 = gateModal.querySelector('[data-gate-panel="1"]');
    var gatePanel2 = gateModal.querySelector('[data-gate-panel="2"]');
    var gateChosenType = null;

    function gateReset() {
      gateChosenType = null;
      gateTitle.textContent = "Tambah Produk Baru";
      gatePanel1.hidden = false;
      gatePanel2.hidden = true;
    }
    function gateOpen() { gateReset(); gateModal.classList.add("open"); }
    function gateClose() { gateModal.classList.remove("open"); }

    document.getElementById("btnTambahProduk").addEventListener("click", gateOpen);
    document.getElementById("gateCloseBtn").addEventListener("click", gateClose);
    gateModal.addEventListener("click", function (e) { if (e.target === gateModal) gateClose(); });

    document.getElementById("gateBackBtn").addEventListener("click", function () {
      gateChosenType = null;
      gateTitle.textContent = "Tambah Produk Baru";
      gatePanel2.hidden = true;
      gatePanel1.hidden = false;
    });

    gatePanel1.querySelectorAll("[data-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        gateChosenType = btn.dataset.type;
        gateTitle.textContent = "Jumlah Varian";
        gatePanel1.hidden = true;
        gatePanel2.hidden = false;
      });
    });

    gatePanel2.querySelectorAll("[data-variant]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!gateChosenType) return;
        location.href = "tambah-produk.html?type=" + gateChosenType + "&variant=" + btn.dataset.variant;
      });
    });

    var deleteModal = document.getElementById("deleteModal");
    var deleteTargetId = null;
    function openDeleteModal(id, name) {
      deleteTargetId = id;
      document.getElementById("deleteProdName").textContent = name || "produk ini";
      deleteModal.classList.add("open");
    }
    document.getElementById("deleteCloseBtn").addEventListener("click", function () { deleteModal.classList.remove("open"); });
    document.getElementById("deleteCancelBtn").addEventListener("click", function () { deleteModal.classList.remove("open"); });
    deleteModal.addEventListener("click", function (e) { if (e.target === deleteModal) deleteModal.classList.remove("open"); });
    document.getElementById("deleteConfirmBtn").addEventListener("click", async function () {
      if (!deleteTargetId) return;
      try {
        await db.deleteProduct(deleteTargetId);
        state.products = state.products.filter(function (p) { return String(p.id) !== String(deleteTargetId); });
        renderStats(); render(); renderOverviewLists(); renderTopSold();
        AdminShared.toast("Produk dihapus", "success");
      } catch (e) {
        AdminShared.toast(e.message || "Gagal menghapus produk", "error");
      }
      deleteModal.classList.remove("open");
    });

    var pendingToast = sessionStorage.getItem("admin_toast");
    if (pendingToast) {
      sessionStorage.removeItem("admin_toast");
      setTimeout(function () { AdminShared.toast(pendingToast, "success"); }, 300);
    }

    loadAll();
  }

  /* ================================ WIZARD ================================
     Alur wizard sekarang ditentukan di awal lewat query string:
       ?type=digital|fisik      -> dari gate modal langkah 1
       ?variant=single|multi    -> dari gate modal langkah 2
     "single"  = tanpa varian / hanya 1 varian:
        1) Nama produk, Kategori, Berat(fisik), Stok, Harga Jual, Harga Coret
        2) Deskripsi, Spesifikasi
        3) Rating awal, Jumlah terjual
        4) Foto Utama, Foto Thumbnail
     "multi"   = lebih dari 1 varian:
        1) Nama produk, Kategori, Berat(fisik), Deskripsi, Spesifikasi
        2) Stok, Harga Jual, Harga Coret per kombinasi varian
        3) Rating awal, Jumlah terjual
        4) Foto Utama + Foto per kombinasi varian
     5) Review & Simpan (sama utk semua mode)
     ========================================================================== */
  else if (document.getElementById("wizardBackBtn")) {
    var wdb = AdminShared.db;
    var wrupiah = AdminShared.rupiah;

    var qs = new URLSearchParams(location.search);
    var editId = qs.get("id");
    var gateType = qs.get("type");
    var gateVariant = qs.get("variant");

    if (!editId && (!gateType || !gateVariant)) {
      location.replace("linguahub.html");
      return;
    }

    function allVOptions() {
      return (wstate.vgroups || []).reduce(function (acc, g) { return acc.concat(g.options || []); }, []);
    }

    var wstate = {
      id: editId || null,
      type: gateType || "digital",
      mode: gateVariant || "single",
      category: "",
      categories: [],
      usedCategoryKeys: {},
      specs: [],
      vgroups: [],
      mainImage: "",
      galleryImages: []
    };

    var currentStep = 1;
    var TOTAL_STEPS = 5;

    function updateProgressBar(n) {
      var bar = document.getElementById("wizardProgressBar");
      if (bar) bar.style.width = Math.round((n / TOTAL_STEPS) * 100) + "%";
    }

    var previewState = { imgIndex: 0, qty: 1 };

    var exitModal = document.getElementById("exitConfirmModal");
    document.getElementById("wizardBackBtn").addEventListener("click", function () { exitModal.classList.add("open"); });
    document.getElementById("exitCloseBtn").addEventListener("click", function () { exitModal.classList.remove("open"); });
    document.getElementById("exitCancelBtn").addEventListener("click", function () { exitModal.classList.remove("open"); });
    exitModal.addEventListener("click", function (e) { if (e.target === exitModal) exitModal.classList.remove("open"); });
    document.getElementById("exitConfirmBtn").addEventListener("click", function () { location.href = "linguahub.html"; });

    var previewToggleBtn = document.getElementById("previewToggleBtn");
    var previewCloseBtn = document.getElementById("previewCloseBtn");
    var previewCol = document.getElementById("wizardPreviewCol");
    if (previewToggleBtn) previewToggleBtn.addEventListener("click", function () { document.body.classList.add("preview-open"); });
    if (previewCloseBtn) previewCloseBtn.addEventListener("click", function () { document.body.classList.remove("preview-open"); });
    if (previewCol) previewCol.addEventListener("click", function (e) { if (e.target === previewCol) document.body.classList.remove("preview-open"); });

    document.addEventListener("click", function (e) {
      if (e.target.closest(".vgroup-xselect")) return;
      document.querySelectorAll(".vgroup-xselect.open").forEach(function (xs) {
        xs.classList.remove("open");
        var m = xs.querySelector(".xselect__menu");
        if (m) m.hidden = true;
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      document.querySelectorAll(".vgroup-xselect.open").forEach(function (xs) {
        xs.classList.remove("open");
        var m = xs.querySelector(".xselect__menu");
        if (m) m.hidden = true;
      });
    });

    function tplTitle() {
      return '' +
        '<div class="field">' +
          '<label for="f_title">Nama Produk</label>' +
          '<input type="text" id="f_title" placeholder="Contoh: Template Konten Instagram Pro" />' +
          '<div class="field-error-msg" id="err_title" hidden></div>' +
        '</div>';
    }
    function tplCategory() {
      return '' +
        '<div class="field">' +
          '<label>Kategori</label>' +
          '<div class="xselect" id="xselect_category">' +
            '<button type="button" class="xselect__trigger" id="xselect_category_trigger">' +
              '<span class="xselect__value is-placeholder">Pilih kategori...</span>' +
              '<svg class="xselect__chev" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>' +
            '<div class="xselect__menu" id="xselect_category_menu" hidden></div>' +
          '</div>' +
        '</div>';
    }
    function tplWeightStockRow() {
      return '' +
        '<div class="field-row" id="weightStockRow">' +
          '<div class="field" id="fisikOnlyRow" hidden>' +
            '<label for="f_weight">Berat Produk (gram)</label>' +
            '<input type="number" id="f_weight" min="0" step="1" placeholder="Contoh: 250" />' +
            '<div class="hint">Wajib diisi untuk produk fisik.</div>' +
          '</div>' +
          '<div class="field" id="stockField">' +
            '<label for="f_stock">Stok</label>' +
            '<input type="number" id="f_stock" min="0" step="1" placeholder="0" />' +
            '<div class="hint" id="stockHint">Stok untuk produk fisik. Produk digital biasanya tidak dibatasi stok — kosongkan / isi 0 jika tak terbatas.</div>' +
          '</div>' +
        '</div>';
    }
    function tplPriceRow() {
      return '' +
        '<div class="field-row">' +
          '<div class="field">' +
            '<label for="f_price">Harga Jual</label>' +
            '<div class="input-prefix"><span>Rp</span><input type="number" id="f_price" min="0" step="1000" placeholder="0" /></div>' +
          '</div>' +
          '<div class="field">' +
            '<label for="f_oldPrice">Harga Coret (opsional)</label>' +
            '<div class="input-prefix"><span>Rp</span><input type="number" id="f_oldPrice" min="0" step="1000" placeholder="0" /></div>' +
          '</div>' +
        '</div>';
    }
    function tplCategoryWeightRow() {
      return '' +
        '<div class="field-row" id="categoryWeightRow">' +
          '<div class="field" id="categoryField">' +
            '<label>Kategori</label>' +
            '<div class="xselect" id="xselect_category">' +
              '<button type="button" class="xselect__trigger" id="xselect_category_trigger">' +
                '<span class="xselect__value is-placeholder">Pilih kategori...</span>' +
                '<svg class="xselect__chev" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</button>' +
              '<div class="xselect__menu" id="xselect_category_menu" hidden></div>' +
            '</div>' +
          '</div>' +
          '<div class="field" id="fisikOnlyRow" hidden>' +
            '<label for="f_weight">Berat Produk (gram)</label>' +
            '<input type="number" id="f_weight" min="0" step="1" placeholder="Contoh: 250" />' +
            '<div class="hint">Wajib diisi untuk produk fisik.</div>' +
          '</div>' +
        '</div>';
    }
    function tplDesc() {
      return '' +
        '<div class="field">' +
          '<label for="f_desc">Deskripsi</label>' +
          '<textarea id="f_desc" placeholder="Jelaskan produk ini secara singkat dan menarik..."></textarea>' +
        '</div>';
    }
    function tplSpecs() {
      return '' +
        '<div class="field">' +
          '<label>Spesifikasi</label>' +
          '<div class="hint" style="margin-bottom:6px;">Tambahkan pasangan atribut — nilai, mis. "Format" : "PDF + Canva".</div>' +
          '<div id="specList" class="multibox-list"></div>' +
          '<button type="button" class="btn-dashed" id="btnAddSpec" style="margin-top:6px;">' +
            '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
            'Tambah Spesifikasi' +
          '</button>' +
        '</div>';
    }
    function tplRatingSold() {
      return '' +
        '<div class="field-row">' +
          '<div class="field">' +
            '<label for="f_rating">Rating Awal</label>' +
            '<input type="number" id="f_rating" min="0" max="5" step="0.1" value="5.0" />' +
          '</div>' +
          '<div class="field">' +
            '<label for="f_sold">Jumlah Terjual (opsional)</label>' +
            '<input type="number" id="f_sold" min="0" step="1" value="0" />' +
          '</div>' +
        '</div>';
    }
    function tplVariantGroupsAndCombos() {
      return '' +
        '<div id="vgroupList"></div>' +
        '<button type="button" class="btn-dashed" id="btnAddVGroup">' +
          '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
          'Tambah Grup Varian' +
        '</button>';
    }
    function tplComboSection(gi) {
      return '' +
        '<div class="vgroup-combo" style="margin:10px 0 12px;">' +
          '<div class="vcombo-table-wrap" id="vcomboWrap-' + gi + '" style="margin-top:6px;">' +
            '<table class="vcombo-table">' +
              '<thead><tr><th>Foto</th><th>Kombinasi</th><th>Stok</th><th>Harga</th><th>Harga Coret</th><th></th></tr></thead>' +
              '<tbody id="vcomboTbody-' + gi + '"></tbody>' +
            '</table>' +
          '</div>' +
          '<button type="button" class="btn-dashed" data-vg-addvariant="' + gi + '" style="width:100%;justify-content:center;margin-top:8px;">' +
            '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
            'Tambah Varian' +
          '</button>' +
        '</div>';
    }
    function tplPhotosSingle() {
      return '' +
        '<div class="field">' +
          '<label>Foto Utama</label>' +
          '<div class="upload-grid" style="grid-template-columns:1fr;max-width:260px;">' +
            '<label class="upload-slot upload-slot-main" id="mainPhotoSlot" style="max-width:260px;">' +
              '<span id="mainPhotoPlaceholder">' + photoPlaceholderSvg() + '<div>Foto Utama</div></span>' +
              '<input type="file" id="mainPhotoInput" accept="image/*" />' +
            '</label>' +
          '</div>' +
          '<div class="upload-hint">Foto utama tampil sebagai sampul produk di katalog &amp; halaman detail. Ukuran ideal 1080 x 1350px (rasio 4:5). Format JPG/PNG/WebP, maks 10MB.</div>' +
        '</div>' +
        '<div class="field" style="margin-top:16px;">' +
          '<label>Galeri Foto Tambahan</label>' +
          '<div class="upload-grid upload-grid-gallery" id="galleryPhotoGrid"></div>' +
          '<input type="file" id="galleryPhotoInput" accept="image/*" multiple hidden />' +
          '<div class="upload-hint">Opsional — tambahkan lebih banyak foto untuk slider galeri di halaman detail produk (ukuran ideal 1080 x 1350px), nggak dibatasi jumlahnya.</div>' +
        '</div>';
    }
    var tplPhotosMulti = tplPhotosSingle;
    function photoPlaceholderSvg() {
      return '<svg width="22" height="22" viewBox="0 0 16 16" fill="none"><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1.2l.8-1.2h5l.8 1.2h1.2A1.5 1.5 0 0 1 14 5.5v6A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-6z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="8" cy="8.2" r="2.1" stroke="currentColor" stroke-width="1.2"/></svg>';
    }

    var STEP_DEFS = {
      single: [
        { label: "Info & Harga", sub: "Nama, kategori, dan harga jual produk.", tpl: function () { return tplTitle() + tplCategory() + tplWeightStockRow() + tplPriceRow(); } },
        { label: "Deskripsi", sub: "Ceritakan detail produknya.", tpl: function () { return tplDesc() + tplSpecs(); } },
        { label: "Rating & Terjual", sub: "Data awal tampilan produk.", tpl: tplRatingSold },
        { label: "Foto", sub: "Foto utama dan galeri foto produk.", tpl: tplPhotosSingle }
      ],
      multi: [
        { label: "Info Dasar", sub: "Nama, kategori, dan detail umum produk.", tpl: function () { return tplTitle() + tplCategoryWeightRow() + tplDesc() + tplSpecs(); } },
        { label: "Varian & Harga", sub: "Atur stok, harga jual, dan harga coret tiap kombinasi.", tpl: tplVariantGroupsAndCombos },
        { label: "Rating & Terjual", sub: "Data awal tampilan produk.", tpl: tplRatingSold },
        { label: "Foto", sub: "Foto utama dan galeri foto produk.", tpl: tplPhotosMulti }
      ]
    };
    STEP_DEFS.single.push({ label: "Review", isReview: true });
    STEP_DEFS.multi.push({ label: "Review", isReview: true });

    function buildWizardShell() {
      var steps = STEP_DEFS[wstate.mode];
      var stepsWrap = document.getElementById("wizardSteps");
      var panelsWrap = document.getElementById("wizardPanels");

      var stepsHtml = "";
      steps.forEach(function (s, i) {
        var n = i + 1;
        stepsHtml += '<div class="wizard-step' + (n === 1 ? " active" : "") + '" data-step="' + n + '">' +
          '<div class="wizard-step__dot">' + n + '</div><div class="wizard-step__label">' + s.label + '</div></div>';
        if (n < steps.length) stepsHtml += '<div class="wizard-step-line"></div>';
      });
      stepsWrap.innerHTML = stepsHtml;

      var panelsHtml = "";
      for (var i = 0; i < steps.length - 1; i++) {
        var s = steps[i];
        var n = i + 1;
        panelsHtml +=
          '<section class="wizard-panel' + (n === 1 ? " active" : "") + '" data-panel="' + n + '">' +
            '<div class="wizard-section-title">' + s.label + '</div>' +
            '<div class="wizard-section-sub">' + s.sub + '</div>' +
            '<div class="wizard-form-grid">' + s.tpl() + '</div>' +
            '<div class="wizard-footer">' +
              (n === 1 ? '<span></span>' : '<button class="btn btn-ghost" data-prev="' + (n - 1) + '">Kembali</button>') +
              '<div class="wizard-footer-right"><button class="btn btn-primary" data-next="' + (n + 1) + '">Lanjut</button></div>' +
            '</div>' +
          '</section>';
      }
      panelsWrap.innerHTML = panelsHtml;
      updateProgressBar(currentStep);

      panelsWrap.addEventListener("click", function (e) {
        var nextBtn = e.target.closest("[data-next]");
        if (nextBtn) { goStep(Number(nextBtn.dataset.next)); return; }
        var prevBtn = e.target.closest("[data-prev]");
        if (prevBtn) { goStep(Number(prevBtn.dataset.prev)); return; }
        var gotoBtn = e.target.closest("[data-goto-step]");
        if (gotoBtn) { goStep(Number(gotoBtn.dataset.gotoStep)); return; }
      });

      panelsWrap.addEventListener("input", function (e) {
        if (e.target.matches("input, textarea")) renderPreview();
      });
      panelsWrap.addEventListener("change", function (e) {
        if (e.target.matches("input, textarea")) renderPreview();
      });

      renderPreview();
    }

    async function init() {
      buildWizardShell();
      bindDynamicFieldEvents();

      try {
        var catRes = await Promise.all([wdb.listCategories(), wdb.listProducts()]);
        wstate.categories = catRes[0];
        wstate.usedCategoryKeys = {};
        catRes[1].forEach(function (p) { if (p.category) wstate.usedCategoryKeys[p.category] = true; });
        buildCategoryXSelect();
      } catch (e) {
        AdminShared.toast("Gagal memuat kategori", "error");
      }

      if (editId) {
        document.getElementById("wizardTitle").textContent = "Edit Produk";
        try {
          var row = await wdb.getProduct(editId);
          if (!row) { AdminShared.toast("Produk tidak ditemukan", "error"); location.href = "linguahub.html"; return; }
          hydrateFromRow(row);
        } catch (e) {
          AdminShared.toast("Gagal memuat produk", "error");
        }
      } else {
        addSpecRow();
      }

      applyTypeUI();
      renderSpecs();
      renderVGroups();
      renderMainPhoto();
      renderGalleryPhotos();
      renderPreview();
    }

    function hydrateFromRow(row) {
      wstate.id = row.id;
      wstate.type = row.type || "digital";
      var vp = row.variant_pricing || {};
      wstate.vgroups = (row.variant_groups || []).map(function (g) {
        return {
          id: g.id || ("vg" + (++vgroupSeq)),
          name: g.name || "",
          options: (g.options || []).map(function (optVal) {
            var pr = vp[optVal] || {};
            return { id: "vopt" + (++voptSeq), value: optVal, stock: pr.stock || "", price: pr.price || "", oldPrice: pr.oldPrice || "", image: pr.image || "" };
          })
        };
      });
      wstate.mode = wstate.vgroups.length > 0 ? "multi" : "single";
      buildWizardShell();
      bindDynamicFieldEvents();
      buildCategoryXSelect();

      document.getElementById("f_title").value = row.title || "";
      setCategory(row.category || "");
      document.getElementById("f_rating").value = row.rating || 5;
      document.getElementById("f_sold").value = row.sold || 0;
      if (document.getElementById("f_weight")) document.getElementById("f_weight").value = row.weight || "";
      document.getElementById("f_desc").value = row.description || row.short_desc || "";

      var specs = row.specs || {};
      wstate.specs = Object.keys(specs).map(function (k) { return { key: k, value: specs[k] }; });
      if (!wstate.specs.length) wstate.specs.push({ key: "", value: "" });

      if (wstate.mode === "single") {
        document.getElementById("f_price").value = row.price || "";
        document.getElementById("f_oldPrice").value = row.old_price || "";
        document.getElementById("f_stock").value = row.stock || "";
      }

      wstate.mainImage = (row.images && row.images[0]) || "";
      wstate.galleryImages = (row.images && row.images.length > 1) ? row.images.slice(1) : [];
      renderMainPhoto();
      renderGalleryPhotos();
    }

    function applyTypeUI() {
      var isFisik = wstate.type === "fisik";
      document.getElementById("wizardTypeBadge").textContent = isFisik ? "Produk Fisik" : "Produk Digital";
      var weightRow = document.getElementById("fisikOnlyRow");
      if (weightRow) weightRow.hidden = !isFisik;
      var stockHint = document.getElementById("stockHint");
      if (stockHint) {
        stockHint.textContent = isFisik
          ? "Stok fisik yang tersedia untuk dijual."
          : "Produk digital biasanya tak terbatas — boleh dikosongkan / isi 0 jika tidak dibatasi.";
      }
      renderPreview();
    }

    function visibleCategories() {
      return wstate.categories.filter(function (c) {
        return wstate.usedCategoryKeys[c.key] || c.key === wstate.category || c._sessionAdded;
      });
    }

    function buildCategoryXSelect() {
      var xselect = document.getElementById("xselect_category");
      if (!xselect) return;
      var trigger = document.getElementById("xselect_category_trigger");
      var menu = document.getElementById("xselect_category_menu");
      var valueEl = trigger.querySelector(".xselect__value");

      function renderMenu() {
        var cats = visibleCategories();
        menu.innerHTML =
          (cats.length
            ? cats.map(function (c) {
                return '<button type="button" class="xselect__option' + (c.key === wstate.category ? " selected" : "") + '" data-cat-key="' + escAttr(c.key) + '">' + escAttr(c.label) + '</button>';
              }).join("")
            : '<div class="xselect__empty">Belum ada kategori</div>') +
          '<div class="xselect__custom-wrap">' +
            '<input type="text" class="xselect__custom-input" id="newCategoryInput" placeholder="Nama kategori baru..." />' +
            '<button type="button" class="btn-dashed" id="btnAddCategory" style="width:100%;justify-content:center;margin-top:7px;">' +
              '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
              'Tambah Kategori Baru' +
            '</button>' +
          '</div>';
        menu.querySelectorAll("[data-cat-key]").forEach(function (opt) {
          opt.addEventListener("click", function () {
            setCategory(opt.dataset.catKey);
            closeMenu();
          });
        });
        var addInput = menu.querySelector("#newCategoryInput");
        var addBtn = menu.querySelector("#btnAddCategory");
        addBtn.addEventListener("click", function (e) { e.stopPropagation(); addNewCategory(addInput.value); });
        addInput.addEventListener("click", function (e) { e.stopPropagation(); });
        addInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); addNewCategory(addInput.value); }
        });
      }

      async function addNewCategory(rawName) {
        var name = (rawName || "").trim();
        if (!name) { menu.querySelector("#newCategoryInput").focus(); return; }
        var key = AdminShared.slugify(name);
        if (!key) { AdminShared.toast("Nama kategori tidak valid", "error"); return; }
        var existing = wstate.categories.find(function (c) { return c.key === key; });
        if (existing) {
          existing._sessionAdded = true;
          setCategory(key);
          closeMenu();
          return;
        }
        var addBtn = menu.querySelector("#btnAddCategory");
        addBtn.disabled = true;
        try {
          var created = await wdb.createCategory({ key: key, label: name });
          created._sessionAdded = true;
          wstate.categories.push(created);
          setCategory(created.key);
          closeMenu();
          AdminShared.toast("Kategori \"" + name + "\" ditambahkan", "success");
        } catch (e) {
          AdminShared.toast(e.message || "Gagal menambah kategori", "error");
          addBtn.disabled = false;
        }
      }

      function openMenu() { renderMenu(); menu.hidden = false; xselect.classList.add("open"); }
      function closeMenu() { menu.hidden = true; xselect.classList.remove("open"); }

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        if (menu.hidden) openMenu(); else closeMenu();
      });
      document.addEventListener("click", function (e) {
        if (!xselect.contains(e.target)) closeMenu();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMenu();
      });

      updateCategoryLabel();
    }

    function updateCategoryLabel() {
      var trigger = document.getElementById("xselect_category_trigger");
      if (!trigger) return;
      var valueEl = trigger.querySelector(".xselect__value");
      var found = wstate.categories.find(function (c) { return c.key === wstate.category; });
      if (found) {
        valueEl.textContent = found.label;
        valueEl.classList.remove("is-placeholder");
      } else {
        valueEl.textContent = "Pilih kategori...";
        valueEl.classList.add("is-placeholder");
      }
    }

    function setCategory(key) {
      wstate.category = key || "";
      updateCategoryLabel();
      renderPreview();
    }

    function goStep(n) {
      if (n > currentStep && !validateStep(currentStep)) return;
      currentStep = n;
      document.querySelectorAll(".wizard-panel").forEach(function (p) {
        p.classList.toggle("active", Number(p.dataset.panel) === n);
      });
      document.querySelectorAll(".wizard-step").forEach(function (s) {
        var sn = Number(s.dataset.step);
        s.classList.toggle("active", sn === n);
        s.classList.toggle("done", sn < n);
      });
      if (n === TOTAL_STEPS) buildReview();
      updateProgressBar(n);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function validateStep(step) {
      if (step === 1) {
        var title = document.getElementById("f_title").value.trim();
        var errEl = document.getElementById("err_title");
        var inputEl = document.getElementById("f_title");
        if (!title) {
          errEl.textContent = "Nama produk wajib diisi.";
          errEl.hidden = false;
          inputEl.classList.add("field-error");
          return false;
        }
        errEl.hidden = true;
        inputEl.classList.remove("field-error");
        if (wstate.type === "fisik") {
          var w = document.getElementById("f_weight").value;
          if (!w || Number(w) <= 0) {
            AdminShared.toast("Isi berat produk (gram) untuk produk fisik.", "error");
            return false;
          }
        }
        if (wstate.mode === "single") {
          var price = document.getElementById("f_price").value;
          if (!price || Number(price) <= 0) {
            AdminShared.toast("Isi harga jual produk.", "error");
            return false;
          }
        }
      }
      if (step === 2 && wstate.mode === "multi") {
        var unnamedGroup = wstate.vgroups.some(function (g) { return g.options && g.options.length && !g.name; });
        if (unnamedGroup) {
          AdminShared.toast("Isi nama tiap grup varian (mis. Warna, Ukuran).", "error");
          return false;
        }
        var allOpts = allVOptions();
        if (!allOpts.length) {
          AdminShared.toast("Tambahkan minimal satu grup varian beserta opsinya.", "error");
          return false;
        }
        var unnamedOpt = allOpts.some(function (o) { return !o.value; });
        if (unnamedOpt) {
          AdminShared.toast("Isi nama tiap kombinasi varian (mis. Merah, Biru).", "error");
          return false;
        }
        var missing = allOpts.some(function (o) { return !o.price; });
        if (missing) {
          AdminShared.toast("Isi harga untuk semua kombinasi varian.", "error");
          return false;
        }
      }
      return true;
    }

    function bindDynamicFieldEvents() {
      var btnAddSpec = document.getElementById("btnAddSpec");
      if (btnAddSpec) btnAddSpec.addEventListener("click", function () { addSpecRow(); });

      var btnAddVGroup = document.getElementById("btnAddVGroup");
      if (btnAddVGroup) btnAddVGroup.addEventListener("click", function () {
        wstate.vgroups.push({ id: "vg" + (++vgroupSeq), name: "", options: [newVOption()] });
        renderVGroups();
      });

      var mainPhotoInput = document.getElementById("mainPhotoInput");
      if (mainPhotoInput) mainPhotoInput.addEventListener("change", async function () {
        var file = this.files[0];
        if (!file) return;
        wstate.mainImage = URL.createObjectURL(file);
        renderMainPhoto();
        try {
          var url = await AdminShared.uploadImage(file);
          wstate.mainImage = url;
          renderMainPhoto();
        } catch (e) {
          AdminShared.toast("Upload gagal, pakai preview lokal sementara.", "error");
        }
      });

      var galleryPhotoInput = document.getElementById("galleryPhotoInput");
      if (galleryPhotoInput) galleryPhotoInput.addEventListener("change", async function () {
        var files = Array.prototype.slice.call(this.files || []);
        this.value = "";
        if (!files.length) return;
        for (var i = 0; i < files.length; i++) {
          (function (file) {
            var entry = { url: URL.createObjectURL(file), uploading: true };
            wstate.galleryImages.push(entry);
            renderGalleryPhotos();
            AdminShared.uploadImage(file).then(function (url) {
              entry.url = url;
              entry.uploading = false;
              renderGalleryPhotos();
            }).catch(function () {
              entry.uploading = false;
              AdminShared.toast("Upload gagal, pakai preview lokal sementara.", "error");
              renderGalleryPhotos();
            });
          })(files[i]);
        }
      });
    }

    function addSpecRow(key, value) {
      wstate.specs.push({ key: key || "", value: value || "" });
      renderSpecs();
    }
    function renderSpecs() {
      var wrap = document.getElementById("specList");
      if (!wrap) return;
      wrap.innerHTML = "";
      wstate.specs.forEach(function (spec, i) {
        var row = document.createElement("div");
        row.className = "speaker-row";
        row.innerHTML =
          '<input type="text" placeholder="Atribut, mis. Format" value="' + escAttr(spec.key) + '" data-spec-key="' + i + '" />' +
          '<input type="text" placeholder="Nilai, mis. PDF + Canva" value="' + escAttr(spec.value) + '" data-spec-val="' + i + '" />' +
          '<button type="button" class="btn-remove-speaker" data-spec-del="' + i + '" aria-label="Hapus">' +
            '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M4 12l8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
          '</button>';
        wrap.appendChild(row);
      });
      wrap.querySelectorAll("[data-spec-key]").forEach(function (el) {
        el.addEventListener("input", function () { wstate.specs[Number(el.dataset.specKey)].key = el.value; });
      });
      wrap.querySelectorAll("[data-spec-val]").forEach(function (el) {
        el.addEventListener("input", function () { wstate.specs[Number(el.dataset.specVal)].value = el.value; });
      });
      wrap.querySelectorAll("[data-spec-del]").forEach(function (el) {
        el.addEventListener("click", function () { wstate.specs.splice(Number(el.dataset.specDel), 1); renderSpecs(); });
      });
      renderPreview();
    }

    var vgroupSeq = 0;
    var voptSeq = 0;
    var VGROUP_NAME_PRESETS = ["Warna", "Ukuran", "Model", "Rasa", "Varian"];

    function newVOption() {
      return { id: "vopt" + (++voptSeq), value: "", stock: "", price: "", oldPrice: "", image: "" };
    }

    function renderVGroups() {
      var wrap = document.getElementById("vgroupList");
      if (!wrap) return;
      wrap.innerHTML = "";
      wstate.vgroups.forEach(function (g, gi) {
        var el = document.createElement("div");
        el.className = "vgroup";
        var isPreset = VGROUP_NAME_PRESETS.indexOf(g.name) !== -1;
        el.innerHTML =
          '<div class="vgroup-head">' +
            '<div class="xselect vgroup-xselect" data-vg-xselect="' + gi + '">' +
              '<button type="button" class="xselect__trigger" data-vg-trigger="' + gi + '">' +
                '<span class="xselect__value' + (g.name ? '' : ' is-placeholder') + '">' + (g.name ? escAttr(g.name) : "Pilih / tulis nama grup...") + '</span>' +
                '<svg class="xselect__chev" width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</button>' +
              '<div class="xselect__menu" hidden>' +
                VGROUP_NAME_PRESETS.map(function (p) {
                  return '<button type="button" class="xselect__option' + (g.name === p ? " selected" : "") + '" data-vg-preset="' + gi + '" data-preset-value="' + escAttr(p) + '">' + p + '</button>';
                }).join("") +
                '<div class="xselect__custom-wrap">' +
                  '<input type="text" class="xselect__custom-input" placeholder="Atau tulis nama sendiri..." data-vg-custom="' + gi + '" value="' + (isPreset ? "" : escAttr(g.name)) + '" />' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="vgroup-remove" data-vg-del="' + gi + '" aria-label="Hapus grup">' +
              '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M4 12l8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button>' +
          '</div>' +
          tplComboSection(gi);
        wrap.appendChild(el);
        renderVariantRows(gi);
      });

      wrap.querySelectorAll("[data-vg-trigger]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var xs = btn.closest(".xselect");
          var menu = xs.querySelector(".xselect__menu");
          var willOpen = menu.hidden;
          wrap.querySelectorAll(".xselect__menu").forEach(function (m) { m.hidden = true; m.closest(".xselect").classList.remove("open"); });
          if (willOpen) { menu.hidden = false; xs.classList.add("open"); }
        });
      });
      wrap.querySelectorAll("[data-vg-preset]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var gi = Number(btn.dataset.vgPreset);
          wstate.vgroups[gi].name = btn.dataset.presetValue;
          renderVGroups();
        });
      });
      wrap.querySelectorAll("[data-vg-custom]").forEach(function (input) {
        input.addEventListener("input", function () {
          var gi = Number(input.dataset.vgCustom);
          wstate.vgroups[gi].name = input.value;
          var xs = input.closest(".xselect");
          var valueEl = xs.querySelector(".xselect__trigger .xselect__value");
          valueEl.textContent = input.value || "Pilih / tulis nama grup...";
          valueEl.classList.toggle("is-placeholder", !input.value);
          renderPreview();
        });
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            var xs = input.closest(".xselect");
            xs.classList.remove("open");
            xs.querySelector(".xselect__menu").hidden = true;
          }
        });
      });
      wrap.querySelectorAll("[data-vg-del]").forEach(function (el) {
        el.addEventListener("click", function () { wstate.vgroups.splice(Number(el.dataset.vgDel), 1); renderVGroups(); });
      });
      wrap.querySelectorAll("[data-vg-addvariant]").forEach(function (el) {
        el.addEventListener("click", function () {
          var gi = Number(el.dataset.vgAddvariant);
          wstate.vgroups[gi].options.push(newVOption());
          renderVariantRows(gi);
          renderPreview();
        });
      });
      renderPreview();
    }

    function renderVariantRows(gi) {
      var tbody = document.getElementById("vcomboTbody-" + gi);
      if (!tbody) return;
      var g = wstate.vgroups[gi];
      tbody.innerHTML = "";
      g.options.forEach(function (opt, oi) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td><label class="vcombo-photo" data-opt-photo="' + opt.id + '">' +
            (opt.image ? '<img src="' + opt.image + '" alt="">' : photoIconSvg()) +
            '<input type="file" accept="image/*" data-opt-file="' + opt.id + '" /></label></td>' +
          '<td class="vcombo-name"><input type="text" placeholder="mis. Merah" value="' + escAttr(opt.value) + '" data-opt-value="' + opt.id + '" /></td>' +
          '<td><input type="number" min="0" step="1" placeholder="0" value="' + (opt.stock || "") + '" data-opt-stock="' + opt.id + '" /></td>' +
          '<td><div class="input-prefix"><span>Rp</span><input type="number" min="0" step="1000" placeholder="0" value="' + (opt.price || "") + '" data-opt-price="' + opt.id + '" style="padding-left:30px;"/></div></td>' +
          '<td><div class="input-prefix"><span>Rp</span><input type="number" min="0" step="1000" placeholder="0" value="' + (opt.oldPrice || "") + '" data-opt-oldprice="' + opt.id + '" style="padding-left:30px;"/></div></td>' +
          '<td><button type="button" class="vgroup-remove" data-opt-del="' + opt.id + '" aria-label="Hapus varian">' +
            '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M4 12l8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
          '</button></td>';
        tbody.appendChild(tr);
      });

      function findOpt(id) { return g.options.find(function (o) { return o.id === id; }); }

      tbody.querySelectorAll("[data-opt-value]").forEach(function (elInput) {
        elInput.addEventListener("input", function () { findOpt(elInput.dataset.optValue).value = elInput.value; renderPreview(); });
      });
      tbody.querySelectorAll("[data-opt-stock]").forEach(function (elInput) {
        elInput.addEventListener("input", function () { findOpt(elInput.dataset.optStock).stock = elInput.value; });
      });
      tbody.querySelectorAll("[data-opt-price]").forEach(function (elInput) {
        elInput.addEventListener("input", function () { findOpt(elInput.dataset.optPrice).price = elInput.value; renderPreview(); });
      });
      tbody.querySelectorAll("[data-opt-oldprice]").forEach(function (elInput) {
        elInput.addEventListener("input", function () { findOpt(elInput.dataset.optOldprice).oldPrice = elInput.value; renderPreview(); });
      });
      tbody.querySelectorAll("[data-opt-file]").forEach(function (elInput) {
        elInput.addEventListener("change", function () { handleVariantPhoto(gi, elInput.dataset.optFile, elInput.files[0]); });
      });
      tbody.querySelectorAll("[data-opt-del]").forEach(function (elBtn) {
        elBtn.addEventListener("click", function () {
          g.options = g.options.filter(function (o) { return o.id !== elBtn.dataset.optDel; });
          renderVariantRows(gi);
          renderPreview();
        });
      });
    }

    function photoIconSvg() {
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h1.2l.8-1.2h5l.8 1.2h1.2A1.5 1.5 0 0 1 14 5.5v6A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-6z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/><circle cx="8" cy="8.2" r="1.9" stroke="currentColor" stroke-width="1.1"/></svg>';
    }

    async function handleVariantPhoto(gi, optId, file) {
      if (!file) return;
      var opt = wstate.vgroups[gi].options.find(function (o) { return o.id === optId; });
      if (!opt) return;
      try {
        AdminShared.toast("Mengunggah foto varian...");
        opt.image = await AdminShared.uploadImage(file);
      } catch (e) {
        opt.image = URL.createObjectURL(file);
        AdminShared.toast("Upload gagal, pakai preview lokal sementara.", "error");
      }
      renderVariantRows(gi);
      renderPreview();
    }

    function renderMainPhoto() { renderSinglePhotoSlot("mainPhotoSlot", "mainPhotoPlaceholder", wstate.mainImage, function () { wstate.mainImage = ""; renderMainPhoto(); }); }

    function renderGalleryPhotos() {
      var grid = document.getElementById("galleryPhotoGrid");
      if (!grid) return;
      var html = wstate.galleryImages.map(function (entry, i) {
        var url = typeof entry === "string" ? entry : entry.url;
        var uploading = typeof entry === "object" && entry.uploading;
        return (
          '<div class="upload-slot has-img gallery-photo-slot' + (uploading ? " is-uploading" : "") + '">' +
            '<img src="' + url + '" alt="Foto galeri ' + (i + 1) + '">' +
            (uploading ? '<span class="upload-slot__uploading">Mengunggah…</span>' : '') +
            '<button type="button" class="upload-slot__remove" data-gallery-remove="' + i + '" aria-label="Hapus foto">&times;</button>' +
          '</div>'
        );
      }).join("");
      html += '<button type="button" class="upload-slot upload-slot-add" id="galleryPhotoAddBtn" aria-label="Tambah foto galeri">' +
        '<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '<div>Tambah Foto</div>' +
      '</button>';
      grid.innerHTML = html;

      grid.querySelectorAll("[data-gallery-remove]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          wstate.galleryImages.splice(Number(btn.dataset.galleryRemove), 1);
          renderGalleryPhotos();
        });
      });
      var addBtn = document.getElementById("galleryPhotoAddBtn");
      if (addBtn) addBtn.addEventListener("click", function () {
        var input = document.getElementById("galleryPhotoInput");
        if (input) input.click();
      });
      renderPreview();
    }

    function renderSinglePhotoSlot(slotId, placeholderId, imgUrl, onRemove) {
      var slot = document.getElementById(slotId);
      if (!slot) return;
      var placeholder = document.getElementById(placeholderId);
      var existingImg = slot.querySelector("img");
      var existingRemove = slot.querySelector(".upload-slot__remove");
      if (existingImg) existingImg.remove();
      if (existingRemove) existingRemove.remove();
      if (imgUrl) {
        slot.classList.add("has-img");
        placeholder.hidden = true;
        var img = document.createElement("img");
        img.src = imgUrl;
        slot.appendChild(img);
        var rm = document.createElement("button");
        rm.type = "button";
        rm.className = "upload-slot__remove";
        rm.innerHTML = "&times;";
        rm.addEventListener("click", function (e) { e.preventDefault(); onRemove(); });
        slot.appendChild(rm);
      } else {
        slot.classList.remove("has-img");
        placeholder.hidden = false;
      }
      renderPreview();
    }

    function renderPreview() {
      var scr = document.getElementById("previewScreen");
      if (!scr) return;

      var elTitle = document.getElementById("f_title");
      var elRating = document.getElementById("f_rating");
      var elSold = document.getElementById("f_sold");
      var elDesc = document.getElementById("f_desc");
      var elWeight = document.getElementById("f_weight");

      var title = elTitle ? elTitle.value.trim() : "";
      var catLabel = (wstate.categories.find(function (c) { return c.key === wstate.category; }) || {}).label || "";
      var rating = elRating && elRating.value ? elRating.value : "5.0";
      var sold = elSold && elSold.value ? elSold.value : "0";
      var desc = elDesc ? elDesc.value.trim() : "";
      var weight = elWeight ? elWeight.value : "";
      var isFisik = wstate.type === "fisik";

      var price = 0, oldPrice = 0;
      var variantChipsHtml = "";

      if (wstate.mode === "multi") {
        var comboVals = allVOptions();
        var prices = comboVals.map(function (c) { return Number(c.price) || 0; }).filter(function (n) { return n > 0; });
        price = prices.length ? Math.min.apply(null, prices) : 0;
        var withOld = comboVals.filter(function (c) { return Number(c.oldPrice) > 0; });
        oldPrice = withOld.length ? Math.max.apply(null, withOld.map(function (c) { return Number(c.oldPrice); })) : 0;

        var groupsWithOptions = (wstate.vgroups || []).filter(function (g) { return g.options && g.options.length; });
        if (groupsWithOptions.length) {
          variantChipsHtml = groupsWithOptions.map(function (g) {
            return '<div class="ppd-vgroup">' +
              '<div class="ppd-vgroup-name">' + escAttr(g.name || "Varian") + '</div>' +
              '<div class="ppd-chip-row">' + g.options.map(function (o, i) {
                return '<span class="ppd-chip' + (i === 0 ? " active" : "") + '">' + escAttr(o.value || "(belum diisi)") + '</span>';
              }).join("") + '</div></div>';
          }).join("");
        }
      } else {
        var elPrice = document.getElementById("f_price");
        var elOldPrice = document.getElementById("f_oldPrice");
        price = elPrice ? Number(elPrice.value || 0) : 0;
        oldPrice = elOldPrice ? Number(elOldPrice.value || 0) : 0;
      }

      var discount = (oldPrice > price && price > 0) ? Math.round((1 - price / oldPrice) * 100) : 0;

      var galleryImages = [];
      function pushImg(u) { if (u && galleryImages.indexOf(u) === -1) galleryImages.push(u); }
      pushImg(wstate.mainImage);
      wstate.galleryImages.forEach(function (entry) {
        pushImg(typeof entry === "string" ? entry : entry.url);
      });
      if (wstate.mode === "multi") {
        allVOptions().forEach(function (c) { pushImg(c.image); });
      }

      if (previewState.imgIndex >= galleryImages.length) previewState.imgIndex = 0;
      if (previewState.imgIndex < 0) previewState.imgIndex = 0;
      var activeImg = galleryImages[previewState.imgIndex] || "";
      var hasMultipleImgs = galleryImages.length > 1;

      var arrowsHtml = hasMultipleImgs
        ? '<button type="button" class="ppd-gallery__arrow ppd-gallery__arrow--prev" id="ppdArrowPrev" aria-label="Foto sebelumnya"' + (previewState.imgIndex <= 0 ? " disabled" : "") + '>' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>' +
          '</button>' +
          '<button type="button" class="ppd-gallery__arrow ppd-gallery__arrow--next" id="ppdArrowNext" aria-label="Foto berikutnya"' + (previewState.imgIndex >= galleryImages.length - 1 ? " disabled" : "") + '>' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>' +
          '</button>'
        : "";

      var thumbsHtml = hasMultipleImgs
        ? '<div class="ppd-thumbs" id="ppdThumbs">' + galleryImages.map(function (img, i) {
            return '<button type="button" class="ppd-thumb' + (i === previewState.imgIndex ? " active" : "") + '" data-thumb-index="' + i + '" aria-label="Lihat foto ' + (i + 1) + '"><img src="' + img + '" alt=""></button>';
          }).join("") + '</div>'
        : "";

      var specsFilled = (wstate.specs || []).filter(function (s) { return s.key; });
      var specsHtml = specsFilled.length
        ? '<div class="ppd-specs">' + specsFilled.map(function (s) {
            return '<div class="ppd-spec-row"><span>' + escAttr(s.key) + '</span><span>' + escAttr(s.value) + '</span></div>';
          }).join("") + '</div>'
        : "";

      var breadcrumbHtml =
        '<div class="ppd-breadcrumb"><div class="ppd-breadcrumb__inner">' +
          '<span class="ppd-breadcrumb__link">Beranda</span>' +
          '<span class="ppd-breadcrumb__sep">&rsaquo;</span>' +
          (catLabel ? '<span class="ppd-breadcrumb__link">' + escAttr(catLabel) + '</span><span class="ppd-breadcrumb__sep">&rsaquo;</span>' : '') +
          '<span class="ppd-breadcrumb__current">' + (title ? escAttr(title) : "Produk") + '</span>' +
        '</div></div>';

      var qtyHtml =
        '<div class="ppd-qty-row">' +
          '<span class="ppd-qty-label">Jumlah</span>' +
          '<div class="ppd-qty">' +
            '<button type="button" class="ppd-qty__btn" id="ppdQtyMinus" aria-label="Kurangi jumlah">&minus;</button>' +
            '<input type="text" class="ppd-qty__input" id="ppdQtyInput" value="' + previewState.qty + '" readonly aria-label="Jumlah produk" />' +
            '<button type="button" class="ppd-qty__btn" id="ppdQtyPlus" aria-label="Tambah jumlah">+</button>' +
          '</div>' +
        '</div>';

      scr.innerHTML =
        '<div class="ppd-navbar">' +
          '<button type="button" class="ppd-nav-back" aria-label="Kembali" disabled title="Nonaktif di mode preview">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>' +
          '</button>' +
          '<span class="ppd-nav-title">' + (title ? escAttr(title) : "Detail Produk") + '</span>' +
          '<button type="button" class="ppd-nav-cart" aria-label="Keranjang" disabled title="Nonaktif di mode preview">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
          '</button>' +
        '</div>' +
        breadcrumbHtml +
        '<div class="ppd-photo-wrap">' +
          '<div class="ppd-photo">' +
            (activeImg ? '<img src="' + activeImg + '" alt="">' : '<div class="ppd-photo-empty">Foto produk akan tampil di sini</div>') +
            (discount > 0 ? '<span class="ppd-badge-diskon">-' + discount + '%</span>' : '') +
            arrowsHtml +
          '</div>' +
        '</div>' +
        thumbsHtml +
        '<div class="ppd-body">' +
          (catLabel ? '<span class="ppd-category">' + escAttr(catLabel) + '</span>' : '') +
          '<div class="ppd-title">' + (title ? escAttr(title) : "Nama produk belum diisi") + '</div>' +
          '<div class="ppd-meta">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' +
            '<strong>' + escAttr(rating) + '</strong>' +
            '<span class="dot">&bull;</span><span>' + escAttr(sold) + ' terjual</span>' +
          '</div>' +
          '<div class="ppd-price">' +
            '<span class="ppd-price-now">' + wrupiah(price) + '</span>' +
            (oldPrice > price ? '<span class="ppd-price-old">' + wrupiah(oldPrice) + '</span>' : '') +
            (oldPrice > price ? '<span class="ppd-discount-tag">Hemat ' + wrupiah(oldPrice - price) + '</span>' : '') +
          '</div>' +
          qtyHtml +
          variantChipsHtml +
          (desc || specsHtml ? '<div class="ppd-section-label">Deskripsi</div>' : '') +
          (desc ? '<div class="ppd-desc">' + escAttr(desc) + '</div>' : '') +
          (specsHtml ? '<div class="ppd-section-label">Spesifikasi</div>' + specsHtml : '') +
        '</div>' +
        '<div class="ppd-actions">' +
          '<button type="button" class="ppd-btn ppd-btn--cart" id="ppdAddCartBtn" disabled title="Nonaktif di mode preview">+ Keranjang</button>' +
          '<button type="button" class="ppd-btn ppd-btn--buy" id="ppdBuyBtn" disabled title="Nonaktif di mode preview">Beli Sekarang</button>' +
        '</div>';

      bindPreviewInteractions(galleryImages.length);
    }

    function bindPreviewInteractions(galleryCount) {
      var qtyMinusBtn = document.getElementById("ppdQtyMinus");
      var qtyPlusBtn = document.getElementById("ppdQtyPlus");
      if (qtyMinusBtn) qtyMinusBtn.addEventListener("click", function () {
        if (previewState.qty > 1) { previewState.qty--; renderPreview(); }
      });
      if (qtyPlusBtn) qtyPlusBtn.addEventListener("click", function () {
        if (previewState.qty < 99) { previewState.qty++; renderPreview(); }
      });

      var arrowPrev = document.getElementById("ppdArrowPrev");
      var arrowNext = document.getElementById("ppdArrowNext");
      if (arrowPrev) arrowPrev.addEventListener("click", function () {
        if (previewState.imgIndex > 0) { previewState.imgIndex--; renderPreview(); }
      });
      if (arrowNext) arrowNext.addEventListener("click", function () {
        if (previewState.imgIndex < galleryCount - 1) { previewState.imgIndex++; renderPreview(); }
      });

      var thumbs = document.querySelectorAll("#ppdThumbs [data-thumb-index]");
      thumbs.forEach(function (btn) {
        btn.addEventListener("click", function () {
          previewState.imgIndex = Number(btn.dataset.thumbIndex);
          renderPreview();
        });
      });
    }

    function buildReview() {
      var title = document.getElementById("f_title").value.trim() || "(Tanpa nama)";
      var catLabel = (wstate.categories.find(function (c) { return c.key === wstate.category; }) || {}).label || "—";
      var rating = document.getElementById("f_rating").value || "5.0";
      var sold = document.getElementById("f_sold").value || "0";

      var heroImg = wstate.mainImage || "";
      document.getElementById("rvHeroImg").src = heroImg;
      document.getElementById("rvHeroImg").style.visibility = heroImg ? "visible" : "hidden";
      document.getElementById("rvHeroTitle").textContent = title;
      document.getElementById("rvHeroMeta").textContent = catLabel + " · " + (wstate.type === "fisik" ? "Fisik" : "Digital");

      document.getElementById("rvCategory").textContent = catLabel;
      document.getElementById("rvType").textContent = wstate.type === "fisik" ? "Fisik" : "Digital";
      document.getElementById("rvRating").textContent = rating;
      document.getElementById("rvSold").textContent = sold;
      document.getElementById("rvWeightRow").hidden = wstate.type !== "fisik";
      document.getElementById("rvWeight").textContent = ((document.getElementById("f_weight") || {}).value || "0") + " gram";

      var pricingBody = document.getElementById("rvPricingBody");
      pricingBody.innerHTML = "";
      if (wstate.mode === "multi") {
        var reviewOpts = allVOptions();
        reviewOpts.forEach(function (c) {
          var row = document.createElement("div");
          row.className = "review-row";
          var priceStr = wrupiah(c.price) + (c.oldPrice ? ' <s style="opacity:.55;">' + wrupiah(c.oldPrice) + '</s>' : '');
          row.innerHTML = '<span class="review-row__label">' + escAttr(c.value || "(belum diisi)") + '</span><span class="review-row__value">' + priceStr + ' · stok ' + (c.stock || 0) + '</span>';
          pricingBody.appendChild(row);
        });
        if (!reviewOpts.length) pricingBody.innerHTML = '<div class="review-row"><span class="review-row__label">Belum ada kombinasi varian</span></div>';
      } else {
        var price = document.getElementById("f_price").value;
        var oldPrice = document.getElementById("f_oldPrice").value;
        var stock = document.getElementById("f_stock").value;
        pricingBody.innerHTML =
          '<div class="review-row"><span class="review-row__label">Harga</span><span class="review-row__value">' + wrupiah(price) + '</span></div>' +
          (oldPrice ? '<div class="review-row"><span class="review-row__label">Harga Coret</span><span class="review-row__value">' + wrupiah(oldPrice) + '</span></div>' : '') +
          '<div class="review-row"><span class="review-row__label">Stok</span><span class="review-row__value">' + (stock || "Tak terbatas") + '</span></div>';
      }

      var photoBody = document.getElementById("rvPhotoBody");
      var photoRows =
        '<div class="review-row"><span class="review-row__label">Foto Utama</span><span class="review-row__value">' + (wstate.mainImage ? "Terpasang" : "Belum ada") + '</span></div>' +
        '<div class="review-row"><span class="review-row__label">Galeri Foto Tambahan</span><span class="review-row__value">' + wstate.galleryImages.length + ' foto</span></div>';
      if (wstate.mode === "multi") {
        var photoOpts = allVOptions();
        var withPhoto = photoOpts.filter(function (c) { return c.image; }).length;
        photoRows += '<div class="review-row"><span class="review-row__label">Foto per Varian</span><span class="review-row__value">' + withPhoto + ' / ' + photoOpts.length + ' kombinasi</span></div>';
      }
      photoBody.innerHTML = photoRows;
    }

    function buildPayload() {
      var specs = {};
      wstate.specs.forEach(function (s) { if (s.key) specs[s.key] = s.value; });

      var images = [];
      if (wstate.mainImage) images.push(wstate.mainImage);
      wstate.galleryImages.forEach(function (entry) {
        var url = typeof entry === "string" ? entry : entry.url;
        if (url) images.push(url);
      });

      var variantGroupsOut = [];
      var variantPricingOut = {};
      if (wstate.mode === "multi") {
        wstate.vgroups.filter(function (g) { return g.name && g.options.length; }).forEach(function (g) {
          variantGroupsOut.push({ id: g.id, name: g.name, options: g.options.map(function (o) { return o.value; }) });
          g.options.forEach(function (o) {
            variantPricingOut[o.value] = { price: Number(o.price) || 0, oldPrice: Number(o.oldPrice) || 0, stock: Number(o.stock) || 0, image: o.image || "", label: o.value };
          });
        });
      }

      var payload = {
        title: document.getElementById("f_title").value.trim(),
        category: wstate.category || null,
        type: wstate.type,
        weight: wstate.type === "fisik" ? Number((document.getElementById("f_weight") || {}).value || 0) : null,
        rating: Number(document.getElementById("f_rating").value || 5),
        sold: Number(document.getElementById("f_sold").value || 0),
        description: document.getElementById("f_desc").value.trim(),
        specs: specs,
        images: images,
        variant_groups: variantGroupsOut,
        variant_pricing: variantPricingOut
      };

      if (wstate.mode === "multi") {
        var allOpts = allVOptions();
        var prices = allOpts.map(function (c) { return Number(c.price) || 0; }).filter(Boolean);
        payload.price = prices.length ? Math.min.apply(null, prices) : 0;
        payload.stock = allOpts.reduce(function (s, c) { return s + (Number(c.stock) || 0); }, 0);
      } else {
        payload.price = Number(document.getElementById("f_price").value || 0);
        payload.old_price = document.getElementById("f_oldPrice").value ? Number(document.getElementById("f_oldPrice").value) : null;
        payload.stock = document.getElementById("f_stock").value ? Number(document.getElementById("f_stock").value) : null;
      }
      return payload;
    }

    async function save(publish) {
      if (!validateStep(1) || !validateStep(2)) { goStep(!validateStep(1) ? 1 : 2); return; }
      var payload = buildPayload();
      try {
        if (wstate.id) {
          await wdb.updateProduct(wstate.id, payload);
        } else {
          await wdb.createProduct(payload);
        }
        sessionStorage.setItem("admin_toast", publish ? "Produk berhasil dipublikasikan" : "Draft produk disimpan");
        location.href = "linguahub.html";
      } catch (e) {
        console.error(e);
        AdminShared.toast(e.message || "Gagal menyimpan produk", "error");
      }
    }

    document.getElementById("btnPublish").addEventListener("click", function () { save(true); });
    document.getElementById("btnSaveDraft").addEventListener("click", function () { save(false); });
    document.getElementById("btnSaveDraftTop").addEventListener("click", function () { save(false); });

    document.querySelectorAll("[data-prev]").forEach(function (b) {
      if (!b.closest("#wizardPanels")) b.addEventListener("click", function () { goStep(Number(b.dataset.prev)); });
    });

    function escAttr(s) {
      return String(s || "").replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    init();
  }
})();
