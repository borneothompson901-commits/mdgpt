let currentPage = 'tim';
let editingId = null;
let deletingId = null;
let deletingIds = [];
let sortOrder = null;
let db = {};
const pages = {
    tim: {
        label: 'Tim',
        sub: 'Kelola data anggota tim',
        columns: ['', 'Foto', 'Nama', 'Jabatan', 'Aksi'],
        fields: [{
            key: 'foto',
            label: 'Foto',
            type: 'file'
        }, {
            key: 'nama',
            label: 'Nama',
            type: 'text',
            placeholder: 'Nama lengkap'
        }, {
            key: 'jabatan',
            label: 'Jabatan',
            type: 'text',
            placeholder: 'Jabatan'
        }, ],
    },
    deskripsi: {
        label: 'Deskripsi',
        sub: 'Kelola konten deskripsi',
        columns: ['Kategori', 'Aksi'],
        noAdd: true,
        noDelete: true,
        noLabel: true,
        fields: [{
            key: 'headline',
            label: 'Headline',
            type: 'text',
            placeholder: 'Headline'
        }, {
            key: 'subtext1',
            label: 'Subtext 1',
            type: 'textarea',
            placeholder: 'Subtext 1'
        }, {
            key: 'subtext2',
            label: 'Subtext 2',
            type: 'textarea',
            placeholder: 'Subtext 2'
        }, ],
    },
    webinar: {
        label: 'Webinar',
        sub: 'Kelola data webinar',
        columns: ['', 'Foto', 'Judul Webinar', 'Tag', 'Status', 'HTM', 'Aksi'],
        maxRows: 20,
        custom: true,
    },
    brand: {
        label: 'Brand',
        sub: 'Kelola brand klien',
        columns: ['', 'Media', 'Aksi'],
        maxRows: 25,
        fields: [{
            key: 'media',
            label: 'Media',
            type: 'file'
        }, ],
    },
    testimoniA: {
        label: 'Testimoni A',
        sub: 'Kelola testimoni klien - Grup A',
        columns: ['', 'Foto', 'Nama', 'Jabatan', 'Aksi'],
        maxRows: 20,
        fields: [{
            key: 'foto',
            label: 'Foto',
            type: 'file'
        }, {
            key: 'nama',
            label: 'Nama',
            type: 'text'
        }, {
            key: 'jabatan',
            label: 'Jabatan',
            type: 'text'
        }, {
            key: 'ulasan',
            label: 'Ulasan',
            type: 'textarea'
        }, ],
    },
    testimoniB: {
        label: 'Testimoni B',
        sub: 'Kelola testimoni klien - Grup B',
        columns: ['', 'Nama', 'Jabatan', 'Aksi'],
        maxRows: 20,
        fields: [{
            key: 'nama',
            label: 'Nama',
            type: 'text'
        }, {
            key: 'jabatan',
            label: 'Jabatan',
            type: 'text'
        }, {
            key: 'ulasan',
            label: 'Ulasan',
            type: 'textarea'
        }, ],
    },
    faq: {
        label: 'FAQ',
        sub: 'Kelola pertanyaan yang sering ditanyakan',
        columns: ['', 'Pertanyaan', 'Aksi'],
        maxRows: 10,
        fields: [{
            key: 'headline',
            label: 'Pertanyaan',
            type: 'text',
            placeholder: 'Tulis pertanyaan di sini'
        }, {
            key: 'subheadline',
            label: 'Jawaban',
            type: 'textarea',
            placeholder: 'Tulis jawaban di sini'
        }, ],
    },
    portofolioA: {
        label: 'Portofolio A',
        sub: 'Kelola karya dan portofolio - Grup A',
        multiSection: true,
        sections: [{
            key: 'portofolioA_foto',
            title: 'Feed Instagram',
            sub: 'Sosial Media Client',
            maxRows: 20,
            columns: ['Media', 'Aksi'],
            fields: [{
                key: 'media',
                label: 'Media (Foto)',
                type: 'file'
            }],
        }, {
            key: 'portofolioA_video',
            title: 'Reels',
            sub: 'Sosial Media Client',
            maxRows: 8,
            columns: ['Media', 'Aksi'],
            fields: [{
                key: 'media',
                label: 'Media (Video)',
                type: 'file'
            }],
        }, ],
    },
    portofolioB: {
        label: 'Portofolio B',
        sub: 'Kelola karya dan portofolio - Grup B',
        multiSection: true,
        sections: [{
            key: 'portofolioB_foto',
            title: 'Foto',
            sub: 'Dokumentasi Event',
            maxRows: 20,
            columns: ['Media', 'Aksi'],
            fields: [{
                key: 'media',
                label: 'Media (Foto)',
                type: 'file'
            }],
        }, {
            key: 'portofolioB_video',
            title: 'Video',
            sub: 'Dokumentasi Event',
            maxRows: 8,
            columns: ['Media', 'Aksi'],
            fields: [{
                key: 'media',
                label: 'Media (Video)',
                type: 'file'
            }],
        }, ],
    },
    portofolioC: {
        label: 'Portofolio C',
        sub: 'Kelola karya dan portofolio - Grup C',
        multiSection: true,
        sections: [{
            key: 'portofolioC_foto',
            title: 'Foto',
            sub: 'Foto Produk',
            maxRows: 20,
            columns: ['Media', 'Aksi'],
            fields: [{
                key: 'media',
                label: 'Media (Foto)',
                type: 'file'
            }],
        }, ],
    },
    portofolioD: {
        label: 'Portofolio D',
        sub: 'Kelola karya dan portofolio - Grup D',
        multiSection: true,
        sections: [{
            key: 'portofolioD_foto',
            title: 'Foto',
            sub: 'Ads Marketplace',
            maxRows: 20,
            columns: ['Media', 'Aksi'],
            fields: [{
                key: 'media',
                label: 'Media (Foto)',
                type: 'file'
            }],
        }, ],
    },
    materi: {
        label: 'Materi',
        sub: 'Kelola materi membership',
        columns: ['Bulan', 'Tag', 'Judul', 'Aksi'],
        noAdd: true,
        noDelete: true,
        noLabel: false,
        fixed: true,
        fields: [{
            key: 'tag',
            label: 'Tag',
            type: 'text',
            placeholder: 'Tag materi'
        }, {
            key: 'judul',
            label: 'Judul',
            type: 'text',
            placeholder: 'Judul materi'
        }, {
            key: 'subtext',
            label: 'Subtext',
            type: 'textarea',
            placeholder: 'Deskripsi singkat'
        }, ],
    },
    keuntungan: {
        label: 'Keuntungan',
        sub: 'Kelola keuntungan membership',
        columns: ['', 'Judul', 'Subtext', 'Aksi'],
        maxRows: 15,
        fields: [{
            key: 'judul',
            label: 'Judul',
            type: 'text',
            placeholder: 'Judul keuntungan'
        }, {
            key: 'subtext',
            label: 'Subtext',
            type: 'textarea',
            placeholder: 'Deskripsi keuntungan'
        }, ],
    },
    mentor: {
        label: 'Mentor',
        sub: 'Kelola data mentor',
        columns: ['', 'Foto', 'Nama', 'Aksi'],
        maxRows: 10,
        fields: [{
            key: 'foto',
            label: 'Foto',
            type: 'file'
        }, {
            key: 'badge_title',
            label: 'Badge Title',
            type: 'text',
            placeholder: 'Contoh: S.E., CDS'
        }, {
            key: 'badge_sub',
            label: 'Badge Sub',
            type: 'text',
            placeholder: 'Contoh: Certified Digital Strategist'
        }, {

            key: 'eyebrow',
            label: 'Eyebrow',
            type: 'text',
            placeholder: 'Contoh: Lead Instructor'
        }, {
            key: 'nama',
            label: 'Nama',
            type: 'text',
            placeholder: 'Nama lengkap mentor'
        }, {
            key: 'subtext',
            label: 'Sub Text',
            type: 'text',
            placeholder: 'Contoh: 10+ tahun pengalaman'
        }, {
            key: 'deskripsi',
            label: 'Deskripsi',
            type: 'textarea',
            placeholder: 'Deskripsi singkat tentang mentor'
        }, {
            key: 'exp1',
            label: 'Pengalaman 1',
            type: 'text',
            placeholder: 'Pengalaman 1'
        }, {
            key: 'exp2',
            label: '',
            type: 'text',
            placeholder: 'Pengalaman 2'
        }, {
            key: 'exp3',
            label: '',
            type: 'text',
            placeholder: 'Pengalaman 3'
        }, {
            key: 'exp4',
            label: '',
            type: 'text',
            placeholder: 'Pengalaman 4'
        }, {
            key: 'exp5',
            label: '',
            type: 'text',
            placeholder: 'Pengalaman 5'
        }, ],
    },
    biaya: {
        label: 'Biaya',
        sub: 'Kelola paket dan biaya membership',
        columns: ['Kategori', 'Tag', 'Biaya', 'Aksi'],
        noAdd: true,
        noDelete: true,
        fixed: true,
        fields: [{
                key: 'judul',
                label: 'Judul',
                type: 'text',
                placeholder: 'Contoh: Member Lama 2025'
            },
            {
                key: 'pill1',
                label: 'Pill 1 (Tipe)',
                type: 'text',
                placeholder: 'Contoh: Early Bird / Regular'
            },
            {
                key: 'pill2',
                label: 'Pill 2 (Promo)',
                type: 'text',
                placeholder: 'Contoh: Hemat Rp 300.000! (kosongkan jika tidak ada)'
            }, {
                key: 'harga',
                label: 'Harga',
                type: 'text',
                placeholder: 'Contoh: Rp 299.000'
            }, {
                key: 'subtext',
                label: 'Subtext',
                type: 'text',
                placeholder: 'Contoh: per bulan'
            }, {
                key: 'keterangan1',
                label: 'Keterangan 1',
                type: 'textarea',
                placeholder: 'Keterangan pertama'
            }, {
                key: 'keterangan2',
                label: 'Keterangan 2',
                type: 'textarea',
                placeholder: 'Keterangan kedua'
            },
        ],
    },
    cta: {
        label: 'CTA',
        sub: 'Kelola call-to-action',
        columns: ['Halaman', 'Keterangan', 'Text', 'Aksi'],
        noAdd: true,
        noDelete: true,
        fixed: true,
        fields: [{
            key: 'textNavbar',
            label: 'Text Navbar',
            type: 'text',
            placeholder: 'Teks tombol navbar'
        }, {
            key: 'linkNavbar',
            label: 'Link Navbar',
            type: 'text',
            placeholder: 'https://...'
        }, {
            key: 'textFooter',
            label: 'Text Footer',
            type: 'text',
            placeholder: 'Teks tombol footer'
        }, {
            key: 'linkFooter',
            label: 'Link Footer',
            type: 'text',
            placeholder: 'https://...'
        }, ],
    },
};
Object.keys(pages).forEach(function(k) {
    db[k] = [];
});
var bulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
bulanList.forEach(function(bln, i) {
    db['materi'].push({
        id: 'materi_' + i,
        bulan: bln,
        tag: '',
        judul: '',
        subtext: ''
    });
});
Object.keys(pages).forEach(function(k) {
    var cfg = pages[k];
    if (cfg.multiSection) {
        cfg.sections.forEach(function(s) {
            db[s.key] = [];
        });
    }
});
var biayaSeed = [{
    kategori: 'Member Lama',
    tag: 'Early Bird'
}, {
    kategori: 'Member Baru',
    tag: 'Early Bird'
}, {
    kategori: 'Member Baru',
    tag: 'Regular'
}, ];
biayaSeed.forEach(function(b, i) {
    db['biaya'].push({
        id: 'biaya_' + i,
        kategori: b.kategori,
        tag: b.tag,
        harga: '',
        subtext: '',
        keterangan1: '',
        keterangan2: '',
    });
});
var ctaSeed = [{
    halaman: 'Beranda',
    keterangan: 'Navbar & Footer'
}, {
    halaman: 'Layanan',
    keterangan: 'Navbar & Footer'
}, {
    halaman: 'Webinar',
    keterangan: 'Navbar & Footer'
}, {
    halaman: 'Member',
    keterangan: 'Navbar & Footer'
}, ];
ctaSeed.forEach(function(c, i) {
    db['cta'].push({
        id: 'cta_' + i,
        halaman: c.halaman,
        keterangan: c.keterangan,
        textNavbar: '',
        linkNavbar: '',
        textFooter: '',
        linkFooter: '',
    });
});
const avatarColors = ['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#D97706', '#16A34A', '#0891B2', '#4F46E5', '#BE185D', ];
const dummyTeam = [{
    nama: 'Andi Pratama',
    jabatan: 'CEO & Co-Founder'
}, {
    nama: 'Budi Santoso',
    jabatan: 'Chief Technology Officer'
}, {
    nama: 'Citra Dewi',
    jabatan: 'Head of Product'
}, {
    nama: 'Dian Kusuma',
    jabatan: 'Lead Designer'
}, {
    nama: 'Eko Wahyudi',
    jabatan: 'Backend Engineer'
}, {
    nama: 'Fitri Rahayu',
    jabatan: 'Frontend Engineer'
}, {
    nama: 'Galih Permana',
    jabatan: 'DevOps Engineer'
}, {
    nama: 'Hana Sari',
    jabatan: 'Marketing Manager'
}, {
    nama: 'Ivan Gunawan',
    jabatan: 'Data Analyst'
}, {
    nama: 'Julia Natasya',
    jabatan: 'UI/UX Designer'
}, {
    nama: 'Kevin Tanaka',
    jabatan: 'Mobile Developer'
}, {
    nama: 'Laila Putri',
    jabatan: 'Content Strategist'
}, {
    nama: 'Mario Sitompul',
    jabatan: 'QA Engineer'
}, {
    nama: 'Nina Aprilia',
    jabatan: 'Project Manager'
}, {
    nama: 'Oscar Wijaya',
    jabatan: 'Sales Manager'
}, {
    nama: 'Putri Indah',
    jabatan: 'Customer Success'
}, {
    nama: 'Reza Firmansyah',
    jabatan: 'Full Stack Developer'
}, {
    nama: 'Sinta Melati',
    jabatan: 'Finance Manager'
}, {
    nama: 'Taufik Hidayat',
    jabatan: 'Business Development'
}, {
    nama: 'Umi Kalsum',
    jabatan: 'HR Manager'
}, ];

