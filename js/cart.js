(function () {
  "use strict";

  if (!window.CartStore) return;
  var ADMIN_WHATSAPP = "6287777222572";
  var SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
  var SUPABASE_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";
  var SUPABASE_FN_HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: "Bearer " + SUPABASE_KEY
  };
  var ONGKIR_ENDPOINT = SUPABASE_URL + "/functions/v1/ongkir";
  var HIERARCHY_ENDPOINT = SUPABASE_URL + "/functions/v1/destination-hierarchy";
  var PIVOT_ENDPOINT = SUPABASE_URL + "/functions/v1/pivot-create-payment";

  var VA_CHANNELS = [
    { code: "BCA", label: "BCA" },
    { code: "PERMATA", label: "Permata" },
    { code: "BNI", label: "BNI" },
    { code: "BRI", label: "BRI" },
    { code: "MANDIRI", label: "Mandiri" },
    { code: "CIMB", label: "CIMB Niaga" },
    { code: "DANAMON", label: "Danamon" },
    { code: "MAYBANK", label: "Maybank" },
    { code: "SAHABAT_SAMPOERNA", label: "Bank Sahabat Sampoerna" }
  ];
  var EWALLET_CHANNELS = [
    { code: "SHOPEEPAY", label: "ShopeePay" },
    { code: "DANA", label: "DANA" },
    { code: "OVO", label: "OVO" },
    { code: "LINKAJA", label: "LinkAja" },
    { code: "ASTRAPAY", label: "AstraPay" }
  ];

  var SERVICE_FEE = 0;
  var TAX_RATE = 0;
  var state = {
    ongkir: 0,
    ongkirChecked: false,
    ongkirService: "",
    ongkirServiceCode: "",
    ongkirEtd: "",
    destinationLabel: ""
  };

  var cartListEl = document.getElementById("cartList");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var itemTemplate = document.getElementById("cartItemTemplate");

  var digitalOnlyNoteEl = document.getElementById("digitalOnlyNote");
  var shippingSectionEl = document.getElementById("shippingSection");
  var cartSummaryEl = document.getElementById("cartSummary");
  var cartLayoutEl = document.querySelector(".cart-layout");

  var destinationIdEl = document.getElementById("cartDestinationId");
  var addressDetailEl = document.getElementById("cartAddressDetail");
  var waEl = document.getElementById("cartWhatsapp");

  var kurirHiddenEl = document.getElementById("cartKurir");
  var kurirListEl = document.getElementById("kurirResultList");

  var cekOngkirBtn = document.getElementById("cekOngkirBtn");
  var ongkirNoteEl = document.getElementById("cartOngkirNote");
  var ongkirHintEl = document.getElementById("cartOngkirHint");
  var sumOngkirRowEl = document.getElementById("sumOngkirRow");

  var COURIER_NAMES = {
    jne: "JNE",
    jnt: "J&T Express",
    sicepat: "SiCepat",
    anteraja: "AnterAja"
  };

  function makeDropdown(rootId) {
    var root = document.getElementById(rootId);
    if (!root) return null;

    var trigger = root.querySelector(".custom-select__trigger");
    var valueEl = root.querySelector(".custom-select__value");
    var menu = root.querySelector(".custom-select__menu");
    var hidden = root.querySelector("input[type=hidden]");
    var placeholder = root.getAttribute("data-placeholder") || "Pilih...";
    var changeCb = null;

    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }

    function open() {
      if (root.classList.contains("is-disabled")) return;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    }

    trigger.addEventListener("click", function () {
      if (menu.hidden) open(); else close();
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    menu.addEventListener("click", function (e) {
      var opt = e.target.closest(".custom-select__option");
      if (!opt) return;
      setValue(opt.getAttribute("data-value"), opt.textContent);
      close();
      if (changeCb) changeCb(hidden.value);
    });

    function setValue(val, label) {
      hidden.value = val || "";
      valueEl.textContent = val ? label : placeholder;
      var opts = menu.querySelectorAll(".custom-select__option");
      opts.forEach(function (o) {
        var match = val !== "" && o.getAttribute("data-value") === val;
        o.classList.toggle("is-selected", match);
        o.setAttribute("aria-selected", match ? "true" : "false");
      });
    }

    function setItems(items) {
      menu.innerHTML = "";
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "custom-select__option";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.setAttribute("data-value", item.id);
        li.textContent = item.name;
        menu.appendChild(li);
      });
    }

    function reset(customPlaceholder) {
      close();
      setItems([]);
      hidden.value = "";
      valueEl.textContent = customPlaceholder || placeholder;
    }

    function setDisabled(disabled) {
      root.classList.toggle("is-disabled", disabled);
      trigger.disabled = disabled;
      if (disabled) close();
    }

    function onChange(cb) {
      changeCb = cb;
    }

    return {
      root: root,
      setItems: setItems,
      reset: reset,
      setDisabled: setDisabled,
      setValue: setValue,
      onChange: onChange,
      get value() { return hidden.value; },
      get label() { return hidden.value ? valueEl.textContent : ""; }
    };
  }

  var provinceDd = makeDropdown("provinceSelect");
  var cityDd = makeDropdown("citySelect");
  var districtDd = makeDropdown("districtSelect");
  var subdistrictDd = makeDropdown("subdistrictSelect");

  var sumSubtotalEl = document.getElementById("sumSubtotal");
  var sumOngkirEl = document.getElementById("sumOngkir");
  var sumLayananEl = document.getElementById("sumLayanan");
  var sumPajakEl = document.getElementById("sumPajak");
  var sumTotalEl = document.getElementById("sumTotal");
  var checkoutBtn = document.getElementById("checkoutBtn");
  var customerNameEl = document.getElementById("cartCustomerName");

  var CHECKOUT_STORAGE_KEY = "mdgpt_lingua_checkout";
  var COUNTDOWN_MS = 6 * 60 * 60 * 1000; // 6 jam

  var navTitleMain = document.getElementById("navTitleMain");
  var navTitleMobile = document.getElementById("navTitleMobile");

  var checkoutPanel = document.getElementById("checkoutPanel");
  var checkoutStepMethod = document.getElementById("checkoutStepMethod");
  var checkoutStepResult = document.getElementById("checkoutStepResult");
  var checkoutErrorEl = document.getElementById("checkoutError");
  var checkoutResultContent = document.getElementById("checkoutResultContent");
  var paymentAccordion = document.getElementById("paymentAccordion");
  var channelListEls = {
    VA: document.getElementById("channelListVA"),
    QRIS: document.getElementById("channelListQRIS"),
    EWALLET: document.getElementById("channelListEWALLET")
  };

  var customerInfoSectionEl = document.getElementById("customerInfoSection");
  var checkoutBtnSectionEl = document.getElementById("checkoutBtnSection");
  var checkoutModeActive = false;

  var countdownTimer = null;

  function readCheckoutState() {
    try {
      var raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.step) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function writeCheckoutState(next) {
    try {
      if (!next) {
        localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      } else {
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(next));
      }
    } catch (e) {}
  }

  var checkoutState = readCheckoutState();

  var confirmOverlay = document.getElementById("cartConfirmOverlay");
  var confirmDescEl = document.getElementById("cartConfirmDesc");
  var confirmOkBtn = document.getElementById("cartConfirmOk");
  var confirmCancelBtn = document.getElementById("cartConfirmCancel");
  var pendingRemove = null;

  function formatRupiah(n) {
    n = Math.round(n) || 0;
    return "Rp" + n.toLocaleString("id-ID");
  }

  function findCartItem(id, variantKey) {
    var cart = window.CartStore.getCart();
    if (!Array.isArray(cart)) return null;
    for (var i = 0; i < cart.length; i++) {
      if (String(cart[i].id) === String(id) && (cart[i].variantKey || "") === (variantKey || "")) {
        return cart[i];
      }
    }
    return null;
  }

  function getMaxStockForItem(item) {
    if (!item) return Infinity;
    if (!window.PRODUCTS_DATA || typeof window.PRODUCTS_DATA.getById !== "function") return Infinity;
    var product = window.PRODUCTS_DATA.getById(item.id);
    if (!product || !product.variantPricing) return Infinity;
    var key = item.variantKey || "";
    var pricing = product.variantPricing[key];
    if (pricing && typeof pricing.stock === "number") return pricing.stock;
    return Infinity;
  }

  function showStockHint(inputEl, text) {
    var hint = document.getElementById("cartStockHint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "cartStockHint";
      hint.style.position = "fixed";
      hint.style.zIndex = "10001";
      hint.style.background = "#e0473e";
      hint.style.color = "#fff";
      hint.style.fontSize = "11.5px";
      hint.style.fontWeight = "600";
      hint.style.padding = "5px 10px";
      hint.style.borderRadius = "6px";
      hint.style.pointerEvents = "none";
      hint.style.opacity = "0";
      hint.style.whiteSpace = "nowrap";
      hint.style.transition = "opacity .15s ease";
      document.body.appendChild(hint);
    }
    var rect = inputEl.getBoundingClientRect();
    hint.textContent = text;
    hint.style.left = (rect.left + rect.width / 2) + "px";
    hint.style.top = (rect.top - 8) + "px";
    hint.style.transform = "translate(-50%, -100%)";
    hint.style.opacity = "1";

    clearTimeout(hint._hideTimer);
    hint._hideTimer = setTimeout(function () {
      hint.style.opacity = "0";
    }, 1800);

    inputEl.style.transition = "background-color .2s ease";
    inputEl.style.backgroundColor = "#fdeceb";
    clearTimeout(inputEl._stockFlashTimer);
    inputEl._stockFlashTimer = setTimeout(function () {
      inputEl.style.backgroundColor = "";
    }, 500);
  }

  function setVisible(el, visible) {
    if (!el) return;
    el.hidden = !visible;
    if (visible) {
      el.style.removeProperty("display");
    } else {
      el.style.setProperty("display", "none", "important");
    }
  }

  function renderVariantLine(node, item) {
    var variantsEl = node.querySelector(".cart-item__variants");
    if (!variantsEl) return;

    variantsEl.innerHTML = "";

    if (!item.variant || typeof item.variant !== "object") return;

    for (var key in item.variant) {
      if (!Object.prototype.hasOwnProperty.call(item.variant, key)) continue;
      var value = item.variant[key];
      if (!value) continue;
      var tag = document.createElement("span");
      tag.className = "cart-item__variant-tag";
      tag.textContent = value;
      variantsEl.appendChild(tag);
    }
  }

  function renderCart() {
    var cart = window.CartStore.getCart();
    if (!Array.isArray(cart)) cart = [];
    cartListEl.innerHTML = "";

    if (cart.length === 0) {
      setVisible(cartEmptyEl, !checkoutModeActive);
      setVisible(cartListEl, false);
    } else {
      setVisible(cartEmptyEl, false);
      setVisible(cartListEl, !checkoutModeActive);

      cart.forEach(function (item) {
        var node = itemTemplate.content.cloneNode(true);
        var li = node.querySelector(".cart-item");
        li.setAttribute("data-id", item.id);
        li.setAttribute("data-variant-key", item.variantKey || "");

        var imgLink = node.querySelector(".cart-item__imgwrap");
        var img = node.querySelector(".cart-item__img");
        var titleLink = node.querySelector(".cart-item__title");
        var categoryEl = node.querySelector(".cart-item__category");
        var priceMobileEl = node.querySelector(".cart-item__price-mobile");
        var subtotalEl = node.querySelector(".cart-item__subtotal");
        var qtyInput = node.querySelector(".cart-qty-input");

        var detailUrl = "produk.html?id=" + encodeURIComponent(item.id);
        imgLink.setAttribute("href", detailUrl);
        titleLink.setAttribute("href", detailUrl);

        img.setAttribute("src", item.image || "");
        img.setAttribute("alt", item.title || "");
        titleLink.textContent = item.title || "Produk";
        titleLink.setAttribute("title", item.title || "Produk");
        categoryEl.textContent = item.category || "";
        categoryEl.setAttribute("title", item.category || "");
        priceMobileEl.textContent = formatRupiah(item.price);
        subtotalEl.textContent = formatRupiah(item.price * item.qty);
        qtyInput.value = item.qty;

        renderVariantLine(node, item);

        cartListEl.appendChild(node);
      });
    }

    reconcileShippingVisibility();
    updateTotals();
    updateCheckoutState();
  }

  function reconcileShippingVisibility() {
    var cart = window.CartStore.getCart();
    var isEmpty = !Array.isArray(cart) || cart.length === 0;

    if (cartLayoutEl) cartLayoutEl.classList.toggle("is-empty", isEmpty && !checkoutModeActive);
    setVisible(cartSummaryEl, !isEmpty);

    if (isEmpty) {
      setVisible(digitalOnlyNoteEl, false);
      setVisible(shippingSectionEl, false);
      setVisible(sumOngkirRowEl, false);
      state.ongkir = 0;
      state.ongkirChecked = true;
      return;
    }

    // Saat sedang di step pembayaran, sembunyikan form alamat/kurir & catatan digital,
    // kolom kanan cukup nampilin Ringkasan Pesanan aja.
    if (checkoutModeActive) {
      setVisible(digitalOnlyNoteEl, false);
      setVisible(shippingSectionEl, false);
      return;
    }

    var needsShipping = window.CartStore.needsShipping();

    setVisible(shippingSectionEl, needsShipping);
    setVisible(digitalOnlyNoteEl, !needsShipping);
    setVisible(sumOngkirRowEl, needsShipping);

    if (!needsShipping) {
      state.ongkir = 0;
      state.ongkirChecked = true;
    } else if (!hasValidDestination()) {
      state.ongkirChecked = false;
    }
  }

  function hasValidDestination() {
    return destinationIdEl && destinationIdEl.value.trim().length > 0;
  }

  function updateTotals() {
    var subtotal = window.CartStore.getSubtotal();
    var ongkir = state.ongkirChecked ? state.ongkir : 0;
    var layanan = SERVICE_FEE;
    var pajak = Math.round(subtotal * TAX_RATE);
    var total = subtotal + ongkir + layanan + pajak;

    sumSubtotalEl.textContent = formatRupiah(subtotal);
    sumOngkirEl.textContent = formatRupiah(ongkir);
    sumLayananEl.textContent = formatRupiah(layanan);
    sumPajakEl.textContent = formatRupiah(pajak);
    sumTotalEl.textContent = formatRupiah(total);
  }

  cartListEl.addEventListener("click", function (e) {
    var li = e.target.closest(".cart-item");
    if (!li) return;
    var id = li.getAttribute("data-id");
    var variantKey = li.getAttribute("data-variant-key") || "";

    if (e.target.closest(".cart-qty-btn--plus")) {
      var input = li.querySelector(".cart-qty-input");
      var currentQty = parseInt(input.value, 10) || 1;
      var maxStock = getMaxStockForItem(findCartItem(id, variantKey));

      if (currentQty >= maxStock) {
        showStockHint(input, maxStock > 0 ? "Stok cuma tersisa " + maxStock : "Stok habis");
        return;
      }

      window.CartStore.updateQty(id, currentQty + 1, variantKey);
    } else if (e.target.closest(".cart-qty-btn--minus")) {
      var input2 = li.querySelector(".cart-qty-input");
      var newQty2 = (parseInt(input2.value, 10) || 1) - 1;
      if (newQty2 <= 0) {
        var titleEl2 = li.querySelector(".cart-item__title");
        openConfirmRemove(id, variantKey, titleEl2 ? titleEl2.textContent : "");
      } else {
        window.CartStore.updateQty(id, newQty2, variantKey);
      }
    } else if (e.target.closest(".cart-item__remove")) {
      window.CartStore.removeItem(id, variantKey);
    }
  });

  cartListEl.addEventListener("change", function (e) {
    if (!e.target.classList.contains("cart-qty-input")) return;
    var li = e.target.closest(".cart-item");
    var id = li.getAttribute("data-id");
    var variantKey = li.getAttribute("data-variant-key") || "";
    var qty = parseInt(e.target.value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;

    var item = findCartItem(id, variantKey);
    var maxStock = getMaxStockForItem(item);

    if (qty > maxStock) {
      qty = maxStock > 0 ? maxStock : (item ? item.qty : 1);
      e.target.value = qty;
      showStockHint(e.target, maxStock > 0 ? "Stok cuma tersisa " + maxStock : "Stok habis");
    }

    window.CartStore.updateQty(id, qty, variantKey);
  });

  function fetchHierarchy(level, parentId) {
    var url = HIERARCHY_ENDPOINT + "?level=" + encodeURIComponent(level);
    if (parentId) url += "&parent_id=" + encodeURIComponent(parentId);

    return fetch(url, { headers: SUPABASE_FN_HEADERS })
      .then(function (res) { return res.json(); })
      .then(function (data) { return data.results || []; })
      .catch(function () { return []; });
  }

  function resetKurirResults() {
    kurirHiddenEl.value = "";
    state.ongkirServiceCode = "";
    if (ongkirHintEl) setVisible(ongkirHintEl, false);
    if (!kurirListEl) return;
    setVisible(kurirListEl, false);
    var items = kurirListEl.querySelectorAll(".cart-kurir-item");
    items.forEach(function (item) {
      item.classList.remove("is-selected", "is-loading", "is-unavailable");
      item.setAttribute("aria-expanded", "false");
      var costEl = item.querySelector("[data-cost]");
      if (costEl) costEl.textContent = "—";
    });
    var panels = kurirListEl.querySelectorAll("[data-paket-panel]");
    panels.forEach(function (panel) {
      panel.classList.remove("is-open");
      var list = panel.querySelector("[data-paket-list]");
      if (list) list.innerHTML = "";
    });
  }

  function closeAllPaketPanels() {
    if (!kurirListEl) return;
    kurirListEl.querySelectorAll("[data-paket-panel].is-open").forEach(function (panel) {
      panel.classList.remove("is-open");
    });
    kurirListEl.querySelectorAll('.cart-kurir-item[aria-expanded="true"]').forEach(function (item) {
      item.setAttribute("aria-expanded", "false");
    });
  }

  function togglePaketPanel(group) {
    if (!group) return;
    var header = group.querySelector(".cart-kurir-item");
    var panel = group.querySelector("[data-paket-panel]");
    if (!header || !panel) return;
    var isOpen = panel.classList.contains("is-open");
    closeAllPaketPanels();
    if (!isOpen) {
      panel.classList.add("is-open");
      header.setAttribute("aria-expanded", "true");
    }
  }

  function renderPaketList(group, courier, courierName, services) {
    var list = group.querySelector("[data-paket-list]");
    if (!list) return;
    list.innerHTML = "";

    if (!services || !services.length) {
      var empty = document.createElement("div");
      empty.className = "cart-kurir-paket-empty";
      empty.textContent = "Tidak ada layanan tersedia untuk tujuan ini.";
      list.appendChild(empty);
      return;
    }

    services.forEach(function (svc) {
      var row = document.createElement("div");
      row.className = "cart-kurir-paket-item";
      row.setAttribute("data-courier", courier);
      row.setAttribute("data-service", svc.service || "");
      row.setAttribute("data-cost", String(svc.cost || 0));
      row.setAttribute("data-etd", svc.etd || "");
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");

      var estimasi = document.createElement("span");
      estimasi.className = "cart-kurir-paket-item__estimasi";
      var label = svc.service || "Layanan";
      estimasi.textContent = label + (svc.etd ? " · " + svc.etd + " hari" : "");

      var harga = document.createElement("span");
      harga.className = "cart-kurir-paket-item__harga";
      harga.textContent = formatRupiah(svc.cost || 0);

      row.appendChild(estimasi);
      row.appendChild(harga);
      list.appendChild(row);
    });
  }

  function selectPaket(group, courier, courierName, serviceCode, cost, etd, opts) {
    opts = opts || {};
    if (!kurirListEl) return;

    kurirListEl.querySelectorAll(".cart-kurir-item").forEach(function (item) {
      item.classList.toggle("is-selected", item.getAttribute("data-courier") === courier);
    });
    kurirListEl.querySelectorAll(".cart-kurir-paket-item").forEach(function (row) {
      var match =
        row.getAttribute("data-courier") === courier &&
        row.getAttribute("data-service") === serviceCode;
      row.classList.toggle("is-selected", match);
    });

    var headerCostEl = group.querySelector(".cart-kurir-item [data-cost]");
    if (headerCostEl) {
      headerCostEl.textContent = (serviceCode ? serviceCode + " · " : "") + formatRupiah(cost);
    }

    kurirHiddenEl.value = courier;
    state.ongkirServiceCode = serviceCode || "";
    state.ongkir = cost || 0;
    state.ongkirChecked = true;
    state.ongkirService = courierName + (serviceCode ? " - " + serviceCode : "");
    state.ongkirEtd = etd || "";

    if (!opts.silent) {
      showOngkirNote(
        "Kurir dipilih " + state.ongkirService + ": " + formatRupiah(state.ongkir) +
          (state.ongkirEtd ? " (est. " + state.ongkirEtd + " hari)" : ""),
        "success"
      );
    }

    updateTotals();
    updateCheckoutState();
  }

  function clearDestinationSelection() {
    destinationIdEl.value = "";
    state.destinationLabel = "";

    if (state.ongkirChecked) {
      state.ongkirChecked = false;
      ongkirNoteEl.hidden = true;
      updateTotals();
    }
    resetKurirResults();
    updateCheckoutState();
  }

  function buildDestinationLabel() {
    return [
      subdistrictDd.label,
      districtDd.label,
      cityDd.label,
      provinceDd.label
    ].filter(Boolean).join(", ");
  }

  if (provinceDd) {
    fetchHierarchy("province").then(function (items) {
      provinceDd.setItems(items);
    });

    provinceDd.onChange(function () {
      cityDd.reset();
      districtDd.reset();
      subdistrictDd.reset();
      cityDd.setDisabled(true);
      districtDd.setDisabled(true);
      subdistrictDd.setDisabled(true);
      clearDestinationSelection();

      var provinceId = provinceDd.value;
      if (!provinceId) return;

      cityDd.reset("Memuat...");
      fetchHierarchy("city", provinceId).then(function (items) {
        cityDd.setItems(items);
        cityDd.setValue("");
        cityDd.setDisabled(items.length === 0);
      });
    });

    cityDd.onChange(function () {
      districtDd.reset();
      subdistrictDd.reset();
      districtDd.setDisabled(true);
      subdistrictDd.setDisabled(true);
      clearDestinationSelection();

      var cityId = cityDd.value;
      if (!cityId) return;

      districtDd.reset("Memuat...");
      fetchHierarchy("district", cityId).then(function (items) {
        districtDd.setItems(items);
        districtDd.setValue("");
        districtDd.setDisabled(items.length === 0);
      });
    });

    districtDd.onChange(function () {
      subdistrictDd.reset();
      subdistrictDd.setDisabled(true);
      clearDestinationSelection();

      var districtId = districtDd.value;
      if (!districtId) return;

      subdistrictDd.reset("Memuat...");
      fetchHierarchy("subdistrict", districtId).then(function (items) {
        subdistrictDd.setItems(items);
        subdistrictDd.setValue("");
        subdistrictDd.setDisabled(items.length === 0);
      });
    });

    subdistrictDd.onChange(function () {
      destinationIdEl.value = subdistrictDd.value;
      state.destinationLabel = subdistrictDd.value ? buildDestinationLabel() : "";

      if (subdistrictDd.value && ongkirHintEl) {
        setVisible(ongkirHintEl, false);
      }

      if (state.ongkirChecked) {
        state.ongkirChecked = false;
        ongkirNoteEl.hidden = true;
        updateTotals();
      }
      resetKurirResults();
      updateCheckoutState();
    });
  }

  function showOngkirNote(text, kind) {
    ongkirNoteEl.hidden = false;
    ongkirNoteEl.style.color = kind === "error" ? "#d9534f" : "#1a9c5c";
    ongkirNoteEl.textContent = text;
  }

  if (kurirListEl) {
    kurirListEl.addEventListener("click", function (e) {
      var paketRow = e.target.closest(".cart-kurir-paket-item");
      if (paketRow) {
        var group = paketRow.closest(".cart-kurir-group");
        if (!group) return;
        var courier = paketRow.getAttribute("data-courier");
        var courierName = COURIER_NAMES[courier] || courier;
        var serviceCode = paketRow.getAttribute("data-service");
        var cost = parseInt(paketRow.getAttribute("data-cost"), 10) || 0;
        var etd = paketRow.getAttribute("data-etd") || "";

        selectPaket(group, courier, courierName, serviceCode, cost, etd);
        closeAllPaketPanels();
        return;
      }

      var header = e.target.closest(".cart-kurir-item");
      if (!header || header.classList.contains("is-unavailable") || header.classList.contains("is-loading")) return;

      var headerGroup = header.closest(".cart-kurir-group");
      togglePaketPanel(headerGroup);
    });

    // Aksesibilitas: bisa expand/pilih paket pakai keyboard (Enter/Space)
    kurirListEl.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var paketRow = e.target.closest(".cart-kurir-paket-item");
      if (paketRow) {
        e.preventDefault();
        paketRow.click();
      }
    });
  }

  if (cekOngkirBtn) {
    cekOngkirBtn.addEventListener("click", function () {
      if (!hasValidDestination()) {
        if (ongkirHintEl) setVisible(ongkirHintEl, true);
        ongkirNoteEl.hidden = true;
        if (provinceDd) provinceDd.root.querySelector(".custom-select__trigger").focus();
        return;
      }

      if (ongkirHintEl) setVisible(ongkirHintEl, false);

      var weight = window.CartStore.getTotalWeight();
      if (weight <= 0) weight = 1000;

      var couriers = Object.keys(COURIER_NAMES);
      var groups = kurirListEl ? kurirListEl.querySelectorAll(".cart-kurir-group") : [];

      state.ongkirChecked = false;
      ongkirNoteEl.hidden = true;
      kurirHiddenEl.value = "";
      setVisible(kurirListEl, true);
      groups.forEach(function (group) {
        var item = group.querySelector(".cart-kurir-item");
        var panel = group.querySelector("[data-paket-panel]");
        item.classList.remove("is-selected", "is-unavailable");
        item.classList.add("is-loading");
        item.setAttribute("aria-expanded", "false");
        if (panel) {
          panel.classList.remove("is-open");
          var list = panel.querySelector("[data-paket-list]");
          if (list) list.innerHTML = "";
        }
        var costEl = item.querySelector("[data-cost]");
        if (costEl) costEl.textContent = "Mengecek...";
      });

      cekOngkirBtn.disabled = true;
      cekOngkirBtn.textContent = "Mengecek ongkir...";

      var payload = {
        destination_id: destinationIdEl.value,
        weight: weight,
        couriers: couriers // single request covers all couriers at once (RajaOngkir supports courier=a:b:c)
      };

      var ongkirRequest = fetch(ONGKIR_ENDPOINT, {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, SUPABASE_FN_HEADERS),
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var byCourier = (data && data.results) || {};
          return couriers.map(function (courier) {
            return { courier: courier, data: byCourier[courier] || null };
          });
        })
        .catch(function () {
          return couriers.map(function (courier) {
            return { courier: courier, data: null };
          });
        });

      ongkirRequest.then(function (results) {
        var cheapest = null;

        results.forEach(function (result) {
          var group = kurirListEl.querySelector('.cart-kurir-group[data-courier-group="' + result.courier + '"]');
          if (!group) return;
          var item = group.querySelector(".cart-kurir-item");
          item.classList.remove("is-loading");

          var costEl = item.querySelector("[data-cost]");
          var data = result.data;
          var courierName = COURIER_NAMES[result.courier] || result.courier;
          var services = data && Array.isArray(data.services) ? data.services : [];

          if (!data || !services.length) {
            item.classList.add("is-unavailable");
            if (costEl) costEl.textContent = "Tidak tersedia";
            renderPaketList(group, result.courier, courierName, []);
            return;
          }

          renderPaketList(group, result.courier, courierName, services);

          var courierCheapest = services[0]; // sudah diurutkan termurah dari backend
          if (costEl) costEl.textContent = "mulai " + formatRupiah(courierCheapest.cost);

          if (!cheapest || courierCheapest.cost < cheapest.cost) {
            cheapest = {
              group: group,
              courier: result.courier,
              courierName: courierName,
              service: courierCheapest.service,
              cost: courierCheapest.cost,
              etd: courierCheapest.etd
            };
          }
        });

        if (cheapest) {
          selectPaket(
            cheapest.group,
            cheapest.courier,
            cheapest.courierName,
            cheapest.service,
            cheapest.cost,
            cheapest.etd,
            { silent: true }
          );

          showOngkirNote(
            "Termurah: " + cheapest.courierName + " " + formatRupiah(cheapest.cost),
            "success"
          );
        } else {
          showOngkirNote("Gagal ambil ongkir, coba lagi.", "error");
        }

        updateTotals();
        updateCheckoutState();
      })
        .finally(function () {
          cekOngkirBtn.disabled = false;
          cekOngkirBtn.textContent = "Cek Ongkir";
        });
    });
  }

  if (addressDetailEl) {
    addressDetailEl.addEventListener("input", updateCheckoutState);
  }

  function updateCheckoutState() {
    var cart = window.CartStore.getCart();
    var hasItems = cart.length > 0;
    var hasWa = waEl.value.trim().length >= 9;
    var needsShipping = window.CartStore.needsShipping();

    var shippingOk = true;
    if (needsShipping) {
      shippingOk =
        hasValidDestination() &&
        addressDetailEl.value.trim().length > 0 &&
        state.ongkirChecked;
    }

    checkoutBtn.disabled = !(hasItems && hasWa && shippingOk);
  }

  if (waEl) {
    waEl.addEventListener("input", updateCheckoutState);
  }

  function getOrderTotal() {
    var subtotal = window.CartStore.getSubtotal();
    var ongkir = state.ongkirChecked ? state.ongkir : 0;
    var layanan = SERVICE_FEE;
    var pajak = Math.round(subtotal * TAX_RATE);
    return subtotal + ongkir + layanan + pajak;
  }

  var METHOD_META = {
    VA: { name: "Virtual Account", rowDesc: "Transfer melalui " },
    QRIS: { name: "QRIS", rowDesc: "Bayar pakai aplikasi bank / e-wallet apa saja yang support QRIS." },
    EWALLET: { name: "E-Wallet", rowDesc: "Lanjutkan pembayaran lewat aplikasi " }
  };

  var PAYMENT_GUIDES = {
    VA: [
      "Buka aplikasi mobile banking atau kunjungi ATM terdekat.",
      "Pilih menu Transfer &gt; Virtual Account / Bank Lain.",
      "Masukkan nomor Virtual Account di atas.",
      "Cek detail tagihan, lalu konfirmasi & selesaikan pembayaran."
    ],
    QRIS: [
      "Buka aplikasi bank atau e-wallet yang mendukung QRIS.",
      "Pilih menu Scan QR / Bayar.",
      "Arahkan kamera ke kode QRIS di atas.",
      "Cek nominal, lalu konfirmasi pembayaran."
    ],
    EWALLET: [
      "Klik tombol \"Buka Aplikasi E-Wallet\" di atas.",
      "Login ke akun e-wallet kamu.",
      "Cek detail tagihan yang muncul.",
      "Konfirmasi untuk menyelesaikan pembayaran."
    ]
  };

  function showCheckoutError(msg) {
    if (!checkoutErrorEl) return;
    checkoutErrorEl.textContent = msg;
    checkoutErrorEl.hidden = false;
  }

  function hideCheckoutError() {
    if (!checkoutErrorEl) return;
    checkoutErrorEl.hidden = true;
    checkoutErrorEl.textContent = "";
  }

  function setNavTitle(title) {
    if (navTitleMain) navTitleMain.textContent = title;
    if (navTitleMobile) navTitleMobile.textContent = title;
  }

  function closeAllAccordionPanels() {
    if (!paymentAccordion) return;
    paymentAccordion.querySelectorAll(".payment-accordion__item").forEach(function (item) {
      item.classList.remove("is-open");
      var header = item.querySelector(".payment-accordion__header");
      var panel = item.querySelector(".payment-accordion__panel");
      if (header) header.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    });
  }

  function renderChannelRows(method) {
    var listEl = channelListEls[method];
    if (!listEl || listEl.childElementCount > 0) return; // render once

    var rows = [];
    if (method === "VA") {
      rows = VA_CHANNELS.map(function (ch) {
        return { code: ch.code, title: ch.label, desc: METHOD_META.VA.rowDesc + ch.label };
      });
    } else if (method === "EWALLET") {
      rows = EWALLET_CHANNELS.map(function (ch) {
        return { code: ch.code, title: ch.label, desc: METHOD_META.EWALLET.rowDesc + ch.label };
      });
    } else if (method === "QRIS") {
      rows = [{ code: "", title: "QRIS", desc: METHOD_META.QRIS.rowDesc }];
    }

    rows.forEach(function (row) {
      var rowEl = document.createElement("div");
      rowEl.className = "payment-channel-row";

      var infoEl = document.createElement("div");
      infoEl.className = "payment-channel-row__info";
      infoEl.innerHTML =
        '<span class="payment-channel-row__title">' + row.title + '</span>' +
        '<span class="payment-channel-row__desc">' + row.desc + '</span>';

      var pickBtn = document.createElement("button");
      pickBtn.type = "button";
      pickBtn.className = "payment-pick-btn";
      pickBtn.textContent = "Pilih";
      pickBtn.addEventListener("click", function () {
        pickChannel(method, row.code, row.title, pickBtn);
      });

      rowEl.appendChild(infoEl);
      rowEl.appendChild(pickBtn);
      listEl.appendChild(rowEl);
    });
  }

  ["VA", "QRIS", "EWALLET"].forEach(renderChannelRows);

  if (paymentAccordion) {
    paymentAccordion.addEventListener("click", function (e) {
      var header = e.target.closest(".payment-accordion__header");
      if (!header) return;
      var item = header.closest(".payment-accordion__item");
      var panel = item.querySelector(".payment-accordion__panel");
      var isOpen = item.classList.contains("is-open");

      closeAllAccordionPanels();

      if (!isOpen) {
        item.classList.add("is-open");
        header.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  }

  function showCartView() {
    checkoutModeActive = false;
    if (checkoutPanel) checkoutPanel.hidden = true;
    setVisible(customerInfoSectionEl, true);
    setVisible(checkoutBtnSectionEl, true);
    setNavTitle("Keranjang Belanja");
    stopCountdown();
    renderCart();
  }

  function showCheckoutMethodView() {
    checkoutModeActive = true;
    if (checkoutPanel) checkoutPanel.hidden = false;
    setVisible(customerInfoSectionEl, false);
    setVisible(checkoutBtnSectionEl, false);
    setNavTitle("Pembayaran");
    setVisible(checkoutStepMethod, true);
    setVisible(checkoutStepResult, false);
    hideCheckoutError();
    closeAllAccordionPanels();
    stopCountdown();
    renderCart();
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function formatCountdown(ms) {
    var totalSec = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    return pad(h) + ":" + pad(m) + ":" + pad(s);
  }

  function startCountdown(expiryAt) {
    stopCountdown();
    var timeEl = document.getElementById("checkoutCountdownTime");
    var wrapEl = document.getElementById("checkoutCountdownWrap");
    var reorderBtn = document.getElementById("checkoutReorderBtn");
    if (!timeEl) return;

    function tick() {
      var remaining = expiryAt - Date.now();
      if (remaining <= 0) {
        timeEl.textContent = "00:00:00";
        if (wrapEl) wrapEl.classList.add("is-expired");
        if (reorderBtn) reorderBtn.hidden = false;
        stopCountdown();
        return;
      }
      timeEl.textContent = formatCountdown(remaining);
      if (reorderBtn) reorderBtn.hidden = true;
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function renderResultView() {
    if (!checkoutResultContent || !checkoutState) return;
    var method = checkoutState.method;
    var data = checkoutState.resultData || {};
    var html = '<div class="payment-countdown" id="checkoutCountdownWrap">' +
        '<span class="payment-countdown__label">Selesaikan pembayaran dalam</span>' +
        '<span class="payment-countdown__time" id="checkoutCountdownTime">06:00:00</span>' +
      '</div>' +
      '<button type="button" class="checkout-reorder-btn" id="checkoutReorderBtn" hidden>Pesan Ulang</button>';

    html += '<p class="payment-result__order-id">Order ID: ' + (data.clientReferenceId || data.orderId || "-") + '</p>';

    if (method === "VA" && data.virtualAccount) {
      var va = data.virtualAccount;
      html +=
        '<div class="payment-result__box">' +
          '<p class="payment-result__label">Transfer ke Virtual Account</p>' +
          '<p class="payment-result__va-bank">' + (va.bank || "") + '</p>' +
          '<p class="payment-result__va-number" id="checkoutVaNumber">' + (va.number || "-") + '</p>' +
          '<button type="button" class="payment-result__copy-btn" id="checkoutCopyVaBtn">Salin Nomor VA</button>' +
        '</div>';
    } else if (method === "QRIS" && data.qr) {
      var qr = data.qr;
      html +=
        '<div class="payment-result__box">' +
          '<p class="payment-result__label">Scan QRIS untuk bayar</p>' +
          (qr.imageUrl ? '<img class="payment-result__qr-img" src="' + qr.imageUrl + '" alt="QRIS" />' : "") +
        '</div>';
    } else if (method === "EWALLET" && data.ewallet) {
      var ew = data.ewallet;
      html +=
        '<div class="payment-result__box">' +
          '<p class="payment-result__label">Lanjutkan pembayaran di aplikasi e-wallet</p>' +
          (ew.redirectUrl
            ? '<a class="payment-result__ewallet-btn" href="' + ew.redirectUrl + '" target="_blank" rel="noopener">Buka Aplikasi E-Wallet</a>'
            : '<p class="payment-result__note">Link pembayaran tidak tersedia.</p>') +
        '</div>';
    } else {
      html += '<p class="payment-result__note">Pembayaran diproses. Silakan cek instruksi lebih lanjut dari admin.</p>';
    }

    var guide = PAYMENT_GUIDES[method] || [];
    if (guide.length) {
      html += '<div class="payment-result__guide">' +
        '<p class="payment-result__guide-title">Panduan Pembayaran</p>' +
        '<ol>' + guide.map(function (g) { return "<li>" + g + "</li>"; }).join("") + '</ol>' +
      '</div>';
    }

    checkoutResultContent.innerHTML = html;

    var reorderBtn = document.getElementById("checkoutReorderBtn");
    if (reorderBtn) {
      reorderBtn.addEventListener("click", cancelCheckoutAndReturnToCart);
    }

    var copyBtn = document.getElementById("checkoutCopyVaBtn");
    var vaNumberEl = document.getElementById("checkoutVaNumber");
    if (copyBtn && vaNumberEl) {
      copyBtn.addEventListener("click", function () {
        var text = vaNumberEl.textContent.trim();
        var done = function () {
          copyBtn.textContent = "Tersalin!";
          copyBtn.classList.add("is-copied");
          setTimeout(function () {
            copyBtn.textContent = "Salin Nomor VA";
            copyBtn.classList.remove("is-copied");
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(done);
        } else {
          done();
        }
      });
    }

    if (method === "EWALLET" && data.ewallet && data.ewallet.redirectUrl && checkoutState.justCreated) {
      window.open(data.ewallet.redirectUrl, "_blank", "noopener");
    }
  }

  function showCheckoutResultView() {
    checkoutModeActive = true;
    if (checkoutPanel) checkoutPanel.hidden = false;
    setVisible(customerInfoSectionEl, false);
    setVisible(checkoutBtnSectionEl, false);
    setNavTitle("Pembayaran");
    setVisible(checkoutStepMethod, false);
    setVisible(checkoutStepResult, true);
    renderResultView();
    var expiryAt = checkoutState.expiryAt || (Date.now() + COUNTDOWN_MS);
    startCountdown(expiryAt);
    checkoutState.justCreated = false;
    writeCheckoutState(checkoutState);
    renderCart();
  }

  function pickChannel(method, channelCode, channelLabel, btnEl) {
    if (!checkoutState || !checkoutState.orderSnapshot) {
      showCheckoutError("Sesi checkout tidak ditemukan, silakan ulangi dari keranjang.");
      return;
    }

    hideCheckoutError();
    var listEl = channelListEls[method];
    if (listEl) {
      listEl.querySelectorAll(".payment-pick-btn").forEach(function (b) { b.disabled = true; });
    }
    if (btnEl) btnEl.textContent = "Memproses...";

    var snap = checkoutState.orderSnapshot;
    var payload = {
      items: snap.items,
      amount: snap.total,
      method: method,
      channel: channelCode || undefined,
      customer: {
        name: snap.customerName || "Pelanggan",
        phone: snap.phone
      }
    };

    fetch(PIVOT_ENDPOINT, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, SUPABASE_FN_HEADERS),
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error((result.data && result.data.error) || "Gagal membuat pembayaran.");
        }

        var serverExpiry = null;
        if (result.data.virtualAccount && result.data.virtualAccount.expiryAt) {
          serverExpiry = new Date(result.data.virtualAccount.expiryAt).getTime();
        } else if (result.data.qr && result.data.qr.expiryAt) {
          serverExpiry = new Date(result.data.qr.expiryAt).getTime();
        }

        checkoutState.step = "result";
        checkoutState.method = method;
        checkoutState.channel = channelCode || "";
        checkoutState.resultData = result.data;
        checkoutState.expiryAt = serverExpiry && serverExpiry > Date.now() ? serverExpiry : Date.now() + COUNTDOWN_MS;
        checkoutState.justCreated = true;
        writeCheckoutState(checkoutState);

        showCheckoutResultView();
      })
      .catch(function (err) {
        showCheckoutError(err.message || "Gagal membuat pembayaran, coba lagi.");
      })
      .finally(function () {
        if (listEl) {
          listEl.querySelectorAll(".payment-pick-btn").forEach(function (b) {
            b.disabled = false;
            b.textContent = "Pilih";
          });
        }
      });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      var cart = window.CartStore.getCart();
      if (cart.length === 0) return;

      var total = getOrderTotal();
      var phone = waEl ? waEl.value.trim() : "";
      var name = customerNameEl ? customerNameEl.value.trim() : "";

      var items = cart.map(function (it) {
        return {
          id: it.id,
          title: it.title,
          qty: it.qty,
          price: it.price,
          type: it.type,
          variant: it.variant || undefined
        };
      });

      checkoutState = {
        step: "method",
        method: "",
        channel: "",
        orderSnapshot: {
          items: items,
          total: total,
          customerName: name,
          phone: phone
        },
        createdAt: Date.now()
      };
      writeCheckoutState(checkoutState);
      showCheckoutMethodView();
    });
  }

  var checkoutBackBtn = document.getElementById("checkoutBackBtn");
  var checkoutDoneBtn = document.getElementById("checkoutDoneBtn");

  function cancelCheckoutAndReturnToCart() {
    checkoutState = null;
    writeCheckoutState(null);
    showCartView();
  }

  if (checkoutBackBtn) {
    checkoutBackBtn.addEventListener("click", cancelCheckoutAndReturnToCart);
  }
  if (checkoutDoneBtn) {
    checkoutDoneBtn.addEventListener("click", cancelCheckoutAndReturnToCart);
  }

  // Restore last checkout step on load / reload / back navigation
  function applyPersistedCheckoutState() {
    checkoutState = readCheckoutState();
    if (!checkoutState) {
      showCartView();
      return;
    }
    if (checkoutState.step === "result" && checkoutState.resultData) {
      showCheckoutResultView();
    } else if (checkoutState.step === "method" && checkoutState.orderSnapshot) {
      showCheckoutMethodView();
    } else {
      showCartView();
    }
  }

  applyPersistedCheckoutState();

  window.addEventListener("pageshow", function (e) {
    // Handles bfcache back/forward navigation so the last checkout step is kept
    if (e.persisted) applyPersistedCheckoutState();
  });

  function openConfirmRemove(id, variantKey, title) {
    pendingRemove = { id: id, variantKey: variantKey };
    if (confirmDescEl) {
      confirmDescEl.textContent = title
        ? '"' + title + '" akan dihapus dari keranjang kamu.'
        : "Produk akan dihapus dari keranjang kamu.";
    }
    if (confirmOverlay) confirmOverlay.hidden = false;
  }

  function closeConfirmRemove() {
    pendingRemove = null;
    if (confirmOverlay) confirmOverlay.hidden = true;
  }

  if (confirmOkBtn) {
    confirmOkBtn.addEventListener("click", function () {
      if (pendingRemove) {
        window.CartStore.removeItem(pendingRemove.id, pendingRemove.variantKey);
      }
      closeConfirmRemove();
    });
  }

  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener("click", function () {
      closeConfirmRemove();
      renderCart();
    });
  }

  if (confirmOverlay) {
    confirmOverlay.addEventListener("click", function (e) {
      if (e.target === confirmOverlay) {
        closeConfirmRemove();
        renderCart();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && confirmOverlay && !confirmOverlay.hidden) {
      closeConfirmRemove();
      renderCart();
    }
  });

  document.addEventListener("cart:updated", renderCart);
  resetKurirResults();
  renderCart();

  function isEffectivelyVisible(el) {
    return !el.hidden && el.style.display !== "none";
  }

  function reconcileEmptyState() {
    if (checkoutModeActive) {
      if (isEffectivelyVisible(cartListEl)) setVisible(cartListEl, false);
      if (isEffectivelyVisible(cartEmptyEl)) setVisible(cartEmptyEl, false);
      return;
    }

    var cart = window.CartStore.getCart();
    if (!Array.isArray(cart)) cart = [];
    var shouldBeEmpty = cart.length === 0;

    if (isEffectivelyVisible(cartEmptyEl) !== shouldBeEmpty) {
      setVisible(cartEmptyEl, shouldBeEmpty);
    }
    if (isEffectivelyVisible(cartListEl) !== !shouldBeEmpty) {
      setVisible(cartListEl, !shouldBeEmpty);
    }

    if (!shouldBeEmpty && cartListEl.children.length === 0) {
      renderCart();
    }
  }

  if (window.MutationObserver) {
    var cartGuardObserver = new MutationObserver(function () {
      reconcileEmptyState();
    });
    cartGuardObserver.observe(cartEmptyEl, { attributes: true, attributeFilter: ["hidden", "style", "class"] });
    cartGuardObserver.observe(cartListEl, { attributes: true, attributeFilter: ["hidden", "style", "class"], childList: true });
  }

  window.addEventListener("load", reconcileEmptyState);
})();
