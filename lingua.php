<?php
require __DIR__ . '/config/supabase.php';

$bannerUtama   = fetchLinguaSection('banner_utama');
$bannerCards   = fetchLinguaSection('banner_cards');
$campaignCards = fetchLinguaSection('campaign_card');

function lg_val($data, string $key, string $default): string
{
    if (is_array($data) && !empty($data[$key])) {
        return lg_e($data[$key]);
    }
    return $default;
}

function lg_card_val($cards, int $index, string $key, string $default): string
{
    if (is_array($cards) && isset($cards[$index][$key]) && $cards[$index][$key] !== '') {
        return lg_e($cards[$index][$key]);
    }
    return $default;
}

function lg_card_url($cards, int $index, string $key, string $default): string
{
    $val = (is_array($cards) && isset($cards[$index][$key]) && $cards[$index][$key] !== '')
        ? $cards[$index][$key]
        : $default;
    return lg_e($val);
}

$campaignDefaults = [
    [
        'headline' => 'Promo Spesial Bulan Ini',
        'subheadline' => 'Diskon menarik untuk produk digital pilihan, terbatas!',
        'ctaText' => 'Lihat Promo',
        'ctaUrl' => '/lingua/index.html',
        'image' => 'assets/img/cta.png',
    ],
    [
        'headline' => 'Gabung Jadi Affiliate',
        'subheadline' => 'Dapatkan komisi di setiap transaksi yang kamu bawa.',
        'ctaText' => 'Daftar Sekarang',
        'ctaUrl' => '/lingua/affiliate',
        'image' => 'assets/img/cta.png',
    ],
];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lingua Store - Template, Ebook & Tools Digital | M-DGPT Agency</title>
    <meta name="description" content="Belanja template konten, ebook strategi, dan tools otomasi digital siap pakai dari M-DGPT Agency. Produk original, instant download, update berkala, support cepat." />
    <link rel="canonical" href="https://mdgpt.id/lingua" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Lingua Store - M-DGPT Agency" />
    <meta property="og:title" content="Lingua Store - Template, Ebook & Tools Digital | M-DGPT Agency" />
    <meta property="og:description" content="Belanja template konten, ebook strategi, dan tools otomasi digital siap pakai dari M-DGPT Agency. Produk original, instant download, update berkala, support cepat." />
    <meta property="og:url" content="https://mdgpt.id/lingua" />
    <meta property="og:image" content="https://mdgpt.id/assets/img/cta.png" />
    <meta property="og:locale" content="id_ID" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Lingua Store - Template, Ebook & Tools Digital | M-DGPT Agency" />
    <meta name="twitter:description" content="Belanja template konten, ebook strategi, dan tools otomasi digital siap pakai dari M-DGPT Agency. Produk original, instant download, update berkala, support cepat." />
    <meta name="twitter:image" content="https://mdgpt.id/assets/img/cta.png" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      "name": "Lingua Store",
      "url": "https://mdgpt.id/lingua",
      "logo": "https://mdgpt.id/assets/icons/logo.png",
      "description": "Template konten, ebook strategi, dan tools otomasi siap pakai untuk brand yang serius growth.",
      "parentOrganization": {
        "@type": "Organization",
        "name": "CV Indomarketing Digital Teknologi",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Jl. Simo Gn. Bar. Tol I No.7, Simomulyo",
          "addressLocality": "Surabaya",
          "addressRegion": "Jawa Timur",
          "addressCountry": "ID"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+62-877-7722-2572",
          "contactType": "customer service"
        },
        "sameAs": [
          "https://www.instagram.com/mdgpt_agency/",
          "https://www.linkedin.com/company/m-dgpt-agency"
        ]
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Apakah produk di Lingua Store original?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ya, semua produk dibuat langsung oleh tim M-DGPT Agency dan bukan hasil duplikasi dari pihak lain."
          }
        },
        {
          "@type": "Question",
          "name": "Berapa lama produk digital dikirim setelah checkout?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Produk digital tersedia untuk diunduh langsung setelah proses checkout selesai."
          }
        },
        {
          "@type": "Question",
          "name": "Apakah ada update setelah pembelian?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Produk mengikuti update berkala sesuai perkembangan tren terbaru."
          }
        },
        {
          "@type": "Question",
          "name": "Bagaimana cara menghubungi support jika ada kendala?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tim support merespon dalam hitungan jam melalui WhatsApp di 0877 7722 2572."
          }
        }
      ]
    }
    </script>
    <script>
    (function () {
      var loaded = false;
      function loadPixel() {
        if (loaded) return;
        loaded = true;
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '1577130400783020');
        fbq('track', 'PageView');
        events.forEach(function (ev) { window.removeEventListener(ev, loadPixel); });
      }
      var events = ["scroll", "mousemove", "touchstart", "keydown", "click"];
      events.forEach(function (ev) { window.addEventListener(ev, loadPixel, { passive: true, once: true }); });
      window.addEventListener("load", function () {
        setTimeout(function () {
          if ("requestIdleCallback" in window) {
            requestIdleCallback(loadPixel, { timeout: 4000 });
          } else {
            loadPixel();
          }
        }, 2500);
      });
    })();
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1577130400783020&ev=PageView&noscript=1"
    /></noscript>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="icon" href="assets/icons/logo.png" type="image/png">

    <style id="critical-css">