['Mengenal M-DGPT'].forEach(function(cat, i) {
    db['deskripsi'].push({
        id: 'desk_' + i,
        kategori: cat,
        headline: '',
        subtext1: '',
        subtext2: ''
    });
});
['Youtube Video 1', 'Youtube Video 2', 'Youtube Video 3'].forEach(function(cat, i) {
    db['deskripsi'].push({
        id: 'desk_yt' + i,
        kategori: cat,
        link: '',
        tag: '',
        deskripsi: ''
    });
});

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function trunc(s, n) {
    n = n || 42;
    return s && s.length > n ? s.slice(0, n) + '...' : (s || '—');
}

function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
var sidebar = document.getElementById('sidebar');
var overlay = document.getElementById('overlay');
document.getElementById('hamburgerBtn').addEventListener('click', function() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
});

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
}
document.getElementById('closeBtn').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
document.getElementById('sidebarToggleBtn').addEventListener('click', function() {
    document.body.classList.toggle('sidebar-collapsed');
});
document.addEventListener('click', function(e) {
    var toggle = e.target.closest('.dropdown-toggle');
    if (!toggle) return;
    if (toggle.dataset.page) return;
    if (e.target.closest('[data-page]')) return;
    e.preventDefault();
    e.stopPropagation();
    var parentLi = toggle.parentElement;
    if (parentLi.classList.contains('has-dropdown')) {
        parentLi.classList.toggle('open');
        var dropdownMenu = parentLi.querySelector(':scope > .dropdown-menu');
        if (dropdownMenu) {
            if (parentLi.classList.contains('open')) {
                dropdownMenu.style.display = 'block';
            } else {
                dropdownMenu.style.display = 'none';
            }
        }
    }
});

function showLimitToast(msg) {
    var existing = document.getElementById('faqToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'faqToast';
    toast.className = 'faq-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.classList.add('show');
    }, 10);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 2800);
}

function renderMultiSection() {
    var cfg = pages[currentPage];
    var content = document.getElementById('content');
    content.innerHTML = '<div id="multiSectionWrap"></div>';
    var wrap = document.getElementById('multiSectionWrap');
    cfg.sections.forEach(function(sec) {
        var inner = document.createElement('div');
        inner.className = 'content-inner';
        var head = document.createElement('div');
        head.className = 'page-head';
        head.innerHTML = '<div><h1 class="page-title">' + escHtml(sec.title) + '</h1><p class="page-sub">' + escHtml(sec.sub) + '</p></div>';
        inner.appendChild(head);
        var card = document.createElement('div');
        card.className = 'card';
        var toolbar = document.createElement('div');
        toolbar.className = 'card-toolbar';
        toolbar.innerHTML = '<label class="search-wrap">' + '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' + '<input type="text" class="search-input sec-search" data-seckey="' + sec.key + '" placeholder="Cari data…"/>' + '</label>' + '<div style="margin-left:auto">' + '<button class="btn btn-primary sec-add" data-seckey="' + sec.key + '">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' + 'Tambah ' + sec.title + '</button>' + '</div>';
        card.appendChild(toolbar);
        var tableWrap = document.createElement('div');
        tableWrap.className = 'table-wrap';
        tableWrap.innerHTML = '<table class="data-table">' + '<thead><tr id="thead-' + sec.key + '"></tr></thead>' + '<tbody id="tbody-' + sec.key + '"></tbody>' + '</table>' + '<div class="empty-state" id="empty-' + sec.key + '" style="display:none">' + '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="6" y="10" width="32" height="25" rx="4" stroke="#CBD5E1" stroke-width="1.8"/><path d="M15 21h14M15 27h9" stroke="#CBD5E1" stroke-width="1.6" stroke-linecap="round"/></svg>' + '<p>Belum ada data</p>' + '</div>';
        card.appendChild(tableWrap);
        inner.appendChild(card);
        wrap.appendChild(inner);
        renderSectionTable(sec, '');
    });
    wrap.querySelectorAll('.sec-search').forEach(function(inp) {
        inp.addEventListener('input', function() {
            var sec = pages[currentPage].sections.find(function(s) {
                return s.key === inp.dataset.seckey;
            });
            if (sec) renderSectionTable(sec, inp.value);
        });
    });
    content.querySelectorAll('.sec-add').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var sec = pages[currentPage].sections.find(function(s) {
                return s.key === btn.dataset.seckey;
            });
            if (!sec) return;
            if (sec.maxRows && db[sec.key].length >= sec.maxRows) {
                showLimitToast('Maksimal ' + sec.maxRows + ' ' + sec.title + ' sudah tercapai');
                return;
            }
            openSectionModal(sec, null);
        });
    });
}

