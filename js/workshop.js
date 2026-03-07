(function() {
  'use strict';

  function revealAll() {
    document.querySelectorAll('.hero__line').forEach(function(line, li) {
      line.querySelectorAll('.hero__word').forEach(function(word, wi) {
        setTimeout(function() {
          word.classList.add('is-visible');
        }, 120 + li * 150 + wi * 80);
      });
    });

    var sub = document.querySelector('.hero__sub');
    if (sub) setTimeout(function() { sub.classList.add('is-visible'); }, 680);

    var cta = document.querySelector('.hero__cta-row');
    if (cta) setTimeout(function() { cta.classList.add('is-visible'); }, 860);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealAll);
  } else {
    revealAll();
  }

  var btn = document.querySelector('.hero__btn');
  if (btn) {
    btn.addEventListener('mousemove', function(e) {
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.32;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.32;
      btn.style.transform = 'translate(' + dx + 'px, ' + (dy - 2) + 'px) scale(1.03)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
    });
  }
})();

let WEBINAR_DATA = [];

const ICONS = {
  star: `<svg viewBox="0 0 14 14" fill="none"><path d="M7 1l1.545 3.13 3.455.502-2.5 2.437.59 3.44L7 8.885l-3.09 1.624.59-3.44L2 4.632l3.455-.502L7 1z" fill="currentColor"/></svg>`,
  calendar: `<svg class="cat__meta-icon" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M1.5 6.5h13" stroke="currentColor" stroke-width="1.3"/><path d="M5 1.5v2M11 1.5v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
  tag: `<svg viewBox="0 0 12 12" fill="none"><path d="M1 1h4.5l5 5-4.5 4.5-5-5V1z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="3.5" cy="3.5" r="0.8" fill="currentColor"/></svg>`,
  ticket: `<svg class="cat__meta-icon" viewBox="0 0 16 16" fill="none"><path d="M1.5 5.5A1.5 1.5 0 013 4h10a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 010 3v1A1.5 1.5 0 0113 12H3a1.5 1.5 0 01-1.5-1.5v-1a1.5 1.5 0 010-3v-1z" stroke="currentColor" stroke-width="1.3"/></svg>`,
  imgPlaceholder: `<svg viewBox="0 0 48 48" fill="none"><rect x="4" y="4" width="40" height="40" rx="6" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="18" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 32l10-8 8 8 6-5 16 13" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`
};

let currentSearch = "";
let currentMonth  = "all";

function normalizeDate(str) {
  var bulan = {
    'januari':'01','februari':'02','maret':'03','april':'04',
    'mei':'05','juni':'06','juli':'07','agustus':'08',
    'september':'09','oktober':'10','november':'11','desember':'12'
  };
  str = (str || '').toLowerCase();
  for (var bln in bulan) {
    if (str.indexOf(bln) !== -1) {
      var yearMatch = str.match(/(\d{4})/);
      var year = yearMatch ? yearMatch[1] : '2099';
      var dayMatch = str.match(/(\d{1,2})/);
      var day = dayMatch ? dayMatch[1].padStart(2, '0') : '01';
      return year + '-' + bulan[bln] + '-' + day;
    }
  }
  return '2099-01-01';
}

function getMonthKey(dateStr) { return dateStr.slice(0, 7); }

