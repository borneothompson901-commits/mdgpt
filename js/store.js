function initCategorySlider() {
  var CAT_ICON_RULES = [
    { match: ["ebook", "buku", "e-book"], icon: "book" },
    { match: ["template", "desain", "design"], icon: "layout" },
    { match: ["tools", "otomasi", "automation", "software", "aplikasi", "script"], icon: "settings" },
    { match: ["workshop", "kelas", "course", "kursus", "training"], icon: "cap" },
    { match: ["sosial", "social", "media"], icon: "megaphone" },
    { match: ["branding", "brand", "logo"], icon: "palette" },
    { match: ["marketing", "iklan", "ads", "promosi"], icon: "trending" },
    { match: ["konten", "content", "video", "planner"], icon: "film" },
    { match: ["fisik", "merchandise", "produk fisik"], icon: "box" },
    { match: ["jasa", "service", "layanan", "konsultasi"], icon: "briefcase" }
  ];

  var CAT_ICON_PATHS = {
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    layout: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>',
    megaphone: '<path d="M3 11v3a1 1 0 0 0 1 1h1l3.5 5v-5H13l6 4V6l-6 4H8.5V6L5 11H4a1 1 0 0 0-1 0Z"/><path d="M8.5 10v6"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.6 2-1.4a2 2 0 0 0-.5-2.2c-.3-.3-.4-.7-.3-1.1.2-.6.7-1 1.3-1H16c3.3 0 6-2.7 6-6 0-4.4-4.5-8-10-8Z"/>',
    trending: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    film: '<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    tag: '<path d="M12.59 2.59a2 2 0 0 0-1.42-.59H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l9 9a2 2 0 0 0 2.82 0l7.17-7.17a2 2 0 0 0 0-2.82Z"/><circle cx="7.5" cy="7.5" r="1.5"/>'
  };

  function pickCategoryIcon(key, label) {
    var haystack = (String(key || "") + " " + String(label || "")).toLowerCase();
    for (var i = 0; i < CAT_ICON_RULES.length; i++) {
      var rule = CAT_ICON_RULES[i];
      for (var j = 0; j < rule.match.length; j++) {
        if (haystack.indexOf(rule.match[j]) !== -1) return CAT_ICON_PATHS[rule.icon];
      }
    }
    return CAT_ICON_PATHS.tag;
  }

  function categoryIconHtml(key, label) {
    var path = pickCategoryIcon(key, label);
    return '<div class="category-card__icon">' +
      '<svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>' +
    '</div>';
  }

  function escapeHtmlCat(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderCategoryCards(DATA) {
    var track = document.getElementById("categoryTrack");
    var section = document.getElementById("kategori");
    if (!track) return [];

    var counts = {};
    (DATA.all || []).forEach(function (p) { if (p.category) counts[p.category] = (counts[p.category] || 0) + 1; });

    var cats = (DATA.categories || []).filter(function (c) { return counts[c.key] > 0; });

    if (!cats.length) {
      if (section) section.hidden = true;
      return [];
    }
    if (section) section.hidden = false;

    track.innerHTML = cats.map(function (c) {
      return '<a href="lingua/index.html?category=' + encodeURIComponent(c.key) + '" class="category-card">' +
        '<div class="category-card__img">' + categoryIconHtml(c.key, c.label) + '</div>' +
        '<div class="category-card__body">' +
          '<strong class="category-card__title">' + escapeHtmlCat(c.label) + '</strong>' +
          '<span class="category-card__count">' + (counts[c.key] || 0) + ' Produk</span>' +
        '</div>' +
      '</a>';
    }).join("");

    return Array.prototype.slice.call(track.children);
  }

  function initCategorySliderNav(cards) {
    var slider = document.getElementById('categorySlider');
    if (!slider || !cards.length) return;

    var viewport = slider.querySelector('.category-slider__viewport');
    var prevBtn = document.getElementById('catPrev');
    var nextBtn = document.getElementById('catNext');

    function itemStep() {
      var first = cards[0];
      var second = cards[1];
      if (!first || !second) return viewport.clientWidth;
      return second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    }

    function next() { viewport.scrollBy({ left: itemStep(), behavior: 'smooth' }); }
    function prev() { viewport.scrollBy({ left: -itemStep(), behavior: 'smooth' }); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    function updateNavState() {
      var maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
      prevBtn.classList.toggle('is-disabled', viewport.scrollLeft <= 0);
      nextBtn.classList.toggle('is-disabled', viewport.scrollLeft >= maxScroll);
    }

    var scrollTimer;
    viewport.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateNavState, 80);
    }, { passive: true });

    window.addEventListener('resize', updateNavState);
    updateNavState();
  }

  return function (DATA) {
    var cards = renderCategoryCards(DATA);
    initCategorySliderNav(cards);
  };
}
var renderCategorySection = initCategorySlider();