function renderSectionTable(sec, filter) {
    var data = db[sec.key].slice();
    var rows = filter ? data.filter(function(r) {
        return Object.values(r).some(function(v) {
            return String(v).toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        });
    }) : data;
    var thead = document.getElementById('thead-' + sec.key);
    var tbody = document.getElementById('tbody-' + sec.key);
    var empty = document.getElementById('empty-' + sec.key);
    if (!rows.length) {
        thead.innerHTML = '<th style="width:36px;padding:9px 10px 9px 16px"><input type="checkbox" disabled /></th>' + sec.columns.map(function(c) {
            return '<th>' + c + '</th>';
        }).join('');
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    thead.innerHTML = '<th style="width:36px;padding:9px 10px 9px 16px"><input type="checkbox" id="masterCheck-' + sec.key + '" /></th>' + sec.columns.map(function(c) {
        return '<th>' + c + '</th>';
    }).join('');
    document.getElementById('masterCheck-' + sec.key).addEventListener('change', function() {
        var checked = this.checked;
        tbody.querySelectorAll('.row-check').forEach(function(c) {
            c.checked = checked;
        });
        updateSectionBulkBar(sec);
    });
    tbody.innerHTML = rows.map(function(r) {
        var checkCell = '<td style="padding:11px 10px 11px 16px;width:36px"><input type="checkbox" class="row-check" data-id="' + r.id + '" /></td>';
        var cells = sec.fields.map(function(f) {
            if (f.type === 'file') return '<td>' + mediaThumb(r[f.key], null, null) + '</td>';
            return '<td>' + trunc(r[f.key]) + '</td>';
        });
        cells.push('<td><div class="actions">' + '<button class="btn-icon edit sec-btn-edit" data-seckey="' + sec.key + '" data-id="' + r.id + '" title="Edit">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10.5l2.5-.5 6-6a1.06 1.06 0 00-1.5-1.5l-6 6-.5 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>' + '</button>' + '<button class="btn-icon del sec-btn-del" data-seckey="' + sec.key + '" data-id="' + r.id + '" title="Hapus">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a1 1 0 001 .9h4a1 1 0 001-.9l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + '</button>' + '</div></td>');
        return '<tr>' + checkCell + cells.join('') + '</tr>';
    }).join('');
    tbody.querySelectorAll('.sec-btn-edit').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var sec = pages[currentPage].sections.find(function(s) {
                return s.key === btn.dataset.seckey;
            });
            var row = db[btn.dataset.seckey].find(function(r) {
                return r.id === btn.dataset.id;
            });
            if (sec && row) openSectionModal(sec, row);
        });
    });
    tbody.querySelectorAll('.sec-btn-del').forEach(function(btn) {
        btn.addEventListener('click', function() {
            activeSectionKey = btn.dataset.seckey;
            deletingId = btn.dataset.id;
            deletingIds = [];
            document.getElementById('confirmTitle').textContent = 'Hapus data ini?';
            confirmBackdrop.classList.add('open');
        });
    });
    tbody.querySelectorAll('.row-check').forEach(function(cb) {
        cb.addEventListener('change', function() {
            updateSectionBulkBar(sec);
        });
    });
}
var activeSectionKey = null;

function updateSectionBulkBar(sec) {
    var barId = 'bulkBar-' + sec.key;
    var bar = document.getElementById(barId);
    var checked = document.querySelectorAll('#tbody-' + sec.key + ' .row-check:checked');
    var count = checked.length;
    if (count === 0) {
        if (bar) bar.remove();
        return;
    }
    var card = document.getElementById('tbody-' + sec.key).closest('.card');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = barId;
        bar.className = 'bulk-bar';
        bar.innerHTML = '<span class="bulk-count" id="bulkCount-' + sec.key + '"></span>' + '<div style="display:flex;gap:6px;margin-left:auto">' + '<button class="btn btn-ghost btn-sm sec-bulk-cancel" data-seckey="' + sec.key + '">Batal</button>' + '<button class="btn btn-danger btn-sm sec-bulk-delete" data-seckey="' + sec.key + '">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a1 1 0 001 .9h4a1 1 0 001-.9l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + 'Hapus' + '</button>' + '</div>';
        card.prepend(bar);
        bar.querySelector('.sec-bulk-delete').addEventListener('click', function() {
            var ids = Array.from(document.querySelectorAll('#tbody-' + sec.key + ' .row-check:checked')).map(function(c) {
                return c.dataset.id;
            });
            activeSectionKey = sec.key;
            deletingIds = ids;
            deletingId = null;
            document.getElementById('confirmTitle').textContent = 'Hapus ' + ids.length + ' data?';
            confirmBackdrop.classList.add('open');
        });
        bar.querySelector('.sec-bulk-cancel').addEventListener('click', function() {
            document.querySelectorAll('#tbody-' + sec.key + ' .row-check').forEach(function(c) {
                c.checked = false;
            });
            var master = document.getElementById('masterCheck-' + sec.key);
            if (master) master.checked = false;
            bar.remove();
        });
    }
    document.getElementById('bulkCount-' + sec.key).textContent = count + ' dipilih';
}

function openSectionModal(sec, rowData) {
    activeSectionKey = sec.key;
    editingId = rowData ? rowData.id : null;
    document.getElementById('modalTitle').textContent = rowData ? 'Edit ' + sec.title : 'Tambah ' + sec.title;
    var mb = document.getElementById('modalBody');
    mb.innerHTML = '';
    sec.fields.forEach(function(f) {
        var div = document.createElement('div');
        div.className = 'field';
        if (f.type === 'file') {
            var existingImg = rowData && rowData[f.key] && rowData[f.key].indexOf('data:') === 0 ? rowData[f.key] : null;
            div.innerHTML = '<label class="upload-area" id="uploadArea-' + f.key + '" style="cursor:pointer">' + '<input type="file" id="field-' + f.key + '" accept="image/*,video/*,.avif,.webp" />' + (existingImg ? '<img id="imgPrev-' + f.key + '" src="' + existingImg + '" style="width:56px;height:56px;border-radius:8px;object-fit:cover;display:block;margin:0 auto 8px;border:2px solid var(--border)" />' : '<div id="uploadIcon-' + f.key + '" class="u-icon"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 13V7M7.5 9.5L10 7l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16.5h10M3.5 13.5A3.5 3.5 0 017 10h.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>') + '<div id="uploadLabel-' + f.key + '" style="font-size:.82rem">' + (existingImg ? 'Ganti file' : 'Upload file') + '</div>' + '<div style="font-size:.71rem;margin-top:2px;opacity:.6">JPG, PNG, WEBP, MP4</div>' + '</label>';
            (function(fkey) {
                setTimeout(function() {
                    var inp = document.getElementById('field-' + fkey);
                    if (!inp) return;
                    inp.addEventListener('change', function() {
                        var file = inp.files[0];
                        if (!file) return;
                        var reader = new FileReader();
                        reader.onload = function(ev) {
                            var icon = document.getElementById('uploadIcon-' + fkey);
                            if (icon) icon.remove();
                            var img = document.getElementById('imgPrev-' + fkey);
                            if (!img) {
                                img = document.createElement('img');
                                img.id = 'imgPrev-' + fkey;
                                img.style.cssText = 'width:56px;height:56px;border-radius:8px;object-fit:cover;display:block;margin:0 auto 8px;border:2px solid var(--border)';
                                document.getElementById('uploadArea-' + fkey).insertBefore(img, document.getElementById('uploadLabel-' + fkey));
                            }
                            img.src = ev.target.result;
                            var lbl = document.getElementById('uploadLabel-' + fkey);
                            if (lbl) lbl.textContent = file.name.length > 24 ? file.name.slice(0, 24) + '...' : file.name;
                        };
                        reader.readAsDataURL(file);
                    });
                }, 0);
            })(f.key);
        } else {
            var v = rowData ? (rowData[f.key] || '') : '';
            div.innerHTML = '<label>' + f.label + '</label>' + '<input type="text" id="field-' + f.key + '" value="' + escHtml(v) + '" placeholder="' + escHtml(f.placeholder || f.label) + '" />';
        }
        mb.appendChild(div);
    });
    modalBackdrop.classList.add('open');
}

