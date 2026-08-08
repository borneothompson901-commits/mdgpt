(function () {
  "use strict";

  if (!window.CartStore) return;
  var ADMIN_WHATSAPP = "6287777222572";
  var ONGKIR_ENDPOINT = "/api/ongkir.php";
  var DESTINATION_ENDPOINT = "/api/destination-search.php";
  var DESTINATION_DEBOUNCE_MS = 300;
  var DESTINATION_MIN_CHARS = 3;

  var SERVICE_FEE = 0;
  var TAX_RATE = 0;
  var state = {
    ongkir: 0,
    ongkirChecked: false,
    ongkirService: "",
    ongkirEtd: "",
    destinationLabel: "",
    destinationTimer: null,
    destinationRequestId: 0
  };

  var cartListEl = document.getElementById("cartList");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var itemTemplate = document.getElementById("cartItemTemplate");

  var digitalOnlyNoteEl = document.getElementById("digitalOnlyNote");
  var shippingSectionEl = document.getElementById("shippingSection");

  var destinationInputEl = document.getElementById("cartDestinationInput");
  var destinationMenuEl = document.getElementById("destinationMenu");
  var destinationIdEl = document.getElementById("cartDestinationId");
  var addressDetailEl = document.getElementById("cartAddressDetail");
  var waEl = document.getElementById("cartWhatsapp");

  var kurirSelectEl = document.getElementById("kurirSelect");
  var kurirTriggerEl = document.getElementById("kurirSelectTrigger");
  var kurirMenuEl = document.getElementById("kurirSelectMenu");
  var kurirValueEl = document.getElementById("kurirSelectValue");
  var kurirHiddenEl = document.getElementById("cartKurir");

  var cekOngkirBtn = document.getElementById("cekOngkirBtn");
  var ongkirNoteEl = document.getElementById("cartOngkirNote");
  var sumOngkirRowEl = document.getElementById("sumOngkirRow");

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

  function closeKurirMenu() {
    kurirMenuEl.hidden = true;
    kurirTriggerEl.setAttribute("aria-expanded", "false");
  }

  function openKurirMenu() {
    kurirMenuEl.hidden = false;
    kurirTriggerEl.setAttribute("aria-expanded", "true");
  }

  if (kurirTriggerEl) {
    kurirTriggerEl.addEventListener("click", function () {
      if (kurirMenuEl.hidden) openKurirMenu(); else closeKurirMenu();
    });
  }

  if (kurirMenuEl) {
    kurirMenuEl.addEventListener("click", function (e) {
      var option = e.target.closest(".custom-select__option");
      if (!option) return;

      var options = kurirMenuEl.querySelectorAll(".custom-select__option");
      options.forEach(function (opt) {
        opt.classList.remove("is-selected");
        opt.setAttribute("aria-selected", "false");
      });
      option.classList.add("is-selected");
      option.setAttribute("aria-selected", "true");

      kurirValueEl.textContent = option.textContent;
      kurirHiddenEl.value = option.getAttribute("data-value");
      closeKurirMenu();

      if (state.ongkirChecked) {
        state.ongkirChecked = false;
        ongkirNoteEl.hidden = true;
        updateTotals();
        updateCheckoutState();
      }
    });
  }

  document.addEventListener("click", function (e) {
    if (kurirSelectEl && !kurirSelectEl.contains(e.target)) closeKurirMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeKurirMenu();
  });

  function renderDestinationSuggestions(items) {
    destinationMenuEl.innerHTML = "";

    if (!items || items.length === 0) {
      destinationMenuEl.hidden = true;
      return;
    }

    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "destination-picker__option";
      li.setAttribute("data-id", item.id);
      li.setAttribute("data-label", item.label);
      li.textContent = item.label;
      destinationMenuEl.appendChild(li);
    });

    destinationMenuEl.hidden = false;
  }

  function fetchDestinations(query) {
    var requestId = ++state.destinationRequestId;

    fetch(DESTINATION_ENDPOINT + "?search=" + encodeURIComponent(query))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (requestId !== state.destinationRequestId) return;
        renderDestinationSuggestions(data.results || []);
      })
      .catch(function () {
        if (requestId !== state.destinationRequestId) return;
        renderDestinationSuggestions([]);
      });
  }

  if (destinationInputEl) {
    destinationInputEl.addEventListener("input", function () {
      var query = destinationInputEl.value.trim();

      destinationIdEl.value = "";
      state.destinationLabel = "";

      if (state.ongkirChecked) {
        state.ongkirChecked = false;
        ongkirNoteEl.hidden = true;
        updateTotals();
      }
      updateCheckoutState();

      clearTimeout(state.destinationTimer);

      if (query.length < DESTINATION_MIN_CHARS) {
        renderDestinationSuggestions([]);
        return;
      }

      state.destinationTimer = setTimeout(function () {
        fetchDestinations(query);
      }, DESTINATION_DEBOUNCE_MS);
    });

    destinationInputEl.addEventListener("focus", function () {
      if (destinationMenuEl.children.length > 0) destinationMenuEl.hidden = false;
    });
  }

  if (destinationMenuEl) {
    destinationMenuEl.addEventListener("click", function (e) {
      var option = e.target.closest(".destination-picker__option");
      if (!option) return;

      destinationInputEl.value = option.getAttribute("data-label");
      destinationIdEl.value = option.getAttribute("data-id");
      state.destinationLabel = option.getAttribute("data-label");
      destinationMenuEl.hidden = true;

      updateCheckoutState();
    });
  }

  document.addEventListener("click", function (e) {
    if (destinationInputEl && destinationMenuEl && !destinationInputEl.contains(e.target) && !destinationMenuEl.contains(e.target)) {
      destinationMenuEl.hidden = true;
    }
  });

  function showOngkirNote(text, kind) {
    ongkirNoteEl.hidden = false;
    ongkirNoteEl.style.color = kind === "error" ? "#d9534f" : "#1a9c5c";
    ongkirNoteEl.textContent = text;
  }

  if (cekOngkirBtn) {
    cekOngkirBtn.addEventListener("click", function () {
      if (!hasValidDestination()) {
        showOngkirNote("Pilih tujuan dari daftar saran dulu ya.", "error");
        destinationInputEl.focus();
        return;
      }

      var weight = window.CartStore.getTotalWeight();
      if (weight <= 0) weight = 1000;

      var payload = {
        destination_id: destinationIdEl.value,
        weight: weight,
        courier: kurirHiddenEl.value
      };

      cekOngkirBtn.disabled = true;
      cekOngkirBtn.textContent = "Mengecek...";

      fetch(ONGKIR_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data || typeof data.cost !== "number") {
            showOngkirNote("Gagal ambil ongkir, coba lagi.", "error");
            return;
          }

          state.ongkir = data.cost;
          state.ongkirChecked = true;
          state.ongkirService = data.service || "";
          state.ongkirEtd = data.etd || "";

          showOngkirNote(
            "Ongkir " + (data.service || "") + ": " + formatRupiah(data.cost) +
              (data.etd ? " (est. " + data.etd + " hari)" : ""),
            "success"
          );

          updateTotals();
          updateCheckoutState();
        })
        .catch(function () {
          showOngkirNote("Gagal ambil ongkir, coba lagi.", "error");
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
