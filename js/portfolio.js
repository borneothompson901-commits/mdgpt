(function () {
  'use strict';

  var section = document.querySelector('.porto-section');
  if (!section) return;

  var tabs   = Array.from(section.querySelectorAll('.porto-tab'));
  var panels = Array.from(section.querySelectorAll('.porto-panel'));
  var ink    = section.querySelector('.porto-tab-ink');

  if (!tabs.length || !panels.length) return;
  var fetched = {};

  function moveInk(tab) {
    if (!ink || !tab) return;
    ink.style.width     = tab.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
  }
  var eyeSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  var expandSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
  var playSvg = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
  var playSmSvg = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

  function imgPath(p) {
    if (!p) return '';
    if (p.indexOf('http') === 0 || p.indexOf('data:') === 0) return p;
    if (p.indexOf('/uploads/') === 0) return '/mdgpt' + p;
    return p;
  }

  function renderSosmed(dataFoto, dataVideo) {
    var feedGrid = section.querySelector('.porto-feed-grid');
    if (feedGrid && Array.isArray(dataFoto) && dataFoto.length) {
      feedGrid.innerHTML = '';
      dataFoto.forEach(function(item, i) {
        var src = imgPath(item.media);
        var btn = document.createElement('button');
        btn.className = 'porto-feed-item';
        btn.setAttribute('aria-label', 'Lihat feed ' + (i + 1));
        btn.setAttribute('data-index', i);
        btn.innerHTML =
          '<img src="' + src + '" alt="Feed ' + (i + 1) + '" loading="lazy" />' +
          '<div class="porto-feed-item__overlay">' + eyeSvg + '</div>';
        feedGrid.appendChild(btn);
      });
    }
    var reelsGrid = section.querySelector('.porto-reels-grid');
    if (reelsGrid && Array.isArray(dataVideo) && dataVideo.length) {
      reelsGrid.innerHTML = '';
      dataVideo.forEach(function(item, i) {
        var src = imgPath(item.media);
        var btn = document.createElement('button');
        btn.className = 'porto-reel-item';
        btn.setAttribute('aria-label', 'Lihat reel ' + (i + 1));
        btn.setAttribute('data-index', i);
        btn.setAttribute('data-type', 'video');
        btn.setAttribute('data-src', src);
        btn.innerHTML =
          '<video class="porto-reel-thumb" src="' + src + '" muted playsinline preload="metadata"></video>' +
          '<div class="porto-reel-item__play">' + playSvg + '</div>' +
          '<div class="porto-reel-item__overlay"></div>';
        reelsGrid.appendChild(btn);
      });
    }
  }

  function renderEvent(dataFoto, dataVideo) {
    var grid = section.querySelector('.porto-event-grid');
    if (!grid) return;
    Array.from(grid.querySelectorAll('.porto-event-item:not(.porto-event-item--video)')).forEach(function(el) {
      el.remove();
    });
    var videoEl = grid.querySelector('.porto-event-item--video');
    if (Array.isArray(dataFoto) && dataFoto.length) {
      dataFoto.forEach(function(item, i) {
        var src = imgPath(item.media);
        var btn = document.createElement('button');
        btn.className = 'porto-event-item';
        btn.setAttribute('aria-label', 'Lihat foto event ' + (i + 1));
        btn.setAttribute('data-index', i);
        btn.innerHTML =
          '<img src="' + src + '" alt="Event ' + (i + 1) + '" loading="lazy" />' +
          '<div class="porto-event-item__overlay">' + eyeSvg + '</div>';
        grid.insertBefore(btn, videoEl || null);
      });
    }
    if (videoEl && Array.isArray(dataVideo) && dataVideo.length) {
    var vidSrc = imgPath(dataVideo[0].media);
    videoEl.outerHTML = '<button class="porto-event-item porto-event-item--video porto-event-item--full" ' +
        'aria-label="Lihat video event" data-index="' + (Array.isArray(dataFoto) ? dataFoto.length : 0) + '" ' +
        'data-type="video" data-src="' + vidSrc + '">' +
        '<video class="porto-video" src="' + vidSrc + '" muted playsinline preload="metadata"></video>' +
        '<div class="porto-reel-item__play">' + playSvg + '</div>' +
        '<div class="porto-video__badge">' + playSmSvg + ' Video</div>' +
        '</button>';
}
  }

  function renderProduk(data) {
    var grid = section.querySelector('.porto-product-grid');
    if (!grid || !Array.isArray(data) || !data.length) return;
    grid.innerHTML = '';
    data.forEach(function(item, i) {
      var src = imgPath(item.media);
      var btn = document.createElement('button');
      btn.className = 'porto-product-item';
      btn.setAttribute('aria-label', 'Lihat foto produk ' + (i + 1));
      btn.setAttribute('data-index', i);
      btn.innerHTML =
        '<div class="porto-product-item__img-wrap">' +
          '<img src="' + src + '" alt="Produk ' + (i + 1) + '" loading="lazy" />' +
        '</div>' +
        '<div class="porto-product-item__overlay">' + expandSvg + '</div>';
      grid.appendChild(btn);
    });
  }

  function renderAds(data) {
    var grid = section.querySelector('.porto-ads-grid');
    if (!grid || !Array.isArray(data) || !data.length) return;
    grid.innerHTML = '';
    data.forEach(function(item, i) {
      var src = imgPath(item.media);
      var btn = document.createElement('button');
      btn.className = 'porto-ads-item';
      btn.setAttribute('aria-label', 'Lihat ads ' + (i + 1));
      btn.setAttribute('data-index', i);
      btn.innerHTML =
        '<div class="porto-ads-item__screen">' +
          '<img src="' + src + '" alt="Ads ' + (i + 1) + '" loading="lazy" />' +
        '</div>' +
        '<div class="porto-ads-item__overlay">' + expandSvg + '</div>';
      grid.appendChild(btn);
    });
  }


  var TAB_FETCH = {
    sosmed: function(cb) {
      Promise.all([
        fetch('api/public_contents.php?type=portofolioA_foto',  { cache: 'no-store' }).then(function(r) { return r.json(); }),
        fetch('api/public_contents.php?type=portofolioA_video', { cache: 'no-store' }).then(function(r) { return r.json(); })
      ]).then(function(results) {
        renderSosmed(results[0], results[1]);
        cb && cb();
      }).catch(function() { cb && cb(); });
    },
    event: function(cb) {
      Promise.all([
        fetch('api/public_contents.php?type=portofolioB_foto',  { cache: 'no-store' }).then(function(r) { return r.json(); }),
        fetch('api/public_contents.php?type=portofolioB_video', { cache: 'no-store' }).then(function(r) { return r.json(); })
      ]).then(function(results) {
        renderEvent(results[0], results[1]);
        cb && cb();
      }).catch(function() { cb && cb(); });
    },
    produk: function(cb) {
      fetch('api/public_contents.php?type=portofolioC_foto', { cache: 'no-store' })
        .then(function(r) { return r.json(); })
        .then(function(data) { renderProduk(data); cb && cb(); })
        .catch(function() { cb && cb(); });
    },
    ads: function(cb) {
      fetch('api/public_contents.php?type=portofolioD_foto', { cache: 'no-store' })
        .then(function(r) { return r.json(); })
        .then(function(data) { renderAds(data); cb && cb(); })
        .catch(function() { cb && cb(); });
    }
  };

  function activateTab(target, pushState) {
    if (!target) return;
    var key = target.getAttribute('data-tab');
    if (!key) return;

    tabs.forEach(function(t) {
      var active = t === target;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function(p) {
      var show = p.id === 'tab-' + key;
      if (show) {
        p.hidden = false;
        p.style.animation = 'none';
        void p.offsetHeight;
        p.style.animation = '';
      } else {
        p.hidden = true;
      }
    });

    moveInk(target);

    if (pushState && history.replaceState) {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('tab', key);
        history.replaceState(null, '', url.toString());
      } catch(e) {}
    }
    if (!fetched[key] && TAB_FETCH[key]) {
      fetched[key] = true;
      TAB_FETCH[key](null);
    }
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() { activateTab(tab, true); });
    tab.addEventListener('keydown', function(e) {
      var idx = tabs.indexOf(tab);
      if (e.key === 'ArrowRight') { e.preventDefault(); activateTab(tabs[(idx + 1) % tabs.length], true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); activateTab(tabs[(idx - 1 + tabs.length) % tabs.length], true); }
    });
  });

  function initFromURL() {
    var params   = new URLSearchParams(window.location.search);
    var tabParam = params.get('tab') || 'sosmed';
    var validTabs = ['sosmed', 'event', 'produk', 'ads'];
    if (validTabs.indexOf(tabParam) === -1) tabParam = 'sosmed';
    var targetTab = section.querySelector('[data-tab="' + tabParam + '"]');
    if (targetTab) activateTab(targetTab, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFromURL);
  } else {
    initFromURL();
  }

  window.addEventListener('load', function() {
    var activeTab = section.querySelector('.porto-tab.is-active');
    if (activeTab) moveInk(activeTab);
  });
  window.addEventListener('resize', function() {
    var activeTab = section.querySelector('.porto-tab.is-active');
    if (activeTab) moveInk(activeTab);
  });

  var lb        = document.getElementById('lightbox');
  var lbClose   = document.getElementById('lbClose');
  var lbPrev    = document.getElementById('lbPrev');
  var lbNext    = document.getElementById('lbNext');
  var lbCounter = document.getElementById('lbCounter');
  var lbContent = document.getElementById('lbContent');

  if (!lb || !lbClose || !lbPrev || !lbNext || !lbCounter || !lbContent) return;

  var currentGroup = [];
  var currentIndex = 0;
  var prevFocus    = null;

  function buildGroup(groupEl) {
    if (!groupEl) return [];
    return Array.from(groupEl.querySelectorAll('[data-index]')).map(function(item) {
      var type = item.getAttribute('data-type') || 'image';
      var src  = item.getAttribute('data-src') || '';
      if (!src) {
        var vid = item.querySelector('video');
        var img = item.querySelector('img');
        src = vid ? (vid.src || vid.getAttribute('src') || '') : (img ? img.src : '');
      }
      var img = item.querySelector('img');
      return { src: src, alt: img ? (img.alt || '') : '', type: type };
    });
  }

  function stopActiveVideo() {
    var existing = lbContent.querySelector('video');
    if (existing) { existing.pause(); existing.src = ''; }
  }

  function showSlide(index) {
    if (!currentGroup.length) return;
    index = ((index % currentGroup.length) + currentGroup.length) % currentGroup.length;
    var item = currentGroup[index];
    if (!item) return;

    stopActiveVideo();
    lbContent.innerHTML = '';

    if (item.type === 'video') {
      var v = document.createElement('video');
      v.className  = 'lb-video';
      v.src        = item.src;
      v.controls   = true;
      v.autoplay   = true;
      v.playsInline = true;
      lbContent.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.className = 'lb-img';
      img.alt       = item.alt;
      img.draggable = false;
      img.style.cssText = 'opacity:0;transform:scale(0.96);transition:opacity 0.18s ease,transform 0.22s cubic-bezier(0.34,1.2,0.64,1)';
      lbContent.appendChild(img);
      var loader = new Image();
      loader.onload = function() { img.src = item.src; img.style.opacity = '1'; img.style.transform = 'scale(1)'; };
      loader.onerror = function() { img.style.opacity = '1'; img.style.transform = 'scale(1)'; };
      loader.src = item.src;
    }

    currentIndex = index;
    lbCounter.textContent = (index + 1) + ' / ' + currentGroup.length;
    lbPrev.style.visibility = currentGroup.length > 1 ? 'visible' : 'hidden';
    lbNext.style.visibility = currentGroup.length > 1 ? 'visible' : 'hidden';
  }

  function openLightbox(group, index) {
    if (!group || !group.length) return;
    currentGroup = group;
    prevFocus    = document.activeElement;
    showSlide(index || 0);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    stopActiveVideo();
    lbContent.innerHTML = '';
    lb.hidden = true;
    document.body.style.overflow = '';
    if (prevFocus) prevFocus.focus();
  }

  function prev() { showSlide(currentIndex - 1); }
  function next() { showSlide(currentIndex + 1); }

  section.addEventListener('click', function(e) {
    var trigger = e.target.closest('[data-index]');
    if (!trigger) return;
    var groupEl = trigger.closest('[data-lightbox-group]');
    if (!groupEl) return;
    var group = buildGroup(groupEl);
    var index = parseInt(trigger.getAttribute('data-index'), 10);
    if (isNaN(index)) return;
    openLightbox(group, index);
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lb.addEventListener('click', function(e) { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', function(e) {
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape')    closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  var touchStartX = 0;
  lb.addEventListener('touchstart', function(e) {
    if (e.touches && e.touches.length) touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lb.addEventListener('touchend', function(e) {
    if (!e.changedTouches || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
  });

})();