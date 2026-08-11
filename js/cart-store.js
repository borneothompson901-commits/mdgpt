(function (global) {
  "use strict";

  var STORAGE_KEY = "mdgpt_lingua_cart";

  function parseStoredCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function resolveProductMeta(product) {
    var type = product.type === "fisik" ? "fisik" : "digital";
    var weight = parseInt(product.weight, 10) || 0;

    if (global.PRODUCTS_DATA && typeof global.PRODUCTS_DATA.getById === "function") {
      var master = global.PRODUCTS_DATA.getById(product.id);
      if (master) {
        type = master.type === "fisik" ? "fisik" : "digital";
        weight = parseInt(master.weight, 10) || 0;
      }
    }

    return { type: type, weight: weight };
  }

  function backfillMeta(cart) {
    if (!global.PRODUCTS_DATA || typeof global.PRODUCTS_DATA.getById !== "function") {
      return { cart: cart, changed: false };
    }

    var changed = false;
    var next = cart.map(function (it) {
      var master = global.PRODUCTS_DATA.getById(it.id);
      if (!master) return it;

      var type = master.type === "fisik" ? "fisik" : "digital";
      var weight = parseInt(master.weight, 10) || 0;

      if (it.type === type && it.weight === weight) return it;

      changed = true;
      var copy = {};
      for (var k in it) {
        if (Object.prototype.hasOwnProperty.call(it, k)) copy[k] = it[k];
      }
      copy.type = type;
      copy.weight = weight;
      return copy;
    });

    return { cart: next, changed: changed };
  }

  function readCart() {
    var cart = parseStoredCart();
    var result = backfillMeta(cart);

    if (result.changed) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.cart));
      } catch (e) {
      }
    }

    return result.cart;
  }

  function writeCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
    }
    emitUpdate(cart);
  }

  function emitUpdate(cart) {
    document.dispatchEvent(
      new CustomEvent("cart:updated", { detail: { cart: cart, count: sumQty(cart) } })
    );
  }

  function sumQty(cart) {
    return cart.reduce(function (sum, it) { return sum + (parseInt(it.qty, 10) || 0); }, 0);
  }

  var QTY_MIN = 1;
  var QTY_MAX = 99;

  function clampQty(value, fallback) {
    var n = parseInt(value, 10);
    if (isNaN(n)) return fallback;
    if (n < QTY_MIN) return QTY_MIN;
    if (n > QTY_MAX) return QTY_MAX;
    return n;
  }

  function sameItem(a, b) {
    return String(a.id) === String(b.id) && String(a.variantKey || "") === String(b.variantKey || "");
  }

  function addItem(product, qty) {
    qty = clampQty(qty, QTY_MIN);
    var cart = readCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (sameItem(cart[i], product)) { existing = cart[i]; break; }
    }
    if (existing) {
      existing.qty = clampQty(existing.qty + qty, QTY_MIN);
    } else {
      var meta = resolveProductMeta(product);
      var item = {
        id: product.id,
        title: product.title || "",
        price: parseInt(product.price, 10) || 0,
        image: product.image || "",
        category: product.category || "",
        type: meta.type,
        weight: meta.weight,
        qty: qty
      };
      if (product.variantKey) item.variantKey = product.variantKey;
      if (product.variant) item.variant = product.variant;
      cart.push(item);
    }
    writeCart(cart);
    return cart;
  }

  function updateQty(id, qty, variantKey) {
    var rawQty = parseInt(qty, 10);
    var cart = readCart();
    var next = [];
    cart.forEach(function (it) {
      if (!sameItem(it, { id: id, variantKey: variantKey })) { next.push(it); return; }
      if (!isNaN(rawQty) && rawQty > 0) {
        it.qty = clampQty(rawQty, QTY_MIN);
        next.push(it);
      }
    });
    writeCart(next);
    return next;
  }

  function removeItem(id, variantKey) {
    var cart = readCart().filter(function (it) { return !sameItem(it, { id: id, variantKey: variantKey }); });
    writeCart(cart);
    return cart;
  }

  function clearCart() {
    writeCart([]);
  }

  function getCount() {
    return sumQty(readCart());
  }

  function getSubtotal() {
    return readCart().reduce(function (sum, it) {
      return sum + (parseInt(it.price, 10) || 0) * (parseInt(it.qty, 10) || 0);
    }, 0);
  }

  function getPhysicalItems() {
    return readCart().filter(function (it) { return it.type === "fisik"; });
  }

  function needsShipping() {
    return getPhysicalItems().length > 0;
  }

  function getTotalWeight() {
    return getPhysicalItems().reduce(function (sum, it) {
      return sum + (parseInt(it.weight, 10) || 0) * (parseInt(it.qty, 10) || 0);
    }, 0);
  }

  global.CartStore = {
    KEY: STORAGE_KEY,
    getCart: readCart,
    saveCart: writeCart,
    addItem: addItem,
    updateQty: updateQty,
    removeItem: removeItem,
    clearCart: clearCart,
    getCount: getCount,
    getSubtotal: getSubtotal,
    getPhysicalItems: getPhysicalItems,
    needsShipping: needsShipping,
    getTotalWeight: getTotalWeight
  };

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) emitUpdate(readCart());
  });
})(window);
