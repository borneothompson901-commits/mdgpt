(function () {
  'use strict';

  function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function initHeroParticles() {
    var canvas = qs('#heroCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var COUNT = window.innerWidth < 640 ? 55 : 110;
    var COLORS = ['rgba(169,26,182,','rgba(4,123,254,','rgba(57,61,245,','rgba(177,4,255,'];

    function rand(min, max) { return min + Math.random() * (max - min); }

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() { this.reset(true); }

    Particle.prototype.reset = function (initial) {
      this.x       = rand(0, W);
      this.y       = initial ? rand(0, H) : H + 8;
      this.r       = rand(0.6, 2.2);
      this.vx      = rand(-0.18, 0.18);
      this.vy      = -rand(0.12, 0.5);
      this.life    = 0;
      this.maxLife = rand(120, 280);
      this.color   = COLORS[Math.floor(rand(0, COLORS.length))];
    };

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -8) this.reset(false);
    };

    Particle.prototype.draw = function () {
      var p = this.life / this.maxLife;
      var a = p < 0.15 ? p / 0.15 : p > 0.75 ? (1 - p) / 0.25 : 1;
      a *= 0.75;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    };

    function drawLines() {
      var MAX = 100;
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx   = particles[a].x - particles[b].x;
          var dy   = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = 'rgba(4,123,254,' + (1 - dist / MAX) * 0.12 + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    resize();
    for (var i = 0; i < COUNT; i++) particles.push(new Particle());

    var raf;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawLines();
      for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      raf = requestAnimationFrame(loop);
    }
    loop();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        particles = [];
        for (var i = 0; i < COUNT; i++) particles.push(new Particle());
      }, 200);
    });

    var section = qs('#hero-membership');
    if (section && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!raf) loop();
        } else {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }, { threshold: 0 }).observe(section);
    }
  }

  function initHeroParallax() {
    var section = qs('#hero-membership');
    if (!section) return;
    var orbs     = qsa('.hero__orb', section);
    var mx = 0, my = 0, cx = 0, cy = 0;
    var strength = [18, 26, 12];

    window.addEventListener('mousemove', function (e) {
      var rect = section.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      my = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    });

    (function animate() {
      cx = lerp(cx, mx, 0.04);
      cy = lerp(cy, my, 0.04);
      orbs.forEach(function (orb, i) {
        var s = strength[i] || 14;
        orb.style.transform = 'translate(' + (cx * s) + 'px, ' + (cy * s) + 'px)';
      });
      requestAnimationFrame(animate);
    })();
  }

  function initHeroReveal() {
    var section = qs('#hero-membership');
    if (!section) return;

    var badge   = qs('[data-reveal="badge"]',   section);
    var hlLines = qsa('.hero__hl-line',          section);
    var sub     = qs('[data-reveal="sub"]',      section);
    var divider = qs('[data-reveal="divider"]',  section);
    var cta     = qs('[data-reveal="cta"]',      section);

    function reveal() {
      setTimeout(function () {
        if (badge) badge.classList.add('is-visible');
      }, 0);

      hlLines.forEach(function (line, i) {
        setTimeout(function () {
          line.classList.add('is-visible');
        }, 160 + i * 120);
      });

      var afterHeadline = 160 + hlLines.length * 120;

      setTimeout(function () {
        if (sub) sub.classList.add('is-visible');
      }, afterHeadline + 80);

      setTimeout(function () {
        if (divider) divider.classList.add('is-visible');
      }, afterHeadline + 180);

      setTimeout(function () {
        if (cta) cta.classList.add('is-visible');
      }, afterHeadline + 280);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { reveal(); io.disconnect(); }
      }, { threshold: 0.1 });
      io.observe(section);
    } else {
      reveal();
    }
  }

  function init() {
    if (qs('#hero-membership')) {
      initHeroParticles();
      initHeroParallax();
      initHeroReveal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/*AI Explorer*/
(function () {
  'use strict';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  const section  = $('#workshop-timeline');
  const header   = $('.tl-header');
  const items    = $$('.tl-item');
  const progress = $('#tlProgress');
  const track    = $('.tl-track');

  if (!section) return;

  function positionTrack() {
    if (!track || items.length < 2) return;

    const containerRect = track.parentElement.getBoundingClientRect();
    const firstDot = items[0].querySelector('.tl-item__dot');
    const lastDot  = items[items.length - 1].querySelector('.tl-item__dot');

    if (!firstDot || !lastDot) return;

    const firstRect = firstDot.getBoundingClientRect();
    const lastRect  = lastDot.getBoundingClientRect();

    const firstCenter = firstRect.top + firstRect.height / 2 - containerRect.top;
    const lastCenter  = lastRect.top  + lastRect.height  / 2 - containerRect.top;

    track.style.top    = firstCenter + 'px';
    track.style.height = (lastCenter - firstCenter) + 'px';
  }
  positionTrack();
  window.addEventListener('resize', positionTrack, { passive: true });
  const headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          headerObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  if (header) headerObserver.observe(header);
  const itemObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = items.indexOf(e.target);
          e.target.style.transitionDelay = `${idx * 40}ms`;
          e.target.classList.add('is-visible');
          itemObserver.unobserve(e.target);
          positionTrack();
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach((item) => itemObserver.observe(item));
  function updateProgress() {
    if (!progress || !track || !section) return;

    const sectionRect = section.getBoundingClientRect();
    const viewH   = window.innerHeight;
    const totalH  = sectionRect.height;
    const scrolled = Math.max(0, viewH * 0.5 - sectionRect.top);
    const pct = Math.min(100, (scrolled / totalH) * 100);

    progress.style.height = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

})();
/*Benefits Section*/
(function () {
  'use strict';

  function observe(el, opts, cb) {
    if (!el) return;
    new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cb(e.target);
        obs.unobserve(e.target);
      });
    }, opts).observe(el);
  }

  function observeAll(els, opts, cb) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cb(e.target, els.indexOf(e.target));
        o.unobserve(e.target);
      });
    }, opts);
    els.forEach((el) => obs.observe(el));
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function renderBenefits(data) {
    var list = document.querySelector('.bn-list');
    var statNum = document.querySelector('.bn-left__stat-num');

    if (list && Array.isArray(data) && data.length) {
      list.innerHTML = '';
      data.forEach(function(item, i) {
        var li = document.createElement('li');
        li.className = 'bn-item';
        li.innerHTML =
          '<div class="bn-item__inner">' +
            '<span class="bn-item__num">' + pad(i + 1) + '</span>' +
            '<div class="bn-item__content">' +
              '<h3 class="bn-item__title">' + (item.judul || '') + '</h3>' +
              '<p class="bn-item__desc">' + (item.subtext || '') + '</p>' +
            '</div>' +
            '<span class="bn-item__check" aria-hidden="true">' +
              '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="4 10 8.5 15 16 6"/>' +
              '</svg>' +
            '</span>' +
          '</div>';
        list.appendChild(li);
      });

      if (statNum) statNum.textContent = data.length;
    }
    observe(
      document.querySelector('.bn-ticker'),
      { threshold: 0.3 },
      (el) => el.classList.add('is-visible')
    );
    observe(
      document.querySelector('.bn-left'),
      { threshold: 0.15 },
      (el) => el.classList.add('is-visible')
    );
    const items = Array.from(document.querySelectorAll('.bn-item'));
    observeAll(
      items,
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
      (el, idx) => {
        el.style.transitionDelay = Math.min(idx * 60, 360) + 'ms';
        el.classList.add('is-visible');
      }
    );
  }

  fetch('api/public_contents.php?type=keuntungan', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data) && data.length) renderBenefits(data);
      else renderBenefits([]);
    })
    .catch(function() {
      observe(document.querySelector('.bn-ticker'), { threshold: 0.3 }, (el) => el.classList.add('is-visible'));
      observe(document.querySelector('.bn-left'), { threshold: 0.15 }, (el) => el.classList.add('is-visible'));
      const items = Array.from(document.querySelectorAll('.bn-item'));
      observeAll(items, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }, (el, idx) => {
        el.style.transitionDelay = Math.min(idx * 60, 360) + 'ms';
        el.classList.add('is-visible');
      });
    });

})();
/*Mentor*/
(function () {
  'use strict';

  const slider   = document.getElementById('mtrSlider');
  const dotsWrap = document.getElementById('mtrDots');
  const btnPrev  = document.getElementById('mtrPrev');
  const btnNext  = document.getElementById('mtrNext');
  const header   = document.querySelector('.mtr-header');

  if (!slider) return;

  let current    = 0;
  let isAnimating = false;
  let total      = 0;
  let dots       = [];

  function isMobile() { return window.innerWidth <= 600; }

  function buildDots(count) {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    dots = [];
    if (count <= 1) { dotsWrap.style.display = 'none'; return; }
    dotsWrap.style.display = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'mtr-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Mentor ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function updateButtons() {
    if (isMobile()) return;
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === total - 1;
  }

  function goTo(index) {
    if (isAnimating || index === current || isMobile()) return;
    isAnimating = true;
    current = Math.max(0, Math.min(index, total - 1));
    slider.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    updateButtons();
    setTimeout(() => { isAnimating = false; }, 580);
  }

  window.addEventListener('resize', () => {
    if (isMobile()) { slider.style.transform = ''; }
    else { slider.style.transform = 'translateX(-' + (current * 100) + '%)'; updateButtons(); }
  }, { passive: true });

  if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
  if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));

  let dragStartX = 0, dragging = false;
  slider.addEventListener('pointerdown', (e) => { dragStartX = e.clientX; dragging = true; });
  slider.addEventListener('pointerup',   (e) => {
    if (!dragging) return;
    dragging = false;
    const delta = e.clientX - dragStartX;
    if (Math.abs(delta) > 60) delta < 0 ? goTo(current + 1) : goTo(current - 1);
  });
  slider.addEventListener('pointercancel', () => { dragging = false; });

  document.addEventListener('keydown', (e) => {
    const section = document.getElementById('mentor');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  function reveal(el, opts, cb) {
    if (!el) return;
    new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cb(e.target);
        obs.unobserve(e.target);
      });
    }, opts).observe(el);
  }

  reveal(header, { threshold: 0.15 }, (el) => el.classList.add('is-visible'));

  function buildCheckItem(text) {
    return '<li>' +
      '<span class="mtr-check" aria-hidden="true">' +
        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="4 10 8.5 15 16 6"/>' +
        '</svg>' +
      '</span> ' + text +
    '</li>';
  }

  function renderCards(data) {
    slider.innerHTML = '';
    current = 0;
    total   = data.length;

    data.forEach((m) => {
      const fotoSrc = m.foto
        ? (m.foto.indexOf('/uploads/') === 0 ? '/mdgpt' + m.foto : m.foto)
        : 'assets/img/default-avatar.png';

      const exps = [m.exp1, m.exp2, m.exp3, m.exp4, m.exp5]
        .filter(Boolean)
        .map(buildCheckItem)
        .join('');

      const article = document.createElement('article');
      article.className = 'mtr-card';
      article.setAttribute('role', 'listitem');
      article.innerHTML =
        '<div class="mtr-card__photo">' +
          '<div class="mtr-card__photo-inner">' +
            '<img src="' + fotoSrc + '" alt="' + (m.nama || '') + '" loading="lazy" />' +
          '</div>' +
          '<div class="mtr-card__badge">' +
            '<span class="mtr-card__badge-title">' + (m.badge_title || '') + '</span>' +
            '<span class="mtr-card__badge-sub">'   + (m.badge_sub   || '') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="mtr-card__bio">' +
          '<div class="mtr-card__bio-top">' +
            (m.eyebrow ? '<p class="mtr-card__since">' + m.eyebrow + '</p>' : '') +
            '<h3 class="mtr-card__name">'    + (m.nama    || '') + '</h3>' +
            '<p  class="mtr-card__tagline">' + (m.subtext || '') + '</p>' +
          '</div>' +
          '<div class="mtr-card__divider"></div>' +
          '<div class="mtr-card__story"><p>' + (m.deskripsi || '') + '</p></div>' +
          (exps ? '<div class="mtr-card__divider"></div>' +
            '<div class="mtr-card__roles">' +
              '<p class="mtr-card__roles-label">Kini aktif sebagai</p>' +
              '<ul class="mtr-card__roles-list">' + exps + '</ul>' +
            '</div>' : '') +
        '</div>';

      slider.appendChild(article);
    });

    buildDots(total);
    updateButtons();

    Array.from(slider.querySelectorAll('.mtr-card')).forEach((card) => {
      reveal(card, { threshold: 0.05 }, (el) => el.classList.add('is-visible'));
    });
  }

  fetch('api/public_contents.php?type=mentor', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data) && data.length) {
        renderCards(data);
      } else {
        const existingCards = Array.from(slider.querySelectorAll('.mtr-card'));
        total = existingCards.length;
        buildDots(total);
        updateButtons();
        existingCards.forEach((card) => {
          reveal(card, { threshold: 0.05 }, (el) => el.classList.add('is-visible'));
        });
      }
    })
    .catch(function() {
      const existingCards = Array.from(slider.querySelectorAll('.mtr-card'));
      total = existingCards.length;
      buildDots(total);
      updateButtons();
      existingCards.forEach((card) => {
        reveal(card, { threshold: 0.05 }, (el) => el.classList.add('is-visible'));
      });
    });

})();
(function () {
  'use strict';

  const section = document.getElementById('pricing');
  if (!section) return;

  function reveal(el, opts, cb) {
    if (!el) return;
    new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cb(e.target);
        obs.unobserve(e.target);
      });
    }, opts).observe(el);
  }

  function esc(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function pillClass(val) {
    if (!val) return 'pr-type--regular';
    var v = val.toLowerCase();
    if (v.indexOf('early') !== -1) return 'pr-type--early';
    if (v.indexOf('regular') !== -1) return 'pr-type--regular';
    return 'pr-type--regular';
  }

  function isFeatured(idx) { return idx === 1; }

  function buildCard(item, idx) {
    const featured = isFeatured(idx);
    const saving   = (item.pill2 || '').trim();
    const ket1     = (item.keterangan1 || '').trim();
    const ket2     = (item.keterangan2 || '').trim();

    const perksHtml = (ket1 || ket2)
      ? '<ul class="pr-card__perks">' +
          (ket1 ? '<li><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 10 8.5 15 16 6"/></svg> ' + esc(ket1) + '</li>' : '') +
          (ket2 ? '<li><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 10 8.5 15 16 6"/></svg> ' + esc(ket2) + '</li>' : '') +
        '</ul>'
      : '';

    const btnClass = featured ? 'pr-btn pr-btn--primary' : 'pr-btn pr-btn--outline';

    const card = document.createElement('div');
    card.className = 'pr-card' + (featured ? ' pr-card--featured' : '');
    card.setAttribute('data-index', idx);
    card.innerHTML =
      (featured ? '<div class="pr-card__glow" aria-hidden="true"></div>' : '') +
      '<div class="pr-card__top">' +
        '<div class="pr-card__labels">' +
          '<span class="pr-card__segment">' + esc(item.judul || item.kategori || '') + '</span>' +
          '<span class="pr-card__type ' + pillClass(item.pill1) + '">' + esc(item.pill1 || item.tag || '') + '</span>' +
        '</div>' +
        (saving ? '<div class="pr-card__saving">' + esc(saving) + '</div>' : '') +
        '<div class="pr-card__price-block">' +
          '<span class="pr-card__currency">Rp</span>' +
          '<span class="pr-card__amount">' + esc(item.harga || '') + '</span>' +
          '<span class="pr-card__period">/tahun</span>' +
        '</div>' +
        '<p class="pr-card__desc">' + esc(item.subtext || '') + '</p>' +
      '</div>' +
      '<div class="pr-card__divider"></div>' +
      perksHtml +
      '<a href="member.html#registration" class="' + btnClass + '">Daftar Membership Sekarang!</a>';

    return card;
  }

  function initAnimations() {
    const cards = Array.from(section.querySelectorAll('.pr-card'));

    reveal(
      section.querySelector('.pr-header'),
      { threshold: 0.2 },
      (el) => el.classList.add('is-visible')
    );

    const cardObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const idx      = cards.indexOf(e.target);
        const featured = e.target.classList.contains('pr-card--featured');
        const delay    = featured ? 120 : idx * 80;
        e.target.style.transitionDelay = delay + 'ms';
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

    cards.forEach((c) => cardObs.observe(c));

    reveal(
      section.querySelector('.pr-note'),
      { threshold: 0.5 },
      (el) => el.classList.add('is-visible')
    );
  }

  function updateBenefitCount() {
    const noteEl = section.querySelector('.pr-note');
    if (!noteEl) return;
    const bnItems = document.querySelectorAll('.bn-item');
    if (bnItems.length > 0) {
      noteEl.innerHTML = noteEl.innerHTML.replace(
        /\d+\s*benefit/,
        bnItems.length + ' benefit'
      );
    }
  }

  const grid = section.querySelector('.pr-grid');
  if (grid) grid.innerHTML = '';

  fetch('api/public_contents.php?type=biaya', { cache: 'no-store' })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data) && data.length && grid) {
        data.forEach(function(item, idx) {
          grid.appendChild(buildCard(item, idx));
        });
      }
      initAnimations();
      setTimeout(updateBenefitCount, 800);
    })
    .catch(function() {
      initAnimations();
    });

})();
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx13w5fuGHozshr9xJrBj2z5SnW9ZPqn_SIr_O6shg3qqnhEgmmGGMWNybpdBZFuciMjg/exec";

