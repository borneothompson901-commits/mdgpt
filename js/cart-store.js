(function (global) {
  "use strict";

  var STORAGE_KEY = "mdgpt_lingua_cart";

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
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

  function sameItem(a, b) {
    return String(a.id) === String(b.id) && String(a.variantKey || "") === String(b.variantKey || "");
  }

  function addItem(product, qty) {
    qty = parseInt(qty, 10) || 1;
    var cart = readCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (sameItem(cart[i], product)) { existing = cart[i]; break; }
    }
    if (existing) {
      existing.qty += qty;
    } else {
      var item = {
        id: product.id,
        title: product.title || "",
        price: parseInt(product.price, 10) || 0,
        image: product.image || "",
        category: product.category || "",
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
    qty = parseInt(qty, 10) || 0;
    var cart = readCart();
    var next = [];
    cart.forEach(function (it) {
      if (!sameItem(it, { id: id, variantKey: variantKey })) { next.push(it); return; }
      if (qty > 0) { it.qty = qty; next.push(it); }
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

  global.CartStore = {
    KEY: STORAGE_KEY,
    getCart: readCart,
    saveCart: writeCart,
    addItem: addItem,
    updateQty: updateQty,
    removeItem: removeItem,
    clearCart: clearCart,
    getCount: getCount,
    getSubtotal: getSubtotal
  };

  window.addEventListener("storage", function (e) {
    if (e.key === STORAGE_KEY) emitUpdate(readCart());
  });
})(window);
