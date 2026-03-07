(function () {
  "use strict";

  var serviceItems = document.querySelectorAll(".service-item");
  var isMobile = function () {
    return window.innerWidth <= 600;
  };
  serviceItems.forEach(function (item) {
    function go() {
      var key = item.getAttribute("data-service");
      if (key) window.location.href = "layanan.html#" + key;
    }
    item.addEventListener("click", go);
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (href === "#" || href === "#!") return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      var navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-height") || "68",
        10,
      );
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navH,
        behavior: "smooth",
      });
    });
  });
  function reveal() {
    if (isMobile()) return;
    serviceItems.forEach(function (item, i) {
      if (item.getBoundingClientRect().top < window.innerHeight - 60) {
        setTimeout(function () {
          item.style.opacity = "1";
          item.style.transform = "translateY(0)";
        }, i * 55);
      }
    });
  }
  if (!isMobile()) {
    serviceItems.forEach(function (item) {
      item.style.opacity = "0";
      item.style.transform = "translateY(16px)";
      item.style.transition =
        "opacity 0.35s ease, transform 0.35s ease, box-shadow 0.18s ease, border-color 0.18s ease";
    });
  }
  window.addEventListener("scroll", reveal, { passive: true });
  reveal();
})();

(function () {
  "use strict";
  var targets = document.querySelectorAll(".wwa__left, .wwa__right");
  if (!targets.length) return;
  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(function (el) { observer.observe(el); });
})();

(function () {
  "use strict";
  var header = document.querySelector(".whyus__header");
  var cards = document.querySelectorAll(".whyus__card");
  if (!("IntersectionObserver" in window)) {
    if (header) header.classList.add("is-visible");
    cards.forEach(function (c) { c.classList.add("is-visible"); });
    return;
  }
  if (header) {
    var headerObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          headerObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    headerObs.observe(header);
  }
  if (cards.length) {
    var cardObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          cardObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    cards.forEach(function (card, i) {
      card.style.transitionDelay = i * 70 + "ms";
      cardObs.observe(card);
    });
  }
})();