// Tambahkan ini di bagian submit form yang sudah ada
// Cari: setTimeout(function () { ... showSuccessState(); }, 800);
// Ganti dengan kode submit di bawah ini

(function () {
  'use strict';

  var section = document.getElementById('registration');
  if (!section) return;

  function reveal(el, opts, cb) {
    if (!el) return;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cb(e.target);
        obs.unobserve(e.target);
      });
    }, opts).observe(el);
  }

  reveal(section.querySelector('.frm-header'), { threshold: 0.15 }, function (el) { el.classList.add('is-visible'); });
  reveal(section.querySelector('.frm-body'),   { threshold: 0.08 }, function (el) { el.classList.add('is-visible'); });

  var btn     = document.getElementById('referralBtn');
  var list    = document.getElementById('referralList');
  var valEl   = document.getElementById('referralValue');
  var hidden  = document.getElementById('referralHidden');
  var options = list ? Array.from(list.querySelectorAll('.frm-option')) : [];

  function closeDropdown() {
    if (!btn || !list) return;
    btn.setAttribute('aria-expanded', 'false');
    list.classList.remove('is-open');
  }

  function openDropdown() {
    if (!btn || !list) return;
    btn.setAttribute('aria-expanded', 'true');
    list.classList.add('is-open');
  }

  if (btn && list) {
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeDropdown() : openDropdown();
    });

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var val = opt.dataset.value;
        options.forEach(function (o) { o.classList.remove('is-selected'); });
        opt.classList.add('is-selected');
        if (valEl)  { valEl.textContent = opt.textContent; }
        if (hidden) { hidden.value = val; }
        btn.classList.add('has-value');
        var field = btn.closest('.frm-field');
        if (field) {
          field.classList.remove('is-error');
          var err = field.querySelector('.frm-error-msg');
          if (err) err.remove();
        }
        closeDropdown();
      });
    });

    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !list.contains(e.target)) closeDropdown();
    });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
      if (e.key === 'ArrowDown') { openDropdown(); if (options[0]) options[0].focus(); e.preventDefault(); }
    });

    list.addEventListener('keydown', function (e) {
      var focused = document.activeElement;
      var idx     = options.indexOf(focused);
      if (e.key === 'ArrowDown') { if (options[idx + 1]) options[idx + 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowUp')   { idx > 0 ? options[idx - 1].focus() : btn.focus(); e.preventDefault(); }
      if (e.key === 'Escape')    { closeDropdown(); btn.focus(); }
      if (e.key === 'Enter' || e.key === ' ') { if (focused) focused.click(); e.preventDefault(); }
    });

    options.forEach(function (opt) { opt.setAttribute('tabindex', '0'); });
  }

  var uploadZone    = document.getElementById('uploadZone');
  var uploadInput   = document.getElementById('buktiTF');
  var uploadPreview = document.getElementById('uploadPreview');
  var uploadName    = document.getElementById('uploadFileName');
  var uploadRemove  = document.getElementById('uploadRemove');
  var uploadContent = document.getElementById('uploadContent');

  function showFile(file) {
    if (!file || !uploadPreview || !uploadName) return;
    uploadName.textContent = file.name;
    uploadPreview.hidden   = false;
    if (uploadContent) uploadContent.hidden = true;
    if (uploadZone) uploadZone.classList.add('has-file');
    var field = uploadZone ? uploadZone.closest('.frm-field') : null;
    if (field) {
      field.classList.remove('is-error');
      var err = field.querySelector('.frm-error-msg');
      if (err) err.remove();
    }
  }

  function clearFile() {
    if (uploadInput)   uploadInput.value = '';
    if (uploadPreview) uploadPreview.hidden = true;
    if (uploadContent) uploadContent.hidden = false;
    if (uploadZone)    uploadZone.classList.remove('has-file');
  }

  if (uploadInput) {
    uploadInput.addEventListener('change', function () {
      var file = uploadInput.files && uploadInput.files[0];
      if (file) showFile(file);
    });
  }

  if (uploadRemove) {
    uploadRemove.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      clearFile();
    });
  }

  if (uploadZone) {
    uploadZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadZone.classList.add('is-dragover');
    });
    uploadZone.addEventListener('dragleave', function () {
      uploadZone.classList.remove('is-dragover');
    });
    uploadZone.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadZone.classList.remove('is-dragover');
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && uploadInput) {
        try {
          var dt = new DataTransfer();
          dt.items.add(file);
          uploadInput.files = dt.files;
        } catch (_) {}
        showFile(file);
      }
    });
  }

  var copyBtn   = document.getElementById('copyRek');
  var copyLabel = document.getElementById('copyLabel');
  var rekNum    = document.getElementById('rekNum');

  if (copyBtn && rekNum) {
    copyBtn.addEventListener('click', function () {
      var text = rekNum.textContent.replace(/\s/g, '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          copyBtn.classList.add('copied');
          if (copyLabel) copyLabel.textContent = 'Tersalin!';
          setTimeout(function () {
            copyBtn.classList.remove('copied');
            if (copyLabel) copyLabel.textContent = 'Salin';
          }, 2000);
        }).catch(function () {});
      }
    });
  }

  // ── FORM SUBMIT ──────────────────────────────────────
  var form = document.getElementById('regForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = validateForm(form);
      if (!valid) return;

      var submitBtn   = form.querySelector('.frm-submit');
      var submitLabel = submitBtn ? submitBtn.querySelector('span') : null;
      if (submitBtn)   submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Mengirim\u2026';

      var baseData = {
        sheetName: "Member",
        nama:      (document.getElementById('fullName')  || {}).value  ? document.getElementById('fullName').value.trim()  : "",
        email:     (document.getElementById('email')     || {}).value  ? document.getElementById('email').value.trim()     : "",
        whatsapp:  (document.getElementById('whatsapp')  || {}).value  ? document.getElementById('whatsapp').value.trim()  : "",
        pekerjaan: (document.getElementById('profesi')   || {}).value  ? document.getElementById('profesi').value.trim()   : "",
        instansi:  (document.getElementById('instansi')  || {}).value  ? document.getElementById('instansi').value.trim()  : "",
        domisili:  (document.getElementById('lokasi')    || {}).value  ? document.getElementById('lokasi').value.trim()    : "",
        source:    hidden ? hidden.value : "",
        program:   "Member"
      };

      var file = uploadInput && uploadInput.files && uploadInput.files[0];

      if (file) {
        var reader = new FileReader();
        reader.onload = function (ev) {
          var raw      = ev.target.result;
          var base64   = raw.split(",")[1];
          var mimeType = raw.split(";")[0].split(":")[1];

          var payload = Object.assign({}, baseData, {
            foto:     base64,
            fotoName: file.name,
            fotoMime: mimeType
          });

          kirimMember(payload, submitBtn, submitLabel);
        };
        reader.readAsDataURL(file);
      } else {
        kirimMember(baseData, submitBtn, submitLabel);
      }
    });
  }

  function kirimMember(payload, submitBtn, submitLabel) {
    fetch(APPS_SCRIPT_URL, {
      method:  "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body:    JSON.stringify(payload)
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (submitBtn)   submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Kirim Pendaftaran';

      if (res.success) {
        showSuccessState();
      } else {
        alert("Gagal mengirim: " + (res.error || "Unknown error"));
        console.error("Apps Script error:", res.error);
      }
    })
    .catch(function (err) {
      if (submitBtn)   submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Kirim Pendaftaran';
      alert("Koneksi gagal, coba lagi.");
      console.error("Fetch error:", err);
    });
  }
  // ─────────────────────────────────────────────────────

  function showSuccessState() {
    var cardHeader = section.querySelector('.frm-card__header');
    var formEl     = document.getElementById('regForm');
    var successEl  = document.getElementById('frmSuccess');
    if (!successEl) return;
    if (cardHeader) cardHeader.style.display = 'none';
    if (formEl)     formEl.style.display = 'none';
    successEl.removeAttribute("hidden");
    successEl.classList.add("is-visible");
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function validateForm(f) {
    var valid      = true;
    var firstErrEl = null;

    var textFields = [
      { id: 'fullName', msg: 'Nama lengkap wajib diisi' },
      { id: 'email',    msg: 'Email wajib diisi' },
      { id: 'whatsapp', msg: 'Nomor WhatsApp wajib diisi' },
      { id: 'profesi',  msg: 'Profesi wajib diisi' },
      { id: 'lokasi',   msg: 'Lokasi wajib diisi' }
    ];

    textFields.forEach(function (field) {
      var el = document.getElementById(field.id);
      if (!el) return;
      clearFieldError(el);
      if (!el.value.trim()) {
        showFieldError(el, field.msg);
        valid = false;
        if (!firstErrEl) firstErrEl = el;
      }
    });

    var emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim() && !isValidEmail(emailEl.value.trim())) {
      clearFieldError(emailEl);
      showFieldError(emailEl, 'Format email tidak valid');
      valid = false;
      if (!firstErrEl) firstErrEl = emailEl;
    }

    var refHidden = document.getElementById('referralHidden');
    var refField  = btn ? btn.closest('.frm-field') : null;
    if (refHidden && !refHidden.value) {
      if (refField) {
        refField.classList.add('is-error');
        if (!refField.querySelector('.frm-error-msg')) {
          refField.appendChild(makeErrEl('Pilih sumber informasi'));
        }
      }
      valid = false;
      if (!firstErrEl) firstErrEl = btn || refHidden;
    }

    var bukti      = document.getElementById('buktiTF');
    var buktiField = uploadZone ? uploadZone.closest('.frm-field') : null;
    if (bukti && (!bukti.files || bukti.files.length === 0)) {
      if (buktiField) {
        buktiField.classList.add('is-error');
        if (!buktiField.querySelector('.frm-error-msg')) {
          buktiField.appendChild(makeErrEl('Bukti transfer wajib diunggah'));
        }
      }
      valid = false;
      if (!firstErrEl) firstErrEl = uploadZone || bukti;
    }

    if (!valid && firstErrEl) {
      var top = firstErrEl.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: top, behavior: 'smooth' });
      setTimeout(function () {
        if (firstErrEl.focus) firstErrEl.focus();
      }, 400);
    }

    return valid;
  }

  function showFieldError(inputEl, message) {
    inputEl.classList.add('is-error');
    var parent = inputEl.closest('.frm-field');
    if (parent && !parent.querySelector('.frm-error-msg')) {
      parent.appendChild(makeErrEl(message));
    }
    inputEl.addEventListener('input', function onFix() {
      clearFieldError(inputEl);
      inputEl.removeEventListener('input', onFix);
    });
  }

  function clearFieldError(inputEl) {
    inputEl.classList.remove('is-error');
    var parent = inputEl.closest('.frm-field');
    if (!parent) return;
    var err = parent.querySelector('.frm-error-msg');
    if (err) err.remove();
    parent.classList.remove('is-error');
  }

  function makeErrEl(message) {
    var p = document.createElement('p');
    p.className = 'frm-error-msg';
    p.innerHTML = '<svg viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 4v3M6.5 9v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><span>' + escStr(message) + '</span>';
    return p;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function escStr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();