*,
*::before,
*::after {
   box-sizing: border-box;
   margin: 0;
   padding: 0;
}

:root {
   --grad-1: #a91ab6;
   --grad-2: #b104ff;
   --grad-3: #393df5;
   --grad-4: #047bfe;
   --gradient: linear-gradient(
      90deg,
      var(--grad-1),
      var(--grad-2),
      var(--grad-3),
      var(--grad-4)
   );
   --gradient-diag: linear-gradient(
      135deg,
      var(--grad-1),
      var(--grad-2),
      var(--grad-3),
      var(--grad-4)
   );
   --brand: var(--grad-1);
   --brand-mid: var(--grad-2);
   --brand-blue: var(--grad-3);
   --brand-azure: var(--grad-4);
   --white: #ffffff;
   --gray-50: #fafafa;
   --gray-100: #f4f4f5;
   --gray-200: #e4e4e7;
   --gray-300: #d1d5db;
   --gray-600: #4b5563;
   --gray-900: #111827;
   --color-headline: #000000;
   --color-text: var(--gray-900);
   --color-muted: var(--gray-600);
   --bg: #ffffff;
   --fg: #000000;
   --fg-muted: var(--gray-600);
   --border: rgba(0, 0, 0, 0.08);
   --nav-height: 68px;
   --drawer-w: 300px;
   --radius: 6px;
   --radius-pill: 999px;
   --radius-md: 12px;
   --shadow-nav: 0 4px 18px rgba(0, 0, 0, 0.08);
   --shadow-nav-scrolled: 0 8px 26px rgba(0, 0, 0, 0.1);
   --shadow-drawer: 8px 0 28px rgba(0, 0, 0, 0.14);
   --font: "Raleway", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
   --font-display: var(--font);
   --font-body: var(--font);
   --transition: 0.18s ease;
   --transition-slow: 0.28s ease;
   --page-max: 1300px;
   --page-pad: 18px;
}

html {
   scroll-behavior: smooth;
   overflow-x: hidden;
}

body {
   font-family: var(--font);
   background: var(--bg);
   color: var(--color-text);
   -webkit-font-smoothing: antialiased;
   overflow-x: hidden;
}

button, input, textarea, select {
  font-family: inherit;
}

:focus-visible {
   outline: 2.5px solid var(--brand);
   outline-offset: 3px;
   border-radius: 4px;
}