(function () {
  "use strict";

  function initSlider(teamData) {
    var wrap = document.getElementById("sliderWrap");
    var track = document.getElementById("sliderTrack");
    var dotsEl = document.getElementById("sliderDots");
    if (!wrap || !track || !dotsEl) return;

    if (teamData && teamData.length > 0) {
      track.innerHTML = "";

      teamData.forEach(function (member) {
        var card = document.createElement("div");
        card.className = "slide-card";

        var img = document.createElement("img");
        img.className = "slide-photo";
        img.src = member.photo || "assets/img/placeholder.png";
        img.alt = member.name || "";
        img.style.display = "block"; // ← tambah ini

        var name = document.createElement("p");
        name.className = "slide-name";
        name.textContent = member.name || "";

        var role = document.createElement("p");
        role.className = "slide-role";
        role.textContent = member.role || "";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(role);
        track.appendChild(card);
      });
    }

    dotsEl.innerHTML = "";

    var origCards = Array.from(track.querySelectorAll(".slide-card"));
    var count = origCards.length;
    if (count === 0) return;

    var GAP = 20;
    var SPEED = 0.7;

    origCards.forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    origCards.slice().reverse().forEach(function (c) {
      track.insertBefore(c.cloneNode(true), track.firstChild);
    });

    var allCards = Array.from(track.querySelectorAll(".slide-card"));
    var offset = count;

    origCards.forEach(function (_, i) {
      var d = document.createElement("button");
      d.className = "dot";
      d.setAttribute("aria-label", "Slide " + (i + 1));
      d.addEventListener("click", function () { snapTo(offset + i); });
      dotsEl.appendChild(d);
    });

    function cw(i) { return allCards[i].offsetWidth + GAP; }
    function leftOf(i) {
      var x = 0;
      for (var j = 0; j < i; j++) x += cw(j);
      return x;
    }
    function centerOffset(i) {
      return -(leftOf(i) - (wrap.offsetWidth - allCards[i].offsetWidth) / 2);
    }
    function updateDots(translateX) {
      var best = offset, bestD = Infinity;
      allCards.forEach(function (_, i) {
        var d = Math.abs(translateX - centerOffset(i));
        if (d < bestD) { bestD = d; best = i; }
      });
      var ri = (((best - offset) % count) + count) % count;
      dotsEl.querySelectorAll(".dot").forEach(function (d, i) {
        d.classList.toggle("active", i === ri);
      });
    }

    var currentX = centerOffset(offset);
    var paused = false;
    var snapping = false;

    function applyX(x, transition) {
      track.style.transition = transition || "none";
      track.style.transform = "translateX(" + x + "px)";
    }

    function totalWidth() {
      var w = 0;
      for (var i = offset; i < offset + count; i++) w += cw(i);
      return w;
    }

    function wrapIfNeeded() {
      var tw = totalWidth();
      if (currentX < centerOffset(offset + count - 1) - cw(offset + count - 1) * 0.5) {
        currentX += tw; applyX(currentX);
      }
      if (currentX > centerOffset(offset) + cw(offset) * 0.5) {
        currentX -= tw; applyX(currentX);
      }
    }

    function tick() {
      if (!paused && !snapping) {
        currentX -= SPEED;
        applyX(currentX);
        wrapIfNeeded();
        updateDots(currentX);
      }
      requestAnimationFrame(tick);
    }

    function snapTo(idx) {
      snapping = true;
      currentX = centerOffset(idx);
      applyX(currentX, "transform 0.45s cubic-bezier(.25,.8,.25,1)");
      updateDots(currentX);
      setTimeout(function () { snapping = false; }, 460);
    }

    wrap.addEventListener("mouseenter", function () { paused = true; });
    wrap.addEventListener("mouseleave", function () { paused = false; });

    var dragStartX = 0, dragStartTranslate = 0, dragging = false, moved = false;

    wrap.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      dragging = true; moved = false; paused = true; snapping = false;
      dragStartX = e.clientX; dragStartTranslate = currentX;
      track.style.transition = "none";
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 3) moved = true;
      currentX = dragStartTranslate + dx;
      applyX(currentX);
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      snapNearest();
      setTimeout(function () { paused = false; }, 460);
    }
    wrap.addEventListener("pointerup", endDrag);
    wrap.addEventListener("pointercancel", endDrag);
    wrap.addEventListener("click", function (e) {
      if (moved) e.stopPropagation();
    }, true);

    function snapNearest() {
      var best = offset, bestD = Infinity;
      allCards.forEach(function (_, i) {
        var d = Math.abs(currentX - centerOffset(i));
        if (d < bestD) { bestD = d; best = i; }
      });
      snapping = true;
      currentX = centerOffset(best);
      applyX(currentX, "transform 0.4s cubic-bezier(.25,.8,.25,1)");
      updateDots(currentX);
      setTimeout(function () { snapping = false; }, 420);
    }

    var touchStartX = 0, touchStartTranslate = 0;
    wrap.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX; touchStartTranslate = currentX;
      paused = true; snapping = false; track.style.transition = "none";
    }, { passive: true });
    wrap.addEventListener("touchmove", function (e) {
      currentX = touchStartTranslate + (e.touches[0].clientX - touchStartX);
      applyX(currentX);
    }, { passive: true });
    wrap.addEventListener("touchend", function () {
      snapNearest();
      setTimeout(function () { paused = false; }, 460);
    });

    window.addEventListener("resize", function () { applyX(currentX); });

    (function () {
      origCards.forEach(function (c) { c.style.opacity = "0"; });
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var visible = Array.from(allCards).filter(function (c) {
            var r = c.getBoundingClientRect();
            return r.left < window.innerWidth && r.right > 0;
          });
          visible.forEach(function (c, i) {
            setTimeout(function () {
              c.style.transition = "opacity .6s ease";
              c.style.opacity = "1";
            }, i * 100);
          });
          setTimeout(function () {
            allCards.forEach(function (c) {
              c.style.transition = "opacity .3s ease";
              c.style.opacity = "1";
            });
          }, origCards.length * 100 + 600);
          observer.disconnect();
        });
      }, { threshold: 0.2 });
      observer.observe(wrap);
    })();

    applyX(currentX);
    updateDots(currentX);
    requestAnimationFrame(tick);
  }

  if (window.__cmsTeamData) {
    initSlider(window.__cmsTeamData);
  } else {
    document.addEventListener("cms:teamDataReady", function (e) {
      initSlider(e.detail.teamData);
    });

    setTimeout(function () {
      if (!window.__cmsTeamData) {
        initSlider(null);
      }
    }, 3000);
  }
})();

(function () {
  var btn = document.getElementById("ctaBtn");
  if (!btn) return;
  var shine = btn.querySelector(".cta-shine");
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        btn.style.animationPlayState = "running";
        if (shine) shine.style.animationPlayState = "running";
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });
  observer.observe(btn);
})();