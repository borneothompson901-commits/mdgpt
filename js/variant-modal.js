(function () {
  "use strict";
  var variantModalState = null; 

  function getSelectedVariantKey(selected, variantGroups) {
    var parts = [];
    for (var i = 0; i < variantGroups.length; i++) {
      var group = variantGroups[i];
      var val = selected[group.id];
      if (group.required !== false && !val) return null;
      parts.push(val || "");
    }
    return parts.join("|");
  }

  function getPriceForSelection(product, selected) {
    var groups = product.variantGroups || [];
    var key = getSelectedVariantKey(selected, groups);
    if (key && product.variantPricing && product.variantPricing[key]) {
      return product.variantPricing[key].price;
    }
    return product.price;
  }

  function getStockForOption(product, groupId, optionId, selected) {
    var groups = product.variantGroups || [];
    var trial = {};
    for (var k in selected) trial[k] = selected[k];
    trial[groupId] = optionId;

    var allSelected = groups.every(function (g) {
      return g.required === false || !!trial[g.id];
    });
    if (!allSelected) return null;

    var key = getSelectedVariantKey(trial, groups);
    if (key && product.variantPricing && product.variantPricing[key]) {
      return product.variantPricing[key].stock;
    }
    return null; 
  }

  function getStockForSelection(product, selected) {
    var groups = product.variantGroups || [];
    var key = getSelectedVariantKey(selected, groups);
    if (key && product.variantPricing && product.variantPricing[key]) {
      return product.variantPricing[key].stock;
    }
    return null;
  }

  function normalizeVariantGroups(rawGroups) {
    if (!Array.isArray(rawGroups)) return [];
    return rawGroups.map(function (g) {
      var groupId = g.id || g.name || g.label;
      var groupLabel = g.label || g.name || "Pilih Opsi";
      var rawOptions = g.options || [];
      var options = rawOptions.map(function (o) {
        if (typeof o === "string" || typeof o === "number") {
          var v = String(o);
          return { id: v, value: v, label: v };
        }
        var val = o.value != null ? o.value : (o.label != null ? o.label : o.id);
        return {
          id: o.id != null ? o.id : val,
          value: val,
          label: o.label != null ? o.label : val,
          price: o.price,
          oldPrice: o.oldPrice,
          stock: o.stock,
          image: o.image
        };
      });
      return {
        id: groupId,
        label: groupLabel,
        required: g.required,
        options: options
      };
    });
  }

  function formatRupiahModal(n) {
    n = Math.round(parseFloat(n)) || 0;
    return "Rp" + n.toLocaleString("id-ID");
  }

  function buildMissingHintText(missingGroups) {
    if (missingGroups.length === 0) return "";
    var names = missingGroups.map(function (g) {
      return (g.label || "").replace(/^pilih\s+/i, "").trim().toLowerCase() || g.label;
    });
    if (names.length === 1) return "Pilih " + names[0] + " dulu ya";
    return "Pilih " + names.slice(0, -1).join(", ") + " & " + names[names.length - 1] + " dulu ya";
  }

  window.openVariantModal = function openVariantModal(product, opts) {
    opts = opts || {};
    injectVariantModalStyles();
    closeVariantModal();

    var groups = normalizeVariantGroups(product.variantGroups || []);

    var overlay = document.createElement("div");
    overlay.className = "variant-modal-overlay";

    var modal = document.createElement("div");
    modal.className = "variant-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    var defaultImage = opts.image || (product.images && product.images[0]) || "";
    var productImage = defaultImage;

    modal.innerHTML =
      '<button type="button" class="variant-modal__close" aria-label="Tutup">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button>" +
      '<div class="variant-modal__head">' +
        '<img class="variant-modal__img" src="' + productImage + '" alt="" />' +
        '<div class="variant-modal__headinfo">' +
          '<p class="variant-modal__title">' + (product.title || "") + "</p>" +
          '<p class="variant-modal__price" data-role="price"></p>' +
          '<p class="variant-modal__stock" data-role="stock"></p>' +
        "</div>" +
      "</div>" +
      '<div class="variant-modal__body" data-role="groups"></div>' +
      '<div class="variant-modal__qty-row">' +
        '<span class="variant-modal__qty-label">Jumlah</span>' +
        '<div class="variant-modal__qty-control">' +
          '<div class="variant-modal__stepper">' +
            '<button type="button" class="variant-modal__step variant-modal__step--minus" aria-label="Kurangi jumlah">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14"/></svg>' +
            "</button>" +
            '<input type="number" class="variant-modal__qty-input" value="1" min="1" inputmode="numeric" />' +
            '<button type="button" class="variant-modal__step variant-modal__step--plus" aria-label="Tambah jumlah">' +
              '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
            "</button>" +
          "</div>" +
          '<p class="variant-modal__qty-hint" data-role="qtyhint"></p>' +
        "</div>" +
      "</div>" +
      '<div class="variant-modal__footer">' +
        '<p class="variant-modal__hint" data-role="hint"></p>' +
        '<button type="button" class="variant-modal__add-btn" data-role="addbtn" disabled>Tambah ke Keranjang</button>' +
      "</div>";

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    lockBodyScroll();

    var imgEl = modal.querySelector(".variant-modal__img");
    var groupsWrap = modal.querySelector('[data-role="groups"]');
    var priceEl = modal.querySelector('[data-role="price"]');
    var stockEl = modal.querySelector('[data-role="stock"]');
    var hintEl = modal.querySelector('[data-role="hint"]');
    var addBtn = modal.querySelector('[data-role="addbtn"]');
    var qtyInput = modal.querySelector(".variant-modal__qty-input");
    var qtyMinusBtn = modal.querySelector(".variant-modal__step--minus");
    var qtyPlusBtn = modal.querySelector(".variant-modal__step--plus");
    var qtyStepperEl = modal.querySelector(".variant-modal__stepper");
    var qtyHintEl = modal.querySelector('[data-role="qtyhint"]');
    var closeBtn = modal.querySelector(".variant-modal__close");
    var qtyHintTimer = null;

    var startQty = parseInt(opts.initialQty, 10);
    if (isNaN(startQty) || startQty < 1) startQty = 1;

    variantModalState = {
      overlay: overlay,
      modal: modal,
      product: product,
      selected: {},
      qty: startQty,
      maxQty: 99
    };

    function showQtyMaxHint(maxQty) {
      if (!qtyHintEl) return;
      qtyHintEl.textContent = maxQty > 0 ? "Stok cuma tersisa " + maxQty : "Stok habis";
      qtyHintEl.classList.add("is-visible");
      if (qtyStepperEl) {
        qtyStepperEl.classList.remove("is-shaking");
        void qtyStepperEl.offsetWidth;
        qtyStepperEl.classList.add("is-shaking");
      }
      clearTimeout(qtyHintTimer);
      qtyHintTimer = setTimeout(function () {
        qtyHintEl.classList.remove("is-visible");
      }, 1800);
    }

    function getVariantImage(selected) {
      var img = null;
      groups.forEach(function (group) {
        var optId = selected[group.id];
        if (!optId) return;
        var opt = group.options.filter(function (o) { return o.id === optId; })[0];
        if (opt && opt.image) img = opt.image;
      });
      return img;
    }

    function updateModalImage() {
      var variantImg = getVariantImage(variantModalState.selected);
      productImage = variantImg || defaultImage;
      if (imgEl) imgEl.src = productImage;
    }

    function renderGroups() {
      groupsWrap.innerHTML = "";
      groups.forEach(function (group) {
        var row = document.createElement("div");
        row.className = "variant-modal__group";

        var label = document.createElement("p");
        label.className = "variant-modal__group-label";
        label.textContent = group.label || "Pilih Opsi";
        row.appendChild(label);

        var chips = document.createElement("div");
        chips.className = "variant-modal__chips";

        group.options.forEach(function (option) {
          var stock = getStockForOption(product, group.id, option.id, variantModalState.selected);
          var isOutOfStock = stock === 0;
          var isSelected = variantModalState.selected[group.id] === option.id;

          var chip = document.createElement("button");
          chip.type = "button";
          chip.className = "variant-modal__chip" +
            (isSelected ? " is-selected" : "") +
            (isOutOfStock ? " is-disabled" : "");
          chip.disabled = isOutOfStock;
          chip.textContent = option.label;

          if (!isOutOfStock) {
            chip.addEventListener("click", function () {
              if (variantModalState.selected[group.id] === option.id) {
                delete variantModalState.selected[group.id];
              } else {
                variantModalState.selected[group.id] = option.id;
              }
              renderGroups();
              renderSummary();
            });
          }

          chips.appendChild(chip);
        });

        row.appendChild(chips);
        groupsWrap.appendChild(row);
      });
    }

    function renderSummary() {
      var selected = variantModalState.selected;
      updateModalImage();
      var price = getPriceForSelection(product, selected);
      priceEl.textContent = formatRupiahModal(price);

      var stock = getStockForSelection(product, selected);
      if (typeof stock === "number") {
        stockEl.classList.add("is-visible");
        stockEl.textContent = stock > 0 ? "Stok tersisa: " + stock : "Stok habis";
        stockEl.classList.toggle("is-empty", stock === 0);
      } else {
        stockEl.classList.remove("is-visible");
      }

      var missingGroups = groups.filter(function (g) {
        return g.required !== false && !selected[g.id];
      });
      var allSelected = missingGroups.length === 0;
      var isOutOfStock = allSelected && stock === 0;

      var maxQty = typeof stock === "number" && stock > 0 ? stock : 99;
      if (variantModalState.qty < 1) variantModalState.qty = 1;
      variantModalState.maxQty = maxQty;
      qtyInput.value = variantModalState.qty;
      qtyInput.max = maxQty;
      qtyMinusBtn.disabled = variantModalState.qty <= 1;
      qtyPlusBtn.classList.toggle("is-maxed", variantModalState.qty >= maxQty);

      var qtyExceedsStock =
        allSelected && !isOutOfStock && typeof stock === "number" && variantModalState.qty > maxQty;

      if (!allSelected) {
        hintEl.classList.add("is-visible");
        hintEl.textContent = buildMissingHintText(missingGroups);
      } else if (isOutOfStock) {
        hintEl.classList.add("is-visible");
        hintEl.textContent = "Kombinasi ini sedang habis, coba pilihan lain ya";
      } else if (qtyExceedsStock) {
        hintEl.classList.add("is-visible");
        hintEl.textContent =
          "Stok cuma tersisa " + maxQty + ", kurangi jumlah pesanan dulu ya";
        qtyInput.classList.add("is-error");
      } else {
        hintEl.classList.remove("is-visible");
      }

      if (!qtyExceedsStock) qtyInput.classList.remove("is-error");

      addBtn.disabled = !allSelected || isOutOfStock || qtyExceedsStock;
    }

    qtyMinusBtn.addEventListener("click", function () {
      variantModalState.qty = Math.max(1, variantModalState.qty - 1);
      renderSummary();
    });
    qtyPlusBtn.addEventListener("click", function () {
      var maxQty = variantModalState.maxQty || 99;
      if (variantModalState.qty >= maxQty) {
        showQtyMaxHint(maxQty);
        return;
      }
      variantModalState.qty = variantModalState.qty + 1;
      renderSummary();
    });
    qtyInput.addEventListener("change", function () {
      var v = parseInt(qtyInput.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      variantModalState.qty = v;
      renderSummary();
    });

    addBtn.addEventListener("click", function () {
      if (addBtn.disabled) return;

      var selected = variantModalState.selected;
      var qty = variantModalState.qty;
      var price = getPriceForSelection(product, selected);
      var variantKey = getSelectedVariantKey(selected, groups);
      var variantLabels = {};
      groups.forEach(function (group) {
        var optId = selected[group.id];
        var opt = group.options.filter(function (o) { return o.id === optId; })[0];
        variantLabels[group.id] = opt ? opt.label : optId;
      });
      var variantSummary = groups.map(function (group) { return variantLabels[group.id]; }).join(", ");
      var cartItem = {
        id: product.id,
        title: product.title,
        image: productImage,
        category: product.category,
        price: price,
        variant: variantLabels,
        variantKey: variantKey
      };

      window.CartStore.addItem(cartItem, qty);

      closeVariantModal();

      if (typeof opts.onAdded === "function") opts.onAdded();
      if (window.flyToCart) window.flyToCart(opts.sourceImgEl, opts.sourceBtnEl);
      if (window.showAddedToCartToast) {
        window.showAddedToCartToast({
          image: cartItem.image,
          title: cartItem.title + (variantSummary ? " (" + variantSummary + ")" : ""),
          price: cartItem.price
        });
      }
    });

    closeBtn.addEventListener("click", closeVariantModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeVariantModal();
    });
    document.addEventListener("keydown", handleVariantModalKeydown);

    renderGroups();
    renderSummary();

    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });
  };

  function handleVariantModalKeydown(e) {
    if (e.key === "Escape") closeVariantModal();
  }

  function closeVariantModal() {
    if (!variantModalState) return;
    var overlay = variantModalState.overlay;
    var opts = variantModalState.opts;
    document.removeEventListener("keydown", handleVariantModalKeydown);
    overlay.classList.remove("is-open");
    unlockBodyScroll();
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 200);
    variantModalState = null;
    if (opts && typeof opts.onClose === "function") opts.onClose();
  }

  // overflow:hidden alone doesn't reliably stop touch-scroll on mobile
  // (Safari/Chrome can still rubber-band/scroll the body behind a fixed
  // overlay), which was letting the page shift under the user's finger
  // mid-tap and cause mis-taps on the variant chips. Pinning body to a
  // fixed position at the current scroll offset stops that completely.
  var lockedScrollY = 0;
  function lockBodyScroll() {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = "-" + lockedScrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }
  function unlockBodyScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo(0, lockedScrollY);
  }

  function injectVariantModalStyles() {
    if (document.getElementById("variantModalStyles")) return;
    var style = document.createElement("style");
    style.id = "variantModalStyles";
    style.textContent =
      ".variant-modal-overlay{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;pointer-events:none;transition:opacity .2s ease,background .2s ease;overscroll-behavior:contain;}" +
      ".variant-modal-overlay.is-open{opacity:1;pointer-events:auto;background:rgba(0,0,0,.45);}" +
      ".variant-modal{position:relative;width:100%;max-width:420px;max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:20px;transform:translateY(16px) scale(.98);opacity:0;transition:transform .22s ease,opacity .22s ease;}" +
      ".variant-modal-overlay.is-open .variant-modal{transform:translateY(0) scale(1);opacity:1;}" +
      ".variant-modal__close{position:absolute;top:12px;right:12px;width:30px;height:30px;border:none;border-radius:50%;background:#f2f2f2;color:#555;display:flex;align-items:center;justify-content:center;cursor:pointer;}" +
      ".variant-modal__close:hover{background:#e6e6e6;color:#1a1a1a;}" +
      ".variant-modal__head{display:flex;gap:12px;padding-right:34px;}" +
      ".variant-modal__img{flex:none;width:64px;height:64px;border-radius:12px;object-fit:cover;background:#f2f2f2;}" +
      ".variant-modal__headinfo{min-width:0;}" +
      ".variant-modal__title{margin:0;font-size:13.5px;font-weight:600;color:#1a1a1a;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}" +
      ".variant-modal__price{margin:6px 0 0;font-size:17px;font-weight:700;color:var(--grad-1,#a91ab6);}" +
      ".variant-modal__stock{margin:2px 0 0;min-height:14px;line-height:14px;font-size:11.5px;color:#1a9c5c;opacity:0;transition:opacity .15s ease;}" +
      ".variant-modal__stock.is-visible{opacity:1;}" +
      ".variant-modal__stock.is-empty{color:#e0473e;}" +
      ".variant-modal__body{margin-top:16px;display:flex;flex-direction:column;gap:16px;}" +
      ".variant-modal__group-label{margin:0 0 8px;font-size:13px;font-weight:600;color:#1a1a1a;}" +
      ".variant-modal__chips{display:flex;flex-wrap:wrap;gap:8px;}" +
      ".variant-modal__chip{border:1.5px solid #e0e0e0;background:#fff;color:#1a1a1a;font-size:12.5px;font-weight:500;padding:8px 14px;border-radius:9px;cursor:pointer;transition:border-color .15s ease,color .15s ease,background .15s ease;}" +
      ".variant-modal__chip:hover{border-color:var(--grad-1,#a91ab6);}" +
      ".variant-modal__chip.is-selected{border-color:var(--grad-1,#a91ab6);background:var(--grad-1,#a91ab6);color:#fff;}" +
      ".variant-modal__chip.is-disabled{border-color:#eee;background:#f7f7f7;color:#b3b3b3;cursor:not-allowed;}" +
      ".variant-modal__chip.is-disabled:hover{border-color:#eee;}" +
      ".variant-modal__qty-row{margin-top:18px;display:flex;align-items:flex-start;gap:10px;}" +
      ".variant-modal__qty-label{font-size:13px;font-weight:600;color:#1a1a1a;flex:1;margin-top:6px;}" +
      ".variant-modal__qty-control{position:relative;display:flex;flex-direction:column;align-items:flex-end;}" +
      ".variant-modal__stepper{display:flex;align-items:center;border:1.5px solid #e0e0e0;border-radius:9px;overflow:hidden;}" +
      ".variant-modal__stepper.is-shaking{animation:variantQtyShake .36s ease;}" +
      "@keyframes variantQtyShake{0%,100%{transform:translateX(0);}20%{transform:translateX(-4px);}40%{transform:translateX(4px);}60%{transform:translateX(-3px);}80%{transform:translateX(3px);}}" +
      ".variant-modal__step{width:30px;height:30px;border:none;background:#fafafa;color:#1a1a1a;display:flex;align-items:center;justify-content:center;cursor:pointer;}" +
      ".variant-modal__step:disabled{color:#ccc;cursor:not-allowed;}" +
      ".variant-modal__step:not(:disabled):hover{background:#f0f0f0;}" +
      ".variant-modal__step--plus.is-maxed{color:#ccc;}" +
      ".variant-modal__qty-input{width:38px;height:30px;border:none;border-left:1.5px solid #e0e0e0;border-right:1.5px solid #e0e0e0;text-align:center;font-size:13px;-moz-appearance:textfield;}" +
      ".variant-modal__qty-input.is-error{color:#e0473e;background:#fdeceb;}" +
      ".variant-modal__qty-input::-webkit-outer-spin-button,.variant-modal__qty-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}" +
      ".variant-modal__qty-hint{position:absolute;top:calc(100% + 5px);right:0;margin:0;font-size:10.5px;color:#e0473e;text-align:right;white-space:nowrap;pointer-events:none;opacity:0;transform:translateY(-3px);transition:opacity .15s ease,transform .15s ease;}" +
      ".variant-modal__qty-hint.is-visible{opacity:1;transform:translateY(0);}" +
      ".variant-modal__footer{margin-top:18px;}" +
      ".variant-modal__hint{margin:0 0 8px;min-height:14px;line-height:14px;font-size:11.5px;color:#e0473e;text-align:center;opacity:0;transition:opacity .15s ease;}" +
      ".variant-modal__hint.is-visible{opacity:1;}" +
      ".variant-modal__add-btn{width:100%;padding:12px;border:none;border-radius:10px;background:var(--grad-1,#a91ab6);color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:filter .15s ease,opacity .15s ease;}" +
      ".variant-modal__add-btn:not(:disabled):hover{filter:brightness(1.08);}" +
      ".variant-modal__add-btn:disabled{background:#d8d8d8;color:#999;cursor:not-allowed;}" +
      "@media (max-width:640px){" +
        ".variant-modal-overlay{align-items:flex-end;padding:0;}" +
        ".variant-modal{max-width:none;width:100%;max-height:85vh;border-radius:18px 18px 0 0;transform:translateY(100%);}" +
        ".variant-modal-overlay.is-open .variant-modal{transform:translateY(0);}" +
      "}";
    document.head.appendChild(style);
  }

})();
