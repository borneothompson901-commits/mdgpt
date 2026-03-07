(function () {
  'use strict';

  var NAV_H  = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '68', 10
  );
  var OFFSET = NAV_H + 24;

  var activeCard = null;

  function clearHighlight() {
    document.querySelectorAll('.svc-card--highlight').forEach(function (c) {
      c.classList.remove('svc-card--highlight');
    });
    activeCard = null;
  }

  function scrollToCard(id) {
    var card = document.getElementById(id);
    if (!card) return;
    var top = card.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top: top, behavior: 'smooth' });
    clearHighlight();
    card.classList.add('svc-card--highlight');
    activeCard = card;
  }

  document.addEventListener('click', function (e) {
    if (!activeCard) return;
    var clickedCard = e.target.closest('.svc-card');
    if (!clickedCard) {
      clearHighlight();
    } else if (clickedCard !== activeCard) {
      clearHighlight();
    }
  });

  var cards = Array.from(document.querySelectorAll('.svc-card'));

  if (cards.length) {
    var obs = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    cards.forEach(function (card) { obs.observe(card); });
  }

  function init() {
    var hash = window.location.hash.replace('#', '').trim();
    if (hash) scrollToCard(hash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(init);
      });
    });
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(init);
    });
  }

})();

/*brands*/
(function () {
  'use strict';

  var wrap  = document.querySelector('.brands-track-wrap');
  var track = document.getElementById('brandsTrack');
  if (!wrap || !track) return;

  var SPEED      = 0.55;
  var SNAP_EASE  = 0.12;

  var origItems = [];
  function getSetWidth() {
    var gap   = 16;
    var items = track.querySelectorAll('.brands-item');
    var total = 0;
    var count = origItems.length;
    for (var i = 0; i < count; i++) {
      total += items[i].getBoundingClientRect().width + gap;
    }
    return total;
  }

  var setWidth   = 0;
  var currentX   = 0;
  var targetX    = 0;
  var isPaused   = false;
  var isDragging = false;
  var rafId      = null;
  var dragStartX   = 0;
  var dragStartPos = 0;
  var velocity     = 0;
  var lastX        = 0;
  var lastTime     = 0;

  function applyTransform(x) {
    track.style.transform = 'translate3d(' + x + 'px, 0, 0)';
  }

  function loop() {
    if (!isDragging) {
      if (!isPaused) {
        targetX -= SPEED;
      }
      currentX += (targetX - currentX) * (isDragging ? 1 : SNAP_EASE);
    } else {
      currentX = targetX;
    }

    if (Math.abs(currentX) >= setWidth) {
      currentX += setWidth;
      targetX  += setWidth;
    }
    if (currentX > 0) {
      currentX -= setWidth;
      targetX  -= setWidth;
    }

    applyTransform(currentX);
    rafId = requestAnimationFrame(loop);
  }

  wrap.addEventListener('mouseenter', function () { isPaused = true; });
  wrap.addEventListener('mouseleave', function () {
    if (!isDragging) isPaused = false;
  });

  wrap.addEventListener('mousedown', function (e) {
    isDragging   = true;
    isPaused     = true;
    dragStartX   = e.clientX;
    dragStartPos = currentX;
    lastX        = e.clientX;
    lastTime     = performance.now();
    velocity     = 0;
    wrap.classList.add('is-dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var now   = performance.now();
    var dt    = now - lastTime;
    var dx    = e.clientX - lastX;
    velocity  = dt > 0 ? dx / dt : 0;
    lastX     = e.clientX;
    lastTime  = now;
    targetX   = dragStartPos + (e.clientX - dragStartX);
    currentX  = targetX;
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    wrap.classList.remove('is-dragging');
    targetX += velocity * 80;
    isPaused = false;
  });

  wrap.addEventListener('touchstart', function (e) {
    isDragging   = true;
    isPaused     = true;
    dragStartX   = e.touches[0].clientX;
    dragStartPos = currentX;
    lastX        = e.touches[0].clientX;
    lastTime     = performance.now();
    velocity     = 0;
  }, { passive: true });

  wrap.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    var now  = performance.now();
    var dt   = now - lastTime;
    var dx   = e.touches[0].clientX - lastX;
    velocity = dt > 0 ? dx / dt : 0;
    lastX    = e.touches[0].clientX;
    lastTime = now;
    targetX  = dragStartPos + (e.touches[0].clientX - dragStartX);
    currentX = targetX;
  }, { passive: true });

  wrap.addEventListener('touchend', function () {
    isDragging = false;
    targetX   += velocity * 80;
    isPaused   = false;
  });

  var section = document.querySelector('.brands-section');
  if (section) {
    if ('IntersectionObserver' in window) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add('is-visible');
            sectionObserver.unobserve(section);
          }
        });
      }, { threshold: 0.15 });
      sectionObserver.observe(section);
    } else {
      section.classList.add('is-visible');
    }
  }

  function init() {
    origItems = Array.from(track.children);
    for (var c = 0; c < 5; c++) {
      origItems.forEach(function(item) {
        track.appendChild(item.cloneNode(true));
      });
    }
    setWidth = getSetWidth();
    currentX = -setWidth;
    targetX  = -setWidth;
    applyTransform(currentX);
    rafId = requestAnimationFrame(loop);
  }
  function startCarousel() {
    fetch("api/public_contents.php?type=brand", { cache: "no-store" })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (Array.isArray(data) && data.length) {
          var track = document.getElementById('brandsTrack');
          if (track) {
            track.innerHTML = '';
            data.forEach(function(item) {
              if (!item.media) return;
              var li = document.createElement('li');
              li.className = 'brands-item';
              li.setAttribute('role', 'listitem');
              li.innerHTML = '<div class="brands-logo"><img src="/mdgpt' + item.media + '" alt="Brand" loading="lazy" /></div>';
              track.appendChild(li);
            });
          }
        }
        init();
      })
      .catch(function() {
        init();
      });
  }

  if (document.readyState === 'complete') {
    startCarousel();
  } else {
    window.addEventListener('load', startCarousel);
  }

  window.addEventListener('resize', function () {
    setWidth = getSetWidth();
  }, { passive: true });

})();