function monthLabel(key) {
  const [year, month] = key.split("-");
  return new Date(+year, +month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function uniqueMonths(data) {
  return [...new Set(data.map(w => getMonthKey(w.date)))].sort();
}

function filteredData() {
  const q = currentSearch.toLowerCase().trim();
  return WEBINAR_DATA.filter(w => {
    const matchSearch = !q || w.title.toLowerCase().includes(q) || w.tag.toLowerCase().includes(q);
    const matchMonth  = currentMonth === "all" || getMonthKey(w.date) === currentMonth;
    return matchSearch && matchMonth;
  });
}

function attachImgLoad(wrap) {
  const img = wrap.querySelector('img');
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) {
    wrap.classList.add('img-loaded');
    return;
  }
  img.addEventListener('load',  function() { wrap.classList.add('img-loaded'); }, { once: true });
  img.addEventListener('error', function() { wrap.classList.add('img-loaded'); }, { once: true });
}

function renderCards() {
  const grid  = document.getElementById("catGrid");
  const empty = document.getElementById("catEmpty");
  if (!grid || !empty) return;

  const data = filteredData();
  grid.innerHTML = "";

  if (data.length === 0) {
    empty.hidden = false;
    grid.hidden  = true;
    return;
  }
  empty.hidden = true;
  grid.hidden  = false;

  const sorted = [...data].sort((a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0));
  const fragment = document.createDocumentFragment();

  sorted.forEach((w, i) => {
    const card     = document.createElement("article");
    card.className = "cat__card" + (w.best ? " cat__card--best" : "");
    card.style.animationDelay = `${i * 55}ms`;
    card.style.cursor = "pointer";

    if (w.best) {
      const badge     = document.createElement("div");
      badge.className = "cat__best-badge";
      badge.innerHTML = ICONS.star + " Terpopuler";
      card.appendChild(badge);
    }

    const imgWrap     = document.createElement("div");
    imgWrap.className = "cat__card-img-wrap";

    if (w.img) {
      const img    = document.createElement("img");
      img.alt      = w.title;
      img.loading  = "lazy";
      img.decoding = "async";
      img.width    = 400;
      img.height   = 500;
      img.src      = w.img;
      imgWrap.appendChild(img);
      attachImgLoad(imgWrap);
    } else {
      const ph     = document.createElement("div");
      ph.className = "cat__card-img-placeholder";
      ph.innerHTML = ICONS.imgPlaceholder;
      imgWrap.appendChild(ph);
      imgWrap.classList.add('img-loaded');
    }

    const body     = document.createElement("div");
    body.className = "cat__card-body";
    body.innerHTML = `
      <span class="cat__card-tag">${ICONS.tag} ${w.tag}</span>
      <h3 class="cat__card-title">${w.title}</h3>
      <div class="cat__card-meta">
        <div class="cat__meta-row">${ICONS.calendar}<span>${w.dateLabel}</span></div>
       <div class="cat__meta-row cat__meta-row--price">${ICONS.ticket}<span>${w.price}${w.htmSub ? ' <span style="font-size:0.8em;opacity:0.6">' + w.htmSub + '</span>' : ''}</span></div>
      </div>`;

    card.appendChild(imgWrap);
    card.appendChild(body);

    card.addEventListener("click", function() {
      window.location.href = `formulir.html?id=${w.id}`;
    });

    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function buildDropdown() {
  const dropdown = document.getElementById("catDropdown");
  const list     = document.getElementById("catDropdownList");
  const label    = document.getElementById("catDropdownLabel");
  const btn      = document.getElementById("catDropdownBtn");
  if (!dropdown || !list || !label || !btn) return;

  list.innerHTML = '';
  const months  = uniqueMonths(WEBINAR_DATA);
  const allItem = document.createElement("li");
  allItem.textContent = "Semua Bulan";
  allItem.setAttribute("role", "option");
  allItem.setAttribute("aria-selected", "true");
  allItem.dataset.value = "all";
  list.appendChild(allItem);

  months.forEach(key => {
    const li = document.createElement("li");
    li.textContent = monthLabel(key);
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");
    li.dataset.value = key;
    list.appendChild(li);
  });

  btn.addEventListener("click", function(e) {
    e.stopPropagation();
    const open = dropdown.getAttribute("aria-expanded") === "true";
    dropdown.setAttribute("aria-expanded", String(!open));
  });

  document.addEventListener("click", function() {
    dropdown.setAttribute("aria-expanded", "false");
  });

  list.addEventListener("click", function(e) {
    const li = e.target.closest("li");
    if (!li) return;
    const val    = li.dataset.value;
    currentMonth = val;
    list.querySelectorAll("li").forEach(el => el.setAttribute("aria-selected", "false"));
    li.setAttribute("aria-selected", "true");
    label.textContent = val === "all" ? "Semua Bulan" : monthLabel(val);
    dropdown.setAttribute("aria-expanded", "false");
    renderCards();
  });
}

function initSearch() {
  const input = document.getElementById("catSearch");
  const clear = document.getElementById("catSearchClear");
  if (!input || !clear) return;

  input.addEventListener("input", function() {
    currentSearch = input.value;
    clear.hidden  = !currentSearch;
    renderCards();
  });

  clear.addEventListener("click", function() {
    input.value   = "";
    currentSearch = "";
    clear.hidden  = true;
    input.focus();
    renderCards();
  });
}

function initEmptyReset() {
  const resetBtn = document.getElementById("catEmptyReset");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", function() {
    const input = document.getElementById("catSearch");
    const clear = document.getElementById("catSearchClear");
    if (input) input.value = "";
    currentSearch = "";
    if (clear) clear.hidden = true;
    currentMonth  = "all";
    const label = document.getElementById("catDropdownLabel");
    if (label) label.textContent = "Semua Bulan";
    document.querySelectorAll("#catDropdownList li").forEach(function(li, i) {
      li.setAttribute("aria-selected", i === 0 ? "true" : "false");
    });
    renderCards();
  });
}

(function init() {
  fetch("api/public_contents.php?type=webinar", { cache: "no-store" })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!Array.isArray(data)) data = [];

      WEBINAR_DATA = data.map(function(w) {
        return {
          id:        w.id,
          best:      w.status === 'Prioritas',
          tag:       w.tag || w.status || '—',
          title:     w.judul   || '—',
          type:      'Webinar',
          date:      normalizeDate(w.tanggal),
          dateLabel: w.tanggal || '—',
          price:     w.htm     || 'Gratis',
          htmSub:    w.htmSub || '',
         img: w.foto ? w.foto : '',
        };
      });

      buildDropdown();
      initSearch();
      initEmptyReset();
      renderCards();
    })
    .catch(function() {
      WEBINAR_DATA = [];
      buildDropdown();
      initSearch();
      initEmptyReset();
      renderCards();
    });
})();

