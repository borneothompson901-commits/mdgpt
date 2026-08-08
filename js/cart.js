(function () {
  "use strict";

  if (!window.CartStore) return;
  var ADMIN_WHATSAPP = "6287777222572";

  var SERVICE_FEE = 0;
  var TAX_RATE = 0;
  var state = {
    ongkir: 0,
    ongkirChecked: false
  };

  var cartListEl = document.getElementById("cartList");
  var cartEmptyEl = document.getElementById("cartEmpty");
  var itemTemplate = document.getElementById("cartItemTemplate");

  var addressEl = document.getElementById("cartAddress");
  var waEl = document.getElementById("cartWhatsapp");
  var kurirEl = document.getElementById("cartKurir");
  var cekOngkirBtn = document.getElementById("cekOngkirBtn");
  var ongkirNoteEl = document.getElementById("cartOngkirNote");

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

    updateTotals();
    updateCheckoutState();
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

  if (cekOngkirBtn) {
    cekOngkirBtn.addEventListener("click", function () {
      var address = addressEl.value.trim();
      if (!address) {
        ongkirNoteEl.hidden = false;
        ongkirNoteEl.style.color = "#d9534f";
        ongkirNoteEl.textContent = "Isi alamat dulu ya sebelum cek ongkir.";
        addressEl.focus();
        return;
      }

      state.ongkir = 0;
      state.ongkirChecked = true;

      ongkirNoteEl.hidden = false;
      ongkirNoteEl.style.color = "#1a9c5c";
      ongkirNoteEl.textContent =
        "Ongkir " + kurirEl.options[kurirEl.selectedIndex].text + ": " + formatRupiah(state.ongkir) + " (gratis, promo peluncuran)";

      updateTotals();
      updateCheckoutState();
    });
  }

  [addressEl, kurirEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener("input", function () {
      if (state.ongkirChecked) {
        state.ongkirChecked = false;
        ongkirNoteEl.hidden = true;
        updateTotals();
        updateCheckoutState();
      }
    });
  });

  function updateCheckoutState() {
    var cart = window.CartStore.getCart();
    var hasItems = cart.length > 0;
    var hasAddress = addressEl.value.trim().length > 0;
    var hasWa = waEl.value.trim().length >= 9;

    checkoutBtn.disabled = !(hasItems && hasAddress && hasWa);
  }

  [addressEl, waEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener("input", updateCheckoutState);
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      var cart = window.CartStore.getCart();
      if (cart.length === 0) return;

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
          (idx + 1) + ". " + item.title + " x" + item.qty + " = " + formatRupiah(item.price * item.qty)
        );
      });
      lines.push("");
      lines.push("Subtotal: " + formatRupiah(subtotal));
      lines.push("Ongkir: " + formatRupiah(ongkir));
      lines.push("Biaya Layanan: " + formatRupiah(layanan));
      lines.push("Pajak: " + formatRupiah(pajak));
      lines.push("Total: " + formatRupiah(total));
      lines.push("");
      lines.push("Alamat: " + addressEl.value.trim());
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
