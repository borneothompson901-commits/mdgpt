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
  var ORDER_STATUS_ENDPOINT = SUPABASE_URL + "/functions/v1/order-status";

  var VA_CHANNELS = [
    { code: "BCA", label: "BCA", disabled: true },
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
  var CHANNEL_ICON = {
    BCA: { file: "bca", initials: "BCA", bg: "#003876" },
    PERMATA: { file: "permata", initials: "PR", bg: "#003876" },
    BNI: { file: "bni", initials: "BNI", bg: "#f37021" },
    BRI: { file: "bri", initials: "BRI", bg: "#00529c" },
    MANDIRI: { file: "mandiri", initials: "MD", bg: "#003a70" },
    CIMB: { file: "cimb", initials: "CB", bg: "#7a1f2b" },
    DANAMON: { file: "danamon", initials: "DM", bg: "#e2231a" },
    MAYBANK: { file: "maybank", initials: "MB", bg: "#ffc72c" },
    SAHABAT_SAMPOERNA: { file: "sahabat_sampoerna", initials: "BSS", bg: "#0f9d58" },
    QRIS: { file: "qris", initials: "QR", bg: "#4b2d83" },
    SHOPEEPAY: { file: "shopeepay", initials: "SP", bg: "#ee4d2d" },
    DANA: { file: "dana", initials: "DN", bg: "#118eea" },
    OVO: { file: "ovo", initials: "OVO", bg: "#4c2a86" },
    LINKAJA: { file: "linkaja", initials: "LA", bg: "#e6231e" },
    ASTRAPAY: { file: "astrapay", initials: "AP", bg: "#005ca9" }
  };

  var SERVICE_FEE = 0;
  var TAX_RATE = 0;
  var ONGKIR_RATE = 0;
  var CHECKOUT_CONFIG_ENDPOINT = SUPABASE_URL + "/rest/v1/checkout_config?select=*&limit=1";

  function loadCheckoutConfig() {
    return fetch(CHECKOUT_CONFIG_ENDPOINT, { headers: SUPABASE_FN_HEADERS })
      .then(function (res) { return res.json(); })
      .then(function (rows) {
        var cfg = (rows && rows[0]) || {};
        SERVICE_FEE = parseInt(cfg.biaya_layanan, 10) || 0;
        TAX_RATE = (parseFloat(cfg.pajak_persen) || 0) / 100;
        ONGKIR_RATE = (parseFloat(cfg.ongkir_rate_persen) || 0) / 100;
        updateTotals();
      })
      .catch(function () {  });
  }

  function terapkanTarifOngkir(nilai) {
    var angka = parseInt(nilai, 10) || 0;
    return Math.round(angka * (1 + ONGKIR_RATE));
  }

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
  var cartLoadingEl = document.getElementById("cartLoading");
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
  var kurirFieldEl = document.getElementById("kurirField");
  var gantiEkspedisiBtn = document.getElementById("gantiEkspedisiBtn");

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

  function clearFieldInvalid(el) {
    if (el) el.classList.remove("is-field-invalid");
  }

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
      if (val) clearFieldInvalid(root);
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
  var checkoutValidationHintEl = document.getElementById("checkoutValidationHint");
  var customerNameEl = document.getElementById("cartCustomerName");

  var CHECKOUT_STORAGE_KEY = "mdgpt_lingua_checkout";
  var SHIPPING_DRAFT_KEY = "mdgpt_lingua_shipping_draft";
  var COUNTDOWN_MS = 15 * 60 * 1000;

  function readShippingDraft() {
    try {
      var raw = localStorage.getItem(SHIPPING_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearShippingDraft() {
    try { localStorage.removeItem(SHIPPING_DRAFT_KEY); } catch (e) {}
  }

  function saveShippingDraft() {
    try {
      var draft = {
        customerName: customerNameEl ? customerNameEl.value : "",
        whatsapp: waEl ? waEl.value : "",
        addressDetail: addressDetailEl ? addressDetailEl.value : "",
        province: provinceDd && provinceDd.value ? { id: provinceDd.value, label: provinceDd.label } : null,
        city: cityDd && cityDd.value ? { id: cityDd.value, label: cityDd.label } : null,
        district: districtDd && districtDd.value ? { id: districtDd.value, label: districtDd.label } : null,
        subdistrict: subdistrictDd && subdistrictDd.value ? { id: subdistrictDd.value, label: subdistrictDd.label } : null,
        kurir: state.ongkirChecked && kurirHiddenEl && kurirHiddenEl.value ? {
          courier: kurirHiddenEl.value,
          serviceCode: state.ongkirServiceCode,
          cost: state.ongkir,
          etd: state.ongkirEtd
        } : null
      };
      localStorage.setItem(SHIPPING_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {}
  }

  var navTitleMain = document.getElementById("navTitleMain");
  var navTitleMobile = document.getElementById("navTitleMobile");

  var checkoutPanel = document.getElementById("checkoutPanel");
  var checkoutStepMethod = document.getElementById("checkoutStepMethod");
  var checkoutStepResult = document.getElementById("checkoutStepResult");
  var checkoutErrorEl = document.getElementById("checkoutError");
  var checkoutResultContent = document.getElementById("checkoutResultContent");
  var paymentAccordion = document.getElementById("paymentAccordion");
  var cartPageEl = document.querySelector(".cart-page");
  var channelListEls = {
    VA: document.getElementById("channelListVA"),
    QRIS: document.getElementById("channelListQRIS"),
    EWALLET: document.getElementById("channelListEWALLET")
  };

  var customerInfoSectionEl = document.getElementById("customerInfoSection");
  var checkoutBtnSectionEl = document.getElementById("checkoutBtnSection");
  var checkoutModeActive = false;

  var countdownTimer = null;
  var statusPollTimer = null;

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
    if (!product) return Infinity;

    var key = item.variantKey || "";
    if (key && product.variantPricing) {
      var pricing = product.variantPricing[key];
      if (pricing && typeof pricing.stock === "number") return pricing.stock;
    }

    // Non-variant product: fall back to the flat stock column. Digital
    // products (or physical ones with untracked stock) leave stock null,
    // meaning unlimited.
    if (typeof product.stock === "number") return product.stock;
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
    if (cartLoadingEl) cartLoadingEl.hidden = true;
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
    if (checkoutModeActive && checkoutState && checkoutState.orderSnapshot) {
      var snap = checkoutState.orderSnapshot;
      sumSubtotalEl.textContent = formatRupiah(snap.subtotal || 0);
      sumOngkirEl.textContent = formatRupiah(snap.ongkir || 0);
      sumLayananEl.textContent = formatRupiah(snap.layanan || 0);
      sumPajakEl.textContent = formatRupiah(snap.pajak || 0);
      sumTotalEl.textContent = formatRupiah(snap.total || 0);
      return;
    }

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
    showAllKurirGroups();
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

  function showAllKurirGroups() {
    if (kurirListEl) {
      kurirListEl.querySelectorAll(".cart-kurir-group").forEach(function (group) {
        setVisible(group, true);
      });
    }
    if (gantiEkspedisiBtn) setVisible(gantiEkspedisiBtn, false);
  }

  function focusKurirGroup(courier) {
    if (!kurirListEl) return;
    kurirListEl.querySelectorAll(".cart-kurir-group").forEach(function (group) {
      setVisible(group, group.getAttribute("data-courier-group") === courier);
    });
    if (gantiEkspedisiBtn) setVisible(gantiEkspedisiBtn, true);
  }

  function markKurirInvalid() {
    if (!ongkirNoteEl) return;
    if (!ongkirNoteEl.textContent || !ongkirNoteEl.textContent.trim()) {
      ongkirNoteEl.textContent = "Silakan pilih ekspedisi terlebih dahulu.";
    }
    ongkirNoteEl.hidden = false;
    ongkirNoteEl.style.color = "#d9534f";
  }

  if (gantiEkspedisiBtn) {
    gantiEkspedisiBtn.addEventListener("click", function () {
      showAllKurirGroups();
      closeAllPaketPanels();
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

      var pilihBtn = document.createElement("button");
      pilihBtn.type = "button";
      pilihBtn.className = "cart-kurir-paket-item__pilih-btn";
      pilihBtn.textContent = "Pilih";

      var rightWrap = document.createElement("div");
      rightWrap.className = "cart-kurir-paket-item__right";
      rightWrap.appendChild(harga);
      rightWrap.appendChild(pilihBtn);

      row.appendChild(estimasi);
      row.appendChild(rightWrap);
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
    clearFieldInvalid(kurirFieldEl);

    if (!opts.silent) {
      showOngkirNote(
        "Ekspedisi dipilih " + state.ongkirService + ": " + formatRupiah(state.ongkir) +
          (state.ongkirEtd ? " (est. " + state.ongkirEtd + " hari)" : ""),
        "success"
      );
    }

    focusKurirGroup(courier);
    updateTotals();
    updateCheckoutState();
    saveShippingDraft();
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
      saveShippingDraft();
    });
  }

  function restoreShippingDraft() {
    var draft = readShippingDraft();
    if (!draft) return;

    if (customerNameEl && draft.customerName) customerNameEl.value = draft.customerName;
    if (waEl && draft.whatsapp) waEl.value = draft.whatsapp;
    if (addressDetailEl && draft.addressDetail) addressDetailEl.value = draft.addressDetail;

    if (!provinceDd || !draft.province || !draft.province.id) return;

    fetchHierarchy("province").then(function (items) {
      provinceDd.setItems(items);
      provinceDd.setValue(draft.province.id, draft.province.label);
      if (!draft.city || !draft.city.id) return;

      cityDd.setDisabled(false);
      return fetchHierarchy("city", draft.province.id).then(function (cityItems) {
        cityDd.setItems(cityItems);
        cityDd.setValue(draft.city.id, draft.city.label);
        if (!draft.district || !draft.district.id) return;

        districtDd.setDisabled(false);
        return fetchHierarchy("district", draft.city.id).then(function (districtItems) {
          districtDd.setItems(districtItems);
          districtDd.setValue(draft.district.id, draft.district.label);
          if (!draft.subdistrict || !draft.subdistrict.id) return;

          subdistrictDd.setDisabled(false);
          return fetchHierarchy("subdistrict", draft.district.id).then(function (subdistrictItems) {
            subdistrictDd.setItems(subdistrictItems);
            subdistrictDd.setValue(draft.subdistrict.id, draft.subdistrict.label);
            destinationIdEl.value = draft.subdistrict.id;
            state.destinationLabel = buildDestinationLabel();
            if (ongkirHintEl) setVisible(ongkirHintEl, false);
            reconcileShippingVisibility();

            if (draft.kurir && draft.kurir.courier) {
              var group = kurirListEl.querySelector('.cart-kurir-group[data-courier-group="' + draft.kurir.courier + '"]');
              if (group) {
                var courierName = COURIER_NAMES[draft.kurir.courier] || draft.kurir.courier;
                selectPaket(group, draft.kurir.courier, courierName, draft.kurir.serviceCode, draft.kurir.cost, draft.kurir.etd, { silent: true });
              }
            }
            updateCheckoutState();
          });
        });
      });
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
      ongkirNoteEl.style.color = "";
      kurirHiddenEl.value = "";
      setVisible(kurirListEl, true);
      showAllKurirGroups();
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
        couriers: couriers
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
            var entry = byCourier[courier] || null;
            if (entry && Array.isArray(entry.services)) {
              entry.services.forEach(function (svc) {
                svc.cost = terapkanTarifOngkir(svc.cost);
              });
            }
            return { courier: courier, data: entry };
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

          var courierCheapest = services[0];
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
          showOngkirNote(
            "Termurah: " + cheapest.courierName + " " + formatRupiah(cheapest.cost) + ". Silakan pilih ekspedisi.",
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
    addressDetailEl.addEventListener("input", function () {
      clearFieldInvalid(addressDetailEl);
      updateCheckoutState();
      saveShippingDraft();
    });
  }

  function updateCheckoutState() {}

  if (waEl) {
    waEl.addEventListener("input", function () {
      clearFieldInvalid(waEl);
      updateCheckoutState();
      saveShippingDraft();
    });
  }

  if (customerNameEl) {
    customerNameEl.addEventListener("input", function () {
      clearFieldInvalid(customerNameEl);
      saveShippingDraft();
    });
  }

  function getOrderTotal() {
    var subtotal = window.CartStore.getSubtotal();
    var ongkir = state.ongkirChecked ? state.ongkir : 0;
    var layanan = SERVICE_FEE;
    var pajak = Math.round(subtotal * TAX_RATE);
    return subtotal + ongkir + layanan + pajak;
  }

  function getOrderBreakdown() {
    var subtotal = window.CartStore.getSubtotal();
    var ongkir = state.ongkirChecked ? state.ongkir : 0;
    var layanan = SERVICE_FEE;
    var pajak = Math.round(subtotal * TAX_RATE);
    return {
      subtotal: subtotal,
      ongkir: ongkir,
      layanan: layanan,
      pajak: pajak,
      total: subtotal + ongkir + layanan + pajak
    };
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

  function buildChannelIconEl(code) {
    var iconWrap = document.createElement("span");
    iconWrap.className = "payment-channel-row__icon";
    var meta = CHANNEL_ICON[code];
    var initialsEl = document.createElement("span");
    initialsEl.className = "payment-channel-row__icon-fallback";
    initialsEl.textContent = meta ? meta.initials : "";
    iconWrap.style.background = meta ? meta.bg : "#a91ab6";
    iconWrap.appendChild(initialsEl);
    if (meta && meta.file) {
      var imgEl = document.createElement("img");
      imgEl.alt = code;
      imgEl.loading = "lazy";
      imgEl.addEventListener("error", function () {
        imgEl.remove();
        iconWrap.style.background = meta.bg;
        initialsEl.hidden = false;
      });
      imgEl.addEventListener("load", function () {
        initialsEl.hidden = true;
        iconWrap.style.background = "transparent";
      });
      initialsEl.hidden = true;
      imgEl.src = "../assets/icons/" + meta.file + ".png";
      iconWrap.appendChild(imgEl);
    }
    return iconWrap;
  }

  function renderChannelRows(method) {
    var listEl = channelListEls[method];
    if (!listEl || listEl.childElementCount > 0) return;

    var rows = [];
    if (method === "VA") {
      rows = VA_CHANNELS.map(function (ch) {
        return { code: ch.code, title: ch.label, desc: "", disabled: !!ch.disabled };
      });
    } else if (method === "EWALLET") {
      rows = EWALLET_CHANNELS.map(function (ch) {
        return { code: ch.code, title: ch.label, desc: "", disabled: false };
      });
    } else if (method === "QRIS") {
      rows = [{ code: "QRIS", title: "QRIS", desc: "", disabled: false }];
    }

    rows.forEach(function (row) {
      var rowEl = document.createElement("div");
      rowEl.className = "payment-channel-row" + (row.disabled ? " payment-channel-row--disabled" : "");

      var mainEl = document.createElement("div");
      mainEl.className = "payment-channel-row__main";
      mainEl.appendChild(buildChannelIconEl(row.code));

      var infoEl = document.createElement("div");
      infoEl.className = "payment-channel-row__info";
      infoEl.innerHTML =
        '<span class="payment-channel-row__title">' + row.title + '</span>' +
        (row.desc ? '<span class="payment-channel-row__desc">' + row.desc + '</span>' : '');
      mainEl.appendChild(infoEl);

      rowEl.appendChild(mainEl);

      if (row.disabled) {
        var badgeEl = document.createElement("span");
        badgeEl.className = "payment-channel-row__badge";
        badgeEl.textContent = "Belum tersedia";
        rowEl.appendChild(badgeEl);
      } else {
        var pickBtn = document.createElement("button");
        pickBtn.type = "button";
        pickBtn.className = "payment-pick-btn";
        pickBtn.textContent = "Pilih";
        pickBtn.addEventListener("click", function () {
          pickChannel(method, row.code === "QRIS" ? "" : row.code, row.title, pickBtn);
        });
        rowEl.appendChild(pickBtn);
      }

      listEl.appendChild(rowEl);
    });
  }

  ["VA", "QRIS", "EWALLET"].forEach(renderChannelRows);

  if (paymentAccordion) {
    paymentAccordion.addEventListener("click", function (e) {
      var header = e.target.closest(".payment-accordion__header");
      if (!header) return;
      var item = header.closest(".payment-accordion__item");
      if (item.dataset.methodDisabled === "true") return;
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
    if (cartPageEl) cartPageEl.classList.remove("is-checkout-view");
    if (cartLayoutEl) cartLayoutEl.classList.remove("is-paid-view", "is-expired-view");
    stopCountdown();
    stopStatusPoll();
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
    if (cartPageEl) cartPageEl.classList.add("is-checkout-view");
    if (cartLayoutEl) cartLayoutEl.classList.remove("is-paid-view", "is-expired-view");
    stopCountdown();
    stopStatusPoll();
    renderCart();
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function stopStatusPoll() {
    if (statusPollTimer) {
      clearInterval(statusPollTimer);
      statusPollTimer = null;
    }
  }

  function isTerminalOrderStatus(status) {
    return status === "PAID" || status === "EXPIRED" || status === "CANCELLED" || status === "FAILED";
  }

  function checkOrderStatus() {
    if (!checkoutState || !checkoutState.resultData) return;
    var ref = checkoutState.resultData.clientReferenceId;
    if (!ref) return;

    fetch(ORDER_STATUS_ENDPOINT + "?ref=" + encodeURIComponent(ref), { headers: SUPABASE_FN_HEADERS })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !data.status || data.status === checkoutState.orderStatus) return;
        checkoutState.orderStatus = data.status;
        writeCheckoutState(checkoutState);
        if (isTerminalOrderStatus(data.status)) stopStatusPoll();
        if (checkoutModeActive && checkoutState.step === "result") renderResultView();
      })
      .catch(function () {});
  }

  function startStatusPoll() {
    stopStatusPoll();
    if (checkoutState && isTerminalOrderStatus(checkoutState.orderStatus)) return;
    checkOrderStatus();
    statusPollTimer = setInterval(checkOrderStatus, 6000);
  }

  function formatCountdown(ms) {
    var totalSec = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(totalSec / 60);
    var s = totalSec % 60;
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    return pad(m) + ":" + pad(s);
  }

  function startCountdown(expiryAt) {
    stopCountdown();
    var timeEl = document.getElementById("checkoutCountdownTime");
    if (!timeEl) return;

    function tick() {
      var remaining = expiryAt - Date.now();
      if (remaining <= 0) {
        timeEl.textContent = "00:00:00";
        stopCountdown();
        checkoutState.uiExpired = true;
        writeCheckoutState(checkoutState);
        renderResultView();
        return;
      }
      timeEl.textContent = formatCountdown(remaining);
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  function adminWhatsappLink(message) {
    return "https://wa.me/" + ADMIN_WHATSAPP + "?text=" + encodeURIComponent(message);
  }

  function getResultOrderId() {
    var data = (checkoutState && checkoutState.resultData) || {};
    return data.clientReferenceId || data.orderId || "-";
  }

  function renderExpiredCard() {
    stopCountdown();
    stopStatusPoll();
    if (cartLayoutEl) cartLayoutEl.classList.remove("is-paid-view");
    if (cartLayoutEl) cartLayoutEl.classList.add("is-expired-view");
    setVisible(cartSummaryEl, false);

    var orderId = getResultOrderId();

    checkoutResultContent.innerHTML =
      '<div class="payment-success">' +
        '<div class="payment-success__icon payment-success__icon--expired">' +
          '<span class="payment-success__icon-pulse"></span>' +
          '<svg class="payment-success__check payment-success__check--x" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
            '<circle class="payment-success__check-circle" cx="40" cy="40" r="36"/>' +
            '<path class="payment-success__check-mark" d="M27 27L53 53M53 27L27 53"/>' +
          '</svg>' +
        '</div>' +
        '<h2 class="payment-success__title">Waktu Pembayaran Habis</h2>' +
        '<p class="payment-success__subtitle">Sesi pembayaran untuk pesanan ini sudah berakhir dan otomatis dibatalkan.</p>' +
        '<div class="payment-success__card">' +
          '<div class="payment-success__row">' +
            '<span class="payment-success__row-label">Order ID</span>' +
            '<span class="payment-success__row-value">' + orderId + '</span>' +
          '</div>' +
          '<div class="payment-success__row">' +
            '<span class="payment-success__row-label">Status</span>' +
            '<span class="payment-success__badge payment-success__badge--expired">Kadaluarsa</span>' +
          '</div>' +
        '</div>' +
        '<p class="payment-success__note">Kalau kamu sudah terlanjur transfer atau bayar, langsung hubungi admin ya biar segera dibantu dicek.</p>' +
        '<div class="payment-success__actions">' +
          '<button type="button" class="payment-success__btn payment-success__btn--reorder" id="expiredReorderBtn">Order Ulang</button>' +
          '<button type="button" class="payment-success__btn payment-success__btn--ghost" id="expiredHomeBtn">Halaman Utama</button>' +
        '</div>' +
      '</div>';

    var reorderBtn = document.getElementById("expiredReorderBtn");
    if (reorderBtn) {
      reorderBtn.addEventListener("click", function () {
        writeCheckoutState(null);
        window.location.href = "../lingua/index.html";
      });
    }

    var homeBtn = document.getElementById("expiredHomeBtn");
    if (homeBtn) {
      homeBtn.addEventListener("click", function () {
        writeCheckoutState(null);
        window.location.href = "../lingua.html";
      });
    }
  }

  function renderPaidCard() {
    stopCountdown();
    stopStatusPoll();
    if (cartLayoutEl) cartLayoutEl.classList.remove("is-expired-view");
    if (cartLayoutEl) cartLayoutEl.classList.add("is-paid-view");
    setVisible(cartSummaryEl, false);

    if (window.CartStore && typeof window.CartStore.clearCart === "function") {
      window.CartStore.clearCart();
    }

    var orderId = getResultOrderId();
    var waHref = adminWhatsappLink(
      "Halo admin, pembayaran order " + orderId + " sudah berhasil. Mohon info selanjutnya ya."
    );

    checkoutResultContent.innerHTML =
      '<div class="payment-success">' +
        '<div class="payment-success__icon">' +
          '<span class="payment-success__icon-pulse"></span>' +
          '<svg class="payment-success__check" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
            '<circle class="payment-success__check-circle" cx="40" cy="40" r="36"/>' +
            '<path class="payment-success__check-mark" d="M23 41l11 11 24-26"/>' +
          '</svg>' +
        '</div>' +
        '<h2 class="payment-success__title">Pembayaran Berhasil!</h2>' +
        '<p class="payment-success__subtitle">Pesanan kamu sudah kami terima dan sedang diproses tim kami.</p>' +
        '<div class="payment-success__card">' +
          '<div class="payment-success__row">' +
            '<span class="payment-success__row-label">Order ID</span>' +
            '<span class="payment-success__row-value">' + orderId + '</span>' +
          '</div>' +
          '<div class="payment-success__row">' +
            '<span class="payment-success__row-label">Status</span>' +
            '<span class="payment-success__badge">Lunas</span>' +
          '</div>' +
        '</div>' +
        '<p class="payment-success__note">Nomor resi (produk fisik) atau file/dokumen (produk digital) akan diinfokan admin lewat WhatsApp maksimal 1x24 jam.</p>' +
        '<div class="payment-success__actions">' +
          '<a class="payment-success__btn payment-success__btn--primary" href="' + waHref + '" target="_blank" rel="noopener">Hubungi Admin (WhatsApp)</a>' +
          '<button type="button" class="payment-success__btn payment-success__btn--ghost" id="paidHomeBtn">Halaman Utama</button>' +
        '</div>' +
      '</div>';

    var homeBtn = document.getElementById("paidHomeBtn");
    if (homeBtn) {
      homeBtn.addEventListener("click", function () {
        writeCheckoutState(null);
        window.location.href = "../lingua.html";
      });
    }
  }

  function renderPendingCard() {
    if (cartLayoutEl) cartLayoutEl.classList.remove("is-paid-view", "is-expired-view");
    setVisible(cartSummaryEl, true);
    var method = checkoutState.method;
    var data = checkoutState.resultData || {};
    var html = '<div class="payment-countdown" id="checkoutCountdownWrap">' +
        '<span class="payment-countdown__label">Selesaikan pembayaran dalam</span>' +
        '<span class="payment-countdown__time" id="checkoutCountdownTime">15:00</span>' +
      '</div>';

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

    var expiryAt = checkoutState.expiryAt || (Date.now() + COUNTDOWN_MS);
    startCountdown(expiryAt);
  }

  function renderResultView() {
    if (!checkoutResultContent || !checkoutState) return;

    if (checkoutState.orderStatus === "PAID") {
      renderPaidCard();
      return;
    }

    var expiredByTimer = checkoutState.uiExpired || (checkoutState.expiryAt && Date.now() >= checkoutState.expiryAt);
    if (expiredByTimer || isTerminalOrderStatus(checkoutState.orderStatus)) {
      renderExpiredCard();
      return;
    }

    renderPendingCard();
  }

  function showCheckoutResultView() {
    checkoutModeActive = true;
    if (checkoutPanel) checkoutPanel.hidden = false;
    setVisible(customerInfoSectionEl, false);
    setVisible(checkoutBtnSectionEl, false);
    setNavTitle("Pembayaran");
    setVisible(checkoutStepMethod, false);
    setVisible(checkoutStepResult, true);
    if (cartPageEl) cartPageEl.classList.add("is-checkout-view");
    renderResultView();
    startStatusPoll();
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
    var refCode = window.MdgptRefTracker ? window.MdgptRefTracker.getRefCode() : null;
    var payload = {
      items: snap.items,
      amount: snap.total,
      method: method,
      channel: channelCode || undefined,
      customer: {
        name: snap.customerName || "Pelanggan",
        phone: snap.phone
      },
      ref_code: refCode || undefined
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

        var uiExpiry = Date.now() + COUNTDOWN_MS;
        if (serverExpiry && serverExpiry > Date.now() && serverExpiry < uiExpiry) {
          uiExpiry = serverExpiry;
        }

        checkoutState.step = "result";
        checkoutState.method = method;
        checkoutState.channel = channelCode || "";
        checkoutState.resultData = result.data;
        checkoutState.expiryAt = uiExpiry;
        checkoutState.orderStatus = result.data.status === "PAID" ? "PAID" : "";
        checkoutState.uiExpired = false;
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

  function findFirstInvalidField() {
    var needsShipping = window.CartStore.needsShipping();
    if (needsShipping) {
      var geoSteps = [provinceDd, cityDd, districtDd, subdistrictDd];
      for (var i = 0; i < geoSteps.length; i++) {
        if (geoSteps[i] && !geoSteps[i].value) {
          return {
            outlineEl: geoSteps[i].root,
            focusEl: geoSteps[i].root.querySelector(".custom-select__trigger"),
            msg: "Lengkapi alamat pengiriman dulu ya."
          };
        }
      }
      if (!addressDetailEl.value.trim()) {
        return { outlineEl: addressDetailEl, focusEl: addressDetailEl, msg: "Isi detail alamat pengiriman dulu ya." };
      }
      if (!kurirHiddenEl.value || !state.ongkirChecked) {
        return { kurirInvalid: true, focusEl: cekOngkirBtn, msg: "Pilih ekspedisi pengiriman dulu ya." };
      }
    }
    if (waEl.value.trim().length < 9) {
      return { outlineEl: waEl, focusEl: waEl, msg: "Isi nomor WhatsApp yang valid dulu ya." };
    }
    return null;
  }

  function showFieldError(invalid) {
    document.querySelectorAll(".is-field-invalid").forEach(function (el) {
      el.classList.remove("is-field-invalid");
    });
    if (invalid.kurirInvalid) {
      markKurirInvalid();
      if (kurirFieldEl) kurirFieldEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (invalid.outlineEl) {
      invalid.outlineEl.classList.add("is-field-invalid");
      invalid.outlineEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (invalid.focusEl && typeof invalid.focusEl.focus === "function") {
      invalid.focusEl.focus({ preventScroll: true });
    }
    if (checkoutValidationHintEl) {
      checkoutValidationHintEl.textContent = invalid.msg;
      checkoutValidationHintEl.hidden = false;
    }
  }

  function hideFieldError() {
    if (checkoutValidationHintEl) {
      checkoutValidationHintEl.hidden = true;
      checkoutValidationHintEl.textContent = "";
    }
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      var cart = window.CartStore.getCart();
      if (cart.length === 0) return;

      var invalid = findFirstInvalidField();
      if (invalid) {
        showFieldError(invalid);
        return;
      }
      hideFieldError();

      var total = getOrderTotal();
      var breakdown = getOrderBreakdown();
      var phone = waEl ? waEl.value.trim() : "";
      var name = customerNameEl ? customerNameEl.value.trim() : "";

      var items = cart.map(function (it) {
        return {
          id: it.id,
          title: it.title,
          qty: it.qty,
          price: it.price,
          type: it.type,
          variant: it.variant || undefined,
          variantKey: it.variantKey || undefined
        };
      });

      checkoutState = {
        step: "method",
        method: "",
        channel: "",
        orderSnapshot: {
          items: items,
          total: total,
          subtotal: breakdown.subtotal,
          ongkir: breakdown.ongkir,
          layanan: breakdown.layanan,
          pajak: breakdown.pajak,
          customerName: name,
          phone: phone
        },
        createdAt: Date.now()
      };
      writeCheckoutState(checkoutState);
      clearShippingDraft();
      showCheckoutMethodView();
    });
  }

  var checkoutBackBtn = document.getElementById("checkoutBackBtn");
  var checkoutDoneBtn = document.getElementById("checkoutDoneBtn");

  function cancelCheckoutAndReturnToCart() {
    stopStatusPoll();
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
  if (!checkoutState) restoreShippingDraft();

  window.addEventListener("pageshow", function (e) {
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
  loadCheckoutConfig();

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
