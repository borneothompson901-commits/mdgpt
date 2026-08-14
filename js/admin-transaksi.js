(function () {
  "use strict";

  if (!document.getElementById("txTbody")) return;

  var db = AdminShared.db;
  var rupiah = AdminShared.rupiah;

  var state = { transactions: [], search: "", status: "", method: "" };

  var tbody = document.getElementById("txTbody");
  var emptyState = document.getElementById("txEmptyState");
  var searchInput = document.getElementById("txSearchInput");
  var refreshBtn = document.getElementById("btnRefreshTransaksi");

  var STATUS_BADGE = {
    PAID: "badge-green",
    SUCCEEDED: "badge-green",
    PENDING: "badge-orange",
    REQUIRE_ACTION: "badge-orange",
    AWAITING_PAYMENT: "badge-orange",
    EXPIRED: "badge-red",
    FAILED: "badge-red",
    CANCELLED: "badge-gray"
  };

  var STATUS_LABEL = {
    PAID: "Berhasil",
    SUCCEEDED: "Berhasil",
    PENDING: "Menunggu",
    REQUIRE_ACTION: "Menunggu Bayar",
    AWAITING_PAYMENT: "Menunggu",
    EXPIRED: "Kadaluarsa",
    FAILED: "Gagal",
    CANCELLED: "Dibatalkan"
  };

  var STATUS_OPTIONS = [
    { value: "", label: "Semua Status" },
    { value: "PAID", label: "Berhasil" },
    { value: "REQUIRE_ACTION", label: "Menunggu Bayar" },
    { value: "PENDING", label: "Menunggu" },
    { value: "EXPIRED", label: "Kadaluarsa" },
    { value: "FAILED", label: "Gagal" },
    { value: "CANCELLED", label: "Dibatalkan" }
  ];

  var METHOD_OPTIONS = [
    { value: "", label: "Semua Metode" },
    { value: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
    { value: "QR", label: "QRIS" },
    { value: "EWALLET", label: "E-Wallet" }
  ];

  var METHOD_LABEL = { VIRTUAL_ACCOUNT: "Virtual Account", QR: "QRIS", EWALLET: "E-Wallet" };

  function statusBadge(status) {
    var cls = STATUS_BADGE[status] || "badge-gray";
    var label = STATUS_LABEL[status] || status || "-";
    return '<span class="badge ' + cls + '">' + escapeHtml(label) + "</span>";
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escAttr(s) { return escapeHtml(s); }

  function fmtDate(iso) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function fmtDateShort(iso) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    var dd = pad2(d.getDate());
    var mm = pad2(d.getMonth() + 1);
    var yy = pad2(d.getFullYear() % 100);
    var hh = pad2(d.getHours());
    var mi = pad2(d.getMinutes());
    return dd + "/" + mm + "/" + yy + " " + hh + ":" + mi;
  }

  function customerObj(t) {
    return t.customer && typeof t.customer === "object" ? t.customer : {};
  }
  function customerLabel(t) {
    var c = customerObj(t);
    return (c.name || "").trim() || c.email || c.phone || "-";
  }

  function methodLabel(t) {
    var base = METHOD_LABEL[t.payment_method] || t.payment_method || "-";
    if (t.payment_channel) return t.payment_channel + " · " + base;
    return base;
  }

  function itemsList(t) {
    return Array.isArray(t.items) ? t.items : [];
  }

  function countBy(list, statuses) {
    return list.filter(function (t) { return statuses.indexOf(t.status) !== -1; }).length;
  }

  function renderStats() {
    var list = state.transactions;
    document.getElementById("txStatTotal").textContent = list.length;
    document.getElementById("txStatPaid").textContent = countBy(list, ["PAID", "SUCCEEDED"]);
    document.getElementById("txStatPending").textContent = countBy(list, ["PENDING", "REQUIRE_ACTION", "AWAITING_PAYMENT"]);
    document.getElementById("txStatFailed").textContent = countBy(list, ["EXPIRED", "FAILED", "CANCELLED"]);
    var revenue = list
      .filter(function (t) { return t.status === "PAID" || t.status === "SUCCEEDED"; })
      .reduce(function (sum, t) { return sum + (Number(t.amount) || 0); }, 0);
    document.getElementById("txStatRevenue").textContent = rupiah(revenue);
    var navCount = document.getElementById("navTransaksiCount");
    if (navCount) navCount.textContent = list.length;
  }

  function matchesFilter(t) {
    if (state.status && t.status !== state.status) return false;
    if (state.method && t.payment_method !== state.method) return false;
    if (state.search) {
      var c = customerObj(t);
      var q = state.search.toLowerCase();
      var hay = [t.client_reference_id, c.name, c.email, c.phone, t.ref_code].join(" ").toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var list = state.transactions.filter(matchesFilter);
    tbody.innerHTML = "";
    emptyState.hidden = list.length !== 0;

    list.forEach(function (t) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="col-refid"><div class="prod-name">' + escapeHtml(t.client_reference_id || t.id) + "</div>" +
          '<div class="prod-sku">' + fmtDate(t.created_at) + "</div></td>" +
        "<td>" + escapeHtml(customerLabel(t)) + "</td>" +
        '<td class="col-metode">' + escapeHtml(methodLabel(t)) + "</td>" +
        "<td>" + rupiah(t.amount) + "</td>" +
        '<td class="col-affiliate">' + (t.ref_code ? '<span class="badge badge-purple">' + escapeHtml(t.ref_code) + "</span>" : "-") + "</td>" +
        "<td>" + statusBadge(t.status) + "</td>" +
        '<td class="col-waktu">' +
          '<span class="waktu-full">' + fmtDate(t.updated_at || t.created_at) + "</span>" +
          '<span class="waktu-short">' + fmtDateShort(t.updated_at || t.created_at) + "</span>" +
        "</td>" +
        '<td class="row-actions"><div class="actions">' +
          '<button class="btn-icon" data-detail="' + escAttr(t.id) + '" title="Detail">' +
            '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5.3v.1M8 7.5v3.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' +
          "</button>" +
        "</div></td>";
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-detail]").forEach(function (btn) {
      btn.addEventListener("click", function () { openDetail(btn.dataset.detail); });
    });
  }

  function paymentSpecificHtml(t) {
    if (t.payment_method === "VIRTUAL_ACCOUNT" && (t.va_number || t.va_bank)) {
      return (
        '<div class="review-row"><span class="review-row__label">Bank VA</span><span class="review-row__value">' + escapeHtml(t.va_bank || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">No. VA</span><span class="review-row__value">' + escapeHtml(t.va_number || "-") + "</span></div>"
      );
    }
    if (t.payment_method === "QR" && (t.qr_url || t.qr_content)) {
      return '<div class="review-row"><span class="review-row__label">QR</span><span class="review-row__value">' + (t.qr_url ? '<a href="' + escAttr(t.qr_url) + '" target="_blank" rel="noopener">Lihat QR</a>' : "Tersedia") + "</span></div>";
    }
    if (t.payment_method === "EWALLET" && t.ewallet_redirect_url) {
      return '<div class="review-row"><span class="review-row__label">Redirect E-Wallet</span><span class="review-row__value"><a href="' + escAttr(t.ewallet_redirect_url) + '" target="_blank" rel="noopener">Buka link</a></span></div>';
    }
    return "";
  }

  function affiliateHtml(t) {
    if (!t.affiliate_id && !t.ref_code) return "";
    return (
      '<div style="margin-top:14px;font-weight:600;font-size:0.85rem;">Affiliate</div>' +
      '<div class="review-row"><span class="review-row__label">Ref Code</span><span class="review-row__value">' + escapeHtml(t.ref_code || "-") + "</span></div>" +
      '<div class="review-row"><span class="review-row__label">Komisi</span><span class="review-row__value">' + (t.commission_amount != null ? rupiah(t.commission_amount) : "-") + (t.commission_status ? " (" + escapeHtml(t.commission_status) + ")" : "") + "</span></div>"
    );
  }

  function shippingHtml(t) {
    var c = customerObj(t);
    var addr = (t.shipping_address && typeof t.shipping_address === "object") ? t.shipping_address : {};
    var hasAddr = addr.province || addr.city || addr.district || addr.subdistrict || addr.addressDetail;
    var hasKurir = t.shipping_courier || t.shipping_cost != null;

    var rows =
      '<div class="review-row"><span class="review-row__label">Customer</span><span class="review-row__value">' + escapeHtml(c.name || "-") + "</span></div>" +
      '<div class="review-row"><span class="review-row__label">Telepon</span><span class="review-row__value">' + escapeHtml(c.phone || "-") + "</span></div>";

    if (hasAddr) {
      rows +=
        '<div class="review-row"><span class="review-row__label">Provinsi</span><span class="review-row__value">' + escapeHtml((addr.province && addr.province.label) || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">Kota/Kab</span><span class="review-row__value">' + escapeHtml((addr.city && addr.city.label) || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">Kecamatan</span><span class="review-row__value">' + escapeHtml((addr.district && addr.district.label) || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">Kelurahan</span><span class="review-row__value">' + escapeHtml((addr.subdistrict && addr.subdistrict.label) || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">Alamat</span><span class="review-row__value">' + escapeHtml(addr.addressDetail || "-") + "</span></div>";
    }

    if (hasKurir) {
      rows +=
        '<div class="review-row"><span class="review-row__label">Ekspedisi</span><span class="review-row__value">' + escapeHtml(t.shipping_courier_name || t.shipping_courier || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">Paket</span><span class="review-row__value">' + escapeHtml(t.shipping_service_name || t.shipping_service_code || "-") + "</span></div>" +
        '<div class="review-row"><span class="review-row__label">Biaya Ekspedisi</span><span class="review-row__value">' + (t.shipping_cost != null ? rupiah(t.shipping_cost) : "-") + "</span></div>";
    }

    return '<div style="margin-top:14px;font-weight:600;font-size:0.85rem;">Detail Pesanan</div>' + rows;
  }

  function variantSummary(it) {
    if (!it.variant || typeof it.variant !== "object") return "";
    var parts = [];
    for (var key in it.variant) {
      if (!Object.prototype.hasOwnProperty.call(it.variant, key)) continue;
      var value = it.variant[key];
      if (value) parts.push(value);
    }
    return parts.join(", ");
  }

  function itemsHtml(t) {
    var items = itemsList(t);
    if (!items.length) return "";
    return (
      '<div style="margin-top:14px;font-weight:600;font-size:0.85rem;">Item</div>' +
      items.map(function (it) {
        var variantTxt = variantSummary(it);
        var label = escapeHtml(it.title || it.id || "-") +
          (variantTxt ? ' <span style="color:#888;font-weight:400;">(' + escapeHtml(variantTxt) + ")</span>" : "") +
          " × " + escapeHtml(it.qty != null ? it.qty : 1);
        return '<div class="review-row"><span class="review-row__label">' + label +
          '</span><span class="review-row__value">' + rupiah((it.price || 0) * (it.qty || 1)) + "</span></div>";
      }).join("")
    );
  }

  function openDetail(id) {
    var tx = state.transactions.find(function (t) { return t.id === id; });
    if (!tx) return;
    var c = customerObj(tx);
    var body = document.getElementById("txDetailBody");

    body.innerHTML =
      '<div class="review-row"><span class="review-row__label">Reference ID</span><span class="review-row__value">' + escapeHtml(tx.client_reference_id) + "</span></div>" +
      '<div class="review-row"><span class="review-row__label">Status</span><span class="review-row__value">' + statusBadge(tx.status) + "</span></div>" +
      '<div class="review-row"><span class="review-row__label">Jumlah</span><span class="review-row__value">' + rupiah(tx.amount) + "</span></div>" +
      '<div class="review-row"><span class="review-row__label">Metode</span><span class="review-row__value">' + escapeHtml(methodLabel(tx)) + "</span></div>" +
      paymentSpecificHtml(tx) +
      (c.email ? '<div class="review-row"><span class="review-row__label">Email</span><span class="review-row__value">' + escapeHtml(c.email) + "</span></div>" : "") +
      '<div class="review-row"><span class="review-row__label">Dibuat</span><span class="review-row__value">' + fmtDate(tx.created_at) + "</span></div>" +
      (tx.paid_at ? '<div class="review-row"><span class="review-row__label">Dibayar</span><span class="review-row__value">' + fmtDate(tx.paid_at) + "</span></div>" : "") +
      '<div class="review-row"><span class="review-row__label">Kadaluarsa</span><span class="review-row__value">' + fmtDate(tx.expiry_at) + "</span></div>" +
      itemsHtml(tx) +
      shippingHtml(tx) +
      affiliateHtml(tx) +
      (tx.pivot_payment_session_id ? '<div style="margin-top:14px;font-weight:600;font-size:0.85rem;">Pivot</div><div class="review-row"><span class="review-row__label">Session ID</span><span class="review-row__value" style="word-break:break-all;">' + escapeHtml(tx.pivot_payment_session_id) + "</span></div>" : "");

    document.getElementById("txDetailModal").classList.add("open");
  }

  var txDetailCloseBtn = document.getElementById("txDetailCloseBtn");
  var txDetailModal = document.getElementById("txDetailModal");
  if (txDetailCloseBtn) txDetailCloseBtn.addEventListener("click", function () { txDetailModal.classList.remove("open"); });
  if (txDetailModal) txDetailModal.addEventListener("click", function (e) { if (e.target === txDetailModal) txDetailModal.classList.remove("open"); });

  function buildFilterXSelect(rootId, options, onChange) {
    var root = document.getElementById(rootId);
    var trigger = document.getElementById(rootId + "_trigger");
    var menu = document.getElementById(rootId + "_menu");
    var valueEl = trigger.querySelector(".xselect__value");
    var placeholder = options[0].label;
    var currentValue = "";

    function renderMenu() {
      menu.innerHTML = options.map(function (o) {
        return '<button type="button" class="xselect__option' + (o.value === currentValue ? " selected" : "") + '" data-val="' + escAttr(o.value) + '">' + escapeHtml(o.label) + "</button>";
      }).join("");
      menu.querySelectorAll("[data-val]").forEach(function (btn) {
        btn.addEventListener("click", function () { setValue(btn.dataset.val); closeMenu(); });
      });
    }

    function setValue(val) {
      currentValue = val;
      var found = options.find(function (o) { return o.value === val; });
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
    document.addEventListener("click", function (e) { if (!root.contains(e.target)) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

    renderMenu();
    return { setValue: setValue };
  }

  if (searchInput) searchInput.addEventListener("input", function () { state.search = this.value; render(); });
  buildFilterXSelect("xselect_filterTxStatus", STATUS_OPTIONS, function (val) { state.status = val; render(); });
  buildFilterXSelect("xselect_filterTxMethod", METHOD_OPTIONS, function (val) { state.method = val; render(); });

  async function loadAll() {
    try {
      state.transactions = await db.listTransactions();
      renderStats();
      render();
    } catch (e) {
      console.error(e);
      AdminShared.toast(e.message || "Gagal memuat transaksi", "error");
    }
  }

  if (refreshBtn) refreshBtn.addEventListener("click", loadAll);

  loadAll();
})();