(function initTesti() {
  const track   = document.getElementById('testiTrack');
  const btnPrev = document.getElementById('testiBtnPrev');
  const btnNext = document.getElementById('testiBtnNext');
  const progFill= document.getElementById('testiProgressFill');
  const section = document.getElementById('testi');

  if (!track || !btnPrev || !btnNext || !progFill || !section) return;

  function getInitials(name) {
    if (!name) return '??';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function buildCards(data) {
    track.innerHTML = '';
    data.forEach(function(item, idx) {
      var article = document.createElement('article');
      article.className = 'testi__card' + (idx === 2 ? ' testi__card--featured' : '');
      article.innerHTML =
        '<blockquote class="testi__text">"' + (item.ulasan || '') + '"</blockquote>' +
        '<footer class="testi__footer">' +
          '<div class="testi__avatar" aria-hidden="true">' + getInitials(item.nama) + '</div>' +
          '<div class="testi__meta">' +
            '<p class="testi__name">' + (item.nama || '') + '</p>' +
            '<p class="testi__role">' + (item.jabatan || '') + '</p>' +
          '</div>' +
        '</footer>';
      track.appendChild(article);
    });
  }

  function startSlider() {
    var cards = Array.from(track.querySelectorAll('.testi__card'));
    var GAP   = 20;
    var current = 0;
    var isDragging = false;
    var startX = 0;
    var startScroll = 0;

    function getCardWidth() { return cards[0] ? cards[0].offsetWidth + GAP : 380; }
    function visibleCount() {
      var sliderW = track.parentElement.offsetWidth;
      return Math.max(1, Math.floor(sliderW / getCardWidth()));
    }
    function maxIndex() { return Math.max(0, cards.length - visibleCount()); }
    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      track.style.transform = 'translateX(-' + (current * getCardWidth()) + 'px)';
      updateUI();
    }
    function updateUI() {
      var max = maxIndex();
      btnPrev.disabled = current === 0;
      btnNext.disabled = current >= max;
      progFill.style.width = (max > 0 ? (current / max) * 100 : 100) + '%';
    }

    btnPrev.addEventListener('click', function() { goTo(current - 1); });
    btnNext.addEventListener('click', function() { goTo(current + 1); });

    section.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    function onDragStart(x) {
      isDragging = true; startX = x;
      startScroll = current * getCardWidth();
      track.style.transition = 'none';
    }
    function onDragMove(x) {
      if (!isDragging) return;
      var delta = startX - x;
      var raw   = startScroll + delta;
      var maxPx = maxIndex() * getCardWidth();
      track.style.transform = 'translateX(-' + Math.max(0, Math.min(raw, maxPx)) + 'px)';
    }
    function onDragEnd(x) {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      var delta = startX - x;
      goTo(Math.abs(delta) > 60 ? (delta > 0 ? current + 1 : current - 1) : current);
    }

    track.addEventListener('mousedown', function(e) { onDragStart(e.clientX); });
    window.addEventListener('mousemove', function(e) { if (isDragging) onDragMove(e.clientX); });
    window.addEventListener('mouseup',   function(e) { onDragEnd(e.clientX); });
    track.addEventListener('touchstart', function(e) { onDragStart(e.touches[0].clientX); }, { passive: true });
    track.addEventListener('touchmove',  function(e) { if (isDragging) onDragMove(e.touches[0].clientX); }, { passive: true });
    track.addEventListener('touchend',   function(e) { onDragEnd(e.changedTouches[0].clientX); });

    window.addEventListener('resize', function() { goTo(Math.min(current, maxIndex())); });

    var animTargets = [
      section.querySelector('.testi__head'),
      section.querySelector('.testi__slider'),
      section.querySelector('.testi__controls'),
    ].filter(Boolean);

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    animTargets.forEach(function(el) { observer.observe(el); });

    var cardObserver = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        cards.forEach(function(card, i) {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(24px)';
          card.style.transition = 'opacity 0.5s ease ' + (i * 0.07) + 's, transform 0.5s ease ' + (i * 0.07) + 's';
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              card.style.opacity   = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        });
        cardObserver.disconnect();
      }
    }, { threshold: 0.1 });

    cardObserver.observe(section);
    goTo(0);
  }

  fetch("api/public_contents.php?type=testimoniB", { cache: "no-store" })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (Array.isArray(data) && data.length) buildCards(data);
      startSlider();
    })
    .catch(function() { startSlider(); });

})();