.page {

.navbar {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   z-index: 10000;

   background: rgba(255, 255, 255, 0.92);

   border-bottom: 1px solid var(--border);
   transition: box-shadow var(--transition), background var(--transition);
}

.navbar.scrolled {
   box-shadow: var(--shadow-nav-scrolled);
   background: rgba(255, 255, 255, 0.98);
}

.nav-inner {
   max-width: 1200px;
   margin: 0 auto;
   padding: 0 32px;
   height: var(--nav-height);

   display: flex;
   align-items: center;
   gap: 0;
}

.nav-logo {
   display: flex;
   align-items: center;
   gap: 10px;
   text-decoration: none;
   color: var(--color-headline);
   flex-shrink: 0;
   transition: opacity var(--transition);
}

.nav-logo:hover {
   opacity: 0.85;
}
.logo-img {
   height: 48px;
   width: 85px;
   display: block;
   transition: transform var(--transition-slow);
}

.nav-logo:hover .logo-img {
   transform: scale(1.04);
}

.nav-links {
   display: flex;
   align-items: center;
   gap: 4px;
   list-style: none;
   margin: 0 auto;
}

.nav-link {
   font-family: var(--font);
   font-size: 14px;
   font-weight: 500;
   color: var(--color-muted);
   text-decoration: none;
   padding: 7px 14px;
   border-radius: var(--radius);
   position: relative;
   transition: color var(--transition), background var(--transition);
   white-space: nowrap;
}

.nav-link::after {
   content: "";
   position: absolute;
   left: 0;
   bottom: -2px;
   width: 100%;
   height: 2px;
   background: var(--gradient);
   transform: scaleX(0);
   transform-origin: left;
   transition: transform 0.25s ease;
}

.nav-link:hover {
   color: var(--brand);
   background: rgba(169, 26, 182, 0.05);
}

.nav-link.active {
   color: var(--brand);
   font-weight: 500;
}

.nav-link.active::after {
   transform: scaleX(1);
}

.nav-cta {
   flex-shrink: 0;
   margin-left: 24px;
}

.btn-cta {
   display: inline-flex;
   align-items: center;
   font-family: var(--font);
   font-size: 13px;
   font-weight: 600;
   letter-spacing: 0.01em;
   color: #fff;
   background: var(--gradient);
   background-size: 200% 100%;
   background-position: 0% 50%;
   text-decoration: none;
   padding: 10px 22px;
   border-radius: var(--radius-pill);
   border: none;
   transition: background-position 0.35s ease, transform var(--transition),
      box-shadow var(--transition);
   position: relative;
   overflow: hidden;
   will-change: transform;
}

.btn-cta:hover {
   background-position: 100% 50%;
   box-shadow: 0 10px 18px rgba(169, 26, 182, 0.22);
   transform: translate3d(0, -1px, 0);
}

.btn-cta span {
   position: relative;
   z-index: 1;
}

.hamburger {
   display: none;
   flex-direction: column;
   gap: 5px;
   background: none;
   border: none;
   cursor: pointer;
   padding: 8px;
   border-radius: var(--radius);
   margin-left: auto;
   transition: background var(--transition);
}

.hamburger:hover {
   background: rgba(169, 26, 182, 0.06);
}

.hamburger span {
   display: block;
   width: 22px;
   height: 2px;
   background: var(--color-headline);
   border-radius: 2px;
   transform-origin: center;
   transition: transform var(--transition), opacity var(--transition);
}

.hamburger.is-open span:nth-child(1) {
   transform: translateY(7px) rotate(45deg);
   background: var(--brand);
}
.hamburger.is-open span:nth-child(2) {
   opacity: 0;
   transform: scaleX(0);
}
.hamburger.is-open span:nth-child(3) {
   transform: translateY(-7px) rotate(-45deg);
   background: var(--brand);
}

.mobile-menu {
   display: none;
   border-top: 1px solid var(--border);
   overflow: hidden;
   max-height: 0;
   opacity: 0;
   transition: max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}

.mobile-menu.is-open {
   max-height: 420px;
   opacity: 1;
}

.mobile-links {
   list-style: none;
   padding: 12px 20px;
}

.mobile-links li {
   opacity: 0;
   transform: translate3d(0, -6px, 0);
   transition: opacity 0.18s ease, transform 0.18s ease;
}

.mobile-menu.is-open .mobile-links li {
   opacity: 1;
   transform: translate3d(0, 0, 0);
}

.mobile-menu.is-open .mobile-links li:nth-child(1) {
   transition-delay: 0.04s;
}
.mobile-menu.is-open .mobile-links li:nth-child(2) {
   transition-delay: 0.08s;
}
.mobile-menu.is-open .mobile-links li:nth-child(3) {
   transition-delay: 0.12s;
}
.mobile-menu.is-open .mobile-links li:nth-child(4) {
   transition-delay: 0.16s;
}
.mobile-menu.is-open .mobile-links li:nth-child(5) {
   transition-delay: 0.2s;
}

.mobile-link {
   display: block;
   font-family: var(--font);
   font-size: 15px;
   font-weight: 500;
   color: var(--color-muted);
   text-decoration: none;
   padding: 13px 12px;
   border-radius: var(--radius);
   border-bottom: 1px solid var(--border);
   transition: color var(--transition), background var(--transition);
}

.mobile-links li:last-child .mobile-link {
   border-bottom: none;
}

.mobile-link:hover {
   color: var(--brand);
   background: rgba(169, 26, 182, 0.04);
}

.mobile-link.active {
   color: var(--brand);
   font-weight: 700;
   background: rgba(169, 26, 182, 0.05);
}

.mobile-cta {
   padding: 12px 20px 20px;
   opacity: 0;
   transform: translate3d(0, -6px, 0);
   transition: opacity 0.18s ease 0.2s, transform 0.18s ease 0.2s;
}

.mobile-menu.is-open .mobile-cta {
   opacity: 1;
   transform: translate3d(0, 0, 0);
}

.navbar--hero {
   background: transparent;
   border-bottom: 1px solid transparent;
   box-shadow: none;
   transition: background var(--transition), box-shadow var(--transition),
      border-color var(--transition);
}

.navbar--hero:not(.scrolled) .nav-link {
   color: rgba(255, 255, 255, 0.88);
}

.navbar--hero:not(.scrolled) .nav-link:hover {
   color: #fff;
   background: rgba(255, 255, 255, 0.12);
}

.navbar--hero:not(.scrolled) .nav-link.active {
   color: #fff;
}

.navbar--hero:not(.scrolled) .nav-link.active::after {
   background: #fff;
}

.navbar--hero:not(.scrolled) .nav-logo {
   color: #fff;
}

.navbar--hero:not(.scrolled) .logo-img {
   filter: brightness(0) invert(1);
}

.navbar--hero:not(.scrolled) .hamburger {
   background: transparent !important;
   border-color: transparent !important;
}

.navbar--hero:not(.scrolled) .hamburger span {
   background: #fff;
}

.navbar--hero:not(.scrolled) .hamburger:hover {
   background: rgba(255, 255, 255, 0.16) !important;
}

.navbar--hero:not(.scrolled) .mobile-menu {
   background: rgba(255, 255, 255, 0.98);
}

.navbar--hero:has(.mobile-menu.is-open) {
   background: rgba(255, 255, 255, 0.98);
   border-bottom-color: var(--border);
}

.navbar--hero:has(.mobile-menu.is-open) .nav-logo {
   color: var(--color-headline);
}

.navbar--hero:has(.mobile-menu.is-open) .logo-img {
   filter: none;
}

.navbar--hero:has(.mobile-menu.is-open) .hamburger {
   background: transparent;
}

.navbar--hero:has(.mobile-menu.is-open) .hamburger:hover {
   background: rgba(169, 26, 182, 0.06);
}

.navbar--hero:has(.mobile-menu.is-open) .hamburger span {
   background: var(--color-headline);
}

.navbar--hero:has(.mobile-menu.is-open) .hamburger.is-open span:nth-child(1),
.navbar--hero:has(.mobile-menu.is-open) .hamburger.is-open span:nth-child(3) {
   background: var(--brand);
}

.navbar--hero:not(.scrolled) .btn-cta {
   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.hero {
   position: relative;
   overflow: hidden;
   background:
      linear-gradient(135deg, rgba(88, 20, 120, 0.82), rgba(20, 12, 40, 0.78)),
      url("../assets/img/herolingua.avif") center / cover no-repeat;
   padding: calc(var(--nav-height) + 64px) 0 0;
   color: #fff;
}

.hero__inner {
   position: relative;
   z-index: 1;
   max-width: 1200px;
   margin: 0 auto;
   padding: 0 32px 100px;
}

.hero__content {
   max-width: 640px;
}

.hero__eyebrow {
   display: inline-flex;
   align-items: center;
   gap: 8px;
   font-size: 12.5px;
   font-weight: 600;
   letter-spacing: 0.04em;
   color: #fff;
   background: rgba(255, 255, 255, 0.14);
   border: 1px solid rgba(255, 255, 255, 0.28);
   padding: 7px 14px;
   border-radius: var(--radius-pill);
   margin-bottom: 22px;
}

.hero__eyebrow::before {
   content: "";
   width: 6px;
   height: 6px;
   border-radius: 50%;
   background: #fff;
   flex-shrink: 0;
}

.hero__title {
   font-family: var(--font-display);
   font-weight: 800;
   font-size: clamp(32px, 4.6vw, 52px);
   line-height: 1.12;
   letter-spacing: -0.01em;
   margin-bottom: 20px;
}

.hero__title-accent {
   background: linear-gradient(90deg, #ffe08a, #fff);
   -webkit-background-clip: text;
   background-clip: text;
   color: transparent;
}

.hero__desc {
   font-size: 16px;
   line-height: 1.65;
   color: rgba(255, 255, 255, 0.86);
   max-width: 480px;
   margin-bottom: 32px;
}

.hero__actions {
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: 14px;
   margin-bottom: 40px;
}

.hero__actions .btn-cta,
.hero__actions .hero__btn-secondary {
   padding: 14px 30px;
   border-radius: var(--radius-md);
   font-size: 14px;
   line-height: 1;
}

.hero__btn-secondary {
   display: inline-flex;
   align-items: center;
   font-family: var(--font);
   font-weight: 700;
   color: var(--gray-900);
   text-decoration: none;
   background: #fff;
   border: none;
   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
   transition: background var(--transition), transform var(--transition), box-shadow var(--transition);
}

.hero__btn-secondary:hover {
   background: #fff;
   transform: translateY(-1px);
   box-shadow: 0 12px 26px rgba(0, 0, 0, 0.22);
}

.hero__trust {
   position: relative;
   z-index: 2;
   max-width: 1140px;
   margin: 0 auto;
   padding: 0 var(--page-pad);
   transform: translateY(-40px);
}

.hero__trust-inner {
   background: #fff;
   border-radius: var(--radius-md);
   box-shadow: var(--shadow-nav-scrolled);
   display: grid;
   grid-template-columns: repeat(4, 1fr);
}

.hero__trust-item {
   display: flex;
   align-items: center;
   gap: 12px;
   padding: 20px 24px;
   border-right: 1px solid var(--border);
}

.hero__trust-item:last-child {
   border-right: none;
}

.hero__trust-icon {
   flex-shrink: 0;
   width: 38px;
   height: 38px;
   border-radius: 10px;
   display: flex;
   align-items: center;
   justify-content: center;
   background: rgba(169, 26, 182, 0.08);
   color: var(--brand);
}

.hero__trust-text strong {
   display: block;
   font-size: 13.5px;
   font-weight: 700;
   color: var(--color-headline);
   margin-bottom: 2px;
}

.hero__trust-text span {
   font-size: 12px;
   color: var(--color-muted);
}

@media (max-width: 1024px) {
   .hero__trust-inner {
      grid-template-columns: repeat(2, 1fr);
   }
   .hero__trust-item:nth-child(2) {
      border-right: none;
   }
   .hero__trust-item:nth-child(odd) {
      border-right: 1px solid var(--border);
   }
}

@media (max-width: 900px) {

.nav-search {
   flex-shrink: 0;
}

.nav-search__form {
   display: flex;
   align-items: center;
   gap: 8px;
   background: var(--gray-100);
   border: 1px solid var(--border);
   border-radius: var(--radius-pill);
   padding: 9px 16px;
   transition: background var(--transition), border-color var(--transition);
}

.nav-search__form:focus-within {
   border-color: var(--brand);
}

.nav-search__icon {
   flex-shrink: 0;
   color: var(--color-muted);
}

.nav-search__input {
   width: 190px;
   max-width: 100%;
   border: none;
   outline: none;
   background: transparent;
   font-family: var(--font);
   font-size: 13.5px;
   color: var(--gray-900);
}

.nav-search__input::placeholder {
   color: var(--color-muted);
}

.navbar--hero:not(.scrolled) .nav-search__form {
   background: rgba(255, 255, 255, 0.14);
   border-color: rgba(255, 255, 255, 0.32);
}

.navbar--hero:not(.scrolled) .nav-search__form:focus-within {
   background: rgba(255, 255, 255, 0.2);
   border-color: #fff;
}

.navbar--hero:not(.scrolled) .nav-search__icon {
   color: rgba(255, 255, 255, 0.75);
}

.navbar--hero:not(.scrolled) .nav-search__input {
   color: #fff;
}

.navbar--hero:not(.scrolled) .nav-search__input::placeholder {
   color: rgba(255, 255, 255, 0.65);
}

@media (max-width: 900px) {
   .nav-search {
      display: none;
   }
}

.nav-cart {
   flex-shrink: 0;
   position: relative;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: 38px;
   height: 38px;
   margin-left: 10px;
   border-radius: 50%;
   border: 1px solid var(--brand);
   background: #fff;
   color: var(--brand);
   text-decoration: none;
   cursor: pointer;
   transition: border-color var(--transition), background var(--transition), color var(--transition);
}

.nav-cart:hover {
   background: var(--brand);
   color: #fff;
}

.nav-cart__count {
   position: absolute;
   top: -5px;
   right: -5px;
   display: inline-flex;
   align-items: center;
   justify-content: center;
   min-width: 16px;
   height: 16px;
   padding: 0 4px;
   border-radius: var(--radius-pill);
   background: var(--gradient);
   color: #fff;
   font-size: 10px;
   font-weight: 700;
   line-height: 1;
}

.nav-cart__count[hidden] {
   display: none;
}

.navbar--hero:not(.scrolled) .nav-cart {
   border-color: rgba(255, 255, 255, 0.55);
   background: rgba(255, 255, 255, 0.14);
   color: #fff;
}

.navbar--hero:not(.scrolled) .nav-cart:hover {
   background: #fff;
    </style>

    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Raleway:wght@500;600;700;800&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Raleway:wght@500;600;700;800&display=swap"></noscript>

    <link rel="preload" href="css/global.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="css/global.css"></noscript>

    <link rel="preload" href="css/store.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="css/store.css"></noscript>

    <link rel="preload" as="image" href="assets/img/herolingua.avif" fetchpriority="high">
    <link rel="preload" as="image" href="assets/icons/logo.png">
  </head>
  <body>
    <nav class="navbar navbar--hero" id="navbar">
      <div class="nav-inner">
        <a href="index" class="nav-logo" aria-label="Home">
          <img src="assets/icons/logo.png" alt="Logo" class="logo-img" width="48" height="48" />
        </a>
        <ul class="nav-links" id="navLinks">
          <li>
            <a href="index" class="nav-link" data-page="Overview">Beranda</a>
          </li>
          <li>
            <a href="layanan" class="nav-link" data-page="Solutions">Layanan</a>
          </li>
          <li>
            <a href="workshop" class="nav-link" data-page="Platform">Webinar & Workshop</a>
          </li>
          <li>
            <a href="member" class="nav-link" data-page="Resources">Member</a>
          </li>
          <li>
            <a href="lingua" class="nav-link active" data-page="Resources">Store</a>
          </li>
        </ul>
        <div class="nav-search">
          <form class="nav-search__form" role="search" action="#" method="get">
            <svg class="nav-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input type="search" name="q" class="nav-search__input" placeholder="Cari produk digital..." aria-label="Cari produk" />
          </form>
        </div>
        <a href="lingua/cart.html" class="nav-cart" id="navCartBtn" aria-label="Keranjang belanja">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span class="nav-cart__count" id="navCartCount" hidden>0</span>
        </a>
        <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        <ul class="mobile-links">
          <li>
            <a href="index" class="mobile-link">Beranda</a>
          </li>
          <li>
            <a href="layanan" class="mobile-link">Layanan</a>
          </li>
          <li>
            <a href="workshop" class="mobile-link">Webinar & Workshop</a>
          </li>
          <li>
            <a href="member" class="mobile-link">Member</a>
          </li>
          <li>
            <a href="lingua" class="mobile-link active">Store</a>
          </li>
        </ul>
      </div>
    </nav>
    <main class="page home-page">
      <section class="hero">
        <div class="hero__inner">
          <div class="hero__content">
            <span class="hero__eyebrow" id="heroEyebrow"><?= lg_val($bannerUtama, 'pill', 'Toko Digital M-DGPT Agency') ?></span>
            <h1 class="hero__title">
              <span id="heroTitleLine1"><?= lg_val($bannerUtama, 'headline1', 'Digital Product yang Bikin') ?></span>
              <span class="hero__title-accent" id="heroTitleLine2"><?= lg_val($bannerUtama, 'headline2', 'Bisnismu Naik Level') ?></span>
            </h1>
            <p class="hero__desc" id="heroDesc">
              <?= lg_val($bannerUtama, 'subheadline', 'Template konten, ebook strategi, dan tools otomasi siap pakai, dirancang langsung oleh tim M-DGPT Agency untuk brand yang serius growth.') ?>
            </p>
            <div class="hero__actions">
              <a href="/lingua/index.html" class="btn-cta"><span>Belanja Sekarang</span></a>
              <a href="#kategori" class="hero__btn-secondary">Lihat Kategori</a>
            </div>
          </div>
        </div>
      </section>
      <div class="hero__trust">
        <div class="hero__trust-inner">
          <div class="hero__trust-item">
            <span class="hero__trust-icon" id="heroTrust1Icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            </span>
            <div class="hero__trust-text">
              <strong id="heroTrust1Title"><?= lg_card_val($bannerCards, 0, 'headline', 'Produk Original') ?></strong>
              <span id="heroTrust1Desc"><?= lg_card_val($bannerCards, 0, 'subheadline', 'Dibuat langsung oleh tim ahli') ?></span>
            </div>
          </div>
          <div class="hero__trust-item">
            <span class="hero__trust-icon" id="heroTrust2Icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v14M5 12l7 7 7-7"/><path d="M5 21h14"/></svg>
            </span>
            <div class="hero__trust-text">
              <strong id="heroTrust2Title"><?= lg_card_val($bannerCards, 1, 'headline', 'Instant Download') ?></strong>
              <span id="heroTrust2Desc"><?= lg_card_val($bannerCards, 1, 'subheadline', 'Langsung setelah checkout') ?></span>
            </div>
          </div>
          <div class="hero__trust-item">
            <span class="hero__trust-icon" id="heroTrust3Icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
            </span>
            <div class="hero__trust-text">
              <strong id="heroTrust3Title"><?= lg_card_val($bannerCards, 2, 'headline', 'Update Berkala') ?></strong>
              <span id="heroTrust3Desc"><?= lg_card_val($bannerCards, 2, 'subheadline', 'Selalu ikut tren terbaru') ?></span>
            </div>
          </div>
          <div class="hero__trust-item">
            <span class="hero__trust-icon" id="heroTrust4Icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9.5 8.3A8.5 8.5 0 1 1 21 11.5Z"/><path d="M12 7v5l3 2"/></svg>
            </span>
            <div class="hero__trust-text">
              <strong id="heroTrust4Title"><?= lg_card_val($bannerCards, 3, 'headline', 'Support Cepat') ?></strong>
              <span id="heroTrust4Desc"><?= lg_card_val($bannerCards, 3, 'subheadline', 'Respon dalam hitungan jam') ?></span>
            </div>
          </div>
        </div>
      </div>

      <section class="category-section" id="kategori">
        <div class="category-section__inner">
          <h2 class="category-section__title">Kategori</h2>

          <div class="category-slider" id="categorySlider">
            <button class="category-slider__nav category-slider__nav--prev" id="catPrev" aria-label="Kategori sebelumnya" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <div class="category-slider__viewport">
              <div class="category-slider__track" id="categoryTrack"></div>
            </div>
            <button class="category-slider__nav category-slider__nav--next" id="catNext" aria-label="Kategori berikutnya" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </section>
      <section class="promo-banners">
        <div class="promo-banners__inner">
          <a class="promo-banner" id="campaignCard1"
             href="<?= lg_card_url($campaignCards, 0, 'ctaUrl', $campaignDefaults[0]['ctaUrl']) ?>">
            <img class="promo-banner__img" id="campaignCard1Img"
                 src="<?= lg_card_url($campaignCards, 0, 'image', $campaignDefaults[0]['image']) ?>"
                 alt="" loading="lazy" width="1280" height="360" />
            <div class="promo-banner__overlay"></div>
            <div class="promo-banner__content">
              <h3 class="promo-banner__title" id="campaignCard1Headline"><?= lg_card_val($campaignCards, 0, 'headline', $campaignDefaults[0]['headline']) ?></h3>
              <p class="promo-banner__subtitle" id="campaignCard1Sub"><?= lg_card_val($campaignCards, 0, 'subheadline', $campaignDefaults[0]['subheadline']) ?></p>
              <span class="promo-banner__cta">
                <span id="campaignCard1CtaText"><?= lg_card_val($campaignCards, 0, 'ctaText', $campaignDefaults[0]['ctaText']) ?></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </a>
          <a class="promo-banner" id="campaignCard2"
             href="<?= lg_card_url($campaignCards, 1, 'ctaUrl', $campaignDefaults[1]['ctaUrl']) ?>">
            <img class="promo-banner__img" id="campaignCard2Img"
                 src="<?= lg_card_url($campaignCards, 1, 'image', $campaignDefaults[1]['image']) ?>"
                 alt="" loading="lazy" width="1280" height="360" />
            <div class="promo-banner__overlay"></div>
            <div class="promo-banner__content">
              <h3 class="promo-banner__title" id="campaignCard2Headline"><?= lg_card_val($campaignCards, 1, 'headline', $campaignDefaults[1]['headline']) ?></h3>
              <p class="promo-banner__subtitle" id="campaignCard2Sub"><?= lg_card_val($campaignCards, 1, 'subheadline', $campaignDefaults[1]['subheadline']) ?></p>
              <span class="promo-banner__cta">
                <span id="campaignCard2CtaText"><?= lg_card_val($campaignCards, 1, 'ctaText', $campaignDefaults[1]['ctaText']) ?></span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </span>
            </div>
          </a>
        </div>
      </section>
      <section class="bestseller-section" id="bestseller">
        <div class="bestseller-section__inner">
          <div class="bestseller-section__head">
            <h2 class="bestseller-section__title">Best Seller</h2>
            <a href="#" class="bestseller-section__viewall">Lihat Semua Produk</a>
          </div>
          <div class="bestseller-grid" id="bestsellerGrid"></div>
        </div>
      </section>
<section class="explore-section" id="explore">
  <div class="explore-section__inner">
    <div class="explore-section__head">
      <h2 class="explore-section__title">Rekomendasi Produk</h2>
      <p class="explore-section__subtitle">Temukan produk digital yang paling cocok buat kamu</p>
    </div>

    <div class="explore-grid" id="exploreGrid"></div>

    <a href="lingua/index.html" class="explore-more-btn" id="exploreMoreBtn">Lihat produk selengkapnya . . .</a>
  </div>
</section>
    </main>
    <footer class="footer" role="contentinfo">
      <div class="footer__inner">
        <div class="footer__col footer__col--brand">
          <div class="footer__logos">
            <img src="assets/icons/logo.png" alt="MDGPT Agency" class="footer__logo-img" loading="lazy" />
            <img src="assets/icons/logo2.png" alt="Naek Level" class="footer__logo-img" loading="lazy" />
          </div>
          <p class="footer__legal">CV Indomarketing Digital Teknologi</p>
          <address class="footer__address"> Jl. Simo Gn. Bar. Tol I No.7, Simomulyo, <br /> Kec. Sukomanunggal, Surabaya </address>
        </div>
        <div class="footer__col">
          <h3 class="footer__heading">Informasi</h3>
          <ul class="footer__links">
            <li><a href="index.html" class="footer__link">Beranda</a></li>
            <li><a href="layanan.html" class="footer__link">Layanan</a></li>
            <li><a href="workshop.html" class="footer__link">Info Webinar &amp; Workshop</a></li>
            <li><a href="member.html" class="footer__link">Member Tahunan</a></li>
          </ul>
        </div>
        <div class="footer__col">
          <h3 class="footer__heading">Layanan</h3>
          <ul class="footer__links">
            <li><a href="layanan.html#services" class="footer__link">Social Media Service</a></li>
            <li><a href="layanan.html#services" class="footer__link">Digital Ads Service</a></li>
            <li><a href="layanan.html#services" class="footer__link">Workshop Digital Service & Organizer</a></li>
            <li><a href="layanan.html#services" class="footer__link">Business Process Automation</a></li>
            <li><a href="layanan.html#services" class="footer__link">Event Documentation</a></li>
            <li><a href="layanan.html#services" class="footer__link">Generate Content Publishing</a></li>
          </ul>
        </div>
        <div class="footer__col footer__col--end">
          <div class="footer__group">
            <h3 class="footer__heading">Ikuti Kami</h3>
            <ul class="footer__links">
              <li>
                <a href="https://www.instagram.com/mdgpt_agency/" class="footer__link footer__link--icon" target="_blank" rel="noopener noreferrer">
                  <span class="footer__icon-sq footer__icon-sq--ig" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                    </svg>
                  </span> @mdgpt_agency
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/company/m-dgpt-agency" class="footer__link footer__link--icon" target="_blank" rel="noopener noreferrer">
                  <span class="footer__icon-sq footer__icon-sq--li" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </span> M-DGPT Agency
                </a>
              </li>
            </ul>
          </div>
          <div class="footer__group">
            <h3 class="footer__heading">Hubungi Kami</h3>
            <ul class="footer__links">
              <li>
                <a href="https://wa.me/6287777222572" class="footer__link footer__link--icon" target="_blank" rel="noopener noreferrer">
                  <span class="footer__icon-sq footer__icon-sq--wa" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </span> 0877 7722 2572
                </a>
              </li>
              <li>
                <a href="mailto:indomarketingdigitalteknologi@gmail.com" class="footer__link footer__link--icon">
                  <span class="footer__icon-sq footer__icon-sq--em" aria-hidden="true">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span> indomarketingdigitalteknologi@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="footer__bottom-inner">
          <p class="footer__copy">&copy; <span id="footer-year"></span> CV Indomarketing Digital Teknologi. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
    <script src="js/global.js" defer></script>
    <script src="js/cms-loader.js" defer></script>
    <script type="module" src="js/products-data.js"></script>
    <script src="js/cart-store.js" defer></script>
    <script src="js/variant-modal.js" defer></script>
    <script src="js/icon-library.js" defer></script>
    <script src="js/store.js" defer></script>
    <script src="js/lingua-site-content.js" defer></script>
  </body>
</html>