function loadDataFromDB(pageType) {
    var formData = new FormData();
    formData.append('action', 'get');
    formData.append('type', pageType);
    var seedData = db[pageType] ? db[pageType].slice() : [];

    return fetch('/api/save-cms-data.php', {
            method: 'POST',
            body: formData
        })
        .then(function(r) {
            return r.json();
        })
        .then(function(data) {
            if (Array.isArray(data) && data.length > 0) {
                db[pageType] = data;
            } else {
                db[pageType] = seedData;
            }
            return db[pageType];
        })
        .catch(function(err) {
            console.error('Error loading data:', err);
            db[pageType] = seedData;
            return db[pageType];
        });
}

function setPage(page) {
    currentPage = page;

    document.getElementById('breadcrumbText').textContent = pages[page].label;
    document.querySelectorAll('.nav-item, .nav-sub').forEach(function(el) {
        el.classList.remove('active');
    });
    var el = document.querySelector('[data-page="' + page + '"]');
    if (el) {
        el.classList.add('active');
        var parent = el.closest('.has-dropdown');
        if (parent) parent.classList.add('open');
    }
    var bar = document.getElementById('bulkBar');
    if (bar) bar.remove();
    var modalBox = document.getElementById('modalBox');
    if (page === 'webinar') {
        modalBox.classList.add('modal-lg');
    } else {
        modalBox.classList.remove('modal-lg');
    }

    var cfg2 = pages[page];
    if (cfg2 && cfg2.multiSection) {
        document.getElementById('content').innerHTML = '<div id="multiSectionWrap"></div>';
        loadDataFromDB(page).then(function() {
            renderMultiSection();
        });
    } else {
        var content = document.getElementById('content');
        content.innerHTML = '<div class="content-inner">' +
            '<div class="page-head"><div>' +
            '<h1 class="page-title" id="pageTitle"></h1>' +
            '<p class="page-sub" id="pageSub"></p>' +
            '</div></div>' +
            '<div class="card">' +
            '<div class="card-toolbar" id="cardToolbar">' +
            '<label class="search-wrap" id="searchWrap">' +
            '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M9.5 9.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
            '<input type="text" class="search-input" id="searchInput" placeholder="Cari data…"/>' +
            '</label>' +
            '</div>' +
            '<div class="table-wrap">' +
            '<table class="data-table"><thead><tr id="tableHead"></tr></thead><tbody id="tableBody"></tbody></table>' +
            '<div class="empty-state" id="emptyState" style="display:none">' +
            '<svg width="44" height="44" viewBox="0 0 44 44" fill="none"><rect x="6" y="10" width="32" height="25" rx="4" stroke="#CBD5E1" stroke-width="1.8"/><path d="M15 21h14M15 27h9" stroke="#CBD5E1" stroke-width="1.6" stroke-linecap="round"/></svg>' +
            '<p>Belum ada data</p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        document.getElementById('searchInput').addEventListener('input', function(e) {
            renderTable(e.target.value);
        });

        document.getElementById('pageTitle').textContent = pages[page].label;
        document.getElementById('pageSub').textContent = pages[page].sub;
        rebuildToolbar();

        loadDataFromDB(page).then(function() {
            renderTable();
        });
    }

    if (window.innerWidth <= 768) closeSidebar();
}

document.querySelectorAll('[data-page]').forEach(function(el) {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        setPage(el.dataset.page);
    });
});

function rebuildToolbar() {
    var toolbar = document.getElementById('cardToolbar');
    var searchWrap = document.getElementById('searchWrap');
    var prevActions = toolbar.querySelector('.toolbar-right');
    if (prevActions) prevActions.remove();
    if (currentPage === 'deskripsi') {
        searchWrap.style.display = '';
        toolbar.classList.remove('toolbar-actions-only');
    } else if (currentPage === 'faq') {
        searchWrap.style.display = 'none';
        toolbar.classList.add('toolbar-actions-only');
        var right = document.createElement('div');
        right.className = 'toolbar-right';
        right.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:8px;';
        right.innerHTML = '<button class="btn btn-primary" id="btnTambahFaq">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' + 'Tambah FAQ' + '</button>';
        toolbar.appendChild(right);
        document.getElementById('btnTambahFaq').addEventListener('click', function() {
            var max = pages['faq'].maxRows;
            if (db['faq'].length >= max) {
                showLimitToast('Maksimal ' + max + ' FAQ sudah tercapai');
                return;
            }
            openModal('Tambah FAQ');
        });
    } else if (currentPage === 'webinar') {
        searchWrap.style.display = '';
        toolbar.classList.remove('toolbar-actions-only');
        var right = document.createElement('div');
        right.className = 'toolbar-right';
        right.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:8px;';
        right.innerHTML = '<button class="btn btn-primary" id="btnTambahWebinar">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' + 'Tambah Webinar' + '</button>';
        toolbar.appendChild(right);
        document.getElementById('btnTambahWebinar').addEventListener('click', function() {
            var max = pages['webinar'].maxRows;
            if (db['webinar'].length >= max) {
                showLimitToast('Maksimal ' + max + ' Webinar sudah tercapai');
                return;
            }
            openWebinarModal(null);
        });
    } else if (currentPage === 'tim') {
        searchWrap.style.display = '';
        toolbar.classList.remove('toolbar-actions-only');
        var right = document.createElement('div');
        right.className = 'toolbar-right';
        right.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:8px;';
        right.innerHTML = '<div class="sort-group">' + '<button class="btn-sort" id="sortAZ">' + '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h4M2 6.5h3M2 9.5h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9.5 2v9M7 9l2.5 2.5L12 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + 'A–Z' + '</button>' + '<button class="btn-sort" id="sortZA">' + '<svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h4M2 6.5h3M2 9.5h2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9.5 11V2M7 4.5L9.5 2 12 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + 'Z–A' + '</button>' + '</div>' + '<button class="btn btn-primary" id="btnTambahTim">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' + 'Tambah Tim' + '</button>';
        toolbar.appendChild(right);
        document.getElementById('btnTambahTim').addEventListener('click', function() {
            openModal('Tambah Tim');
        });
        document.getElementById('sortAZ').addEventListener('click', function() {
            sortOrder = sortOrder === 'asc' ? null : 'asc';
            updateSortButtons();
            renderTable(document.getElementById('searchInput').value);
        });
        document.getElementById('sortZA').addEventListener('click', function() {
            sortOrder = sortOrder === 'desc' ? null : 'desc';
            updateSortButtons();
            renderTable(document.getElementById('searchInput').value);
        });
    } else {
        searchWrap.style.display = '';
        toolbar.classList.remove('toolbar-actions-only');
        var pagesWithAdd = ['testimoniA', 'testimoniB', 'keuntungan', 'mentor', 'brand'];
        if (pagesWithAdd.indexOf(currentPage) !== -1) {
            var right = document.createElement('div');
            right.className = 'toolbar-right';
            right.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:8px;';
            right.innerHTML = '<button class="btn btn-primary" id="btnTambahGeneric">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' + 'Tambah ' + pages[currentPage].label + '</button>';
            toolbar.appendChild(right);
            document.getElementById('btnTambahGeneric').addEventListener('click', function() {
                var max = pages[currentPage].maxRows;
                if (max && db[currentPage].length >= max) {
                    showLimitToast('Maksimal ' + max + ' ' + pages[currentPage].label + ' sudah tercapai');
                    return;
                }
                openModal('Tambah ' + pages[currentPage].label);
            });
        }
    }
}

function updateSortButtons() {
    var az = document.getElementById('sortAZ');
    var za = document.getElementById('sortZA');
    if (!az || !za) return;
    az.classList.toggle('active', sortOrder === 'asc');
    za.classList.toggle('active', sortOrder === 'desc');
}

function updateBulkBar() {
    var bar = document.getElementById('bulkBar');
    var checked = document.querySelectorAll('.row-check:checked');
    var count = checked.length;
    var pagesWithBulk = ['tim', 'faq', 'webinar', 'keuntungan', 'mentor', 'testimoniA', 'testimoniB', 'brand'];

    var masterCb = document.getElementById('masterCheck');
    if (masterCb) {
        var totalRows = document.querySelectorAll('.row-check').length;
        masterCb.checked = totalRows > 0 && count === totalRows;
    }

    if (pagesWithBulk.indexOf(currentPage) === -1 || count === 0) {
        if (bar) bar.remove();
        return;
    }
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'bulkBar';
        bar.className = 'bulk-bar';
        bar.innerHTML = '<span class="bulk-count" id="bulkCount"></span>' + '<div style="display:flex;gap:6px;margin-left:auto">' + '<button class="btn btn-ghost btn-sm" id="btnBulkCancel">Batal</button>' + '<button class="btn btn-danger btn-sm" id="btnBulkDelete">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a1 1 0 001 .9h4a1 1 0 001-.9l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + 'Hapus' + '</button>' + '</div>';
        document.querySelector('.card').prepend(bar);
        document.getElementById('btnBulkDelete').addEventListener('click', function() {
            var ids = Array.from(document.querySelectorAll('.row-check:checked')).map(function(c) {
                return c.dataset.id;
            });
            deletingIds = ids;
            document.getElementById('confirmTitle').textContent = 'Hapus ' + ids.length + ' data?';
            confirmBackdrop.classList.add('open');
        });
        document.getElementById('btnBulkCancel').addEventListener('click', function() {
            document.querySelectorAll('.row-check').forEach(function(c) {
                c.checked = false;
            });
            var masterCb = document.getElementById('masterCheck');
            if (masterCb) masterCb.checked = false;
            updateBulkBar();
        });
    }
    document.getElementById('bulkCount').textContent = count + ' dipilih';
}


