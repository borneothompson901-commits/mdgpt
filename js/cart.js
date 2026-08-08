(function () {
  "use strict";

  if (!window.CartStore) return;
  var ADMIN_WHATSAPP = "6287777222572";
  var ONGKIR_ENDPOINT = "/api/ongkir.php";
  var HIERARCHY_ENDPOINT = "/api/destination-hierarchy.php";

  var SERVICE_FEE = 0;
  var TAX_RATE = 0;
  var state = {
    ongkir: 0,
    ongkirChecked: false,
    ongkirService: "",
    ongkirEtd: "",
    destinationLabel: ""
  };

  var cartListEl = document.getElementById("cartList");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var itemTemplate = document.getElementById("cartItemTemplate");

  var digitalOnlyNoteEl = document.getElementById("digitalOnlyNote");
  var shippingSectionEl = document.getElementById("shippingSection");

  var destinationIdEl = document.getElementById("cartDestinationId");
  var addressDetailEl = document.getElementById("cartAddressDetail");
  var waEl = document.getElementById("cartWhatsapp");

  var kurirHiddenEl = document.getElementById("cartKurir");
  var kurirListEl = document.getElementById("kurirResultList");

  var cekOngkirBtn = document.getElementById("cekOngkirBtn");
  var ongkirNoteEl = document.getElementById("cartOngkirNote");
  var sumOngkirRowEl = document.getElementById("sumOngkirRow");

  var COURIER_NAMES = {
    jne: "JNE",
    jnt: "J&T Express",
    sicepat: "SiCepat",
    anteraja: "AnterAja"
  };

  // Custom dropdown controller (replaces native <select> so styling is
  // fully custom, with menu list capped to 5 rows + scroll for the rest).
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
      setVisible(cartEmptyEl, true);
      setVisible(cartListEl, false);
    } else {
      setVisible(cartEmptyEl, false);
      setVisible(cartListEl, true);

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

    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) { return data.results || []; })
      .catch(function () { return []; });
  }

  function resetKurirResults() {
    kurirHiddenEl.value = "";
    if (!kurirListEl) return;
    var items = kurirListEl.querySelectorAll(".cart-kurir-item");
    items.forEach(function (item) {
      item.classList.remove("is-selected", "is-loading", "is-unavailable");
      var costEl = item.querySelector("[data-cost]");
      if (costEl) costEl.textContent = "—";
    });
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

  function selectKurirItem(courier) {
    if (!kurirListEl) return;
    var items = kurirListEl.querySelectorAll(".cart-kurir-item");
    items.forEach(function (item) {
      item.classList.toggle("is-selected", item.getAttribute("data-courier") === courier);
    });
    kurirHiddenEl.value = courier;
  }

  if (kurirListEl) {
    kurirListEl.addEventListener("click", function (e) {
      var item = e.target.closest(".cart-kurir-item");
      if (!item || item.classList.contains("is-unavailable") || item.classList.contains("is-loading")) return;
      var costEl = item.querySelector("[data-cost]");
      if (!costEl || !costEl.hasAttribute("data-value")) return;

      selectKurirItem(item.getAttribute("data-courier"));

      state.ongkir = parseInt(costEl.getAttribute("data-value"), 10) || 0;
      state.ongkirChecked = true;
      state.ongkirService = item.getAttribute("data-name") || "";
      state.ongkirEtd = costEl.getAttribute("data-etd") || "";

      showOngkirNote(
        "Kurir dipilih " + state.ongkirService + ": " + formatRupiah(state.ongkir) +
          (state.ongkirEtd ? " (est. " + state.ongkirEtd + " hari)" : ""),
        "success"
      );

      updateTotals();
      updateCheckoutState();
    });
  }

  if (cekOngkirBtn) {
    cekOngkirBtn.addEventListener("click", function () {
      if (!hasValidDestination()) {
        showOngkirNote("Lengkapi provinsi sampai kelurahan/desa tujuan dulu ya.", "error");
        if (provinceDd) provinceDd.root.querySelector(".custom-select__trigger").focus();
        return;
      }

      var weight = window.CartStore.getTotalWeight();
      if (weight <= 0) weight = 1000;

      var couriers = Object.keys(COURIER_NAMES);
      var items = kurirListEl ? kurirListEl.querySelectorAll(".cart-kurir-item") : [];

      state.ongkirChecked = false;
      ongkirNoteEl.hidden = true;
      kurirHiddenEl.value = "";
      items.forEach(function (item) {
        item.classList.remove("is-selected", "is-unavailable");
        item.classList.add("is-loading");
        var costEl = item.querySelector("[data-cost]");
        if (costEl) {
          costEl.textContent = "Mengecek...";
          costEl.removeAttribute("data-value");
          costEl.removeAttribute("data-etd");
        }
      });

      cekOngkirBtn.disabled = true;
      cekOngkirBtn.textContent = "Mengecek ongkir...";

      var requests = couriers.map(function (courier) {
        var payload = {
          destination_id: destinationIdEl.value,
          weight: weight,
          courier: courier
        };

        return fetch(ONGKIR_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (res) { return res.json(); })
          .then(function (data) { return { courier: courier, data: data }; })
          .catch(function () { return { courier: courier, data: null }; });
      });

      Promise.all(requests).then(function (results) {
        var cheapest = null;

        results.forEach(function (result) {
          var item = kurirListEl.querySelector('.cart-kurir-item[data-courier="' + result.courier + '"]');
          if (!item) return;
          item.classList.remove("is-loading");

          var costEl = item.querySelector("[data-cost]");
          var data = result.data;

          if (!data || typeof data.cost !== "number") {
            item.classList.add("is-unavailable");
            if (costEl) costEl.textContent = "Tidak tersedia";
            return;
          }

          if (costEl) {
            costEl.textContent = formatRupiah(data.cost);
            costEl.setAttribute("data-value", String(data.cost));
            costEl.setAttribute("data-etd", data.etd || "");
          }

          if (!cheapest || data.cost < cheapest.cost) {
            cheapest = { courier: result.courier, cost: data.cost, service: data.service, etd: data.etd };
          }
        });

        if (cheapest) {
          selectKurirItem(cheapest.courier);
          state.ongkir = cheapest.cost;
          state.ongkirChecked = true;
          state.ongkirService = cheapest.service || COURIER_NAMES[cheapest.courier] || "";
          state.ongkirEtd = cheapest.etd || "";

          showOngkirNote(
            "Ongkir termurah " + state.ongkirService + ": " + formatRupiah(cheapest.cost) +
              (cheapest.etd ? " (est. " + cheapest.etd + " hari)" : "") +
              ". Bisa pilih kurir lain di bawah.",
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

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      var cart = window.CartStore.getCart();
      if (cart.length === 0) return;

      var needsShipping = window.CartStore.needsShipping();
      var subtotal = window.CartStore.getSubtotal();
      var ongkir = state.ongkirChecked ? state.ongkir : 0;
      var layanan = SERVICE_FEE;
      var pajak = Math.round(subtotal * TAX_RATE);
      var total = subtotal + ongkir + layanan + pajak;

      var lines = [];
      lines.push("Halo, saya mau checkout pesanan berikut:");
      lines.push("");
      cart.forEach(function (item, idx) {
        lines.push(
          (idx + 1) + ". " + item.title + " x" + item.qty + " = " + formatRupiah(item.price * item.qty) +
            (item.type === "fisik" ? " (fisik)" : " (digital)")
        );
      });
      lines.push("");
      lines.push("Subtotal: " + formatRupiah(subtotal));
      if (needsShipping) {
        lines.push("Ongkir (" + (state.ongkirService || kurirHiddenEl.value) + "): " + formatRupiah(ongkir));
      }
      lines.push("Biaya Layanan: " + formatRupiah(layanan));
      lines.push("Pajak: " + formatRupiah(pajak));
      lines.push("Total: " + formatRupiah(total));
      lines.push("");

      if (needsShipping) {
        lines.push("Tujuan: " + state.destinationLabel);
        lines.push("Alamat: " + addressDetailEl.value.trim());
      }
      lines.push("No. WhatsApp: " + waEl.value.trim());

      var waUrl = "https://wa.me/" + ADMIN_WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(waUrl, "_blank", "noopener");
    });
  }

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
  renderCart();

  function isEffectivelyVisible(el) {
    return !el.hidden && el.style.display !== "none";
  }

  function reconcileEmptyState() {
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
