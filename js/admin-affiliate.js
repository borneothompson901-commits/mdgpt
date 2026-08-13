(function () {
  "use strict";

  if (!document.getElementById("affiliateTbody")) return;

  var db = AdminShared.db;
  var rupiah = AdminShared.rupiah;

  var state = { affiliates: [], search: "" };
  var editingId = null;
  var deletingId = null;

  var tbody = document.getElementById("affiliateTbody");
  var emptyState = document.getElementById("affiliateEmptyState");
  var searchInput = document.getElementById("affSearchInput");
  var navCount = document.getElementById("navAffiliateCount");

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function truncateEmail(email) {
    email = email || "";
    if (email.length <= 22) return email;
    var at = email.indexOf("@");
    if (at === -1) return email.slice(0, 20) + "…";
    var local = email.slice(0, at);
    var domain = email.slice(at);
    if (local.length <= 10) return email.slice(0, 20) + "…";
    return local.slice(0, 8) + "…" + domain;
  }

  function digitsOnly(str) {
    return (str || "").replace(/\D/g, "");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidWhatsapp(num) {
    var d = digitsOnly(num);
    return d.length >= 9 && d.length <= 14;
  }

  function normalizeWhatsapp(num) {
    var d = digitsOnly(num);
    if (d.charAt(0) === "0") d = "62" + d.slice(1);
    if (d.slice(0, 2) !== "62") d = "62" + d;
    return d;
  }

  function iconWa() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-1.5-.7-2.4-1.3-3.4-2.9-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5-.1-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .9.9-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>';
  }

  function iconCopy() {
    return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="5.5" width="8" height="8" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 5.5V3.9A1.4 1.4 0 0 0 9.1 2.5H3.9A1.4 1.4 0 0 0 2.5 3.9v5.2a1.4 1.4 0 0 0 1.4 1.4h1.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  }

  function formatWaLocal(waDigits) {
    var d = String(waDigits || "");
    if (d.slice(0, 2) === "62") d = "0" + d.slice(2);
    return d;
  }

  function copyWaToClipboard(btn, waDigits) {
    var text = formatWaLocal(waDigits);
    function showCopiedHint() {
      var hint = document.createElement("span");
      hint.className = "copy-hint";
      hint.textContent = "Tersalin!";
      btn.style.position = "relative";
      btn.appendChild(hint);
      requestAnimationFrame(function () { hint.classList.add("show"); });
      setTimeout(function () {
        hint.classList.remove("show");
        setTimeout(function () { hint.remove(); }, 160);
      }, 1100);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showCopiedHint).catch(function () {
        AdminShared.toast("Gagal menyalin nomor.", "error");
      });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); showCopiedHint(); } catch (e) {
        AdminShared.toast("Gagal menyalin nomor.", "error");
      }
      ta.remove();
    }
  }

  function matchesFilter(a) {
    if (!state.search) return true;
    var q = state.search.toLowerCase();
    return (a.name || "").toLowerCase().indexOf(q) !== -1 || (a.email || "").toLowerCase().indexOf(q) !== -1;
  }

  var komisiModal = document.getElementById("komisiModal");
  var komisiPersenInput = document.getElementById("komisiPersen");
  var btnAturKomisi = document.getElementById("btnAturKomisi");

  async function komisiOpen() {
    komisiPersenInput.value = "";
    try {
      var config = await db.getAffiliateConfig();
      komisiPersenInput.value = config && config.komisi_persen != null ? config.komisi_persen : "";
    } catch (e) {
      AdminShared.toast(e.message || "Gagal memuat pengaturan komisi", "error");
    }
    komisiModal.classList.add("open");
  }
  function komisiClose() { komisiModal.classList.remove("open"); }

  if (btnAturKomisi) {
    btnAturKomisi.addEventListener("click", komisiOpen);
    document.getElementById("komisiCloseBtn").addEventListener("click", komisiClose);
    document.getElementById("komisiCancelBtn").addEventListener("click", komisiClose);
    komisiModal.addEventListener("click", function (e) { if (e.target === komisiModal) komisiClose(); });
    document.getElementById("komisiSaveBtn").addEventListener("click", async function () {
      var persen = parseFloat(komisiPersenInput.value) || 0;
      var saveBtn = document.getElementById("komisiSaveBtn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Menyimpan...";
      try {
        await db.updateAffiliateConfig({ komisi_persen: persen });
        AdminShared.toast("Pengaturan komisi disimpan.", "success");
        komisiClose();
      } catch (e) {
        AdminShared.toast(e.message || "Gagal menyimpan pengaturan komisi.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Simpan";
      }
    });
  }

  function render() {
    var list = state.affiliates.filter(matchesFilter);
    tbody.innerHTML = "";
    emptyState.hidden = list.length !== 0;
    navCount.textContent = state.affiliates.length;

    list.forEach(function (a) {
      var initial = (a.name || "A").charAt(0).toUpperCase();

      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><div class="prod-cell">' +
          '<div class="thumb">' + escapeHtml(initial) + '</div>' +
          '<div><div class="prod-name" title="' + escapeHtml(a.name || "(Tanpa nama)") + '">' + escapeHtml(a.name || "(Tanpa nama)") + (a.status === "suspended" ? ' <span class="badge badge-red">Suspended</span>' : '') + '</div>' +
          '<div class="prod-sku">' + escapeHtml(a.ref_code || "-") + '</div></div>' +
        '</div></td>' +
        '<td class="col-email" title="' + escapeHtml(a.email || "") + '">' + escapeHtml(truncateEmail(a.email)) + '</td>' +
        '<td>' + (parseInt(a.total_clicks, 10) || 0) + '</td>' +
        '<td>' + (parseInt(a.total_orders, 10) || 0) + '</td>' +
        '<td class="col-fee"><button type="button" class="fee-pill" data-fee="' + a.id + '" data-name="' + escapeHtml(a.name || a.email || "") + '">' + rupiah(a.total_commission) + '</button></td>' +
        '<td><div class="wa-cell">' +
          (a.whatsapp ? '<button type="button" class="btn-icon wa-action" data-wa="' + escapeHtml(a.whatsapp) + '" title="Salin nomor WhatsApp">' + iconCopy() + '</button>' : '<span>—</span>') +
        '</div></td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button class="btn-icon edit" data-edit="' + a.id + '" title="Edit">' +
            '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.3 2.3a1.4 1.4 0 0 1 2 2L6 11.6l-2.7.7.7-2.7 7.3-7.3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>' +
          '</button>' +
          '<button class="btn-icon del" data-del="' + a.id + '" data-name="' + escapeHtml(a.name || a.email || "") + '" title="Hapus">' +
            '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6.8 7.5v4M9.2 7.5v4M3.5 4.5l.6 8.2a1 1 0 0 0 1 .9h5.8a1 1 0 0 0 1-.9l.6-8.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div></td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-wa]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        copyWaToClipboard(btn, btn.dataset.wa);
      });
    });
    tbody.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () { openEditModal(btn.dataset.edit); });
    });
    tbody.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function () { openDeleteModal(btn.dataset.del, btn.dataset.name); });
    });
    tbody.querySelectorAll("[data-fee]").forEach(function (btn) {
      btn.addEventListener("click", function () { openFeeModal(btn.dataset.fee, btn.dataset.name); });
    });
  }

  function renderOverviewStats() {
    var totalEl = document.getElementById("affStatTotal");
    var clicksEl = document.getElementById("affStatClicks");
    var feeEl = document.getElementById("affStatFee");
    var topList = document.getElementById("topClickList");
    var topEmpty = document.getElementById("topClickEmpty");
    if (!totalEl || !clicksEl || !feeEl || !topList || !topEmpty) return;

    var list = state.affiliates;
    var totalClicks = list.reduce(function (sum, a) { return sum + (parseInt(a.total_clicks, 10) || 0); }, 0);
    var totalFee = list.reduce(function (sum, a) { return sum + (Number(a.total_commission) || 0); }, 0);

    totalEl.textContent = list.length;
    clicksEl.textContent = totalClicks;
    feeEl.textContent = rupiah(totalFee);

    var top = list
      .filter(function (a) { return (parseInt(a.total_clicks, 10) || 0) > 0; })
      .sort(function (a, b) { return (parseInt(b.total_clicks, 10) || 0) - (parseInt(a.total_clicks, 10) || 0); })
      .slice(0, 5);

    topList.innerHTML = top.map(function (a, idx) {
      var label = a.name || a.email || "(Tanpa nama)";
      return '<div class="overview-item">' +
        '<span class="overview-item__rank">' + (idx + 1) + '</span>' +
        '<span class="overview-item__name" title="' + escapeHtml(label) + '">' + escapeHtml(label) + '</span>' +
        '<span class="badge badge-purple">' + (parseInt(a.total_clicks, 10) || 0) + ' klik</span>' +
      '</div>';
    }).join("");
    topEmpty.hidden = top.length !== 0;
  }

  async function loadAll() {
    try {
      state.affiliates = await db.listAffiliates();
      render();
      renderOverviewStats();
    } catch (e) {
      console.error(e);
      AdminShared.toast(e.message || "Gagal memuat affiliate", "error");
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.search = searchInput.value.trim();
      render();
    });
  }

  var editModal = document.getElementById("affEditModal");
  var editEmailInput = document.getElementById("affEditEmail");
  var editWaInput = document.getElementById("affEditWa");
  var editPasswordInput = document.getElementById("affEditPassword");
  var editEmailField = document.getElementById("affEditEmailField");
  var editWaField = document.getElementById("affEditWaField");
  var editPasswordField = document.getElementById("affEditPasswordField");
  var editEmailError = document.getElementById("affEditEmailError");
  var editWaError = document.getElementById("affEditWaError");
  var editPasswordError = document.getElementById("affEditPasswordError");
  var editSaveBtn = document.getElementById("affEditSaveBtn");

  function clearEditErrors() {
    [editEmailField, editWaField, editPasswordField].forEach(function (f) { f.classList.remove("has-error"); });
    [editEmailError, editWaError, editPasswordError].forEach(function (e) { e.hidden = true; e.textContent = ""; });
  }

  function showEditError(errEl, fieldEl, msg) {
    fieldEl.classList.add("has-error");
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function openEditModal(id) {
    var a = state.affiliates.find(function (x) { return String(x.id) === String(id); });
    if (!a) return;
    editingId = id;
    clearEditErrors();
    editEmailInput.value = a.email || "";
    editWaInput.value = a.whatsapp ? "0" + a.whatsapp.replace(/^62/, "") : "";
    editPasswordInput.value = "";
    editModal.classList.add("open");
  }

  function closeEditModal() {
    editModal.classList.remove("open");
    editingId = null;
  }

  document.getElementById("affEditCloseBtn").addEventListener("click", closeEditModal);
  document.getElementById("affEditCancelBtn").addEventListener("click", closeEditModal);
  editModal.addEventListener("click", function (e) { if (e.target === editModal) closeEditModal(); });

  editSaveBtn.addEventListener("click", async function () {
    if (!editingId) return;
    clearEditErrors();

    var email = editEmailInput.value.trim().toLowerCase();
    var wa = editWaInput.value.trim();
    var password = editPasswordInput.value;

    var valid = true;
    if (!isValidEmail(email)) {
      showEditError(editEmailError, editEmailField, "Format email tidak valid.");
      valid = false;
    }
    if (!isValidWhatsapp(wa)) {
      showEditError(editWaError, editWaField, "Nomor WhatsApp tidak valid.");
      valid = false;
    }
    if (password && password.length < 6) {
      showEditError(editPasswordError, editPasswordField, "Password minimal 6 karakter.");
      valid = false;
    }
    if (!valid) return;

    editSaveBtn.disabled = true;
    editSaveBtn.textContent = "Menyimpan...";
    try {
      var updated = await db.updateAffiliateContact(editingId, {
        email: email,
        whatsapp: normalizeWhatsapp(wa)
      });
      if (password) {
        await db.resetAffiliatePassword(editingId, password);
      }
      var idx = state.affiliates.findIndex(function (x) { return String(x.id) === String(editingId); });
      if (idx !== -1) state.affiliates[idx] = Object.assign({}, state.affiliates[idx], updated);
      render();
      closeEditModal();
      AdminShared.toast("Affiliate berhasil diperbarui");
    } catch (e) {
      console.error(e);
      var msg = e.message || "Gagal menyimpan perubahan.";
      if (/duplicate|unique/i.test(msg)) {
        showEditError(editEmailError, editEmailField, "Email atau WhatsApp ini sudah dipakai affiliate lain.");
      } else {
        AdminShared.toast(msg, "error");
      }
    } finally {
      editSaveBtn.disabled = false;
      editSaveBtn.textContent = "Simpan";
    }
  });

  var deleteModal = document.getElementById("affDeleteModal");
  var deleteNameEl = document.getElementById("affDeleteName");
  var deleteConfirmBtn = document.getElementById("affDeleteConfirmBtn");

  function openDeleteModal(id, name) {
    deletingId = id;
    deleteNameEl.textContent = name || "";
    deleteModal.classList.add("open");
  }

  function closeDeleteModal() {
    deleteModal.classList.remove("open");
    deletingId = null;
  }

  document.getElementById("affDeleteCloseBtn").addEventListener("click", closeDeleteModal);
  document.getElementById("affDeleteCancelBtn").addEventListener("click", closeDeleteModal);
  deleteModal.addEventListener("click", function (e) { if (e.target === deleteModal) closeDeleteModal(); });

  deleteConfirmBtn.addEventListener("click", async function () {
    if (!deletingId) return;
    deleteConfirmBtn.disabled = true;
    deleteConfirmBtn.textContent = "Menghapus...";
    try {
      var result = await db.deleteAffiliate(deletingId);
      if (result && result.suspended) {
        var idx = state.affiliates.findIndex(function (x) { return String(x.id) === String(deletingId); });
        if (idx !== -1) state.affiliates[idx].status = "suspended";
        render();
        closeDeleteModal();
        AdminShared.toast(result.message || "Affiliate punya riwayat transaksi, jadi di-nonaktifkan (bukan dihapus).", "error");
      } else {
        state.affiliates = state.affiliates.filter(function (x) { return String(x.id) !== String(deletingId); });
        render();
        closeDeleteModal();
        AdminShared.toast("Affiliate berhasil dihapus");
      }
    } catch (e) {
      console.error(e);
      AdminShared.toast(e.message || "Gagal menghapus affiliate", "error");
    } finally {
      deleteConfirmBtn.disabled = false;
      deleteConfirmBtn.textContent = "Hapus";
    }
  });

  var feeModal = document.getElementById("feeModal");
  var feeModalTitle = document.getElementById("feeModalTitle");
  var feeOrdersTbody = document.getElementById("feeOrdersTbody");
  var feeOrdersEmpty = document.getElementById("feeOrdersEmpty");
  var feeStatusMap = { AVAILABLE: "Available", CANCEL: "Cancel", REFUND: "Refund", CLAIM: "Claim", PENDING: "Pending" };

  function fmtTanggal(iso) {
    var d = new Date(iso);
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var yy = String(d.getFullYear()).slice(-2);
    return dd + "/" + mm + "/" + yy;
  }

  function produkSummary(items) {
    return (Array.isArray(items) ? items : []).map(function (it) {
      return (it.title || "-") + " x" + (parseInt(it.qty, 10) || 1);
    }).join(", ");
  }

  var feeStatusColor = { AVAILABLE: "green", CANCEL: "red", REFUND: "orange", CLAIM: "purple", PENDING: "gray" };

  function feeStatusDropdown(orderId, current) {
    var opts = ["AVAILABLE", "CANCEL", "REFUND", "CLAIM"];
    var color = feeStatusColor[current] || "gray";
    var items = opts.map(function (s) {
      return '<li class="fee-status-dd__item" role="option" data-value="' + s + '"' + (s === current ? ' aria-selected="true"' : '') + '>' +
        '<span class="fee-status-dd__dot fee-status-dd__dot--' + feeStatusColor[s] + '"></span>' +
        feeStatusMap[s] +
      '</li>';
    }).join("");
    return (
      '<div class="fee-status-dd' + (current === "PENDING" ? " is-pending" : "") + '" data-order="' + orderId + '" data-value="' + current + '">' +
        '<button type="button" class="fee-status-dd__trigger" aria-haspopup="listbox" aria-expanded="false">' +
          '<span class="fee-status-dd__dot fee-status-dd__dot--' + color + '"></span>' +
          '<span class="fee-status-dd__label">' + (feeStatusMap[current] || current) + '</span>' +
          '<svg class="fee-status-dd__chevron" width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>' +
        '<ul class="fee-status-dd__menu" role="listbox">' + items + '</ul>' +
      '</div>'
    );
  }

  function closeAllFeeDropdowns(except) {
    feeOrdersTbody.querySelectorAll(".fee-status-dd.open").forEach(function (dd) {
      if (dd !== except) {
        dd.classList.remove("open");
        var trg = dd.querySelector(".fee-status-dd__trigger");
        if (trg) trg.setAttribute("aria-expanded", "false");
      }
    });
  }

  function positionFeeDropdownMenu(dd) {
    var trigger = dd.querySelector(".fee-status-dd__trigger");
    var menu = dd.querySelector(".fee-status-dd__menu");
    var rect = trigger.getBoundingClientRect();
    var menuWidth = menu.offsetWidth || 132;
    var left = rect.right - menuWidth;
    var maxLeft = window.innerWidth - menuWidth - 8;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;
    var menuHeight = menu.offsetHeight || 160;
    var top = rect.bottom + 4;
    if (top + menuHeight > window.innerHeight - 8) top = rect.top - menuHeight - 4;
    menu.style.top = top + "px";
    menu.style.left = left + "px";
  }

  var feeTableWrap = document.querySelector("#feeModal .fee-table-wrap");
  if (feeTableWrap) {
    feeTableWrap.addEventListener("scroll", function () { closeAllFeeDropdowns(); }, true);
  }
  window.addEventListener("resize", function () { closeAllFeeDropdowns(); });

  function bindFeeStatusDropdowns() {
    feeOrdersTbody.querySelectorAll(".fee-status-dd").forEach(function (dd) {
      var trigger = dd.querySelector(".fee-status-dd__trigger");
      var menu = dd.querySelector(".fee-status-dd__menu");

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        if (dd.classList.contains("is-loading")) return;
        var willOpen = !dd.classList.contains("open");
        closeAllFeeDropdowns(dd);
        dd.classList.toggle("open", willOpen);
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
        if (willOpen) positionFeeDropdownMenu(dd);
      });

      menu.querySelectorAll(".fee-status-dd__item").forEach(function (item) {
        item.addEventListener("click", async function (e) {
          e.stopPropagation();
          var newStatus = item.dataset.value;
          if (newStatus === dd.dataset.value) {
            dd.classList.remove("open");
            trigger.setAttribute("aria-expanded", "false");
            return;
          }
          var orderId = dd.dataset.order;
          dd.classList.remove("open");
          dd.classList.add("is-loading");
          trigger.setAttribute("aria-expanded", "false");
          try {
            var result = await db.updateOrderCommissionStatus(orderId, newStatus);
            var idx = state.affiliates.findIndex(function (x) { return String(x.id) === String(result.affiliate_id); });
            if (idx !== -1) {
              state.affiliates[idx].total_commission = result.total_commission;
              render();
              renderOverviewStats();
            }
            dd.dataset.value = newStatus;
            dd.classList.remove("is-pending");
            dd.querySelector(".fee-status-dd__label").textContent = feeStatusMap[newStatus];
            var dot = trigger.querySelector(".fee-status-dd__dot");
            dot.className = "fee-status-dd__dot fee-status-dd__dot--" + feeStatusColor[newStatus];
            menu.querySelectorAll(".fee-status-dd__item").forEach(function (li) {
              li.removeAttribute("aria-selected");
            });
            item.setAttribute("aria-selected", "true");
            AdminShared.toast("Status komisi diperbarui.");
          } catch (e) {
            AdminShared.toast(e.message || "Gagal mengubah status komisi.", "error");
          } finally {
            dd.classList.remove("is-loading");
          }
        });
      });
    });
  }

  document.addEventListener("click", function () {
    closeAllFeeDropdowns();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllFeeDropdowns();
  });

  function renderFeeOrders(orders) {
    feeOrdersTbody.innerHTML = orders.map(function (o) {
      var produk = produkSummary(o.items);
      return '<tr data-order-row="' + o.id + '">' +
        '<td>' + fmtTanggal(o.created_at) + '</td>' +
        '<td class="col-produk-fee" title="' + escapeHtml(produk) + '">' + escapeHtml(produk) + '</td>' +
        '<td class="col-fee">' + rupiah(o.commission_amount) + '</td>' +
        '<td>' + feeStatusDropdown(o.id, o.commission_status) + '</td>' +
      '</tr>';
    }).join("");
    feeOrdersEmpty.hidden = orders.length !== 0;

    bindFeeStatusDropdowns();
  }

  async function openFeeModal(affiliateId, name) {
    feeModalTitle.textContent = "Fee — " + (name || "Affiliate");
    feeOrdersTbody.innerHTML = "";
    feeOrdersEmpty.hidden = true;
    feeModal.classList.add("open");
    try {
      var orders = await db.listAffiliateOrders(affiliateId);
      renderFeeOrders(orders);
    } catch (e) {
      AdminShared.toast(e.message || "Gagal memuat fee affiliate", "error");
    }
  }

  function closeFeeModal() { feeModal.classList.remove("open"); }

  document.getElementById("feeCloseBtn").addEventListener("click", closeFeeModal);
  document.getElementById("feeCloseBtn2").addEventListener("click", closeFeeModal);
  feeModal.addEventListener("click", function (e) { if (e.target === feeModal) closeFeeModal(); });

  loadAll();
})();