function updateSectionBulkBar(sec) {
    var barId = 'bulkBar-' + sec.key;
    var bar = document.getElementById(barId);
    var checked = document.querySelectorAll('#tbody-' + sec.key + ' .row-check:checked');
    var count = checked.length;


    var masterCheck = document.getElementById('masterCheck-' + sec.key);
    if (masterCheck) {
        var totalRows = document.querySelectorAll('#tbody-' + sec.key + ' .row-check').length;
        masterCheck.checked = totalRows > 0 && count === totalRows;
    }

    if (count === 0) {
        if (bar) bar.remove();
        return;
    }
    var card = document.getElementById('tbody-' + sec.key).closest('.card');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = barId;
        bar.className = 'bulk-bar';
        bar.innerHTML = '<span class="bulk-count" id="bulkCount-' + sec.key + '"></span>' + '<div style="display:flex;gap:6px;margin-left:auto">' + '<button class="btn btn-ghost btn-sm sec-bulk-cancel" data-seckey="' + sec.key + '">Batal</button>' + '<button class="btn btn-danger btn-sm sec-bulk-delete" data-seckey="' + sec.key + '">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a1 1 0 001 .9h4a1 1 0 001-.9l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + 'Hapus' + '</button>' + '</div>';
        card.prepend(bar);
        bar.querySelector('.sec-bulk-delete').addEventListener('click', function() {
            var ids = Array.from(document.querySelectorAll('#tbody-' + sec.key + ' .row-check:checked')).map(function(c) {
                return c.dataset.id;
            });
            activeSectionKey = sec.key;
            deletingIds = ids;
            deletingId = null;
            document.getElementById('confirmTitle').textContent = 'Hapus ' + ids.length + ' data?';
            confirmBackdrop.classList.add('open');
        });
        bar.querySelector('.sec-bulk-cancel').addEventListener('click', function() {
            document.querySelectorAll('#tbody-' + sec.key + ' .row-check').forEach(function(c) {
                c.checked = false;
            });
            var master = document.getElementById('masterCheck-' + sec.key);
            if (master) master.checked = false;
            bar.remove();
        });
    }
    document.getElementById('bulkCount-' + sec.key).textContent = count + ' dipilih';
}

