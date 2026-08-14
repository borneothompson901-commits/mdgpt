(function () {
  "use strict";

  if (!document.getElementById("bannerUtamaTbody")) return;

  var state = {
    bannerUtama: {
      pill: "Toko Digital M-DGPT Agency",
      headline1: "Digital Product yang Bikin",
      headline2: "Bisnismu Naik Level",
      subheadline: "Template konten, ebook strategi, dan tools otomasi siap pakai, dirancang langsung oleh tim M-DGPT Agency untuk brand yang serius growth."
    },
    bannerCards: [
      { id: "card1", name: "Kartu 1", headline: "Produk Original", subheadline: "Dibuat langsung oleh tim ahli" },
      { id: "card2", name: "Kartu 2", headline: "Instant Download", subheadline: "Langsung setelah checkout" },
      { id: "card3", name: "Kartu 3", headline: "Update Berkala", subheadline: "Selalu ikut tren terbaru" },
      { id: "card4", name: "Kartu 4", headline: "Support Cepat", subheadline: "Respon dalam hitungan jam" }
    ],
    campaignCards: [
      { id: "camp1", name: "Campaign Card 1", headline: "Promo Spesial Bulan Ini", subheadline: "Diskon menarik untuk produk digital pilihan, terbatas!", ctaText: "Lihat Promo", ctaUrl: "/lingua/index.html", image: "" },
      { id: "camp2", name: "Campaign Card 2", headline: "Gabung Jadi Affiliate", subheadline: "Dapatkan komisi di setiap transaksi yang kamu bawa.", ctaText: "Daftar Sekarang", ctaUrl: "/lingua/affiliate.html", image: "" }
    ],
    bannerAffiliate: {
      headline: "Program Affiliate",
      subheadline: "Bagikan link kamu, dapat komisi tiap ada yang checkout."
    },
    cardAffiliate: [
      { id: "aff1", name: "Kartu 1", bold: "", headline: "Komisi tiap transaksi", subheadline: "Berlaku untuk checkout produk apapun di katalog." },
      { id: "aff2", name: "Kartu 2", bold: "14 hari", headline: "Cookie tracking", subheadline: "Klik link kamu tetap terhitung sampai 14 hari ke depan." },
      { id: "aff3", name: "Kartu 3", bold: "Rp0", headline: "Biaya pendaftaran", subheadline: "Aktif dalam kurang dari 1 menit, cair via WhatsApp." }
    ],
    faqAffiliate: [
      { id: "faq1", judul: "Kapan komisi affiliate saya cair?", isi: "Pencairan tidak otomatis lewat sistem. Hubungi admin lewat WhatsApp untuk verifikasi transaksi dan konfirmasi metode pembayaran, lalu komisi akan diproses sesuai jadwal operasional admin." },
      { id: "faq2", judul: "Berapa lama cookie tracking link affiliate berlaku?", isi: "14 hari sejak klik pertama. Selama pembeli checkout dalam rentang waktu itu, transaksinya tetap tercatat sebagai referral kamu." },
      { id: "faq3", judul: "Bisa pakai link affiliate sendiri untuk beli produk sendiri?", isi: "Tidak. Self-referral tidak diperbolehkan sesuai syarat & ketentuan, dan transaksi dari aktivitas semacam ini bisa dinyatakan tidak sah." }
    ],
    syaratKetentuan: [
      { id: "s1", headline: "Definisi & Kedudukan Affiliate", subheadline: "Affiliate adalah individu yang telah terdaftar melalui formulir pendaftaran resmi dan mendapatkan tautan rujukan unik untuk menyebarkan produk atau layanan Lingua. Status affiliate bersifat non-eksklusif dan tidak menjadikan affiliate sebagai karyawan, agen resmi, perwakilan hukum, maupun mitra usaha (partnership) dari Lingua dalam bentuk apa pun." },
      { id: "s2", headline: "Kelayakan Pendaftaran", subheadline: "Pendaftar wajib mengisi data diri secara benar, lengkap, dan dapat diverifikasi, termasuk nama lengkap, nomor WhatsApp aktif, dan alamat email yang valid. Lingua berhak menolak, menangguhkan, atau membatalkan pendaftaran apabila ditemukan data yang tidak valid, ganda, atau terindikasi disalahgunakan." },
      { id: "s3", headline: "Penggunaan Tautan Affiliate", subheadline: "Tautan affiliate hanya boleh disebarkan melalui cara-cara yang sah dan tidak melanggar hukum maupun kebijakan platform pihak ketiga (media sosial, mesin pencari, marketplace, forum, dan sejenisnya). Penyebaran dapat dilakukan melalui konten organik, media sosial pribadi, blog, grup komunitas, maupun kanal digital lain yang dimiliki atau dikelola secara sah oleh affiliate." },
      { id: "s4", headline: "Larangan dalam Penyebaran", subheadline: "Affiliate dilarang keras melakukan hal-hal berikut: menyebarkan tautan melalui spam (termasuk namun tidak terbatas pada email massal tanpa izin, komentar spam, atau pesan berantai tanpa persetujuan penerima); melakukan iklan berbayar menggunakan nama brand Lingua atau variasi penulisannya sebagai kata kunci tanpa izin tertulis; membuat klaim, janji, potongan harga, atau informasi yang menyesatkan dan tidak sesuai dengan fakta di halaman resmi; menyamar sebagai pihak resmi Lingua; menggunakan bot, skrip otomatis, cookie stuffing, atau metode kecurangan lain untuk memanipulasi jumlah klik maupun transaksi; serta mendaftarkan atau menggunakan tautan affiliate milik sendiri untuk transaksi atas nama sendiri (self-referral)." },
      { id: "s5", headline: "Tanggung Jawab Konten dan Legalitas", subheadline: "Segala bentuk konten, narasi, klaim, maupun media promosi yang dibuat dan disebarkan oleh affiliate sepenuhnya menjadi tanggung jawab affiliate yang bersangkutan. Lingua tidak bertanggung jawab atas sengketa, pelaporan, maupun konsekuensi hukum yang timbul akibat konten promosi yang dibuat secara sepihak oleh affiliate, termasuk namun tidak terbatas pada pelanggaran hak cipta, pelanggaran ketentuan platform pihak ketiga, atau klaim yang menyesatkan konsumen." },
      { id: "s6", headline: "Pelacakan Referral", subheadline: "Setiap transaksi yang tercatat melalui tautan atau kode referral affiliate akan dilacak menggunakan sistem internal Lingua. Masa berlaku pelacakan (cookie/kode referral) mengikuti kebijakan teknis yang berlaku dan dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Lingua berhak melakukan verifikasi manual atas setiap transaksi yang tercatat sebelum dinyatakan sah." },
      { id: "s7", headline: "Pencairan Hasil Referral", subheadline: "Proses pencairan hasil referral tidak dilakukan secara otomatis melalui sistem. Affiliate wajib menghubungi admin resmi Lingua melalui WhatsApp untuk mengajukan permintaan pencairan, verifikasi data transaksi, dan konfirmasi metode pembayaran. Waktu pemrosesan pencairan mengikuti kebijakan dan jadwal operasional admin Lingua." },
      { id: "s8", headline: "Pembatalan dan Pemblokiran Akun", subheadline: "Lingua berhak menangguhkan, membekukan, atau menghentikan status affiliate secara sepihak tanpa pemberitahuan sebelumnya apabila ditemukan pelanggaran terhadap ketentuan ini, indikasi kecurangan, atau aktivitas yang merugikan reputasi Lingua. Seluruh hasil referral yang berasal dari aktivitas yang melanggar ketentuan dapat dinyatakan tidak sah dan tidak akan dicairkan." },
      { id: "s9", headline: "Kerahasiaan & Perlindungan Data", subheadline: "Data pribadi yang diberikan pada saat pendaftaran hanya akan digunakan untuk keperluan pengelolaan program affiliate, termasuk verifikasi identitas, pelacakan referral, dan proses pencairan. Lingua berkomitmen untuk tidak membagikan data pribadi affiliate kepada pihak ketiga yang tidak berkepentingan tanpa persetujuan, kecuali diwajibkan oleh peraturan perundang-undangan yang berlaku." },
      { id: "s10", headline: "Batasan Tanggung Jawab", subheadline: "Lingua tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul akibat gangguan teknis, kesalahan input data oleh affiliate, force majeure, atau faktor eksternal lain di luar kendali wajar Lingua." },
      { id: "s11", headline: "Perubahan Ketentuan", subheadline: "Lingua berhak mengubah, memperbarui, atau menambahkan ketentuan ini sewaktu-waktu sesuai kebutuhan operasional dan kebijakan internal. Perubahan akan berlaku efektif sejak dipublikasikan pada halaman ini, dan affiliate dianggap menyetujui perubahan tersebut dengan tetap menggunakan tautan affiliate setelah perubahan berlaku." },
      { id: "s12", headline: "Penyelesaian Sengketa", subheadline: "Segala bentuk perselisihan yang timbul sehubungan dengan program affiliate ini akan diselesaikan terlebih dahulu secara musyawarah antara affiliate dan admin Lingua melalui kanal komunikasi resmi sebelum ditempuh langkah-langkah lain sesuai peraturan perundang-undangan yang berlaku di Indonesia." }
    ]
  };

  var SECTION_KEYS = {
    bannerUtama: "banner_utama",
    bannerCards: "banner_cards",
    campaignCards: "campaign_card",
    bannerAffiliate: "banner_affiliate",
    cardAffiliate: "card_affiliate",
    faqAffiliate: "faq_affiliate",
    syaratKetentuan: "syarat_ketentuan"
  };

  function persist(stateKey) {
    var section = SECTION_KEYS[stateKey];
    if (!section) return;
    AdminShared.db.saveWebsiteContent(section, state[stateKey]).catch(function (e) {
      AdminShared.toast(e.message || "Gagal menyimpan ke server", "error");
    });
  }

  function loadFromServer() {
    Object.keys(SECTION_KEYS).forEach(function (stateKey) {
      AdminShared.db.getWebsiteContent(SECTION_KEYS[stateKey]).then(function (data) {
        if (data == null) return;
        if (Array.isArray(state[stateKey]) && Array.isArray(data) && data.length === 0) return;
        state[stateKey] = data;
        if (stateKey === "syaratKetentuan") syaratSeq = state.syaratKetentuan.length;
        renderAll();
      }).catch(function () {  });
    });
  }

  var editingType = null;
  var editingId = null;
  var deletingId = null;
  var syaratSeq = state.syaratKetentuan.length;

  var bannerUtamaTbody = document.getElementById("bannerUtamaTbody");
  var bannerCardTbody = document.getElementById("bannerCardTbody");
  var campaignCardTbody = document.getElementById("campaignCardTbody");
  var bannerAffiliateTbody = document.getElementById("bannerAffiliateTbody");
  var cardAffiliateTbody = document.getElementById("cardAffiliateTbody");
  var faqAffiliateTbody = document.getElementById("faqAffiliateTbody");
  var syaratTbody = document.getElementById("syaratTbody");
  var syaratEmptyState = document.getElementById("syaratEmptyState");

  var editModal = document.getElementById("websiteEditModal");
  var editTitle = document.getElementById("websiteEditTitle");
  var pillField = document.getElementById("websiteEditPillField");
  var boldField = document.getElementById("websiteEditBoldField");
  var judulField = document.getElementById("websiteEditJudulField");
  var headline1Field = document.getElementById("websiteEditHeadline1Field");
  var headline2Field = document.getElementById("websiteEditHeadline2Field");
  var headlineField = document.getElementById("websiteEditHeadlineField");
  var subheadlineField = document.getElementById("websiteEditSubheadlineField");
  var ctaTextField = document.getElementById("websiteEditCtaTextField");
  var ctaUrlField = document.getElementById("websiteEditCtaUrlField");
  var imageField = document.getElementById("websiteEditImageField");
  var subheadlineLargeField = document.getElementById("websiteEditSubheadlineLargeField");
  var isiField = document.getElementById("websiteEditIsiField");

  var pillInput = document.getElementById("websiteEditPill");
  var boldInput = document.getElementById("websiteEditBold");
  var judulInput = document.getElementById("websiteEditJudul");
  var headline1Input = document.getElementById("websiteEditHeadline1");
  var headline2Input = document.getElementById("websiteEditHeadline2");
  var headlineInput = document.getElementById("websiteEditHeadline");
  var subheadlineInput = document.getElementById("websiteEditSubheadline");
  var ctaTextInput = document.getElementById("websiteEditCtaText");
  var ctaUrlInput = document.getElementById("websiteEditCtaUrl");
  var imageInput = document.getElementById("websiteEditImage");
  var imageFileInput = document.getElementById("websiteEditImageFile");
  var imagePreview = document.getElementById("websiteEditImagePreview");
  var subheadlineLargeInput = document.getElementById("websiteEditSubheadlineLarge");
  var isiInput = document.getElementById("websiteEditIsi");
  var editSaveBtn = document.getElementById("websiteEditSaveBtn");

  var deleteModal = document.getElementById("syaratDeleteModal");
  var deleteNameEl = document.getElementById("syaratDeleteName");

  var typeConfig = {
    bannerUtama: { title: "Edit Banner Utama", fields: ["pill", "headline1", "headline2", "subheadline"] },
    bannerCard: { title: "Edit Banner Card", fields: ["headline", "subheadline"] },
    campaignCard: { title: "Edit Campaign Card", fields: ["headline", "subheadline", "ctaText", "ctaUrl", "image"] },
    bannerAffiliate: { title: "Edit Banner Affiliate", fields: ["headline", "subheadline"] },
    cardAffiliate: { title: "Edit Card Affiliate", fields: ["bold", "headline", "subheadline"] },
    faq: { title: "Edit FAQ Affiliate", fields: ["judul", "isi"] },
    syarat: { title: "Edit Poin Syarat & Ketentuan", fields: ["headline", "subheadlineLarge"] }
  };

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function iconEdit() {
    return '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.3 2.3a1.4 1.4 0 0 1 2 2L6 11.6l-2.7.7.7-2.7 7.3-7.3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  }

  function iconDelete() {
    return '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5h11M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M6.8 7.5v4M9.2 7.5v4M3.5 4.5l.6 8.2a1 1 0 0 0 1 .9h5.8a1 1 0 0 0 1-.9l.6-8.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function findCard(list, id) {
    return list.find(function (x) { return x.id === id; });
  }

  function renderBannerUtama() {
    bannerUtamaTbody.innerHTML =
      '<tr>' +
        '<td>Banner Utama</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="bannerUtama" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>' +
      '</tr>';
  }

  function renderBannerCards() {
    bannerCardTbody.innerHTML = "";
    state.bannerCards.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td>' + escapeHtml(c.name) + '</td>' +
        '<td class="cell-headline">' + escapeHtml(c.headline) + '</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="bannerCard" data-id="' + c.id + '" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>';
      bannerCardTbody.appendChild(tr);
    });
  }

  function renderCampaignCards() {
    campaignCardTbody.innerHTML = "";
    state.campaignCards.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td>' + escapeHtml(c.name) + '</td>' +
        '<td class="cell-headline">' + escapeHtml(c.headline) + '</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="campaignCard" data-id="' + c.id + '" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>';
      campaignCardTbody.appendChild(tr);
    });
  }

  function renderBannerAffiliate() {
    bannerAffiliateTbody.innerHTML =
      '<tr>' +
        '<td>Banner Affiliate</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="bannerAffiliate" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>' +
      '</tr>';
  }

  function renderCardAffiliate() {
    cardAffiliateTbody.innerHTML = "";
    state.cardAffiliate.forEach(function (c) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td>' + escapeHtml(c.name) + '</td>' +
        '<td class="cell-headline">' + escapeHtml(c.headline) + '</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="cardAffiliate" data-id="' + c.id + '" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>';
      cardAffiliateTbody.appendChild(tr);
    });
  }

  function renderFaqAffiliate() {
    faqAffiliateTbody.innerHTML = "";
    state.faqAffiliate.forEach(function (f) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="cell-headline">' + escapeHtml(f.judul) + '</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="faq" data-id="' + f.id + '" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>';
      faqAffiliateTbody.appendChild(tr);
    });
  }

  function renderSyarat() {
    syaratTbody.innerHTML = "";
    syaratEmptyState.hidden = state.syaratKetentuan.length > 0;
    state.syaratKetentuan.forEach(function (s, i) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="num-cell">' + (i + 1) + '</td>' +
        '<td class="cell-headline">' + escapeHtml(s.headline) + '</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-open="syarat" data-id="' + s.id + '" title="Edit">' + iconEdit() + '</button>' +
          '<button type="button" class="btn-icon del" data-del="' + s.id + '" data-name="' + escapeHtml(s.headline) + '" title="Hapus">' + iconDelete() + '</button>' +
        '</div></td>';
      syaratTbody.appendChild(tr);
    });
  }

  function renderAll() {
    renderBannerUtama();
    renderBannerCards();
    renderCampaignCards();
    renderBannerAffiliate();
    renderCardAffiliate();
    renderFaqAffiliate();
    renderSyarat();
  }

  function setFieldVisible(fieldEl, visible) {
    fieldEl.hidden = !visible;
  }

  function openEditModal(type, id) {
    var config = typeConfig[type];
    if (!config) return;
    editingType = type;
    editingId = id || null;
    editTitle.textContent = config.title;

    setFieldVisible(pillField, config.fields.indexOf("pill") !== -1);
    setFieldVisible(boldField, config.fields.indexOf("bold") !== -1);
    setFieldVisible(judulField, config.fields.indexOf("judul") !== -1);
    setFieldVisible(headline1Field, config.fields.indexOf("headline1") !== -1);
    setFieldVisible(headline2Field, config.fields.indexOf("headline2") !== -1);
    setFieldVisible(headlineField, config.fields.indexOf("headline") !== -1);
    setFieldVisible(subheadlineField, config.fields.indexOf("subheadline") !== -1);
    setFieldVisible(ctaTextField, config.fields.indexOf("ctaText") !== -1);
    setFieldVisible(ctaUrlField, config.fields.indexOf("ctaUrl") !== -1);
    setFieldVisible(imageField, config.fields.indexOf("image") !== -1);
    setFieldVisible(subheadlineLargeField, config.fields.indexOf("subheadlineLarge") !== -1);
    setFieldVisible(isiField, config.fields.indexOf("isi") !== -1);

    pillInput.value = "";
    boldInput.value = "";
    judulInput.value = "";
    headline1Input.value = "";
    headline2Input.value = "";
    headlineInput.value = "";
    subheadlineInput.value = "";
    ctaTextInput.value = "";
    ctaUrlInput.value = "";
    imageInput.value = "";
    imageFileInput.value = "";
    imagePreview.src = "";
    imagePreview.hidden = true;
    subheadlineLargeInput.value = "";
    isiInput.value = "";

    if (type === "bannerUtama") {
      pillInput.value = state.bannerUtama.pill || "";
      headline1Input.value = state.bannerUtama.headline1 || "";
      headline2Input.value = state.bannerUtama.headline2 || "";
      subheadlineInput.value = state.bannerUtama.subheadline || "";
    } else if (type === "bannerCard") {
      var card = findCard(state.bannerCards, editingId);
      if (!card) return;
      headlineInput.value = card.headline || "";
      subheadlineInput.value = card.subheadline || "";
    } else if (type === "campaignCard") {
      var campaignCard = findCard(state.campaignCards, editingId);
      if (!campaignCard) return;
      headlineInput.value = campaignCard.headline || "";
      subheadlineInput.value = campaignCard.subheadline || "";
      ctaTextInput.value = campaignCard.ctaText || "";
      ctaUrlInput.value = campaignCard.ctaUrl || "";
      imageInput.value = campaignCard.image || "";
      if (campaignCard.image) {
        imagePreview.src = campaignCard.image;
        imagePreview.hidden = false;
      }
    } else if (type === "bannerAffiliate") {
      headlineInput.value = state.bannerAffiliate.headline || "";
      subheadlineInput.value = state.bannerAffiliate.subheadline || "";
    } else if (type === "cardAffiliate") {
      var affCard = findCard(state.cardAffiliate, editingId);
      if (!affCard) return;
      boldInput.value = affCard.bold || "";
      headlineInput.value = affCard.headline || "";
      subheadlineInput.value = affCard.subheadline || "";
    } else if (type === "faq") {
      var faqItem = findCard(state.faqAffiliate, editingId);
      if (!faqItem) return;
      judulInput.value = faqItem.judul || "";
      isiInput.value = faqItem.isi || "";
    } else if (type === "syarat") {
      var syaratItem = findCard(state.syaratKetentuan, editingId);
      if (!syaratItem) return;
      headlineInput.value = syaratItem.headline || "";
      subheadlineLargeInput.value = syaratItem.subheadline || "";
    }

    editModal.classList.add("open");
  }

  function closeEditModal() {
    editModal.classList.remove("open");
    editingType = null;
    editingId = null;
  }

  function saveEdit() {
    if (editingType === "bannerUtama") {
      state.bannerUtama.pill = pillInput.value.trim();
      state.bannerUtama.headline1 = headline1Input.value.trim();
      state.bannerUtama.headline2 = headline2Input.value.trim();
      state.bannerUtama.subheadline = subheadlineInput.value.trim();
      renderBannerUtama();
      persist("bannerUtama");
    } else if (editingType === "bannerCard") {
      var card = findCard(state.bannerCards, editingId);
      if (!card) return;
      card.headline = headlineInput.value.trim();
      card.subheadline = subheadlineInput.value.trim();
      renderBannerCards();
      persist("bannerCards");
    } else if (editingType === "campaignCard") {
      var campaignCard = findCard(state.campaignCards, editingId);
      if (!campaignCard) return;
      campaignCard.headline = headlineInput.value.trim();
      campaignCard.subheadline = subheadlineInput.value.trim();
      campaignCard.ctaText = ctaTextInput.value.trim();
      campaignCard.ctaUrl = ctaUrlInput.value.trim();
      campaignCard.image = imageInput.value.trim();
      renderCampaignCards();
      persist("campaignCards");
    } else if (editingType === "bannerAffiliate") {
      state.bannerAffiliate.headline = headlineInput.value.trim();
      state.bannerAffiliate.subheadline = subheadlineInput.value.trim();
      renderBannerAffiliate();
      persist("bannerAffiliate");
    } else if (editingType === "cardAffiliate") {
      var affCard = findCard(state.cardAffiliate, editingId);
      if (!affCard) return;
      affCard.bold = boldInput.value.trim();
      affCard.headline = headlineInput.value.trim();
      affCard.subheadline = subheadlineInput.value.trim();
      renderCardAffiliate();
      persist("cardAffiliate");
    } else if (editingType === "faq") {
      var faqItem = findCard(state.faqAffiliate, editingId);
      if (!faqItem) return;
      faqItem.judul = judulInput.value.trim();
      faqItem.isi = isiInput.value.trim();
      renderFaqAffiliate();
      persist("faqAffiliate");
    } else if (editingType === "syarat") {
      var syaratItem = findCard(state.syaratKetentuan, editingId);
      if (!syaratItem) return;
      syaratItem.headline = headlineInput.value.trim();
      syaratItem.subheadline = subheadlineLargeInput.value.trim();
      renderSyarat();
      persist("syaratKetentuan");
    } else {
      return;
    }

    AdminShared.toast("Konten berhasil disimpan");
    closeEditModal();
  }

  function addSyarat() {
    syaratSeq += 1;
    var item = { id: "s" + syaratSeq + "_" + Date.now(), headline: "", subheadline: "" };
    state.syaratKetentuan.push(item);
    renderSyarat();
    openEditModal("syarat", item.id);
  }

  function openDeleteModal(id) {
    var item = findCard(state.syaratKetentuan, id);
    if (!item) return;
    deletingId = id;
    deleteNameEl.textContent = item.headline || "Poin ini";
    deleteModal.classList.add("open");
  }

  function closeDeleteModal() {
    deleteModal.classList.remove("open");
    deletingId = null;
  }

  function confirmDelete() {
    if (!deletingId) return;
    state.syaratKetentuan = state.syaratKetentuan.filter(function (x) { return x.id !== deletingId; });
    renderSyarat();
    persist("syaratKetentuan");
    AdminShared.toast("Poin berhasil dihapus");
    closeDeleteModal();
  }

  function handleImageFileChange() {
    var file = imageFileInput.files && imageFileInput.files[0];
    if (!file) return;

    var localPreviewUrl = URL.createObjectURL(file);
    imagePreview.src = localPreviewUrl;
    imagePreview.hidden = false;

    editSaveBtn.disabled = true;
    var originalLabel = editSaveBtn.textContent;
    editSaveBtn.textContent = "Mengupload...";

    AdminShared.uploadImage(file).then(function (path) {
      imageInput.value = path;
      AdminShared.toast("Gambar berhasil diupload");
    }).catch(function (e) {
      AdminShared.toast(e.message || "Gagal upload gambar", "error");
    }).finally(function () {
      editSaveBtn.disabled = false;
      editSaveBtn.textContent = originalLabel;
      URL.revokeObjectURL(localPreviewUrl);
    });
  }

  document.addEventListener("click", function (e) {
    var openBtn = e.target.closest("[data-open]");
    if (openBtn) {
      openEditModal(openBtn.dataset.open, openBtn.dataset.id);
      return;
    }
    var delBtn = e.target.closest("[data-del]");
    if (delBtn) {
      openDeleteModal(delBtn.dataset.del);
    }
  });

  document.getElementById("btnTambahSyarat").addEventListener("click", addSyarat);
  imageFileInput.addEventListener("change", handleImageFileChange);

  document.getElementById("websiteEditCloseBtn").addEventListener("click", closeEditModal);
  document.getElementById("websiteEditCancelBtn").addEventListener("click", closeEditModal);
  editModal.addEventListener("click", function (e) { if (e.target === editModal) closeEditModal(); });
  editSaveBtn.addEventListener("click", saveEdit);

  document.getElementById("syaratDeleteCloseBtn").addEventListener("click", closeDeleteModal);
  document.getElementById("syaratDeleteCancelBtn").addEventListener("click", closeDeleteModal);
  document.getElementById("syaratDeleteConfirmBtn").addEventListener("click", confirmDelete);
  deleteModal.addEventListener("click", function (e) { if (e.target === deleteModal) closeDeleteModal(); });

  renderAll();
  loadFromServer();
})();
