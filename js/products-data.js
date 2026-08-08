(function (global) {
  "use strict";

  var CATEGORY_LABELS = {
    "template-konten": "Template Konten",
    "ebook-strategi": "Ebook Strategi",
    "tools-otomasi": "Tools Otomasi",
    "workshop-kit": "Workshop Kit",
    "social-media-kit": "Social Media Kit",
    "branding-bundle": "Branding Bundle",
    "content-planner": "Content Planner",
    "automation-script": "Automation Script"
  };

  function gallery(seed) {
    return [
      "https://picsum.photos/seed/mdgpt-" + seed + "/700/700",
      "https://picsum.photos/seed/mdgpt-" + seed + "-b/700/700",
      "https://picsum.photos/seed/mdgpt-" + seed + "-c/700/700",
      "https://picsum.photos/seed/mdgpt-" + seed + "-d/700/700"
    ];
  }

  function galleryN(seed, count) {
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push("https://picsum.photos/seed/mdgpt-" + seed + "-" + i + "/700/700");
    }
    return out;
  }

  var PRODUCTS = [
    {
      id: 1, category: "template-konten", price: 149000, oldPrice: 199000,
      title: "Template Konten Elite Multi Platform Sosial Media",
      seed: "prod-1", sold: 1240, rating: 4.8,
      shortDesc: "Set template siap edit untuk Instagram, TikTok, dan Facebook — tinggal ganti teks dan foto.",
      description: "Template Konten Elite Multi Platform Sosial Media dirancang buat brand yang butuh konten rapi dan konsisten setiap hari tanpa bolak-balik desain dari nol. Satu paket berisi ratusan slide siap edit untuk feed, story, dan reels, lengkap dengan sistem warna dan tipografi yang sudah disusun biar tampilan akun tetap solid di semua platform. Cocok buat tim marketing, admin sosial media, atau pemilik bisnis yang ingin tampil profesional tanpa harus jago desain.",
      highlights: [
        "220+ slide siap edit untuk feed, story, dan reels",
        "Format Canva & PSD, tinggal drag-drop foto/teks",
        "Sistem warna dan font konsisten di semua template",
        "Update gratis untuk 6 bulan ke depan"
      ],
      specs: { "Format File": "Canva, PSD", "Jumlah Slide": "220+ slide", "Ukuran": "Instagram Feed, Story, Reels", "Lisensi": "1 brand / bisnis", "Update": "Gratis 6 bulan" },
      variantGroups: [
        {
          id: "paket",
          label: "Pilih Paket",
          required: true,
          options: [
            { id: "basic", label: "Basic (Canva)", image: "https://picsum.photos/seed/mdgpt-prod-1-basic/700/700" },
            { id: "lengkap", label: "Lengkap (Canva + PSD)", image: "https://picsum.photos/seed/mdgpt-prod-1-lengkap/700/700" }
          ]
        },
        {
          id: "lisensi",
          label: "Pilih Lisensi",
          required: true,
          options: [
            { id: "1brand", label: "1 Brand" },
            { id: "3brand", label: "3 Brand" }
          ]
        }
      ],
      variantPricing: {
        "basic|1brand": { price: 149000, stock: 20 },
        "basic|3brand": { price: 199000, stock: 12 },
        "lengkap|1brand": { price: 189000, stock: 8 },
        "lengkap|3brand": { price: 249000, stock: 0 } 
      }
    },
    {
      id: 2, category: "template-konten", price: 119000, oldPrice: null,
      title: "Template Feed Instagram Minimal Estetik Siap Pakai",
      seed: "prod-2", sold: 860, rating: 4.6,
      shortDesc: "Feed Instagram bergaya minimalis yang bikin profil bisnismu keliatan lebih premium.",
      description: "Buat kamu yang pengen feed Instagram terlihat estetik dan konsisten tanpa ribet mikirin layout, template ini menyediakan grid feed minimalis lengkap dengan variasi warna netral yang gampang disesuaikan dengan identitas brand kamu. Semua elemen sudah tersusun rapi, cukup ganti foto dan caption, feed langsung terlihat rapi dan profesional.",
      highlights: [
        "40 desain slide feed minimalis",
        "Palet warna netral, mudah disesuaikan",
        "Format Canva, langsung edit dari HP atau laptop",
        "Cocok untuk personal brand maupun bisnis kecil"
      ],
      specs: { "Format File": "Canva", "Jumlah Slide": "40 slide", "Ukuran": "1080x1350 px", "Lisensi": "1 brand / bisnis", "Update": "Tidak ada update berkala" }
    },
    {
      id: 3, category: "ebook-strategi", price: 99000, oldPrice: 149000,
      title: "Ebook Growth Playbook Strategi Digital Marketing",
      seed: "prod-3", sold: 980, rating: 4.7,
      shortDesc: "Panduan lengkap strategi growth marketing dari riset pasar sampai eksekusi campaign.",
      description: "Ebook Growth Playbook Strategi Digital Marketing menyusun kerangka kerja praktis yang bisa langsung diaplikasikan, mulai dari riset target pasar, penyusunan funnel, sampai strategi retensi pelanggan. Disusun berdasarkan studi kasus nyata dari berbagai bisnis digital, cocok buat pemilik usaha maupun tim marketing yang ingin naikkan omzet secara terukur.",
      highlights: [
        "120 halaman panduan step-by-step",
        "Studi kasus nyata dari berbagai industri",
        "Template worksheet strategi included",
        "Bisa dibaca di HP, tablet, atau laptop (PDF)"
      ],
      specs: { "Format File": "PDF", "Jumlah Halaman": "120 halaman", "Bahasa": "Indonesia", "Lisensi": "Penggunaan pribadi/bisnis", "Bonus": "Template worksheet strategi" }
    },
    {
      id: 4, category: "ebook-strategi", price: 89000, oldPrice: null,
      title: "Ebook Copywriting Konversi Tinggi untuk Penjualan",
      seed: "prod-4", sold: 705, rating: 4.5,
      shortDesc: "Teknik menulis copy yang bikin calon pembeli klik tombol beli lebih cepat.",
      description: "Ebook ini membahas teknik copywriting yang terbukti meningkatkan konversi penjualan, dari headline yang menggigit sampai call-to-action yang bikin orang nggak ragu buat checkout. Dilengkapi contoh copy untuk iklan, landing page, dan pesan WhatsApp follow up, sehingga bisa langsung diterapkan ke bisnis kamu.",
      highlights: [
        "80+ contoh copy siap pakai",
        "Framework menulis headline & CTA",
        "Studi kasus copy iklan yang terbukti convert",
        "Format PDF, ringan dan mudah dibaca"
      ],
      specs: { "Format File": "PDF", "Jumlah Halaman": "76 halaman", "Bahasa": "Indonesia", "Lisensi": "Penggunaan pribadi/bisnis" }
    },
    {
      id: 5, category: "tools-otomasi", price: 199000, oldPrice: 259000,
      title: "Toolkit Automasi Bisnis Digital Serba Otomatis",
      seed: "prod-5", sold: 875, rating: 4.9,
      shortDesc: "Kumpulan tools & script siap pakai buat otomatisasi tugas operasional harian.",
      description: "Toolkit Automasi Bisnis Digital Serba Otomatis membantu kamu memangkas waktu kerja manual dengan kumpulan automation siap pakai — mulai dari pengingat order, rekap penjualan otomatis, sampai notifikasi stok. Setiap tools dilengkapi panduan setup yang jelas, jadi kamu bisa langsung pasang tanpa harus paham coding.",
      highlights: [
        "10 automation siap pakai (Google Sheets & Zapier/Make)",
        "Panduan setup step-by-step + video",
        "Tidak perlu keahlian coding",
        "Cocok untuk UMKM sampai tim operasional"
      ],
      specs: { "Format File": "Template Sheet + Panduan PDF/Video", "Kompatibilitas": "Google Sheets, Zapier/Make", "Lisensi": "1 bisnis", "Support": "Grup diskusi khusus pembeli" },
      variantGroups: [
        {
          id: "platform",
          label: "Pilih Platform",
          required: true,
          options: [
            { id: "sheets", label: "Google Sheets", image: "https://picsum.photos/seed/mdgpt-prod-5-sheets/700/700" },
            { id: "zapier", label: "Zapier", image: "https://picsum.photos/seed/mdgpt-prod-5-zapier/700/700" },
            { id: "make", label: "Make.com", image: "https://picsum.photos/seed/mdgpt-prod-5-make/700/700" }
          ]
        }
      ],
      variantPricing: {
        "sheets": { price: 199000, stock: 15 },
        "zapier": { price: 229000, stock: 6 },
        "make": { price: 229000, stock: 0 } 
      }
    },
    {
      id: 6, category: "tools-otomasi", price: 229000, oldPrice: null,
      title: "Script Auto-Reply WhatsApp Bisnis Respon Cepat",
      seed: "prod-6", sold: 512, rating: 4.6,
      shortDesc: "Auto-reply WhatsApp Business biar chat calon pembeli nggak ada yang kelewat.",
      description: "Script Auto-Reply WhatsApp Bisnis Respon Cepat memastikan setiap chat masuk langsung dibalas otomatis dengan pesan yang relevan, baik itu FAQ, info produk, maupun status pemesanan. Cocok buat toko online yang menerima banyak chat harian dan butuh respon cepat tanpa harus standby 24 jam.",
      highlights: [
        "Setup auto-reply untuk FAQ & greeting",
        "Template pesan siap edit sesuai brand",
        "Panduan instalasi lengkap",
        "Kompatibel dengan WhatsApp Business App"
      ],
      specs: { "Format File": "Script + Panduan PDF", "Kompatibilitas": "WhatsApp Business", "Lisensi": "1 nomor bisnis", "Support": "Email support" }
    },
    {
      id: 7, category: "workshop-kit", price: 249000, oldPrice: 329000,
      title: "Workshop Kit Digital Marketing Lengkap dan Praktis",
      seed: "prod-7", sold: 690, rating: 4.5,
      shortDesc: "Materi lengkap buat kamu yang mau ngadain workshop digital marketing sendiri.",
      description: "Workshop Kit Digital Marketing Lengkap dan Praktis berisi seluruh materi yang dibutuhkan untuk menyelenggarakan workshop, mulai dari slide presentasi, worksheet peserta, sampai script fasilitator. Materi disusun berjenjang dari dasar sampai strategi lanjutan, cocok dipakai untuk internal tim maupun kelas berbayar.",
      highlights: [
        "Slide presentasi 8 sesi siap tayang",
        "Worksheet & studi kasus untuk peserta",
        "Script fasilitator per sesi",
        "Bisa dipakai ulang tanpa batas untuk internal tim"
      ],
      specs: { "Format File": "PPTX, PDF", "Jumlah Sesi": "8 sesi", "Lisensi": "Internal tim / kelas berbayar", "Update": "Gratis 3 bulan" },
      variantGroups: [
        {
          id: "format",
          label: "Pilih Format File",
          required: true,
          options: [
            { id: "pptx", label: "PPTX" },
            { id: "pdf", label: "PDF" },
            { id: "keduanya", label: "PPTX + PDF" }
          ]
        },
        {
          id: "lisensi",
          label: "Pilih Lisensi",
          required: true,
          options: [
            { id: "internal", label: "Internal Tim" },
            { id: "komersial", label: "Kelas Berbayar" }
          ]
        }
      ],
      variantPricing: {
        "pptx|internal": { price: 249000, stock: 10 },
        "pptx|komersial": { price: 299000, stock: 10 },
        "pdf|internal": { price: 229000, stock: 10 },
        "pdf|komersial": { price: 279000, stock: 10 },
        "keduanya|internal": { price: 269000, stock: 5 },
        "keduanya|komersial": { price: 319000, stock: 0 } 
      }
    },
    {
      id: 8, category: "workshop-kit", price: 179000, oldPrice: null,
      title: "Slide Kit Materi Workshop Desain Profesional",
      seed: "prod-8", sold: 430, rating: 4.4,
      shortDesc: "Slide kit siap pakai untuk workshop atau kelas seputar desain grafis.",
      description: "Slide Kit Materi Workshop Desain Profesional membantu kamu menyampaikan materi desain dengan tampilan yang rapi dan mudah dipahami peserta. Berisi kerangka slide untuk teori dasar, studi kasus, dan sesi praktik, tinggal disesuaikan dengan gaya penyampaian kamu sendiri.",
      highlights: [
        "Slide kit desain 6 modul",
        "Layout siap edit di Canva & PPTX",
        "Termasuk template sertifikat peserta",
        "Cocok untuk trainer maupun konten kelas online"
      ],
      specs: { "Format File": "Canva, PPTX", "Jumlah Modul": "6 modul", "Lisensi": "Internal tim / kelas berbayar" }
    },
    {
      id: 9, category: "social-media-kit", price: 129000, oldPrice: 159000,
      title: "Social Media Kit Growth untuk Bisnis dan Brand",
      seed: "prod-9", sold: 640, rating: 4.6,
      shortDesc: "Paket konten siap posting buat naikin engagement sosial media bisnis kamu.",
      description: "Social Media Kit Growth untuk Bisnis dan Brand berisi kumpulan template konten edukasi, promosi, dan engagement yang dirancang untuk meningkatkan interaksi di sosial media. Setiap template sudah dilengkapi caption dasar yang tinggal disesuaikan dengan bisnismu.",
      highlights: [
        "100+ template konten edukasi & promosi",
        "Termasuk contoh caption siap edit",
        "Format Canva, mudah dikustomisasi",
        "Update tren desain tiap kuartal"
      ],
      specs: { "Format File": "Canva", "Jumlah Slide": "100+ slide", "Lisensi": "1 brand / bisnis", "Update": "Setiap kuartal" }
    },
    {
      id: 10, category: "social-media-kit", price: 139000, oldPrice: null,
      title: "Story Highlight Cover Pack Estetik Instagram",
      seed: "prod-10", sold: 390, rating: 4.3,
      shortDesc: "Cover highlight Instagram yang estetik dan konsisten sama tema brand kamu.",
      description: "Story Highlight Cover Pack Estetik Instagram membantu profil bisnis kamu terlihat lebih rapi dan profesional lewat highlight cover yang konsisten. Tersedia banyak pilihan gaya ikon dan warna, tinggal pilih yang paling cocok dengan identitas brand kamu.",
      highlights: [
        "50+ pilihan cover highlight",
        "5 varian tema warna",
        "Format PNG transparan, siap pakai",
        "Ukuran pas untuk story highlight Instagram"
      ],
      specs: { "Format File": "PNG", "Jumlah Item": "50+ cover", "Ukuran": "500x500 px", "Lisensi": "1 brand / bisnis" }
    },
    {
      id: 11, category: "branding-bundle", price: 179000, oldPrice: 259000,
      title: "Branding Bundle Pro Lengkap untuk Identitas Brand",
      seed: "prod-11", sold: 760, rating: 4.7,
      shortDesc: "Paket identitas brand lengkap, dari logo sampai panduan penggunaannya.",
      description: "Branding Bundle Pro Lengkap untuk Identitas Brand menyediakan seluruh elemen visual yang dibutuhkan untuk membangun identitas brand yang konsisten — logo variasi, palet warna, tipografi, hingga mockup penerapan di berbagai media. Cocok buat bisnis yang mau tampil lebih profesional dan mudah dikenali.",
      highlights: [
        "Logo utama + 4 variasi warna",
        "Panduan brand guideline lengkap",
        "Mockup penerapan di kartu nama, kemasan, dan sosial media",
        "File vector (AI/EPS) siap cetak"
      ],
      specs: { "Format File": "AI, EPS, PNG, PDF", "Isi Paket": "Logo, guideline, mockup", "Lisensi": "1 brand", "Cocok Untuk": "Cetak & digital" }
    },
    {
      id: 12, category: "branding-bundle", price: 159000, oldPrice: null,
      title: "Logo dan Brand Guideline Kit Profesional Lengkap",
      seed: "prod-12", sold: 320, rating: 4.4,
      shortDesc: "Kit logo dan aturan penggunaan brand yang rapi dan mudah diikuti tim.",
      description: "Logo dan Brand Guideline Kit Profesional Lengkap membantu bisnis kamu punya standar visual yang jelas, sehingga logo dan elemen brand selalu digunakan dengan konsisten oleh siapa pun di tim — dari admin sosial media sampai vendor percetakan.",
      highlights: [
        "Template guideline siap isi sesuai brand kamu",
        "Panduan area aman & ukuran minimum logo",
        "Contoh penerapan yang benar dan salah",
        "Format editable (Canva & PDF)"
      ],
      specs: { "Format File": "Canva, PDF", "Jumlah Halaman": "24 halaman", "Lisensi": "1 brand" }
    },
    {
      id: 13, category: "content-planner", price: 79000, oldPrice: 99000,
      title: "Content Planner Notion Template Rapi dan Fleksibel",
      seed: "prod-13", sold: 540, rating: 4.6,
      shortDesc: "Template Notion buat rencanain konten mingguan dan bulanan dengan rapi.",
      description: "Content Planner Notion Template Rapi dan Fleksibel dirancang untuk memudahkan kamu menyusun ide, jadwal posting, dan status produksi konten dalam satu dashboard yang rapi. Tinggal duplikat ke akun Notion kamu dan langsung bisa dipakai.",
      highlights: [
        "Dashboard perencanaan konten mingguan & bulanan",
        "Tracker status ide, produksi, hingga posting",
        "Kalender konten terintegrasi",
        "Tinggal duplikat, tidak perlu setup dari nol"
      ],
      specs: { "Format File": "Notion Template (link)", "Kompatibilitas": "Notion (gratis/berbayar)", "Lisensi": "1 pengguna" }
    },
    {
      id: 14, category: "content-planner", price: 69000, oldPrice: null,
      title: "Kalender Konten 90 Hari Siap Pakai untuk Bisnis",
      seed: "prod-14", sold: 275, rating: 4.2,
      shortDesc: "Kalender ide konten 90 hari, tinggal sesuaikan dengan bisnis kamu.",
      description: "Kalender Konten 90 Hari Siap Pakai untuk Bisnis membantu kamu nggak kehabisan ide posting selama 3 bulan penuh. Berisi tema harian, format konten yang disarankan, dan contoh caption yang tinggal disesuaikan dengan produk atau jasa kamu.",
      highlights: [
        "90 hari ide konten siap pakai",
        "Format Excel/Google Sheets, mudah diedit",
        "Termasuk contoh caption per tema",
        "Cocok untuk berbagai jenis bisnis"
      ],
      specs: { "Format File": "XLSX, Google Sheets", "Durasi": "90 hari", "Lisensi": "1 bisnis" }
    },
    {
      id: 15, category: "automation-script", price: 299000, oldPrice: 349000,
      title: "Automation Script Order Otomatis untuk Toko Online",
      seed: "prod-15", sold: 480, rating: 4.7,
      shortDesc: "Script otomatisasi order biar proses jualan online kamu lebih efisien.",
      description: "Automation Script Order Otomatis untuk Toko Online membantu kamu mengurangi kerja manual saat memproses pesanan — dari notifikasi order baru, update status, sampai rekap penjualan harian yang otomatis terkirim ke tim kamu.",
      highlights: [
        "Notifikasi order baru otomatis",
        "Update status pesanan tanpa input manual",
        "Rekap penjualan harian otomatis",
        "Panduan setup lengkap + video tutorial"
      ],
      specs: { "Format File": "Script + Panduan PDF/Video", "Kompatibilitas": "Google Sheets, Zapier/Make", "Lisensi": "1 toko online", "Support": "Grup diskusi khusus pembeli" }
    },
    {
      id: 16, category: "automation-script", price: 219000, oldPrice: null,
      title: "Bot Rekap Laporan Harian Otomatis untuk Tim",
      seed: "prod-16", sold: 210, rating: 4.3,
      shortDesc: "Bot yang otomatis kirim rekap kerja tim ke grup setiap hari.",
      description: "Bot Rekap Laporan Harian Otomatis untuk Tim membantu proses reporting harian jadi lebih ringkas — bot akan otomatis mengumpulkan dan mengirim rekap kerja tim ke grup komunikasi kamu setiap hari di jam yang ditentukan, tanpa perlu diingatkan manual.",
      highlights: [
        "Rekap otomatis terkirim setiap hari",
        "Bisa disesuaikan dengan format laporan tim kamu",
        "Panduan setup untuk pemula",
        "Cocok untuk tim remote maupun in-office"
      ],
      specs: { "Format File": "Script + Panduan PDF", "Kompatibilitas": "Google Sheets, WhatsApp/Telegram Group", "Lisensi": "1 tim" }
    }
  ];

  var GALLERY_DEMO_IDS = [1];
  var GALLERY_DEMO_COUNT = 16;

  PRODUCTS.forEach(function (p) {
    p.categoryLabel = CATEGORY_LABELS[p.category] || p.category;
    p.images = GALLERY_DEMO_IDS.indexOf(p.id) !== -1 ? galleryN(p.seed, GALLERY_DEMO_COUNT) : gallery(p.seed);
    if (p.oldPrice) {
      p.discount = Math.round((1 - p.price / p.oldPrice) * 100);
    } else {
      p.discount = 0;
    }
  });

  var BEST_SELLER_IDS = [1, 3, 5, 11];

  PRODUCTS.forEach(function (p) {
    p.isBest = BEST_SELLER_IDS.indexOf(p.id) !== -1 ? "best" : null;
  });

  var REKOMENDASI_PRODUK = [2, 4, 6, 7, 9, 12, 13, 15];

  PRODUCTS.forEach(function (p) {
    p.isRekomendasi = REKOMENDASI_PRODUK.indexOf(p.id) !== -1 ? "rekomendasi" : null;
  });

  function getById(id) {
    var numId = parseInt(id, 10);
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === numId) return PRODUCTS[i];
    }
    return null;
  }

  function getRelated(product, limit) {
    limit = limit || 4;
    var related = PRODUCTS.filter(function (p) {
      return p.category === product.category && p.id !== product.id;
    });
    if (related.length < limit) {
      PRODUCTS.forEach(function (p) {
        if (related.length >= limit) return;
        if (p.id !== product.id && related.indexOf(p) === -1) related.push(p);
      });
    }
    return related.slice(0, limit);
  }

  function rupiah(n) {
    return "Rp" + n.toLocaleString("id-ID");
  }

  function getBestSellers() {
    return PRODUCTS.filter(function (p) { return p.isBest === "best"; })
      .sort(function (a, b) { return b.sold - a.sold; });
  }

  function getRekomendasi() {
    return PRODUCTS.filter(function (p) { return p.isRekomendasi === "rekomendasi"; })
      .sort(function (a, b) { return b.sold - a.sold; })
      .slice(0, 8);
  }

  global.PRODUCTS_DATA = {
    all: PRODUCTS,
    categoryLabels: CATEGORY_LABELS,
    getById: getById,
    getRelated: getRelated,
    getBestSellers: getBestSellers,
    getRekomendasi: getRekomendasi,
    rupiah: rupiah
  };
})(window);