(function () {
  'use strict';

  var section = document.querySelector('.prev-section');
  if (!section) return;

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        section.classList.add('is-visible');
        obs.unobserve(section);
      }
    }, { threshold: 0.12 });
    obs.observe(section);
  } else {
    section.classList.add('is-visible');
  }

})();

/*reviews-section*/
(function () {
    'use strict';

    var outer   = document.getElementById('reviewsOuter');
    var track   = document.getElementById('reviewsTrack');
    var section = document.getElementById('reviewsSection');
    if (!outer || !track || !section) return;

    var SPEED = 0.55;
    var GAP   = 20;

    var origCards = [];

    function oneSetWidth() {
        var w = 0;
        origCards.forEach(function (c) { w += c.offsetWidth + GAP; });
        return w;
    }

    var currentX   = 0;
    var paused     = false;
    var dragging   = false;
    var moved      = false;
    var dragStartX = 0;
    var dragStartT = 0;

    function applyX(x) {
        track.style.transform = 'translateX(' + x + 'px)';
    }

    function wrapIfNeeded() {
        var setW = oneSetWidth();
        if (currentX <= -setW) currentX += setW;
        if (currentX > 0)      currentX -= setW;
    }

    function tick() {
        if (!paused && !dragging) {
            currentX -= SPEED;
            wrapIfNeeded();
            applyX(currentX);
        }
        requestAnimationFrame(tick);
    }

    outer.addEventListener('mouseenter', function () { paused = true; });
    outer.addEventListener('mouseleave', function () { paused = false; });

    outer.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        dragging   = true;
        moved      = false;
        paused     = true;
        dragStartX = e.clientX;
        dragStartT = currentX;
        track.style.transition = 'none';
        outer.setPointerCapture(e.pointerId);
    });

    outer.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - dragStartX;
        if (Math.abs(dx) > 3) moved = true;
        currentX = dragStartT + dx;
        wrapIfNeeded();
        applyX(currentX);
    });

    function endDrag() {
        if (!dragging) return;
        dragging = false;
        setTimeout(function () { paused = false; }, 120);
    }

    outer.addEventListener('pointerup',     endDrag);
    outer.addEventListener('pointercancel', endDrag);

    outer.addEventListener('click', function (e) {
        if (moved) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    var touchStartX = 0;
    var touchStartT = 0;

    outer.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartT = currentX;
        paused = true;
        track.style.transition = 'none';
    }, { passive: true });

    outer.addEventListener('touchmove', function (e) {
        var dx = e.touches[0].clientX - touchStartX;
        currentX = touchStartT + dx;
        wrapIfNeeded();
        applyX(currentX);
    }, { passive: true });

    outer.addEventListener('touchend', function () {
        setTimeout(function () { paused = false; }, 120);
    });

    var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
            section.classList.add('rv-visible');
            io.disconnect();
        }
    }, { threshold: 0.15 });
    io.observe(section);

    function startReviews() {
    fetch("api/public_contents.php?type=testimoniA", { cache: "no-store" })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (Array.isArray(data) && data.length) {
                track.innerHTML = '';
                data.forEach(function(item, idx) {
                    var article = document.createElement('article');
                    article.className = 'rv-card' + (idx % 2 === 1 ? ' rv-card--accent' : '');
                    article.innerHTML =
                        '<div class="rv-card__top">' +
                            '<div class="rv-card__stars" aria-label="5 bintang">★★★★★</div>' +
                            '<div class="rv-card__logo">M-DGPT Agency</div>' +
                        '</div>' +
                        '<blockquote class="rv-card__quote">"' + (item.ulasan || '') + '"</blockquote>' +
                        '<footer class="rv-card__author">' +
                            '<div class="rv-card__avatar" aria-hidden="true">' +
                                (item.foto ? '<img src="/mdgpt' + item.foto + '" alt="' + (item.nama || '') + '" />' : '') +
                            '</div>' +
                            '<div>' +
                                '<strong class="rv-card__name">' + (item.nama || '') + '</strong>' +
                                '<span class="rv-card__role">' + (item.jabatan || '') + '</span>' +
                            '</div>' +
                        '</footer>';
                    track.appendChild(article);
                });
            }
            origCards = Array.from(track.querySelectorAll('.rv-card'));
            origCards.forEach(function(c) {
                var cl = c.cloneNode(true);
                cl.setAttribute('aria-hidden', 'true');
                track.appendChild(cl);
            });
            track.style.willChange = 'transform';
            applyX(currentX);
            requestAnimationFrame(tick);
        })
        .catch(function() {
            origCards = Array.from(track.querySelectorAll('.rv-card'));
            origCards.forEach(function(c) {
                var cl = c.cloneNode(true);
                cl.setAttribute('aria-hidden', 'true');
                track.appendChild(cl);
            });
            track.style.willChange = 'transform';
            applyX(currentX);
            requestAnimationFrame(tick);
        });
}

startReviews();
})();
