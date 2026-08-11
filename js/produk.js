(function () {
  "use strict";

  function init() {
  var navbar = document.getElementById("navbar");
  if (navbar) navbar.classList.add("scrolled");

  var navBackBtn = document.getElementById("navBackBtn");
  if (navBackBtn) {
    navBackBtn.addEventListener("click", function () {
      var cameFromSameSite =
        document.referrer && document.referrer.indexOf(window.location.host) !== -1;
      if (cameFromSameSite && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });
  }

  var params = new URLSearchParams(window.location.search);
  var productId = params.get("id");
  var data = window.PRODUCTS_DATA;
  var product = data && productId ? data.getById(productId) : null;

  var notFoundEl = document.getElementById("pdNotFound");
  var detailEl = document.getElementById("pdDetail");
  var relatedEl = document.getElementById("pdRelated");

  if (!product) {
    if (notFoundEl) notFoundEl.hidden = false;
    return;
  }

  detailEl.hidden = false;
  relatedEl.hidden = false;

  var rupiah = data.rupiah;
  var checkIconSvg =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  injectCartFeedbackStyles();
  window.flyToCart = flyToCart;
  window.showAddedToCartToast = showAddedToCartToast;

  var cartToastStack = null;
  function getCartToastStack() {
    if (cartToastStack && document.body.contains(cartToastStack)) return cartToastStack;
    cartToastStack = document.createElement("div");
    cartToastStack.className = "cart-toast-stack";
    cartToastStack.setAttribute("aria-live", "polite");
    document.body.appendChild(cartToastStack);
    return cartToastStack;
  }

  function flyToCart(imgEl, fromBtnEl) {
    var cartIconEl =
      document.getElementById("navCartBtn") ||
      document.getElementById("mobileCartBtn") ||
      document.querySelector(".nav-cart, .mobile-cart");
    var startEl = imgEl || fromBtnEl;
    if (!cartIconEl || !startEl) return;

    var startRect = startEl.getBoundingClientRect();
    var endRect = cartIconEl.getBoundingClientRect();
    if (startRect.width === 0 || endRect.width === 0) return;

    var flyer = document.createElement("div");
    flyer.className = "cart-flyer";
    if (imgEl && imgEl.getAttribute("src")) {
      var cloneImg = document.createElement("img");
      cloneImg.src = imgEl.getAttribute("src");
      flyer.appendChild(cloneImg);
    }
    flyer.style.left = startRect.left + startRect.width / 2 + "px";
    flyer.style.top = startRect.top + startRect.height / 2 + "px";
    document.body.appendChild(flyer);

    var dx = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
    var dy = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
    flyer.style.setProperty("--fly-dx", dx + "px");
    flyer.style.setProperty("--fly-dy", dy + "px");

    requestAnimationFrame(function () {
      flyer.classList.add("is-flying");
    });

    flyer.addEventListener("animationend", function () {
      flyer.remove();
      cartIconEl.classList.add("is-bumping");
      setTimeout(function () {
        cartIconEl.classList.remove("is-bumping");
      }, 380);
    });

    setTimeout(function () {
      if (flyer.parentNode) flyer.remove();
    }, 900);
  }

  function showAddedToCartToast(cartItem) {
    var stack = getCartToastStack();

    var toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.innerHTML =
      '<div class="cart-toast__check">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
      "</div>" +
      '<img class="cart-toast__img" src="' + (cartItem.image || "") + '" alt="" />' +
      '<div class="cart-toast__info">' +
        '<p class="cart-toast__label">Ditambahkan ke keranjang</p>' +
        '<p class="cart-toast__title">' + (cartItem.title || "Produk") + "</p>" +
        '<p class="cart-toast__price">' + rupiah(parseInt(cartItem.price, 10) || 0) + "</p>" +
      "</div>" +
      '<a class="cart-toast__link" href="cart.html">Lihat</a>' +
      '<button type="button" class="cart-toast__close" aria-label="Tutup notifikasi">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button>";

    stack.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });

    var hideTimer = setTimeout(function () {
      dismissToast(toast);
    }, 3200);

    toast.querySelector(".cart-toast__close").addEventListener("click", function () {
      clearTimeout(hideTimer);
      dismissToast(toast);
    });

    function dismissToast(el) {
      el.classList.remove("is-visible");
      el.classList.add("is-leaving");
      setTimeout(function () {
        el.remove();
      }, 260);
    }
  }

  function injectCartFeedbackStyles() {
    if (document.getElementById("cartFeedbackStyles")) return;
    var style = document.createElement("style");
    style.id = "cartFeedbackStyles";
    style.textContent =
      ".cart-flyer{position:fixed;z-index:9999;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;overflow:hidden;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:0;transform:translate(0,0) scale(1);}" +
      ".cart-flyer img{width:100%;height:100%;object-fit:cover;display:block;}" +
      ".cart-flyer.is-flying{opacity:1;animation:cartFlyerMove .62s cubic-bezier(.3,.1,.3,1) forwards;}" +
      "@keyframes cartFlyerMove{0%{opacity:1;transform:translate(0,0) scale(1);}70%{opacity:1;}100%{opacity:0;transform:translate(var(--fly-dx),var(--fly-dy)) scale(.15);}}" +
      ".nav-cart.is-bumping,.mobile-cart.is-bumping,#navCartBtn.is-bumping,#mobileCartBtn.is-bumping{animation:cartIconBump .38s ease;}" +
      "@keyframes cartIconBump{0%{transform:scale(1);}35%{transform:scale(1.28);}60%{transform:scale(.94);}100%{transform:scale(1);}}" +
      ".cart-toast-stack{position:fixed;top:84px;right:16px;z-index:9998;display:flex;flex-direction:column;gap:10px;max-width:320px;}" +
      "@media (max-width:640px){.cart-toast-stack{left:12px;right:12px;max-width:none;top:auto;bottom:16px;}}" +
      ".cart-toast{display:flex;align-items:center;gap:10px;background:#fff;border-radius:14px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.08);opacity:0;transform:translateX(24px);transition:opacity .22s ease,transform .22s ease;}" +
      "@media (max-width:640px){.cart-toast{transform:translateY(16px);}}" +
      ".cart-toast.is-visible{opacity:1;transform:translateX(0);}" +
      "@media (max-width:640px){.cart-toast.is-visible{transform:translateY(0);}}" +
      ".cart-toast.is-leaving{opacity:0;transform:translateX(24px);}" +
      "@media (max-width:640px){.cart-toast.is-leaving{transform:translateY(16px);}}" +
      ".cart-toast__check{flex:none;width:22px;height:22px;border-radius:50%;background:#1a9c5c;color:#fff;display:flex;align-items:center;justify-content:center;}" +
      ".cart-toast__img{flex:none;width:42px;height:42px;border-radius:10px;object-fit:cover;background:#f2f2f2;}" +
      ".cart-toast__info{flex:1;min-width:0;}" +
      ".cart-toast__label{margin:0;font-size:11px;color:#1a9c5c;font-weight:600;}" +
      ".cart-toast__title{margin:1px 0 0;font-size:13px;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}" +
      ".cart-toast__price{margin:1px 0 0;font-size:12px;color:#666;}" +
      ".cart-toast__link{flex:none;font-size:12px;font-weight:600;color:#fff;background:#1a1a1a;padding:6px 10px;border-radius:8px;text-decoration:none;white-space:nowrap;}" +
      ".cart-toast__close{flex:none;border:none;background:transparent;color:#999;cursor:pointer;padding:4px;display:flex;}" +
      ".cart-toast__close:hover{color:#333;}";
    document.head.appendChild(style);
  }

  function updateCartBadges() {
    if (!window.CartStore) return;
    var count = window.CartStore.getCount();
    var badges = document.querySelectorAll(
      "#navCartCount, #mobileCartCount, .nav-cart__count, .mobile-cart__count"
    );
    badges.forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  if (window.CartStore) {
    updateCartBadges();
    document.addEventListener("cart:updated", updateCartBadges);
  }

  document.title = product.title + " - M-DGPT Agency";
  var crumbTitle = document.getElementById("pdBreadcrumbTitle");
  if (crumbTitle) crumbTitle.textContent = product.title;
  var navTitleEl = document.getElementById("navProductTitle");
  if (navTitleEl) navTitleEl.textContent = product.title;
  var mainImageWrap = document.querySelector(".pd-gallery__main");
  var mainImage = document.getElementById("pdMainImage");
  var thumbsWrap = document.getElementById("pdThumbs");
  var badgeEl = document.getElementById("pdBadge");
  var galleryImages = product.images || [];
  var currentImgIndex = 0;

  if (product.discount > 0) {
    badgeEl.hidden = false;
    badgeEl.textContent = "-" + product.discount + "%";
  }

  thumbsWrap.innerHTML = galleryImages
    .map(function (url, i) {
      return (
        '<button type="button" class="pd-gallery__thumb' +
        (i === 0 ? " is-active" : "") +
        '" data-index="' +
        i +
        '" data-img="' +
        url +
        '" aria-label="Lihat foto ' +
        (i + 1) +
        '"><img src="' +
        url +
        '" alt="' +
        product.title +
        " - foto " +
        (i + 1) +
        '" loading="lazy" draggable="false"></button>'
      );
    })
    .join("");

  var thumbButtons = thumbsWrap.querySelectorAll(".pd-gallery__thumb");
  thumbButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      setMainImage(i);
    });
  });

  var prevArrowBtn = null;
  var nextArrowBtn = null;
  if (galleryImages.length > 1 && mainImageWrap) {
    prevArrowBtn = document.createElement("button");
    prevArrowBtn.type = "button";
    prevArrowBtn.className = "pd-gallery__arrow pd-gallery__arrow--prev";
    prevArrowBtn.setAttribute("aria-label", "Foto sebelumnya");
    prevArrowBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';

    nextArrowBtn = document.createElement("button");
    nextArrowBtn.type = "button";
    nextArrowBtn.className = "pd-gallery__arrow pd-gallery__arrow--next";
    nextArrowBtn.setAttribute("aria-label", "Foto berikutnya");
    nextArrowBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

    mainImageWrap.appendChild(prevArrowBtn);
    mainImageWrap.appendChild(nextArrowBtn);

    prevArrowBtn.addEventListener("click", function () {
      goToImage(currentImgIndex - 1);
    });
    nextArrowBtn.addEventListener("click", function () {
      goToImage(currentImgIndex + 1);
    });
  }

  function updateArrowState() {
    if (!prevArrowBtn || !nextArrowBtn) return;
    prevArrowBtn.disabled = currentImgIndex <= 0;
    nextArrowBtn.disabled = currentImgIndex >= galleryImages.length - 1;
  }
  var peekSettleTimer = null;

  function scrollThumbIntoView(btn) {
    if (!btn || !thumbsWrap) return;
    var wrapRect = thumbsWrap.getBoundingClientRect();
    var btnRect = btn.getBoundingClientRect();
    var gap = 10; 

    var alignedTarget = null;
    var peekTarget = null;

    if (btnRect.right > wrapRect.right - 1) {
      var nextBtn = btn.nextElementSibling;
      var peek = nextBtn ? nextBtn.getBoundingClientRect().width / 2 + gap : 0;
      alignedTarget = thumbsWrap.scrollLeft + (btnRect.right - wrapRect.right);
      peekTarget = alignedTarget + peek;
    } else if (btnRect.left < wrapRect.left + 1) {
      var prevBtn = btn.previousElementSibling;
      var peekLeft = prevBtn ? prevBtn.getBoundingClientRect().width / 2 + gap : 0;
      alignedTarget = thumbsWrap.scrollLeft - (wrapRect.left - btnRect.left);
      peekTarget = alignedTarget - peekLeft;
    }

    if (alignedTarget === null) return;

    var maxScroll = thumbsWrap.scrollWidth - thumbsWrap.clientWidth;
    alignedTarget = Math.max(0, Math.min(alignedTarget, maxScroll));
    peekTarget = Math.max(0, Math.min(peekTarget, maxScroll));

    clearTimeout(peekSettleTimer);

    function smoothTo(left) {
      if (thumbsWrap.scrollTo) {
        thumbsWrap.scrollTo({ left: left, behavior: "smooth" });
      } else {
        thumbsWrap.scrollLeft = left;
      }
    }

    if (Math.abs(peekTarget - alignedTarget) < 1) {
      thumbsWrap.classList.remove("is-peeking");
      smoothTo(alignedTarget);
      return;
    }

    thumbsWrap.classList.add("is-peeking");
    smoothTo(peekTarget);

    peekSettleTimer = setTimeout(function () {
      smoothTo(alignedTarget);
      peekSettleTimer = setTimeout(function () {
        thumbsWrap.classList.remove("is-peeking");
      }, 260);
    }, 320);
  }

  ["pointerdown", "touchstart", "wheel"].forEach(function (evt) {
    thumbsWrap.addEventListener(
      evt,
      function () {
        clearTimeout(peekSettleTimer);
        thumbsWrap.classList.remove("is-peeking");
      },
      { passive: true }
    );
  });

  function setMainImage(index, opts) {
    opts = opts || {};
    if (index < 0 || index >= galleryImages.length) return;
    currentImgIndex = index;
    mainImage.src = galleryImages[index];
    mainImage.alt = product.title;
    updateArrowState();

    thumbButtons.forEach(function (b, i) {
      b.classList.toggle("is-active", i === index);
    });
    if (!opts.skipThumbScroll) scrollThumbIntoView(thumbButtons[index]);
  }

  function goToImage(index) {
    if (index < 0) index = 0;
    if (index > galleryImages.length - 1) index = galleryImages.length - 1;
    setMainImage(index);
  }

  setMainImage(0, { skipThumbScroll: true });

  (function initMainImageSwipe() {
    if (!mainImageWrap || galleryImages.length < 2) return;

    var isPointerDown = false;
    var dragged = false;
    var startX = 0;
    var startY = 0;
    var THRESHOLD = 40;

    mainImageWrap.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isPointerDown = true;
      dragged = false;
      startX = e.clientX;
      startY = e.clientY;
      mainImageWrap.classList.add("is-dragging");
    });

    mainImageWrap.addEventListener(
      "pointermove",
      function (e) {
        if (!isPointerDown) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) > 6) {
          dragged = true;
          e.preventDefault();
          mainImage.style.transform = "translateX(" + dx * 0.25 + "px)";
        }
      },
      { passive: false }
    );

    function endDrag(e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      mainImageWrap.classList.remove("is-dragging");
      mainImage.style.transform = "";
      if (!dragged) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) < THRESHOLD) return;
      if (dx < 0) {
        goToImage(currentImgIndex + 1); 
      } else {
        goToImage(currentImgIndex - 1); 
      }
    }

    mainImageWrap.addEventListener("pointerup", endDrag);
    mainImageWrap.addEventListener("pointercancel", endDrag);
    mainImageWrap.addEventListener("pointerleave", function (e) {
      if (isPointerDown) endDrag(e);
    });

    mainImageWrap.addEventListener(
      "click",
      function (e) {
        if (dragged) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true
    );
  })();

  var pdGalleryEl = document.querySelector(".pd-gallery");
  var pdInfoEl = document.querySelector(".pd-info");

  function placeThumbs(isDesktop) {
    if (isDesktop) {
      if (pdInfoEl && thumbsWrap.parentNode !== pdInfoEl) pdInfoEl.appendChild(thumbsWrap);
    } else {
      if (pdGalleryEl && thumbsWrap.parentNode !== pdGalleryEl) pdGalleryEl.appendChild(thumbsWrap);
    }
  }

  var desktopThumbsMql = window.matchMedia("(min-width: 901px)");
  placeThumbs(desktopThumbsMql.matches);
  if (desktopThumbsMql.addEventListener) {
    desktopThumbsMql.addEventListener("change", function (e) { placeThumbs(e.matches); });
  } else if (desktopThumbsMql.addListener) {
    desktopThumbsMql.addListener(function (e) { placeThumbs(e.matches); });
  }

  document.getElementById("pdCategory").textContent = product.categoryLabel;
  document.getElementById("pdTitle").textContent = product.title;
  document.getElementById("pdRating").textContent = product.rating.toFixed(1);
  document.getElementById("pdSold").textContent = product.sold.toLocaleString("id-ID");

  document.getElementById("pdPriceNow").textContent = rupiah(product.price);
  var priceOldEl = document.getElementById("pdPriceOld");
  var discountTagEl = document.getElementById("pdDiscountTag");
  if (product.oldPrice) {
    priceOldEl.hidden = false;
    priceOldEl.textContent = rupiah(product.oldPrice);
    discountTagEl.hidden = false;
    discountTagEl.textContent = "Hemat " + rupiah(product.oldPrice - product.price);
  }

  var descriptionEl = document.getElementById("pdDescription");
  var descriptionText = typeof product.description === "string" ? product.description : "";
  var descriptionLines = descriptionText.split(/\r\n|\r|\n/);
  descriptionEl.textContent = "";
  descriptionLines.forEach(function (line, i) {
    if (i > 0) descriptionEl.appendChild(document.createElement("br"));
    descriptionEl.appendChild(document.createTextNode(line));
  });

  var highlightsEl = document.getElementById("pdHighlights");
  highlightsEl.innerHTML = (product.highlights || [])
    .map(function (h) { return "<li>" + h + "</li>"; })
    .join("");

  var specSection = document.getElementById("pdTabSpesifikasi");
  var specTable = document.getElementById("pdSpecTable");
  var specKeys = Object.keys(product.specs || {});
  if (specKeys.length === 0) {
    if (specSection) specSection.hidden = true;
  } else {
    var specRows = specKeys
      .map(function (key) {
        return "<tr><th>" + key + "</th><td>" + product.specs[key] + "</td></tr>";
      })
      .join("");
    specTable.innerHTML = specRows;
  }

  var QTY_MIN = 1;
  var QTY_MAX = 99;
  var qtyInput = document.getElementById("pdQtyInput");
  var qtyMinus = document.getElementById("pdQtyMinus");
  var qtyPlus = document.getElementById("pdQtyPlus");
  var qty = QTY_MIN;

  function clampQty(value) {
    var n = parseInt(value, 10);
    if (isNaN(n)) return QTY_MIN;
    if (n < QTY_MIN) return QTY_MIN;
    if (n > QTY_MAX) return QTY_MAX;
    return n;
  }

  function renderQty() {
    qty = clampQty(qty);
    qtyInput.value = qty;
    qtyMinus.disabled = qty <= QTY_MIN;
    qtyPlus.disabled = qty >= QTY_MAX;
  }
  renderQty();

  qtyMinus.addEventListener("click", function () {
    qty = clampQty(qty - 1);
    renderQty();
  });
  qtyPlus.addEventListener("click", function () {
    qty = clampQty(qty + 1);
    renderQty();
  });

  function buildCartItem() {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.categoryLabel,
      image: product.images[0]
    };
  }

  var addCartBtn = document.getElementById("pdAddCartBtn");
  var addCartOriginal = addCartBtn.innerHTML;
  var checkIcon =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>Ditambahkan</span>';

  addCartBtn.addEventListener("click", function () {
    if (addCartBtn.classList.contains("is-added")) return;

    if (Array.isArray(product.variantGroups) && product.variantGroups.length > 0) {
      if (typeof window.openVariantModal !== "function") {
        console.warn("openVariantModal belum ke-load. Pastikan js/variant-modal.js di-include sebelum produk.js.");
        return;
      }
      window.openVariantModal(product, {
        image: product.images[0],
        sourceImgEl: mainImage,
        sourceBtnEl: addCartBtn,
        initialQty: clampQty(qty),
        onAdded: function () {
          addCartBtn.classList.add("is-added");
          addCartBtn.innerHTML = checkIcon;
          setTimeout(function () {
            addCartBtn.classList.remove("is-added");
            addCartBtn.innerHTML = addCartOriginal;
          }, 1600);
        }
      });
      return;
    }

    var cartItem = buildCartItem();
    if (window.CartStore) window.CartStore.addItem(cartItem, clampQty(qty));

    addCartBtn.classList.add("is-added");
    addCartBtn.innerHTML = checkIcon;
    setTimeout(function () {
      addCartBtn.classList.remove("is-added");
      addCartBtn.innerHTML = addCartOriginal;
    }, 1600);

    flyToCart(mainImage, addCartBtn);
    showAddedToCartToast(cartItem);
  });

  var buyNowBtn = document.getElementById("pdBuyNowBtn");
  buyNowBtn.addEventListener("click", function () {
    if (Array.isArray(product.variantGroups) && product.variantGroups.length > 0) {
      if (typeof window.openVariantModal !== "function") {
        console.warn("openVariantModal belum ke-load. Pastikan js/variant-modal.js di-include sebelum produk.js.");
        return;
      }
      window.openVariantModal(product, {
        image: product.images[0],
        sourceImgEl: mainImage,
        sourceBtnEl: buyNowBtn,
        initialQty: clampQty(qty),
        onAdded: function () {
          window.location.href = "cart.html";
        }
      });
      return;
    }

    if (window.CartStore) window.CartStore.addItem(buildCartItem(), clampQty(qty));
    window.location.href = "cart.html";
  });

  var relatedGrid = document.getElementById("pdRelatedGrid");
  var relatedProducts = data.getRelated(product, 4);

  function cartIcon() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  }

  function renderRelatedCard(p) {
    var discountBadge = p.discount > 0 ? '<span class="catalog-badge">-' + p.discount + '%</span>' : "";
    var oldPriceHtml = p.oldPrice
      ? '<span class="explore-card__price-old">' + rupiah(p.oldPrice) + "</span>"
      : "";
    return (
      '<article class="explore-card" data-id="' + p.id + '" data-title="' + p.title + '" data-price="' + p.price + '" data-category="' + p.categoryLabel + '" data-image="' + p.images[0] + '">' +
      '<div class="explore-card__img">' +
      '<span class="explore-card__category">' + p.categoryLabel + "</span>" +
      '<img src="' + p.images[0] + '" alt="' + p.title + '" loading="lazy">' +
      "</div>" +
      '<div class="explore-card__body">' +
      '<h3 class="explore-card__title">' + discountBadge + p.title + "</h3>" +
      '<div class="explore-card__price">' +
      '<span class="explore-card__price-now">' + rupiah(p.price) + "</span>" +
      oldPriceHtml +
      "</div>" +
      '<div class="explore-card__actions">' +
      '<a href="produk.html?id=' + p.id + '" class="explore-card__view">Lihat Produk</a>' +
      '<button class="explore-card__cart" type="button" aria-label="Tambah ke keranjang">' +
      cartIcon() +
      "</button>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  relatedGrid.innerHTML = relatedProducts.map(renderRelatedCard).join("");

  relatedGrid.querySelectorAll(".explore-card__cart").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (btn.classList.contains("is-added")) return;

      var card = btn.closest("[data-id]");
      var relatedItem = card
        ? {
            id: card.getAttribute("data-id"),
            title: card.getAttribute("data-title") || "",
            price: card.getAttribute("data-price") || 0,
            category: card.getAttribute("data-category") || "",
            image: card.getAttribute("data-image") || ""
          }
        : null;
      if (!relatedItem) return;

      if (window.CartStore) window.CartStore.addItem(relatedItem, 1);

      var originalIcon = btn.innerHTML;
      btn.classList.add("is-added");
      btn.innerHTML = checkIconSvg;
      setTimeout(function () {
        btn.classList.remove("is-added");
        btn.innerHTML = originalIcon;
      }, 1600);

      flyToCart(card.querySelector("img"), btn);
      showAddedToCartToast(relatedItem);
    });
  });

  relatedGrid.querySelectorAll(".explore-card[data-id]").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".explore-card__cart")) return;
      if (e.target.closest("a")) return;
      window.location.href = "produk.html?id=" + card.getAttribute("data-id");
    });
    card.style.cursor = "pointer";
  });
  } 

  if (window.PRODUCTS_DATA) {
    init();
  } else {
    document.addEventListener("products-data:ready", init, { once: true });
  }
})();