(function initFaq() {
  'use strict';

  function buildFaq(data) {
    var list = document.querySelector('.faq-list');
    if (!list || !Array.isArray(data) || !data.length) return;

    list.innerHTML = '';
    data.forEach(function(item, i) {
      var panelId = 'faq-panel-' + (i + 1);
      var div = document.createElement('div');
      div.className = 'faq-item';
      div.innerHTML =
        '<button class="faq-trigger" aria-expanded="false" aria-controls="' + panelId + '">' +
          '<span class="faq-trigger__q">' + (item.headline || '') + '</span>' +
          '<span class="faq-trigger__icon" aria-hidden="true">' +
            '<svg width="18" height="18" viewBox="0 0 18 18" fill="none">' +
              '<path d="M3.75 9H14.25M9 3.75L14.25 9L9 14.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>' +
          '</span>' +
        '</button>' +
        '<div class="faq-panel" id="' + panelId + '" role="region">' +
          '<div class="faq-panel__inner">' +
            '<p>' + (item.subheadline || '') + '</p>' +
          '</div>' +
        '</div>';
      list.appendChild(div);
    });
  }

  function init() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function(item) {
      item.classList.remove('is-open');
      var btn   = item.querySelector('.faq-trigger');
      var panel = item.querySelector('.faq-panel');
      if (btn)   btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.classList.remove('is-open');
    });

    document.querySelectorAll('.faq-trigger').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var item    = btn.closest('.faq-item');
        var panelId = btn.getAttribute('aria-controls');
        var panel   = document.getElementById(panelId);
        var isOpen  = item.classList.contains('is-open');

        document.querySelectorAll('.faq-item.is-open').forEach(function(o) {
          o.classList.remove('is-open');
          var ob = o.querySelector('.faq-trigger');
          if (ob) ob.setAttribute('aria-expanded', 'false');
          var op = o.querySelector('.faq-panel');
          if (op) op.classList.remove('is-open');
        });

        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (panel) panel.classList.add('is-open');
        }
      });
    });
  }

  function start() {
    fetch("api/public_contents.php?type=faq", { cache: "no-store" })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (Array.isArray(data) && data.length) buildFaq(data);
        init();
      })
      .catch(function() { init(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