function renderTable(filter) {
    filter = filter || '';
    var cfg = pages[currentPage];
    var data = db[currentPage].slice();
    if (currentPage === 'tim' && sortOrder) {
        data.sort(function(a, b) {
            var na = (a.nama || '').toLowerCase(),
                nb = (b.nama || '').toLowerCase();
            return sortOrder === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
        });
    }
    var rows = filter ? data.filter(function(r) {
        if (currentPage === 'tim') return (r.nama || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        if (currentPage === 'faq') return (r.headline || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        if (currentPage === 'webinar') return (r.judul || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        if (currentPage === 'deskripsi') return (r.kategori || '').toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        return Object.values(r).some(function(v) {
            return String(v).toLowerCase().indexOf(filter.toLowerCase()) !== -1;
        });
    }) : data;
    var useCheckbox = ['tim', 'faq', 'webinar', 'keuntungan', 'mentor', 'testimoniA', 'testimoniB', 'brand'].indexOf(currentPage) !== -1;
    var headRow = document.getElementById('tableHead');
    if (useCheckbox) {
        headRow.innerHTML = '<th style="width:36px;padding:9px 10px 9px 16px"><input type="checkbox" id="masterCheck" /></th>' + cfg.columns.slice(1).map(function(c) {
            return '<th>' + c + '</th>';
        }).join('');
        document.getElementById('masterCheck').addEventListener('change', function() {
            var checked = this.checked;
            document.querySelectorAll('.row-check').forEach(function(c) {
                c.checked = checked;
            });
            updateBulkBar();
        });
    } else {
        headRow.innerHTML = cfg.columns.map(function(c) {
            return '<th>' + c + '</th>';
        }).join('');
    }
    var tbody = document.getElementById('tableBody');
    var empty = document.getElementById('emptyState');
    if (!rows.length) {
        if (useCheckbox) {
            headRow.innerHTML = '<th style="width:36px;padding:9px 10px 9px 16px"><input type="checkbox" disabled /></th>' + cfg.columns.slice(1).map(function(c) {
                return '<th>' + c + '</th>';
            }).join('');
        } else {
            headRow.innerHTML = cfg.columns.map(function(c) {
                return '<th>' + c + '</th>';
            }).join('');
        }
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = rows.map(function(r) {
        return buildRow(r, cfg);
    }).join('');
    if (useCheckbox) {
        tbody.querySelectorAll('.row-check').forEach(function(cb) {
            cb.addEventListener('change', updateBulkBar);
        });
    }
    tbody.querySelectorAll('.btn-edit').forEach(function(b) {
        b.addEventListener('click', function() {
            if (currentPage === 'webinar') {
                var row = db['webinar'].find(function(r) {
                    return r.id === b.dataset.id;
                });
                if (row) openWebinarModal(row);
            } else {
                openEditModal(b.dataset.id);
            }
        });
    });
    tbody.querySelectorAll('.btn-del').forEach(function(b) {
        b.addEventListener('click', function() {
            openConfirm(b.dataset.id);
        });
    });
}

function buildRow(row, cfg) {
    var checkCell = '';
    if (['tim', 'faq', 'webinar', 'keuntungan', 'mentor', 'testimoniA', 'testimoniB', 'brand'].indexOf(currentPage) !== -1) {
        checkCell = '<td style="padding:11px 10px 11px 16px;width:36px"><input type="checkbox" class="row-check" data-id="' + row.id + '" /></td>';
    }
    var cells;
    if (currentPage === 'deskripsi') {
        cells = ['<td>' + escHtml(row.kategori) + '</td>'];
    } else if (currentPage === 'webinar') {
        var htmVal = (row.htm || '').trim();
        cells = ['<td>' + mediaThumb(row.foto, null, null) + '</td>', '<td>' + trunc(row.judul, 48) + '</td>', '<td>' + escHtml(row.tag || '—') + '</td>', '<td><span class="badge ' + (row.status === 'Prioritas' ? 'badge-orange' : 'badge-blue') + '">' + escHtml(row.status || 'Regular') + '</span></td>',
            htmVal ? '<td class="htm-cell">' + escHtml(htmVal) + '</td>' : '<td><span class="htm-free">Gratis</span></td>',
        ];
    } else if (currentPage === 'faq') {
        cells = ['<td>' + trunc(row['headline'], 80) + '</td>'];
    } else if (currentPage === 'materi') {
        cells = ['<td>' + escHtml(row.bulan) + '</td>', '<td>' + trunc(row.tag, 30) + '</td>', '<td>' + trunc(row.judul, 48) + '</td>', ];
    } else if (currentPage === 'mentor') {
        cells = ['<td>' + mediaThumb(row.foto, row._initials, row._avatarColor) + '</td>', '<td>' + trunc(row.nama, 48) + '</td>', ];
    } else if (currentPage === 'biaya') {
        var biayaVal = (row.harga || '').trim();
        cells = ['<td>' + escHtml(row.kategori) + '</td>', '<td>' + escHtml(row.tag) + '</td>',
            biayaVal ? '<td>' + escHtml(biayaVal) + '</td>' : '<td><span style="color:var(--text-4);font-style:italic">Belum diisi</span></td>',
        ];
    } else if (currentPage === 'brand') {
        cells = [
            '<td>' + mediaThumb(row.media, null, null) + '</td>',
        ];
    } else if (currentPage === 'testimoniA') {
        cells = ['<td>' + mediaThumb(row.foto, null, null) + '</td>', '<td>' + trunc(row.nama, 32) + '</td>', '<td>' + trunc(row.jabatan, 32) + '</td>', ];
    } else if (currentPage === 'testimoniB') {
        cells = ['<td>' + trunc(row.nama, 32) + '</td>', '<td>' + trunc(row.jabatan, 32) + '</td>', ];
    } else if (currentPage === 'cta') {
        var ctaText = [row.textNavbar, row.textFooter].filter(Boolean).join(' / ');
        cells = ['<td>' + escHtml(row.halaman) + '</td>', '<td>' + escHtml(row.keterangan) + '</td>',
            ctaText ? '<td>' + trunc(ctaText, 40) + '</td>' : '<td><span style="color:var(--text-4);font-style:italic">Belum diisi</span></td>',
        ];
    } else {
        cells = cfg.fields.map(function(f) {
            if (f.type === 'file') return '<td>' + mediaThumb(row[f.key], row._initials, row._avatarColor) + '</td>';
            if (f.key === 'status') {
                var cls = row[f.key] === 'Aktif' ? 'badge-green' : row[f.key] === 'Draft' ? 'badge-gray' : 'badge-blue';
                return '<td><span class="badge ' + cls + '">' + (row[f.key] || '—') + '</span></td>';
            }
            return '<td>' + trunc(row[f.key]) + '</td>';
        });
    }
    var deleteBtn = pages[currentPage].noDelete ? '' : '<button class="btn-icon del btn-del" data-id="' + row.id + '" title="Hapus">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M7.5 6v4M3 3.5l.5 7a1 1 0 001 .9h4a1 1 0 001-.9l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>' + '</button>';
    cells.push('<td><div class="actions">' + '<button class="btn-icon edit btn-edit" data-id="' + row.id + '" title="Edit">' + '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 10.5l2.5-.5 6-6a1.06 1.06 0 00-1.5-1.5l-6 6-.5 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>' + '</button>' + deleteBtn + '</div></td>');
    return '<tr>' + checkCell + cells.join('') + '</tr>';
}

function mediaThumb(val, initials, color) {
    if (!val) {
        if (initials) {
            return '<div class="thumb thumb-avatar" style="background:' + (color || '#2563EB') + '">' + '<span style="color:#fff;font-size:0.72rem;font-weight:700">' + initials + '</span></div>';
        }
        return '<div class="thumb"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#CBD5E1" stroke-width="1.3"/><path d="M2 10l3.5-3.5 3 3 2-2 3.5 3.5" stroke="#CBD5E1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
    }
    if (val.indexOf('/uploads/') === 0) {
        var fixedPath = val;
        return '<div class="thumb"><img src="' + fixedPath + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px;"/></div>';
    }

    if (val.indexOf('/') === 0) {
        return '<div class="thumb"><img src="' + val + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:4px;"/></div>';
    }
    if (val.indexOf('data:image') === 0) return '<div class="thumb"><img src="' + val + '" alt=""/></div>';
    if (val.indexOf('data:video') === 0) return '<div class="thumb"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#CBD5E1" stroke-width="1.3"/><path d="M6.5 6l3.5 2-3.5 2V6z" fill="#CBD5E1"/></svg></div>';
    return '<div class="thumb"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="#CBD5E1" stroke-width="1.3"/><path d="M5.5 5.5h5M5.5 8h3" stroke="#CBD5E1" stroke-width="1.2" stroke-linecap="round"/></svg></div>';
}
var webinarSpeakers = [];
var MAX_SPEAKERS = 6;
var MAX_MATERI = 10;
var MAX_BENEFIT = 10;

function openWebinarModal(rowData) {
    editingId = rowData ? rowData.id : null;
    document.getElementById('modalTitle').textContent = rowData ? 'Edit Webinar' : 'Tambah Webinar';
    webinarSpeakers = rowData && rowData.speakers ? rowData.speakers.slice() : [''];
    var mb = document.getElementById('modalBody');
    mb.innerHTML = '';
    var existingImg = rowData && rowData.foto ? rowData.foto : null;
    var fotoDiv = document.createElement('div');
    fotoDiv.className = 'field';
    fotoDiv.innerHTML = '<label style="font-size:0.73rem;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;">Foto / Thumbnail</label>' + '<label class="upload-area" id="wbUploadArea" style="cursor:pointer">' + '<input type="file" id="wbFotoInput" accept="image/*,.avif,.webp" />' + (existingImg ? '<img id="wbImgPrev" src="' + existingImg + '" style="width:56px;height:56px;border-radius:8px;object-fit:cover;display:block;margin:0 auto 8px;border:2px solid var(--border)" />' : '<div id="wbUploadIcon" class="u-icon"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 13V7M7.5 9.5L10 7l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16.5h10M3.5 13.5A3.5 3.5 0 017 10h.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>') + '<div id="wbUploadLabel" style="font-size:.82rem">' + (existingImg ? 'Ganti foto' : 'Upload foto') + '</div>' + '<div style="font-size:.71rem;margin-top:2px;opacity:.6">JPG, PNG, WEBP, AVIF</div>' + '</label>';
    mb.appendChild(fotoDiv);
    document.getElementById('wbFotoInput').addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            var icon = document.getElementById('wbUploadIcon');
            if (icon) icon.remove();
            var img = document.getElementById('wbImgPrev');
            if (!img) {
                img = document.createElement('img');
                img.id = 'wbImgPrev';
                img.style.cssText = 'width:56px;height:56px;border-radius:8px;object-fit:cover;display:block;margin:0 auto 8px;border:2px solid var(--border)';
                document.getElementById('wbUploadArea').insertBefore(img, document.getElementById('wbUploadLabel'));
            }
            img.src = ev.target.result;
            var lbl = document.getElementById('wbUploadLabel');
            if (lbl) lbl.textContent = file.name.length > 24 ? file.name.slice(0, 24) + '...' : file.name;
        };
        reader.readAsDataURL(file);
    });
    wbField(mb, 'wbJudul', 'text', rowData ? rowData.judul : '', 'Judul Webinar', 'Masukkan judul webinar');
    wbField(mb, 'wbTag', 'text', rowData ? rowData.tag : '', 'Tag Kategori', 'Contoh: N8N, Podcast, Webinar');
    wbField(mb, 'wbCertLink', 'text', rowData ? rowData.certLink : '', 'Link Sertifikat', 'https://drive.google.com/...');
    var spSection = document.createElement('div');
    spSection.className = 'field';
    spSection.innerHTML = '<div class="field-section-label">Pembicara</div>';
    var spList = document.createElement('div');
    spList.className = 'speaker-list';
    spList.id = 'speakerList';
    spSection.appendChild(spList);
    var btnAddSp = document.createElement('button');
    btnAddSp.type = 'button';
    btnAddSp.className = 'btn-add-speaker';
    btnAddSp.id = 'btnAddSpeaker';
    btnAddSp.innerHTML = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Tambah Pembicara';
    spSection.appendChild(btnAddSp);
    mb.appendChild(spSection);
    renderSpeakerList();
    btnAddSp.addEventListener('click', function() {
        if (webinarSpeakers.length >= MAX_SPEAKERS) {
            showLimitToast('Maksimal ' + MAX_SPEAKERS + ' pembicara');
            return;
        }
        webinarSpeakers.push('');
        renderSpeakerList();
    });
    wbField(mb, 'wbTanggal', 'text', rowData ? rowData.tanggal : '', 'Tanggal', 'Contoh: 20 Agustus 2025');
    var statusDiv = document.createElement('div');
    statusDiv.className = 'field';
    statusDiv.innerHTML = '<label style="font-size:0.73rem;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;">Status</label>' + '<select id="wbStatus">' + '<option value="Regular"' + (!rowData || rowData.status === 'Regular' ? ' selected' : '') + '>Regular</option>' + '<option value="Prioritas"' + (rowData && rowData.status === 'Prioritas' ? ' selected' : '') + '>Prioritas</option>' + '</select>';
    mb.appendChild(statusDiv);
    wbField(mb, 'wbVia', 'text', rowData ? rowData.via : '', 'Via (Platform)', 'Contoh: Zoom, Google Meet');
    var htmDiv = document.createElement('div');
    htmDiv.className = 'field';
    htmDiv.innerHTML = '<label style="font-size:0.73rem;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;">HTM (Harga Tiket Masuk)</label>' + '<input type="text" id="wbHtm" placeholder="Kosongkan jika gratis" value="' + escHtml(rowData ? (rowData.htm || '') : '') + '" />' + '<div class="htm-hint">Jika dikosongkan, akan ditampilkan sebagai <strong>Gratis</strong></div>';
    mb.appendChild(htmDiv);
    wbField(mb, 'wbHtmSub', 'text', rowData ? rowData.htmSub : '', 'Subtext Harga', 'Contoh: /orang, sudah termasuk PPN');
    mb.appendChild(buildMultibox('Materi', 'wbMateri', MAX_MATERI, rowData ? rowData.materi : []));
    mb.appendChild(buildMultibox('Benefit', 'wbBenefit', MAX_BENEFIT, rowData ? rowData.benefit : []));
    modalBackdrop.classList.add('open');
}

function wbField(parent, id, type, value, labelText, placeholder) {
    var div = document.createElement('div');
    div.className = 'field';
    div.innerHTML = '<label style="font-size:0.73rem;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;">' + labelText + '</label>' + '<input type="' + type + '" id="' + id + '" value="' + escHtml(value || '') + '" placeholder="' + escHtml(placeholder || '') + '" />';
    parent.appendChild(div);
}

function buildMultibox(labelText, prefix, max, existing) {
    existing = existing || [];
    var div = document.createElement('div');
    div.className = 'field';
    div.innerHTML = '<div class="field-section-label">' + labelText + ' (' + max + ' item)</div>';
    var list = document.createElement('div');
    list.className = 'multibox-list';
    for (var i = 0; i < max; i++) {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.id = prefix + '_' + i;
        inp.placeholder = labelText + ' ' + (i + 1);
        inp.value = existing[i] || '';
        list.appendChild(inp);
    }
    div.appendChild(list);
    return div;
}

function renderSpeakerList() {
    var list = document.getElementById('speakerList');
    if (!list) return;
    list.innerHTML = '';
    webinarSpeakers.forEach(function(sp, idx) {
        var row = document.createElement('div');
        row.className = 'speaker-row';
        row.innerHTML = '<input type="text" id="speaker_' + idx + '" value="' + escHtml(sp) + '" placeholder="Nama pembicara ' + (idx + 1) + '" />' + (webinarSpeakers.length > 1 ? '<button type="button" class="btn-remove-speaker" data-idx="' + idx + '">' + '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' + '</button>' : '');
        list.appendChild(row);
        var inp = document.getElementById('speaker_' + idx);
        (function(i) {
            inp.addEventListener('input', function() {
                webinarSpeakers[i] = inp.value;
            });
        })(idx);
    });
    list.querySelectorAll('.btn-remove-speaker').forEach(function(btn) {
        btn.addEventListener('click', function() {
            webinarSpeakers.splice(parseInt(btn.dataset.idx), 1);
            renderSpeakerList();
        });
    });
    var btnAdd = document.getElementById('btnAddSpeaker');
    if (btnAdd) btnAdd.style.display = webinarSpeakers.length >= MAX_SPEAKERS ? 'none' : '';
}

function saveWebinar() {
    var spList = document.getElementById('speakerList');
    if (spList) {
        spList.querySelectorAll('input').forEach(function(inp, i) {
            webinarSpeakers[i] = inp.value;
        });
    }
    var materi = [],
        benefit = [];
    for (var mi = 0; mi < MAX_MATERI; mi++) {
        var el = document.getElementById('wbMateri_' + mi);
        if (el && el.value.trim()) materi.push(el.value.trim());
    }
    for (var bi = 0; bi < MAX_BENEFIT; bi++) {
        var bel = document.getElementById('wbBenefit_' + bi);
        if (bel && bel.value.trim()) benefit.push(bel.value.trim());
    }
    var row = {
        id: editingId || uid(),
        tag: (document.getElementById('wbTag') || {}).value || '',
        certLink: (document.getElementById('wbCertLink') || {}).value || '',
        judul: (document.getElementById('wbJudul') || {}).value || '',
        tanggal: (document.getElementById('wbTanggal') || {}).value || '',
        status: (document.getElementById('wbStatus') || {}).value || 'Regular',
        via: (document.getElementById('wbVia') || {}).value || '',
        htm: (document.getElementById('wbHtm') || {}).value || '',
        htmSub: (document.getElementById('wbHtmSub') || {}).value || '',
        speakers: webinarSpeakers.filter(function(s) {
            return s.trim();
        }),
        materi: materi,
        benefit: benefit,
        foto: null,
        foto_name: null,
    };
    var fotoInp = document.getElementById('wbFotoInput');
    if (fotoInp && fotoInp.files[0]) {
        var file = fotoInp.files[0];
        uploadFile(file).then(function(filePath) { 
            row.foto = filePath;
            row.foto_name = file.name;
            commitWebinar(row);
        }).catch(function(err) {
            showLimitToast('Error upload: ' + err);
        });
    } else {
        if (editingId) {
            var ex = db['webinar'].find(function(r) {
                return r.id === editingId;
            });
            if (ex) {
                row.foto = ex.foto;
                row.foto_name = ex.foto_name;
            }
        }
        commitWebinar(row);
    }
}

function commitWebinar(row) {
    var allData = Array.isArray(db['webinar']) ? [...db['webinar']] : [];
if (editingId) {
    var idx = allData.findIndex(function(r) { return r.id === editingId; });
    if (idx !== -1) allData[idx] = row;
} else {
    allData.push(row);
}

var saveFormData = new FormData();
saveFormData.append('action', 'save');
saveFormData.append('type', 'webinar');
saveFormData.append('data', JSON.stringify(allData));

    fetch('/api/save-cms-data.php', {
            method: 'POST',
            body: saveFormData
        })
        .then(function(r) {
            return r.json();
        })
        .then(function(result) {
            if (result.error) {
                showLimitToast('Error: ' + result.error);
                return;
            }

            if (editingId) {
                var idx = db['webinar'].findIndex(function(r) {
                    return r.id === editingId;
                });
                if (idx !== -1) db['webinar'][idx] = row;
            } else {
                db['webinar'] = allData;
            }

            closeModal();
            renderTable(document.getElementById('searchInput').value);
            showLimitToast('Webinar tersimpan!');
        })
        .catch(function(err) {
            showLimitToast('Error: ' + err.message);
        });
}
var modalBackdrop = document.getElementById('modalBackdrop');
var modalBody = document.getElementById('modalBody');

function openModal(title, rowData) {
    rowData = rowData || null;
    editingId = rowData ? rowData.id : null;
    document.getElementById('modalTitle').textContent = title;
    modalBody.innerHTML = '';
    if (currentPage === 'deskripsi' && rowData && rowData.kategori.indexOf('Youtube') === 0) {
        var ytFields = [{
            key: 'link',
            type: 'text',
            placeholder: 'Link YouTube'
        }, {
            key: 'tag',
            type: 'text',
            placeholder: 'Tag'
        }, {
            key: 'deskripsi',
            type: 'textarea',
            placeholder: 'Deskripsi'
        }, ];
        ytFields.forEach(function(f) {
            var div = document.createElement('div');
            div.className = 'field';
            if (f.type === 'textarea') {
                div.innerHTML = '<textarea id="field-' + f.key + '" placeholder="' + f.placeholder + '">' + escHtml(rowData[f.key] || '') + '</textarea>';
            } else {
                div.innerHTML = '<input type="text" id="field-' + f.key + '" value="' + escHtml(rowData[f.key] || '') + '" placeholder="' + f.placeholder + '" />';
            }
            modalBody.appendChild(div);
        });
        modalBackdrop.classList.add('open');
        return;
    }
    var cfg = pages[currentPage];
    var noLabel = !!cfg.noLabel;
    var fields = cfg.fields.filter(function(f) {
        if (currentPage === 'deskripsi' && editingId === 'desk_0' && f.key === 'headline') return false;
        return true;
    });
    fields.forEach(function(f) {
        var div = document.createElement('div');
        div.className = 'field';
        if (f.type === 'file') {
            var existingImg = null;
            if (rowData && rowData[f.key] && typeof rowData[f.key] === 'string') {
                var val = rowData[f.key];
                if (val.indexOf('data:image') === 0) {
                    existingImg = val;
                } else if (val.indexOf('/uploads/') === 0) {
                    existingImg = val;
                } else if (val.indexOf('/') === 0) {
                    existingImg = val;
                }
            }
            var existingInitials = rowData && rowData._initials ? rowData._initials : null;
            var existingColor = rowData && rowData._avatarColor ? rowData._avatarColor : '#2563EB';
            var previewHtml = existingImg ? '<img id="imgPrev-' + f.key + '" src="' + existingImg + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 8px;border:2px solid var(--border)" />' : existingInitials ? '<div id="avatarPrev-' + f.key + '" style="width:56px;height:56px;border-radius:50%;background:' + existingColor + ';display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-weight:700;color:#fff;font-size:1.1rem">' + existingInitials + '</div>' : '<div id="uploadIcon-' + f.key + '" class="u-icon"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M10 13V7M7.5 9.5L10 7l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16.5h10M3.5 13.5A3.5 3.5 0 017 10h.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>';
            div.innerHTML = '<label class="upload-area" id="uploadArea-' + f.key + '" style="cursor:pointer">' + '<input type="file" id="field-' + f.key + '" accept="image/*,video/*,.avif,.webp" />' + previewHtml + '<div id="uploadLabel-' + f.key + '" style="font-size:.82rem">' + (existingImg ? 'Ganti foto' : 'Upload foto') + '</div>' + '<div style="font-size:.71rem;margin-top:2px;opacity:.6">JPG, PNG, WEBP, AVIF</div>' + '</label>';
        } else if (f.type === 'textarea') {
            var v = rowData ? (rowData[f.key] || '') : '';
            div.innerHTML = (noLabel ? '' : '<label>' + f.label + '</label>') + '<textarea id="field-' + f.key + '" placeholder="' + escHtml(f.placeholder || f.label) + '">' + escHtml(v) + '</textarea>';
        } else if (f.type === 'select') {
            var opts = f.options.map(function(o) {
                return '<option' + (rowData && rowData[f.key] === o ? ' selected' : '') + ' value="' + o + '">' + o + '</option>';
            }).join('');
            div.innerHTML = (noLabel ? '' : '<label>' + f.label + '</label>') + '<select id="field-' + f.key + '">' + opts + '</select>';
        } else {
            var v2 = rowData ? (rowData[f.key] || '') : '';
            div.innerHTML = (noLabel ? '' : '<label>' + f.label + '</label>') + '<input type="text" id="field-' + f.key + '" value="' + escHtml(v2) + '" placeholder="' + escHtml(f.placeholder || f.label) + '" />';
        }
        modalBody.appendChild(div);
        if (f.type === 'file') {
            (function(fkey) {
                var inp = document.getElementById('field-' + fkey);
                inp.addEventListener('change', function() {
                    var file = inp.files[0];
                    if (!file) return;
                    var reader = new FileReader();
                    reader.onload = function(ev) {
                        var avatar = document.getElementById('avatarPrev-' + fkey);
                        if (avatar) avatar.remove();
                        var icon = document.getElementById('uploadIcon-' + fkey);
                        if (icon) icon.remove();
                        var img = document.getElementById('imgPrev-' + fkey);
                        if (!img) {
                            img = document.createElement('img');
                            img.id = 'imgPrev-' + fkey;
                            img.style.cssText = 'width:56px;height:56px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 8px;border:2px solid var(--border)';
                            document.getElementById('uploadArea-' + fkey).insertBefore(img, document.getElementById('uploadLabel-' + fkey));
                        }
                        img.src = ev.target.result;
                        var lbl = document.getElementById('uploadLabel-' + fkey);
                        if (lbl) lbl.textContent = file.name.length > 24 ? file.name.slice(0, 24) + '...' : file.name;
                    };
                    reader.readAsDataURL(file);
                });
            })(f.key);
        }
    });
    modalBackdrop.classList.add('open');
}

function closeModal() {
    modalBackdrop.classList.remove('open');
    editingId = null;
    activeSectionKey = null;
}
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', function(e) {
    if (e.target === modalBackdrop) closeModal();
});
async function saveSectionModal() {
    var sec = null;
    var cfg = pages[currentPage];
    if (cfg && cfg.sections) {
        sec = cfg.sections.find(function(s) { return s.key === activeSectionKey; });
    }
    if (!sec) return;

    var existing = editingId ? (db[activeSectionKey].find(function(r) { return r.id === editingId; }) || {}) : {};
    var row = Object.assign({}, existing, { id: editingId || uid() });

    for (var i = 0; i < sec.fields.length; i++) {
        var f = sec.fields[i];
        if (f.type === 'file') {
            var inp = document.getElementById('field-' + f.key);
            var file = inp && inp.files[0];
            if (file) {
                try {
                    var filePath = await uploadFile(file);
                    row[f.key] = filePath;
                } catch (err) {
                    showLimitToast('Error upload: ' + err);
                    return;
                }
            } else if (editingId) {
                var ex = db[activeSectionKey].find(function(r) { return r.id === editingId; });
                if (ex) row[f.key] = ex[f.key];
            }
        } else {
            var el = document.getElementById('field-' + f.key);
            row[f.key] = el ? el.value.trim() : '';
        }
    }

    var allData = Array.isArray(db[activeSectionKey]) ? [...db[activeSectionKey]] : [];
    if (editingId) {
        var idx = allData.findIndex(function(r) { return r.id === editingId; });
        if (idx !== -1) allData[idx] = row;
    } else {
        allData.push(row);
    }

    var saveFormData = new FormData();
    saveFormData.append('action', 'save');
    saveFormData.append('type', activeSectionKey);
    saveFormData.append('data', JSON.stringify(allData));

    var response = await fetch('/api/save-cms-data.php', { method: 'POST', body: saveFormData });
    var result = await response.json();

    if (result.error) {
        showLimitToast('Error: ' + result.error);
        return;
    }

    db[activeSectionKey] = allData;
    closeModal();
    renderSectionTable(sec, '');
    showLimitToast('Data tersimpan!');
}
document.getElementById('modalSave').addEventListener('click', async function() {
    try {
        if (currentPage === 'webinar') {
            saveWebinar();
            return;
        }

        if (activeSectionKey) {
            await saveSectionModal();
            return;
        }

        var existing = editingId ? (db[currentPage].find(function(r) {
            return r.id === editingId;
        }) || {}) : {};
        var row = Object.assign({}, existing, {
            id: editingId || uid()
        });
        var isYoutube = existing.kategori && existing.kategori.indexOf('Youtube') === 0;

        var fields;
        if (isYoutube) {
            fields = [{
                    key: 'link',
                    type: 'text'
                },
                {
                    key: 'tag',
                    type: 'text'
                },
                {
                    key: 'deskripsi',
                    type: 'text'
                }
            ];
        } else {
            fields = pages[currentPage].fields || [];
            if (currentPage === 'deskripsi' && editingId === 'desk_0') {
                fields = fields.filter(function(f) {
                    return f.key !== 'headline';
                });
            }
        }

        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            if (f.type === 'file') {
                var inp = document.getElementById('field-' + f.key);
                var file = inp && inp.files[0];
                if (file) {
                    try {
                        var filePath = await uploadFile(file);
                        row[f.key] = filePath;
                    } catch (err) {
                        showLimitToast('Error upload: ' + err);
                        return;
                    }
                } else if (editingId) {
                    var ex = db[currentPage].find(function(r) {
                        return r.id === editingId;
                    });
                    if (ex) row[f.key] = ex[f.key];
                }
            } else {
                var el = document.getElementById('field-' + f.key);
                row[f.key] = el ? el.value.trim() : '';
            }
        }

        if (currentPage === 'tim') {
            row.photo = row.foto || '';
            row.name = row.nama || '';
            row.role = row.jabatan || '';
        }

        var allData = Array.isArray(db[currentPage]) ? [...db[currentPage]] : [];

        if (editingId) {
            var idx = allData.findIndex(function(r) {
                return r.id === editingId;
            });
            if (idx !== -1) {
                allData[idx] = row;
            }
        } else {
            allData.push(row);
        }

        var saveFormData = new FormData();
        saveFormData.append('action', 'save');
        saveFormData.append('type', currentPage);
        saveFormData.append('data', JSON.stringify(allData));

        var response = await fetch('/api/save-cms-data.php', {
            method: 'POST',
            body: saveFormData
        });

        var result = await response.json();

        if (result.error) {
            showLimitToast('Error: ' + result.error);
            return;
        }

        db[currentPage] = allData;

        closeModal();
        renderTable(document.getElementById('searchInput').value);
        showLimitToast('Data tersimpan!');

    } catch (err) {
        showLimitToast('Error: ' + (err.message || err));
    }
});