function initStoreWithProductsData() {
  var DATA = window.PRODUCTS_DATA;

  if (!DATA) {
    console.warn("PRODUCTS_DATA belum ke-load. Pastikan js/products-data.js di-include sebelum store.js.");
    return;
  }

  const rupiah = DATA.rupiah;

  function cartIcon() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  }

  function initNavSearch() {
    var form = document.querySelector('.nav-search__form');
    var input = form ? form.querySelector('.nav-search__input') : null;
    if (!form || !input) return;

    var MAX_SUGGESTIONS = 6;
    var products = DATA.all;
    var matches = [];
    var activeIndex = -1;

    form.classList.add('nav-search__form--enhanced');

    var dropdown = document.createElement('div');
    dropdown.className = 'nav-search__dropdown';
    dropdown.id = 'navSearchDropdown';
    dropdown.hidden = true;
    form.appendChild(dropdown);

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'navSearchDropdown');
    input.setAttribute('autocomplete', 'off');

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function highlight(title, query) {
      var idx = title.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) return escapeHtml(title);
      return (
        escapeHtml(title.slice(0, idx)) +
        '<mark>' + escapeHtml(title.slice(idx, idx + query.length)) + '</mark>' +
        escapeHtml(title.slice(idx + query.length))
      );
    }

    function goToCatalog(query) {
      window.location.href = 'lingua/index.html' + (query ? '?q=' + encodeURIComponent(query) : '');
    }

    function goToProduct(id) {
      window.location.href = 'lingua/produk.html?id=' + id;
    }

    function close() {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      matches = [];
      activeIndex = -1;
    }

    function setActive(items) {
      items.forEach(function (el, i) {
        el.classList.toggle('is-active', i === activeIndex);
      });
      if (activeIndex > -1) {
        input.setAttribute('aria-activedescendant', items[activeIndex].id);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      } else {
        input.removeAttribute('aria-activedescendant');
      }
    }

    function renderEmpty(query) {
      dropdown.innerHTML =
        '<div class="nav-search__empty">' +
          '<p class="nav-search__empty-text">Produk "' + escapeHtml(query) + '" tidak ditemukan.</p>' +
          '<button type="button" class="nav-search__empty-cta" id="navSearchEmptyCta">Cek semua produk di katalog</button>' +
        '</div>';
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');

      var ctaBtn = document.getElementById('navSearchEmptyCta');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', function () { goToCatalog(query); });
      }
    }

    function renderMatches(items, query) {
      dropdown.innerHTML = items.map(function (p, i) {
        return (
          '<button type="button" class="nav-search__item" id="navSearchItem-' + i + '" role="option" data-id="' + p.id + '">' +
            '<img class="nav-search__item-thumb" src="' + p.images[0] + '" alt="" loading="lazy" width="40" height="40" />' +
            '<span class="nav-search__item-info">' +
              '<span class="nav-search__item-title">' + highlight(p.title, query) + '</span>' +
              '<span class="nav-search__item-price">' + rupiah(p.price) + '</span>' +
            '</span>' +
          '</button>'
        );
      }).join('');
      dropdown.hidden = false;
      input.setAttribute('aria-expanded', 'true');

      dropdown.querySelectorAll('.nav-search__item').forEach(function (el) {
        el.addEventListener('mousedown', function (e) {
          e.preventDefault();
          goToProduct(el.getAttribute('data-id'));
        });
      });
    }

    function runSearch(rawQuery) {
      var query = rawQuery.trim();
      activeIndex = -1;

      if (!query) {
        close();
        return;
      }

      var qLower = query.toLowerCase();
      matches = products
        .filter(function (p) { return p.title.toLowerCase().indexOf(qLower) !== -1; })
        .slice(0, MAX_SUGGESTIONS);

      if (matches.length === 0) {
        renderEmpty(query);
      } else {
        renderMatches(matches, query);
      }
    }

    input.addEventListener('input', function () {
      runSearch(input.value);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) runSearch(input.value);
    });

    input.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(dropdown.querySelectorAll('.nav-search__item'));

      if (e.key === 'ArrowDown' && items.length) {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        setActive(items);
      } else if (e.key === 'ArrowUp' && items.length) {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        setActive(items);
      } else if (e.key === 'Escape') {
        close();
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var query = input.value.trim();

      if (activeIndex > -1 && matches[activeIndex]) {
        goToProduct(matches[activeIndex].id);
        return;
      }

      if (!query) return;
      goToCatalog(query);
    });

    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) close();
    });
  }

  initNavSearch();

  function renderBestsellerCard(p) {
    const save = p.oldPrice ? p.oldPrice - p.price : 0;
    return `
      <article class="bestseller-card${p.isBest === "best" ? " is-best" : ""}" data-id="${p.id}" data-is-best="${p.isBest === "best" ? "best" : "null"}" data-title="${p.title}" data-price="${p.price}" data-category="${p.categoryLabel || ""}" data-image="${p.images[0]}">
        <a class="bestseller-card__img" href="lingua/produk.html?id=${p.id}">
          ${p.oldPrice ? `<span class="bestseller-card__badge">-${p.discount}%</span>` : ""}
          <img src="${p.images[0]}" alt="${p.title}" loading="lazy">
        </a>
        <div class="bestseller-card__body">
          <h3 class="bestseller-card__title"><a href="lingua/produk.html?id=${p.id}">${p.title}</a></h3>
          <div class="bestseller-card__price">
            <span class="bestseller-card__price-now">${rupiah(p.price)}</span>
            ${p.oldPrice ? `<span class="bestseller-card__price-old">${rupiah(p.oldPrice)}</span>` : ""}
          </div>
          ${save > 0 ? `<span class="bestseller-card__save">Hemat ${rupiah(save)}</span>` : ""}
          <div class="bestseller-card__actions">
            <a href="lingua/produk.html?id=${p.id}" class="bestseller-card__view">Lihat Produk</a>
            <button class="bestseller-card__cart" type="button" aria-label="Tambah ke keranjang">
              ${cartIcon()}
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderBestsellers() {
    const grid = document.querySelector(".bestseller-grid");
    if (!grid) return;
    const items = DATA.getBestSellers();
    grid.innerHTML = items.map(renderBestsellerCard).join("");
    bindCartButtons(grid.querySelectorAll(".bestseller-card__cart"));
  }

  function renderExploreCard(p) {
    return `
      <article class="explore-card" data-id="${p.id}" data-is-best="${p.isBest === "best" ? "best" : "null"}" data-is-rekomendasi="${p.isRekomendasi === "rekomendasi" ? "rekomendasi" : "null"}" data-title="${p.title}" data-price="${p.price}" data-category="${p.categoryLabel || ""}" data-image="${p.images[0]}">
        <a class="explore-card__img" href="lingua/produk.html?id=${p.id}">
          <span class="explore-card__category">${p.categoryLabel}</span>
          <img src="${p.images[0]}" alt="${p.title}" loading="lazy">
        </a>
        <div class="explore-card__body">
          <h3 class="explore-card__title">${p.oldPrice ? `<span class="catalog-badge">-${p.discount}%</span>` : ""}<a href="lingua/produk.html?id=${p.id}">${p.title}</a></h3>
          <div class="explore-card__price">
            <span class="explore-card__price-now">${rupiah(p.price)}</span>
            ${p.oldPrice ? `<span class="explore-card__price-old">${rupiah(p.oldPrice)}</span>` : ""}
          </div>
          <div class="explore-card__actions">
            <a href="lingua/produk.html?id=${p.id}" class="explore-card__view">Lihat Produk</a>
            <button class="explore-card__cart" type="button" aria-label="Tambah ke keranjang">
              ${cartIcon()}
            </button>
          </div>
        </div>
      </article>`;
  }

  function renderExplore() {
    const grid = document.getElementById("exploreGrid");
    if (!grid) return;
    const items = DATA.getRekomendasi();
    grid.innerHTML = items.map(renderExploreCard).join("");
    bindCartButtons(grid.querySelectorAll(".explore-card__cart"));
  }

  function bindCartButtons(buttons) {
    buttons.forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      var originalIcon = btn.innerHTML;

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (btn.classList.contains("is-added")) return;

        var card = btn.closest("[data-id]");
        if (!card) return;

        var cardId = card.getAttribute("data-id");
        var basicProduct = {
          id: cardId,
          title: card.getAttribute("data-title") || "",
          price: card.getAttribute("data-price") || 0,
          category: card.getAttribute("data-category") || "",
          image: card.getAttribute("data-image") || ""
        };

        var fullProduct = DATA.getById(cardId);
        if (fullProduct && Array.isArray(fullProduct.variantGroups) && fullProduct.variantGroups.length > 0) {
          if (typeof window.openVariantModal !== "function") {
            console.warn("openVariantModal belum ke-load. Pastikan js/variant-modal.js di-include sebelum store.js.");
            return;
          }
          var imgEl = card.querySelector("img");
          window.openVariantModal(fullProduct, {
            image: basicProduct.image,
            sourceImgEl: imgEl,
            sourceBtnEl: btn,
            onAdded: function () {
              btn.classList.add("is-added");
              btn.innerHTML = checkIconSvg;
              btn.setAttribute("aria-label", "Ditambahkan ke keranjang");
              setTimeout(function () {
                btn.classList.remove("is-added");
                btn.innerHTML = originalIcon;
                btn.setAttribute("aria-label", "Tambah ke keranjang");
              }, 1600);
            }
          });
          return;
        }

        if (window.CartStore) {
          window.CartStore.addItem(basicProduct, 1);
        }

        btn.classList.add("is-added");
        btn.innerHTML = checkIconSvg;
        btn.setAttribute("aria-label", "Ditambahkan ke keranjang");

        setTimeout(function () {
          btn.classList.remove("is-added");
          btn.innerHTML = originalIcon;
          btn.setAttribute("aria-label", "Tambah ke keranjang");
        }, 1600);

        var imgEl2 = card.querySelector("img");
        flyToCart(imgEl2, btn);
        showAddedToCartToast(basicProduct);
      });
    });
  }

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

  function showAddedToCartToast(product) {
    var stack = getCartToastStack();

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
        '<p class="cart-toast__price">' + rupiah(parseInt(product.price, 10) || 0) + "</p>" +
      "</div>" +
      '<a class="cart-toast__link" href="lingua/cart.html">Lihat</a>' +
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

  const checkIconSvg =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  const moreBtn = document.getElementById("exploreMoreBtn");
  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      console.log("Lihat produk selengkapnya diklik");
    });
  }

  renderBestsellers();
  renderExplore();
  renderCategorySection(DATA);
}

if (window.PRODUCTS_DATA) {
  initStoreWithProductsData();
} else {
  document.addEventListener("products-data:ready", initStoreWithProductsData);
}
