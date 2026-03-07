(function() {
    'use strict';
    const navbar      = document.getElementById('navbar');
    const hamburger   = document.getElementById('hamburger');
    const mobileMenu  = document.getElementById('mobileMenu');
    const navLinks    = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function handleScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let menuOpen = false;
    function toggleMenu() {
        menuOpen = !menuOpen;
        hamburger.classList.toggle('is-open', menuOpen);
        mobileMenu.classList.toggle('is-open', menuOpen);
        hamburger.setAttribute('aria-expanded', String(menuOpen));
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    }
    hamburger.addEventListener('click', toggleMenu);
    document.addEventListener('click', function(e) {
        if (menuOpen && !navbar.contains(e.target)) toggleMenu();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && menuOpen) toggleMenu();
    });
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && menuOpen) toggleMenu();
    });

    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            navLinks.forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
            const page = link.getAttribute('data-page');
            mobileLinks.forEach(function(ml) {
                ml.classList.toggle('active', ml.textContent.trim() === page);
            });
        });
    });
    mobileLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileLinks.forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
            const text = link.textContent.trim();
            navLinks.forEach(function(nl) {
                nl.classList.toggle('active', nl.getAttribute('data-page') === text);
            });
            setTimeout(toggleMenu, 200);
        });
    });

    // Wrap span buat animasi — pakai teks HTML asli dulu
    const ctaBtn       = document.querySelector('.btn-cta');
    const ctaBtnMobile = document.querySelector('.btn-cta-mobile');
    if (ctaBtn) ctaBtn.innerHTML = '<span>' + ctaBtn.textContent.trim() + '</span>';

    // Auto-prefix https://
    function fixLink(url) {
        if (!url || !url.trim()) return null;
        url = url.trim();
        if (/^https?:\/\//i.test(url) || /^\//.test(url)) return url;
        return 'https://' + url;
    }

    // ── CTA Navbar dari CMS ──────────────────────────────────────────
    const HREF_MAP = {
        'index.html':    'Beranda',
        'layanan.html':  'Layanan',
        'workshop.html': 'Webinar',
        'member.html':   'Member',
    };

    const activeLink  = document.querySelector('.nav-link.active');
    const activeHref  = activeLink ? activeLink.getAttribute('href') : null;
    const namaHalaman = activeHref ? (HREF_MAP[activeHref] || null) : null;

    if (namaHalaman) {
        fetch('api/public_contents.php?type=cta', { cache: 'no-store' })
            .then(function(r) { return r.json(); })
            .then(function(data) {
                if (!Array.isArray(data)) return;
                const row = data.find(function(d) { return d.halaman === namaHalaman; });
                if (!row) return;

                const teks = (row.textNavbar || '').trim();
                const link = fixLink(row.linkNavbar);

                // Hanya update kalau CMS ada isinya — kalau kosong biarkan HTML asli
                if (ctaBtn) {
                    if (teks) ctaBtn.innerHTML = '<span>' + teks + '</span>';
                    if (link) ctaBtn.href = link;
                }
                if (ctaBtnMobile) {
                    if (teks) ctaBtnMobile.textContent = teks;
                    if (link) ctaBtnMobile.href = link;
                }
            })
            .catch(function() { /* fallback HTML asli tetap */ });
    }

})();

(function() {
    'use strict';

    var btn = document.getElementById('ctaBtn');
    if (!btn) return;

    // Animasi shine
    var shine = btn.querySelector('.cta-shine');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                btn.style.animationPlayState = 'running';
                if (shine) shine.style.animationPlayState = 'running';
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });
    observer.observe(btn);

    // Auto-prefix https://
    function fixLink(url) {
        if (!url || !url.trim()) return null;
        url = url.trim();
        if (/^https?:\/\//i.test(url) || /^\//.test(url)) return url;
        return 'https://' + url;
    }

    // Deteksi halaman dari nav-link.active
    var HREF_MAP = {
        'index.html':    'Beranda',
        'layanan.html':  'Layanan',
        'workshop.html': 'Webinar',
        'member.html':   'Member',
    };
    var activeLink    = document.querySelector('.nav-link.active');
    var activeHref    = activeLink ? activeLink.getAttribute('href') : null;
    var namaHalaman   = activeHref ? (HREF_MAP[activeHref] || null) : null;

    if (!namaHalaman) return; // halaman tidak di-map, biarkan HTML asli

    fetch('api/public_contents.php?type=cta', { cache: 'no-store' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!Array.isArray(data)) return;
            var row = data.find(function(d) { return d.halaman === namaHalaman; });
            if (!row) return;

            var teks = (row.textFooter || '').trim();
            var link = fixLink(row.linkFooter);

            // Hanya update kalau CMS ada isinya
            if (teks) {
                var span = btn.querySelector('span');
                if (span) span.textContent = teks;
            }
            if (link) btn.href = link;
        })
        .catch(function() { /* fallback HTML asli */ });

})();