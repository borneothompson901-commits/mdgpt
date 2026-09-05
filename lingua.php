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
    <meta property="og:image" content="https://mdgpt.id/assets/img/oglingua.jpg" />
    <meta property="og:locale" content="id_ID" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Lingua Store - Template, Ebook & Tools Digital | M-DGPT Agency" />
    <meta name="twitter:description" content="Belanja template konten, ebook strategi, dan tools otomasi digital siap pakai dari M-DGPT Agency. Produk original, instant download, update berkala, support cepat." />
    <meta name="twitter:image" content="https://mdgpt.id/assets/img/oglingua.jpg" />
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
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/global.css" />
    <link rel="stylesheet" href="css/store.css" />
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
            <input type="search" name="q" class="nav-search__input" placeholder="Cari produk..." aria-label="Cari produk" />
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
            <div class="lingua-brand-header">
              <img src="assets/icons/logo3.png" alt="Lingua Store" class="lingua-brand-header__logo" width="96" height="96" loading="lazy" />
              <span class="lingua-brand-header__text">Lingua Store</span>
            </div>
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
            <a href="lingua/" class="bestseller-section__viewall">Lihat Semua Produk</a>
          </div>
          <div class="bestseller-grid" id="bestsellerGrid"></div>
        </div>
      </section>
<section class="explore-section" id="explore">
  <div class="explore-section__inner">
    <div class="explore-section__head">
      <h2 class="explore-section__title">Rekomendasi Produk</h2>
      <p class="explore-section__subtitle">Temukan produk yang paling cocok buat kamu</p>
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
