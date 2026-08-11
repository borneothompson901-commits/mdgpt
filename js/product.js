(function () {
  "use strict";

  var navbar = document.getElementById("navbar");
  function onScrollNavbar() {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 8);
  }
  onScrollNavbar();
  window.addEventListener("scroll", onScrollNavbar, { passive: true });


  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var isOpen = hamburger.classList.toggle("is-open");
      mobileMenu.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var toolbarWrap = document.getElementById("catalogToolbarWrap");
  var toolbar = document.getElementById("catalogToolbar");
  var categoriesWrap = document.getElementById("catalogCategoriesWrap");
  var categoriesBar = document.getElementById("catalogCategories");

  var toolbarTriggerPoint = 0;
  var catTriggerPoint = 0;

  function measureToolbar() {
    toolbar.classList.remove("is-pinned");
    toolbarWrap.style.height = "";
    var rect = toolbarWrap.getBoundingClientRect();
    toolbarTriggerPoint = rect.top + window.scrollY;
    toolbarWrap.style.height = toolbar.offsetHeight + "px";
  }

  function measureCategories() {
    categoriesBar.classList.remove("is-pinned");
    categoriesWrap.style.height = "";
    var rect = categoriesWrap.getBoundingClientRect();
    catTriggerPoint = rect.top + window.scrollY;
    categoriesWrap.style.height = categoriesBar.offsetHeight + "px";
  }

  function measure() {
    if (toolbarWrap && toolbar) measureToolbar();
    if (categoriesWrap && categoriesBar) measureCategories();
    updatePin();
  }

  function updatePin() {
    var navH = getNavHeight();
    var toolbarPinned = false;

    if (toolbarWrap && toolbar) {
      toolbarPinned = window.scrollY + navH >= toolbarTriggerPoint;
      toolbar.classList.toggle("is-pinned", toolbarPinned);
      toolbar.style.top = navH + "px";
      if (navbar) navbar.classList.toggle("toolbar-active", toolbarPinned);
    }

    if (categoriesWrap && categoriesBar) {
      var stackTop = (toolbarPinned && toolbar) ? toolbar.getBoundingClientRect().bottom : navH;
      var shouldPinCat = window.scrollY + stackTop >= catTriggerPoint;
      categoriesBar.classList.toggle("is-pinned", shouldPinCat);
      categoriesBar.style.top = stackTop + "px";
    }
  }

  if ((toolbarWrap && toolbar) || (categoriesWrap && categoriesBar)) {
    measure();
    window.addEventListener("scroll", updatePin, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
  }

  function getNavHeight() {
    var scopeEl = toolbarWrap || document.querySelector(".product-page") || document.documentElement;
    var val = getComputedStyle(scopeEl).getPropertyValue("--nav-height");
    var n = parseInt(val, 10);
    return isNaN(n) ? 68 : n;
  }

  var filterBtn = document.getElementById("filterBtn");
  var filterDrawer = document.getElementById("filterDrawer");
  var filterOverlay = document.getElementById("filterOverlay");
  var filterCloseBtn = document.getElementById("filterCloseBtn");

  function openDrawer() {
    filterDrawer.classList.add("is-open");
    filterOverlay.classList.add("is-open");
    filterDrawer.setAttribute("aria-hidden", "false");
    filterBtn.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    filterDrawer.classList.remove("is-open");
    filterOverlay.classList.remove("is-open");
    filterDrawer.setAttribute("aria-hidden", "true");
    filterBtn.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  if (filterBtn && filterDrawer && filterOverlay) {
    filterBtn.addEventListener("click", openDrawer);
    filterCloseBtn.addEventListener("click", closeDrawer);
    filterOverlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && filterDrawer.classList.contains("is-open")) closeDrawer();
    });
  }

  var searchInput = document.getElementById("catalogSearchInput");
  var grid = document.getElementById("catalogGrid");
  var cards = [];
  var catalogDataLoaded = false;
  var resultCount = document.getElementById("resultCount");
  var catalogEmpty = document.getElementById("catalogEmpty");
  var catalogEnd = document.getElementById("catalogEnd");
  var applyBtn = document.getElementById("filterApplyBtn");
  var resetBtn = document.getElementById("filterResetBtn");

  function escapeHtmlCard(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function cartIconSvgCard() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  }

  function buildCardHTML(p, rupiah) {
    var img = (p.images && p.images[0]) || "../assets/icons/logo.png";
    var catLabel = p.categoryLabel || p.category || "";
    var price = Number(p.price) || 0;
    var oldPrice = Number(p.oldPrice) || 0;
    var hasDiscount = oldPrice > price;
    var discountPct = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;

    return (
      '<article class="explore-card" data-id="' + escapeHtmlCard(p.id) + '" data-sold="' + (parseInt(p.sold, 10) || 0) +
      '" data-category="' + escapeHtmlCard(p.category || "") + '" data-price="' + price +
      '" data-title="' + escapeHtmlCard(p.title || "") + '">' +
        '<div class="explore-card__img">' +
          '<span class="explore-card__category">' + escapeHtmlCard(catLabel) + '</span>' +
          '<img src="' + escapeHtmlCard(img) + '" alt="' + escapeHtmlCard(p.title || "") + '" loading="lazy" />' +
        '</div>' +
        '<div class="explore-card__body">' +
          '<h3 class="explore-card__title">' +
            (hasDiscount ? '<span class="catalog-badge">-' + discountPct + '%</span>' : "") +
            escapeHtmlCard(p.title || "(Tanpa nama)") +
          '</h3>' +
          '<div class="explore-card__price">' +
            '<span class="explore-card__price-now">' + rupiah(price) + '</span>' +
            (hasDiscount ? '<span class="explore-card__price-old">' + rupiah(oldPrice) + '</span>' : "") +
          '</div>' +
          '<div class="explore-card__actions">' +
            '<a href="produk.html?id=' + escapeHtmlCard(p.id) + '" class="explore-card__view">Lihat Produk</a>' +
            '<button class="explore-card__cart" type="button" aria-label="Tambah ke keranjang">' + cartIconSvgCard() + '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function renderCatalogFromData(DATA) {
    if (!grid) return;
    var products = DATA.all || [];
    grid.innerHTML = products.map(function (p) { return buildCardHTML(p, DATA.rupiah); }).join("");
    cards = Array.prototype.slice.call(grid.querySelectorAll(".explore-card"));
    catalogDataLoaded = true;
    renderCategoryUI(DATA);
    bindCardInteractions();
    applyFilters();
    applySort();
  }

  function initCatalogFromProductsData() {
    var DATA = window.PRODUCTS_DATA;
    if (!DATA) return;
    renderCatalogFromData(DATA);
  }

  var state = {
    query: "",
    categories: [],
    priceRange: "all"
  };

  function matchesPrice(price, range) {
    if (range === "all") return true;
    var parts = range.split("-");
    var min = parseInt(parts[0], 10);
    var max = parseInt(parts[1], 10);
    return price >= min && price <= max;
  }

  function applyFilters() {
    var visibleCount = 0;
    cards.forEach(function (card) {
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var category = card.getAttribute("data-category") || "";
      var price = parseInt(card.getAttribute("data-price"), 10) || 0;

      var matchQuery = !state.query || title.indexOf(state.query) !== -1;
      var matchCategory = state.categories.length === 0 || state.categories.indexOf(category) !== -1;
      var matchPrice = matchesPrice(price, state.priceRange);

      var visible = matchQuery && matchCategory && matchPrice;
      card.classList.toggle("is-hidden", !visible);
      if (visible) visibleCount++;
    });

    if (resultCount) resultCount.textContent = "Menampilkan " + visibleCount + " produk";
    if (catalogEmpty) catalogEmpty.hidden = !catalogDataLoaded || visibleCount !== 0;
    if (catalogEnd) catalogEnd.hidden = !catalogDataLoaded || visibleCount === 0;

    var activeFilterCount = state.categories.length + (state.priceRange !== "all" ? 1 : 0);
    if (filterBtn) {
      filterBtn.classList.toggle("is-active", activeFilterCount > 0);
    }
  }

  var catalogSort = document.getElementById("catalogSort");
  var sortArrowButtons = catalogSort ? Array.prototype.slice.call(catalogSort.querySelectorAll(".sort-item__arrow[data-sort]")) : [];

  var SORT_GROUPS = [
    { id: "sortTerbaruItem", states: ["terbaru", "terlama"] },
    { id: "sortTerlarisItem", states: ["terlaris-asc", "terlaris-desc"] },
    { id: "sortHargaItem", states: ["termurah", "termahal"] }
  ];

  var currentSort = "terbaru";

  var SORT_COMPARATORS = {
    "terlaris-asc": function (a, b) {
      return (parseInt(a.getAttribute("data-sold"), 10) || 0) - (parseInt(b.getAttribute("data-sold"), 10) || 0);
    },
    "terlaris-desc": function (a, b) {
      return (parseInt(b.getAttribute("data-sold"), 10) || 0) - (parseInt(a.getAttribute("data-sold"), 10) || 0);
    },
    termurah: function (a, b) {
      return (parseInt(a.getAttribute("data-price"), 10) || 0) - (parseInt(b.getAttribute("data-price"), 10) || 0);
    },
    termahal: function (a, b) {
      return (parseInt(b.getAttribute("data-price"), 10) || 0) - (parseInt(a.getAttribute("data-price"), 10) || 0);
    }
  };

  function applySort() {
    if (!grid) return;
    var sorted;

    if (currentSort === "terlama") {
      sorted = cards.slice().reverse();
    } else if (SORT_COMPARATORS[currentSort]) {
      sorted = cards.slice().sort(SORT_COMPARATORS[currentSort]);
    } else {
      sorted = cards; 
    }

    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  function updateSortUI() {
    sortArrowButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-sort") === currentSort);
    });

    document.querySelectorAll(".sort-item").forEach(function (item) {
      item.classList.toggle("is-active", !!item.querySelector(".sort-item__arrow.is-active"));
    });
  }

  function setSort(mode) {
    currentSort = mode;
    updateSortUI();
    applySort();
  }

  SORT_GROUPS.forEach(function (group) {
    var itemEl = document.getElementById(group.id);
    if (!itemEl) return;
    itemEl.addEventListener("click", function (e) {
      var arrowBtn = e.target.closest(".sort-item__arrow[data-sort]");
      var next;
      if (arrowBtn) {
        next = arrowBtn.getAttribute("data-sort");
      } else {
        var idx = group.states.indexOf(currentSort);
        next = idx === -1 ? group.states[0] : group.states[(idx + 1) % group.states.length];
      }
      setSort(next);
    });
  });

  updateSortUI();

  var catBar = document.getElementById("catalogCategories");
  var catScroll = catBar ? catBar.querySelector(".catalog-categories__scroll") : null;
  var catMoreWrap = document.getElementById("catalogCatMore");
  var catMoreToggle = document.getElementById("catalogCatMoreToggle");
  var catMoreMenu = document.getElementById("catalogCatMoreMenu");
  var catMoreLabel = document.getElementById("catalogCatMoreLabel");
  var catMoreDefaultLabel = catMoreLabel ? catMoreLabel.textContent : "Lainnya";
  var filterCategoryOptions = document.getElementById("filterCategoryOptions");

  var catButtons = [];
  var catMoreItems = [];
  var CAT_INLINE_LIMIT = 4;

  function openCatMoreMenu() {
    if (!catMoreMenu || !catMoreWrap || !catMoreToggle) return;
    catMoreMenu.hidden = false;
    catMoreWrap.classList.add("is-open");
    catMoreToggle.setAttribute("aria-expanded", "true");
  }

  function closeCatMoreMenu() {
    if (!catMoreMenu || !catMoreWrap || !catMoreToggle) return;
    catMoreMenu.hidden = true;
    catMoreWrap.classList.remove("is-open");
    catMoreToggle.setAttribute("aria-expanded", "false");
  }

  function updateCategoryTabsUI(value) {
    catButtons.forEach(function (btn) {
      var cat = btn.getAttribute("data-cat");
      var isActive = value !== null && ((value === "" && cat === "all") || cat === value);
      btn.setAttribute("aria-current", isActive ? "true" : "false");
    });

    var matchedItem = null;
    catMoreItems.forEach(function (item) {
      var isActive = value !== null && item.getAttribute("data-cat") === value;
      item.setAttribute("aria-current", isActive ? "true" : "false");
      if (isActive) matchedItem = item;
    });
    if (catMoreToggle) catMoreToggle.setAttribute("aria-current", matchedItem ? "true" : "false");
    if (catMoreLabel) catMoreLabel.textContent = matchedItem ? matchedItem.textContent : catMoreDefaultLabel;
  }

  function scrollCatalogToTop() {
    var target = (toolbarWrap && toolbar) ? toolbarTriggerPoint : 0;
    window.scrollTo({ top: Math.max(target - 4, 0), behavior: "smooth" });
  }

  function selectCategoryTab(value) {
    updateCategoryTabsUI(value);

    document.querySelectorAll('input[name="category"]').forEach(function (el) {
      el.checked = value !== "" && el.value === value;
    });

    state.categories = value ? [value] : [];
    applyFilters();
    scrollCatalogToTop();
  }

  function bindCategoryEvents() {
    catButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var val = btn.getAttribute("data-cat");
        selectCategoryTab(val === "all" ? "" : val);
        closeCatMoreMenu();
      });
    });

    catMoreItems.forEach(function (item) {
      item.addEventListener("click", function () {
        selectCategoryTab(item.getAttribute("data-cat"));
        closeCatMoreMenu();
      });
    });
  }

  function getCmsCategories(DATA) {
    var seen = {};
    var list = [];
    (DATA.all || []).forEach(function (p) {
      if (p.category && !seen[p.category]) {
        seen[p.category] = true;
        list.push({ key: p.category, label: DATA.categoryLabels[p.category] || p.category });
      }
    });
    return list;
  }

  function renderCategoryUI(DATA) {
    var cmsCategories = getCmsCategories(DATA);
    var inlineCategories = cmsCategories.slice(0, CAT_INLINE_LIMIT);
    var overflowCategories = cmsCategories.slice(CAT_INLINE_LIMIT);

    if (catScroll) {
      var allBtn = catScroll.querySelector('[data-cat="all"]');
      catScroll.innerHTML = "";
      if (allBtn) catScroll.appendChild(allBtn);
      inlineCategories.forEach(function (c) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "catalog-cat";
        btn.setAttribute("data-cat", c.key);
        btn.textContent = c.label;
        catScroll.appendChild(btn);
      });
    }

    if (catMoreMenu) {
      catMoreMenu.innerHTML = "";
      overflowCategories.forEach(function (c) {
        var item = document.createElement("button");
        item.type = "button";
        item.className = "catalog-cat-more__item";
        item.setAttribute("role", "menuitem");
        item.setAttribute("data-cat", c.key);
        item.textContent = c.label;
        catMoreMenu.appendChild(item);
      });
    }
    if (catMoreWrap) catMoreWrap.hidden = overflowCategories.length === 0;

    if (filterCategoryOptions) {
      filterCategoryOptions.innerHTML = cmsCategories.map(function (c) {
        return '<label class="filter-check"><input type="checkbox" name="category" value="' +
          escapeHtmlCard(c.key) + '" /><span>' + escapeHtmlCard(c.label) + '</span></label>';
      }).join("");
    }

    catButtons = catBar ? Array.prototype.slice.call(catBar.querySelectorAll(".catalog-cat[data-cat]")) : [];
    catMoreItems = catMoreMenu ? Array.prototype.slice.call(catMoreMenu.querySelectorAll(".catalog-cat-more__item")) : [];
    bindCategoryEvents();
    updateCategoryTabsUI(state.categories.length === 1 ? state.categories[0] : (state.categories.length === 0 ? "" : null));
  }

  if (catBar) {
    if (catMoreToggle) {
      catMoreToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        if (catMoreMenu.hidden) openCatMoreMenu(); else closeCatMoreMenu();
      });
    }

    document.addEventListener("click", function (e) {
      if (catMoreWrap && !catMoreWrap.contains(e.target)) closeCatMoreMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeCatMoreMenu();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value.trim().toLowerCase();
      applyFilters();
    });

    var queryFromUrl = new URLSearchParams(window.location.search).get("q");
    if (queryFromUrl) {
      searchInput.value = queryFromUrl;
      state.query = queryFromUrl.trim().toLowerCase();
      applyFilters();
    }
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      var checkedCategories = Array.prototype.slice
        .call(document.querySelectorAll('input[name="category"]:checked'))
        .map(function (el) { return el.value; });
      var checkedPrice = document.querySelector('input[name="price"]:checked');

      state.categories = checkedCategories;
      state.priceRange = checkedPrice ? checkedPrice.value : "all";

      if (checkedCategories.length === 1) {
        updateCategoryTabsUI(checkedCategories[0]);
      } else if (checkedCategories.length === 0) {
        updateCategoryTabsUI("");
      } else {
        updateCategoryTabsUI(null);
      }

      applyFilters();
      closeDrawer();
    });
  }

  function resetAllFilters() {
    document.querySelectorAll('input[name="category"]').forEach(function (el) { el.checked = false; });
    var allPriceRadio = document.querySelector('input[name="price"][value="all"]');
    if (allPriceRadio) allPriceRadio.checked = true;

    state.categories = [];
    state.priceRange = "all";
    state.query = "";
    if (searchInput) searchInput.value = "";

    updateCategoryTabsUI("");
    applyFilters();
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetAllFilters);
  }

  var emptyResetBtn = document.getElementById("catalogEmptyReset");
  if (emptyResetBtn) {
    emptyResetBtn.addEventListener("click", function () {
      resetAllFilters();
      closeDrawer();
    });
  }

  applyFilters();

  function bindCardInteractions() {
    cards.forEach(function (card) {
      var id = card.getAttribute("data-id");
      if (!id) return;
      card.style.cursor = "pointer";
      card.addEventListener("click", function (e) {
        if (e.target.closest(".explore-card__cart")) return;
        if (e.target.closest("a")) return;
        window.location.href = "produk.html?id=" + id;
      });
    });

    if (window.CartStore) {
      cards.forEach(function (card) {
        var cartBtn = card.querySelector(".explore-card__cart");
        if (!cartBtn) return;

        cartBtn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();

          var img = card.querySelector(".explore-card__img img");
          var cardId = card.getAttribute("data-id");
          var fullProduct = window.PRODUCTS_DATA ? window.PRODUCTS_DATA.getById(cardId) : null;

          var basicProduct = {
            id: cardId,
            title: card.getAttribute("data-title") || "",
            price: card.getAttribute("data-price") || 0,
            category: card.getAttribute("data-category") || "",
            image: img ? img.getAttribute("src") : ""
          };

          if (fullProduct && Array.isArray(fullProduct.variantGroups) && fullProduct.variantGroups.length > 0) {
            openVariantModal(fullProduct, {
              image: basicProduct.image,
              sourceImgEl: img,
              sourceBtnEl: cartBtn,
              onAdded: function () {
                flashAddedToCart(cartBtn);
              }
            });
            return;
          }

          window.CartStore.addItem(basicProduct, 1);
          flashAddedToCart(cartBtn);
          flyToCart(img, cartBtn);
          showAddedToCartToast(basicProduct);
        });
      });
    }
  }

  function flashAddedToCart(btn) {
    if (btn.dataset.flashing === "1") return;
    btn.dataset.flashing = "1";
    var originalHTML = btn.innerHTML;
    btn.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
    btn.classList.add("is-added");
    setTimeout(function () {
      btn.innerHTML = originalHTML;
      btn.classList.remove("is-added");
      btn.dataset.flashing = "0";
    }, 900);
  }

  function updateCartBadges() {
    if (!window.CartStore) return;
    var count = window.CartStore.getCount();
    var badges = document.querySelectorAll(
      "#catalogCartCount, .catalog-cart-btn__count, .nav-cart__count, .mobile-cart__count"
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

  (function initAddToCartFeedback() {
    if (!window.CartStore) return;

    injectCartFeedbackStyles();

    var toastStack = null;
    function getToastStack() {
      if (toastStack && document.body.contains(toastStack)) return toastStack;
      toastStack = document.createElement("div");
      toastStack.className = "cart-toast-stack";
      toastStack.setAttribute("aria-live", "polite");
      document.body.appendChild(toastStack);
      return toastStack;
    }

    function formatRupiahShort(n) {
      n = Math.round(parseFloat(n)) || 0;
      return "Rp" + n.toLocaleString("id-ID");
    }

    window.flyToCart = function (imgEl, fromBtnEl) {
      var cartIcon = document.getElementById("catalogCartBtn") || document.querySelector(".nav-cart, .mobile-cart");
      if (!cartIcon) return;

      var startEl = imgEl || fromBtnEl;
      if (!startEl) return;

      var startRect = startEl.getBoundingClientRect();
      var endRect = cartIcon.getBoundingClientRect();
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

      var dx = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
      var dy = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);
      flyer.style.setProperty("--fly-dx", dx + "px");
      flyer.style.setProperty("--fly-dy", dy + "px");

      requestAnimationFrame(function () {
        flyer.classList.add("is-flying");
      });

      flyer.addEventListener("animationend", function () {
        flyer.remove();
        cartIcon.classList.add("is-bumping");
        setTimeout(function () {
          cartIcon.classList.remove("is-bumping");
        }, 380);
      });

      setTimeout(function () {
        if (flyer.parentNode) flyer.remove();
      }, 900);
    };

    window.showAddedToCartToast = function (product) {
      var stack = getToastStack();

      var toast = document.createElement("div");
      toast.className = "cart-toast";
      toast.innerHTML =
        '<div class="cart-toast__check">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
        "</div>" +
        '<img class="cart-toast__img" src="' + (product.image || "") + '" alt="" />' +
        '<div class="cart-toast__info">' +
          '<p class="cart-toast__label">Ditambahkan ke keranjang</p>' +
          '<p class="cart-toast__title">' + (product.title || "Produk") + "</p>" +
          '<p class="cart-toast__price">' + formatRupiahShort(product.price) + "</p>" +
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
    };

    function injectCartFeedbackStyles() {
      if (document.getElementById("cartFeedbackStyles")) return;
      var style = document.createElement("style");
      style.id = "cartFeedbackStyles";
      style.textContent =
        ".cart-flyer{position:fixed;z-index:9999;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;overflow:hidden;pointer-events:none;box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:0;transform:translate(0,0) scale(1);}" +
        ".cart-flyer img{width:100%;height:100%;object-fit:cover;display:block;}" +
        ".cart-flyer.is-flying{opacity:1;animation:cartFlyerMove .62s cubic-bezier(.3,.1,.3,1) forwards;}" +
        "@keyframes cartFlyerMove{0%{opacity:1;transform:translate(0,0) scale(1);}70%{opacity:1;}100%{opacity:0;transform:translate(var(--fly-dx),var(--fly-dy)) scale(.15);}}" +
        "#catalogCartBtn.is-bumping,.nav-cart.is-bumping,.mobile-cart.is-bumping{animation:cartIconBump .38s ease;}" +
        "@keyframes cartIconBump{0%{transform:scale(1);}35%{transform:scale(1.28);}60%{transform:scale(.94);}100%{transform:scale(1);}}" +
        ".cart-toast-stack{position:fixed;top:calc(var(--nav-height,68px) + 12px);right:16px;z-index:9998;display:flex;flex-direction:column;gap:10px;max-width:320px;}" +
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
  })();

  if (window.PRODUCTS_DATA) {
    initCatalogFromProductsData();
  } else {
    document.addEventListener("products-data:ready", initCatalogFromProductsData, { once: true });
  }
})();