function uploadFile(file) {
    return new Promise(function(resolve, reject) {
        var formData = new FormData();
        formData.append("file", file);

        fetch("/api/upload-file.php", {
                method: "POST",
                body: formData
            })
            .then(r => r.json())
            .then(data => {
                if (data.error) reject(data.error);
                else resolve(data.path);
            })
            .catch(reject);
    });
}

function openEditModal(id) {
    var row = db[currentPage].find(function(r) {
        return r.id === id;
    });
    if (row) openModal('Edit ' + pages[currentPage].label, row);
}
var confirmBackdrop = document.getElementById('confirmBackdrop');

function openConfirm(id) {
    deletingId = id;
    deletingIds = [];
    document.getElementById('confirmTitle').textContent = 'Hapus data ini?';
    confirmBackdrop.classList.add('open');
}

function closeConfirm() {
    confirmBackdrop.classList.remove('open');
    deletingId = null;
    deletingIds = [];
    document.getElementById('confirmTitle').textContent = 'Hapus data ini?';
}
document.getElementById('confirmClose').addEventListener('click', closeConfirm);
document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
confirmBackdrop.addEventListener('click', function(e) {
    if (e.target === confirmBackdrop) closeConfirm();
});
document.getElementById('confirmDelete').addEventListener('click', function() {
    try {
        if (deletingIds.length > 0) {
            var deleteFormData = new FormData();
            deleteFormData.append('action', 'delete_bulk');
            deleteFormData.append('type', currentPage);
            deleteFormData.append('ids', JSON.stringify(deletingIds));

            fetch('/api/save-cms-data.php', {
                    method: 'POST',
                    body: deleteFormData
                })
                .then(function(r) {
                    return r.json();
                })
                .then(function(result) {
                    if (!result.error) {
                        db[currentPage] = db[currentPage].filter(function(r) {
                            return deletingIds.indexOf(r.id) === -1;
                        });
                        showLimitToast('Data dihapus!');
                    } else {
                        showLimitToast('Error: ' + result.error);
                    }
                    closeConfirm();
                    renderTable(document.getElementById('searchInput').value);
                });
        } else if (deletingId) {
            var deleteFormData = new FormData();
            deleteFormData.append('action', 'delete');
            deleteFormData.append('type', currentPage);
            deleteFormData.append('id', deletingId);

            fetch('/api/save-cms-data.php', {
                    method: 'POST',
                    body: deleteFormData
                })
                .then(function(r) {
                    return r.json();
                })
                .then(function(result) {
                    if (!result.error) {
                        db[currentPage] = db[currentPage].filter(function(r) {
                            return r.id !== deletingId;
                        });
                        showLimitToast('Data dihapus!');
                    } else {
                        showLimitToast('Error: ' + result.error);
                    }
                    closeConfirm();
                    renderTable(document.getElementById('searchInput').value);
                });
        }
    } catch (err) {
        showLimitToast('Error: ' + err.message);
    }
});

document.getElementById('btnSimpanPerubahan').addEventListener('click', function() {
    var btn = this;
    btn.disabled = true;
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Menyimpan...';

    setTimeout(function() {
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Tersimpan!';
        btn.style.background = 'var(--green, #16A34A)';
        setTimeout(function() {
            btn.disabled = false;
            btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 7l3.5 3.5L11 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Simpan Perubahan';
            btn.style.background = '';
        }, 2000);
    }, 1000);
});
window.addEventListener('load', function() {
    setPage('tim');
    setTimeout(function() {
        var loader = document.getElementById('pageLoader');
        loader.classList.add('hide');
        setTimeout(function() {
            loader.remove();
        }, 400);
    }, 800);
});
