(async function () {
  try {

    // Kosongkan teks dummy timeline sebelum fetch — biar ga ada fog
    // Pattern sama kayak testimoni: clear dulu, isi dari CMS
    document.querySelectorAll('.tl-item').forEach(item => {
        const t = item.querySelector('.tl-item__title');
        const d = item.querySelector('.tl-item__detail');
        const g = item.querySelector('.tl-item__tag');
        if (t) t.textContent = '';
        if (d) d.textContent = '';
        if (g) g.textContent = '';
    });

    const [resTim, resDesk, resMateri] = await Promise.all([
        fetch("api/public_contents.php?type=tim",      { cache: "no-store" }),
        fetch("api/public_contents.php?type=deskripsi",{ cache: "no-store" }),
        fetch("api/public_contents.php?type=materi",   { cache: "no-store" })
    ]);

    const dataTim    = await resTim.json();
    const dataDesk   = await resDesk.json();
    const dataMateri = await resMateri.json();

    // --- RENDER MENGENAL M-DGPT ---
    if (dataDesk && dataDesk.length > 0) {
        const desk = dataDesk.find(d => d.kategori === 'Mengenal M-DGPT') || dataDesk[0];
        const wwaTexts = document.querySelectorAll('.wwa__text');
        if (wwaTexts[0] && desk.subtext1) wwaTexts[0].innerHTML = desk.subtext1;
        if (wwaTexts[1] && desk.subtext2) wwaTexts[1].innerHTML = desk.subtext2;

        // --- RENDER YOUTUBE ---
        const ytVideos = dataDesk.filter(d => d.kategori && d.kategori.indexOf('Youtube') === 0);
        const vidCards = document.querySelectorAll('.vid-card');
        ytVideos.forEach(function(yt, i) {
            if (!vidCards[i]) return;

            const link = (yt.link || '').trim();
            if (link) {
                const iframe = vidCards[i].querySelector('.vid-card__iframe');
                if (iframe) iframe.src = link;
            }

            const tag = vidCards[i].querySelector('.vid-card__tag');
            if (tag && yt.tag && yt.tag.trim()) tag.textContent = yt.tag.trim();

            const title = vidCards[i].querySelector('.vid-card__title');
            if (title && yt.deskripsi && yt.deskripsi.trim()) title.textContent = yt.deskripsi.trim();
        });
    }

    // --- RENDER SLIDER TIM ---
    const sliderTrack = document.getElementById("sliderTrack");
    if (sliderTrack && Array.isArray(dataTim)) {
        sliderTrack.innerHTML = "";
        const teamData = dataTim.map(member => ({
            photo: member.foto ? '/mdgpt' + member.foto : 'assets/img/default-avatar.png',
            name: member.nama || '',
            role: member.jabatan || ''
        }));
        window.__cmsTeamData = teamData;
        document.dispatchEvent(new CustomEvent("cms:teamDataReady", {
            detail: { teamData: teamData }
        }));
    }

    // --- RENDER TIMELINE MATERI ---
    const tlSection = document.getElementById('workshop-timeline');
    if (tlSection && Array.isArray(dataMateri) && dataMateri.length) {

        const TAG_CLASS_BY_MONTH = [
            'tag--llm',       // 0  Januari
            'tag--gen',       // 1  Februari
            'tag--gen',       // 2  Maret
            'tag--llm',       // 3  April
            'tag--mkt',       // 4  Mei
            'tag--challenge', // 5  Juni
            'tag--dev',       // 6  Juli
            'tag--llm',       // 7  Agustus
            'tag--edu',       // 8  September
            'tag--dev',       // 9  Oktober
            'tag--dev',       // 10 November
            'tag--challenge', // 11 Desember
        ];

        const ALL_TAG_CLASSES = ['tag--llm','tag--gen','tag--mkt','tag--dev','tag--edu','tag--challenge'];

        const BULAN_ORDER = [
            'Januari','Februari','Maret','April','Mei','Juni',
            'Juli','Agustus','September','Oktober','November','Desember',
        ];

        const byMonth = {};
        dataMateri.forEach(row => {
            const idx = BULAN_ORDER.indexOf(row.bulan);
            if (idx !== -1) byMonth[idx] = row;
        });

        tlSection.querySelectorAll('.tl-item').forEach(item => {
            const monthIndex = parseInt(item.getAttribute('data-month'), 10) - 1;
            const row = byMonth[monthIndex];
            if (!row) return;

            const tagEl = item.querySelector('.tl-item__tag');
            if (tagEl) {
                tagEl.textContent = row.tag ? row.tag.trim() : '';
                ALL_TAG_CLASSES.forEach(cls => tagEl.classList.remove(cls));
                tagEl.classList.add(TAG_CLASS_BY_MONTH[monthIndex] || 'tag--llm');
            }

            const titleEl = item.querySelector('.tl-item__title');
            if (titleEl) titleEl.textContent = row.judul ? row.judul.trim() : '';

            const detailEl = item.querySelector('.tl-item__detail');
            if (detailEl) detailEl.textContent = row.subtext ? row.subtext.trim() : '';
        });
    }

  } catch (e) {
    console.error("Gagal memuat data CMS:", e);
  }
})();