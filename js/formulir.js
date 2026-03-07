

var SPEAKER_COLS = { 1: 1, 2: 2, 3: 3, 4: 2, 5: 3 };

var currentProgram = null;

(function init() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");

  fetch("api/public_contents.php?type=webinar", { cache: "no-store" })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!Array.isArray(data) || !data.length) {
        showNotFound(); return;
      }
      var program;
      if (id) {
        program = data.find(function(w) { return w.id === id; });
      } else {
        program = data[0];
      }

      if (!program) { showNotFound(); return; }
      var p = {
        id:        program.id,
        tag: program.tag || '—',
        title:     program.judul  || '—',
        img:       program.foto   ? '/mdgpt' + program.foto : '',
        certLink: program.certLink
  ? (program.certLink.startsWith('http') ? program.certLink : 'https://' + program.certLink)
  : '#',
        speakers:  Array.isArray(program.speakers)
                     ? program.speakers.map(function(s) {
                         return { name: s, role: '', avatar: '' };
                       })
                     : [],
        dateTime:  program.tanggal || '—',
        via:       program.via    || '—',
        price:     program.htm    || 'Gratis',
        htmSub:   program.htmSub || '',
        materi:    Array.isArray(program.materi)  ? program.materi  : [],
        benefit:   Array.isArray(program.benefit) ? program.benefit : [],
      };

      currentProgram = p;
      populatePage(p);
      injectSuccessBlock(p);
      initUpload();
      initCopyBtn();
      initForm();
    })
    .catch(function(err) { 
  console.error('formulir catch error:', err); 
  showNotFound(); 
});
})();

function showNotFound() {
  document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:16px;font-family:sans-serif;color:#aaa"><p style="font-size:18px">Program tidak ditemukan.</p><a href="workshop.html" style="color:#393df5">← Kembali ke katalog</a></div>';
}

function populatePage(p) {
  if (!p) return;

  setText("detBreadcrumb", p.tag);
  document.title = (p.title || "Detail Program") + " \u2013 Workshop & Webinar";

  if (p.img) {
    var img = document.getElementById("detFlyerImg");
    var ph  = document.getElementById("detFlyerPlaceholder");
    if (img) {
      var tempImg = new Image();
      tempImg.onload = function () {
        img.src = p.img;
        img.alt = p.title || "";
        img.removeAttribute("hidden");
        img.style.display = "";
        if (ph) { ph.setAttribute("hidden", ""); ph.style.display = "none"; }
      };
      tempImg.onerror = function () {
        img.setAttribute("hidden", "");
        if (ph) { ph.removeAttribute("hidden"); ph.style.display = ""; }
      };
      tempImg.src = p.img;
    }
  }

  var certBtn = document.getElementById("detCertBtn");
  if (certBtn) certBtn.href = p.certLink || "#";

  setText("detTag",        p.tag);
  setText("detTitle",      p.title);
  setText("detDateTime",   p.dateTime);
  setText("detVia",        p.via);
  var priceEl = document.getElementById("detPrice");
if (priceEl) {
  priceEl.innerHTML = escHtml(p.price) 
    + (p.htmSub ? '<span style="font-size:0.75em;font-weight:400;color:#888">' + escHtml(p.htmSub) + '</span>' : '');
}
var sheetPriceEl = document.getElementById("detSheetPrice");
if (sheetPriceEl) {
  sheetPriceEl.innerHTML = escHtml(p.price)
    + (p.htmSub ? '<span style="font-size:0.75em;font-weight:400;color:#888">' + escHtml(p.htmSub) + '</span>' : '');
}

  var speakers = Array.isArray(p.speakers)
    ? p.speakers.slice(0, 5)
    : (p.speaker ? [p.speaker] : []);

  renderSpeakers(speakers);

  var materiList = document.getElementById("detMateriList");
  if (materiList && Array.isArray(p.materi)) {
    p.materi.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      materiList.appendChild(li);
    });
  }

  var benefitList = document.getElementById("detBenefitList");
  if (benefitList && Array.isArray(p.benefit)) {
    p.benefit.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item;
      benefitList.appendChild(li);
    });
  }

if (!p.price || p.price.toLowerCase() === 'gratis') {
  var uploadField = document.getElementById("detUploadWrap");
  if (uploadField) uploadField.closest('.det-form__field') && (uploadField.closest('.det-form__field').style.display = 'none');
  
  var bankBar = document.querySelector(".det-form-sheet__bank");
  if (bankBar) bankBar.style.display = 'none';
  
  var buktiInput = document.getElementById("fBukti");
  if (buktiInput) buktiInput.removeAttribute("required");
}
}

function injectSuccessBlock(p) {
  var sheet = document.querySelector(".det-form-sheet");
  if (!sheet) return;

  var programTitle = (p && p.title) ? escHtml(p.title) : "Program";
  var programPrice = (p && p.price) ? escHtml(p.price) : "\u2014";

  var block = document.createElement("div");
  block.className = "det-success";
  block.id = "detSuccess";
  block.innerHTML =
    '<div class="det-success__ring">'
      + '<svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">'
        + '<circle class="det-success__ring-track" cx="44" cy="44" r="36" stroke-width="5" fill="none"/>'
        + '<circle class="det-success__ring-fill" cx="44" cy="44" r="36" stroke-width="5" fill="none" stroke="url(#ringGrad)"/>'
        + '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="88" y2="88" gradientUnits="userSpaceOnUse">'
          + '<stop stop-color="#a91ab6"/>'
          + '<stop offset="1" stop-color="#047bfe"/>'
        + '</linearGradient></defs>'
      + '</svg>'
      + '<div class="det-success__check">'
        + '<svg viewBox="0 0 36 36" fill="none">'
          + '<path class="det-success__check-path" d="M9 18.5L15.5 25L27 11" stroke="url(#checkGrad)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>'
          + '<defs><linearGradient id="checkGrad" x1="9" y1="11" x2="27" y2="25" gradientUnits="userSpaceOnUse">'
            + '<stop stop-color="#a91ab6"/>'
            + '<stop offset="1" stop-color="#047bfe"/>'
          + '</linearGradient></defs>'
        + '</svg>'
      + '</div>'
    + '</div>'
    + '<p class="det-success__label">Pendaftaran Terkirim</p>'
    + '<h3 class="det-success__title">Yeay, kamu sudah terdaftar!</h3>'
    + '<p class="det-success__desc">Kami akan segera memverifikasi pembayaranmu. Konfirmasi akan dikirim melalui WhatsApp dalam 1×24 jam.</p>'
    + '<div class="det-success__meta">'
      + '<div class="det-success__meta-icon">'
        + '<svg viewBox="0 0 20 20" fill="none"><path d="M4 5h12M4 9h8M4 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
      + '</div>'
      + '<div class="det-success__meta-text">'
        + '<span class="det-success__meta-label">Program yang didaftarkan</span>'
        + '<span class="det-success__meta-val">' + programTitle + ' · ' + programPrice + '</span>'
      + '</div>'
    + '</div>'
    + '<a href="https://wa.me/6287777222572" class="det-success__wa" target="_blank" rel="noopener noreferrer">'
      + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
      + 'Hubungi Kami via WhatsApp'
    + '</a>';

  sheet.appendChild(block);
}

function renderSpeakers(speakers) {
  var grid = document.getElementById("detSpeakersGrid");
  if (!grid) return;
  if (!Array.isArray(speakers) || speakers.length === 0) return;

  var count = speakers.length;
  var cols  = SPEAKER_COLS[count] || 1;

  grid.style.setProperty("--spk-cols", cols);
  grid.className = "det-info__speakers-grid det-info__speakers-grid--" + count;

  speakers.forEach(function (spk) {
    if (!spk) return;

    var card = document.createElement("div");
    card.className = "det-spk-card";

    var avatarHtml = spk.avatar
      ? '<div class="det-spk-card__avatar"><img src="' + escHtml(spk.avatar) + '" alt="' + escHtml(spk.name || "") + '" /></div>'
      : '<div class="det-spk-card__avatar"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="12" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M4 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></div>';

    card.innerHTML = avatarHtml
      + '<div class="det-spk-card__text">'
      + '<span class="det-spk-card__name">' + escHtml(spk.name || "\u2014") + '</span>'
      + '<span class="det-spk-card__role">' + escHtml(spk.role || "") + '</span>'
      + '</div>';

    grid.appendChild(card);
  });
}

function escHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initUpload() {
  var wrap  = document.getElementById("detUploadWrap");
  var input = document.getElementById("fBukti");
  var idle  = document.getElementById("detUploadIdle");
  var done  = document.getElementById("detUploadDone");
  var fname = document.getElementById("detUploadFname");
  var rmBtn = document.getElementById("detUploadRm");

  if (!input || !idle || !done || !fname || !rmBtn) return;

  input.addEventListener("change", function () {
    var file = input.files && input.files[0];
    if (!file) return;
    fname.textContent = file.name;
    idle.hidden = true;
    done.hidden = false;
    if (wrap) wrap.classList.remove("is-error");
    clearError(input);
  });

  rmBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    input.value = "";
    idle.hidden = false;
    done.hidden = true;
    fname.textContent = "";
  });
}

function initCopyBtn() {
  var btn = document.getElementById("detCopyBtn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    var noEl  = document.getElementById("detSheetBankNo");
    var label = btn.querySelector("span");
    if (!noEl) return;

    var no = noEl.textContent.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(no).then(function () {
        if (label) label.textContent = "Tersalin!";
        setTimeout(function () { if (label) label.textContent = "Salin"; }, 2000);
      }).catch(function () {
        if (label) label.textContent = "Gagal";
        setTimeout(function () { if (label) label.textContent = "Salin"; }, 2000);
      });
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = no;
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        if (label) label.textContent = "Tersalin!";
        setTimeout(function () { if (label) label.textContent = "Salin"; }, 2000);
      } catch (err) {
        if (label) label.textContent = "Gagal";
        setTimeout(function () { if (label) label.textContent = "Salin"; }, 2000);
      }
    }
  });
}

// google
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx13w5fuGHozshr9xJrBj2z5SnW9ZPqn_SIr_O6shg3qqnhEgmmGGMWNybpdBZFuciMjg/exec";

function initForm() {
  var form = document.getElementById("detForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateForm(form)) return;

    var btn      = form.querySelector(".det-form__submit");
    var btnLabel = btn ? btn.querySelector("span") : null;

    if (btn) btn.disabled = true;
    if (btnLabel) btnLabel.textContent = "Mengirim\u2026";
    var checked = [];
    var checkboxes = form.querySelectorAll('input[name="source"]:checked');
    for (var i = 0; i < checkboxes.length; i++) {
      checked.push(checkboxes[i].value);
    }

    var baseData = {
      sheetName: "Pendaftaran",
      nama:      form.nama      ? form.nama.value.trim()      : "",
      email:     form.email     ? form.email.value.trim()     : "",
      whatsapp:  form.whatsapp  ? form.whatsapp.value.trim()  : "",
      pekerjaan: form.pekerjaan ? form.pekerjaan.value.trim() : "",
      instansi:  form.instansi  ? form.instansi.value.trim()  : "",
      domisili:  form.domisili  ? form.domisili.value.trim()  : "",
      source:    checked,
      program:   (currentProgram && currentProgram.title) ? currentProgram.title : (new URLSearchParams(window.location.search).get("id") || "")
    };

    var uploadInput = form.querySelector("#fBukti");
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

        kirimKeAppsScript(payload, btn, btnLabel);
      };
      reader.readAsDataURL(file);
    } else {
      kirimKeAppsScript(baseData, btn, btnLabel);
    }
  });
}

function kirimKeAppsScript(payload, btn, btnLabel) {
  fetch(APPS_SCRIPT_URL, {
    method:  "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body:    JSON.stringify(payload)
  })
  .then(function (r) { return r.json(); })
  .then(function (res) {
    if (btn) btn.disabled = false;
    if (btnLabel) btnLabel.textContent = "Kirim Pendaftaran";

    if (res.success) {
      showSuccessState();
    } else {
      alert("Gagal mengirim pendaftaran: " + (res.error || "Unknown error"));
      console.error("Apps Script error:", res.error);
    }
  })
  .catch(function (err) {
    if (btn) btn.disabled = false;
    if (btnLabel) btnLabel.textContent = "Kirim Pendaftaran";
    alert("Koneksi gagal, coba lagi.");
    console.error("Fetch error:", err);
  });
}

function validateForm(form) {
  var valid = true;
  var firstErrorEl = null;

  var requiredFields = [
    { el: form.querySelector("#fNama"),      label: "Nama lengkap wajib diisi" },
    { el: form.querySelector("#fEmail"),     label: "Email wajib diisi" },
    { el: form.querySelector("#fWa"),        label: "Nomor WhatsApp wajib diisi" },
    { el: form.querySelector("#fPekerjaan"), label: "Pekerjaan wajib diisi" },
    { el: form.querySelector("#fDomisili"),  label: "Domisili wajib diisi" }
  ];

  requiredFields.forEach(function (field) {
    if (!field.el) return;
    clearError(field.el);
    var val = field.el.value.trim();
    if (!val) {
      showError(field.el, field.label);
      valid = false;
      if (!firstErrorEl) firstErrorEl = field.el;
    }
  });

  var emailEl = form.querySelector("#fEmail");
  if (emailEl && emailEl.value.trim() && !isValidEmail(emailEl.value.trim())) {
    clearError(emailEl);
    showError(emailEl, "Format email tidak valid");
    valid = false;
    if (!firstErrorEl) firstErrorEl = emailEl;
  }

  var uploadInput = form.querySelector("#fBukti");
var uploadWrap  = document.getElementById("detUploadWrap");
var isGratis = !currentProgram || !currentProgram.price || currentProgram.price.toLowerCase() === 'gratis';
if (!isGratis && uploadInput && (!uploadInput.files || uploadInput.files.length === 0)) {
    if (uploadWrap) uploadWrap.classList.add("is-error");
    var existingErr = uploadWrap ? uploadWrap.parentElement.querySelector(".det-form__error-msg") : null;
    if (!existingErr) {
      var errEl = makeErrorEl("Bukti transfer wajib diunggah");
      if (uploadWrap && uploadWrap.parentElement) {
        uploadWrap.parentElement.appendChild(errEl);
      }
    }
    valid = false;
    if (!firstErrorEl) firstErrorEl = uploadWrap || uploadInput;
  }

  if (!valid && firstErrorEl) {
    var offset = firstErrorEl.getBoundingClientRect().top + window.pageYOffset - 120;
    window.scrollTo({ top: offset, behavior: "smooth" });
    setTimeout(function () {
      if (firstErrorEl.focus) firstErrorEl.focus();
    }, 400);
  }

  return valid;
}

function showError(inputEl, message) {
  inputEl.classList.add("is-error");
  var errEl = makeErrorEl(message);
  inputEl.parentElement.appendChild(errEl);
  inputEl.addEventListener("input", function onFix() {
    clearError(inputEl);
    inputEl.removeEventListener("input", onFix);
  });
}

function makeErrorEl(message) {
  var errEl = document.createElement("p");
  errEl.className = "det-form__error-msg";
  errEl.innerHTML = '<svg viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M6.5 4v3M6.5 9v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
    + '<span>' + escHtml(message) + '</span>';
  return errEl;
}

function clearError(inputEl) {
  inputEl.classList.remove("is-error");
  var parent = inputEl.parentElement;
  if (!parent) return;
  var existing = parent.querySelector(".det-form__error-msg");
  if (existing) existing.remove();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccessState() {
  var formContent = document.querySelector(".det-form-sheet__head");
  var bankBar     = document.querySelector(".det-form-sheet__bank");
  var formEl      = document.getElementById("detForm");
  var successEl   = document.getElementById("detSuccess");

  if (!successEl) return;

  if (formContent) formContent.style.display = "none";
  if (bankBar)     bankBar.style.display = "none";
  if (formEl)      formEl.style.display = "none";

  successEl.classList.add("is-visible");

  successEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showToast() {
  var toast = document.getElementById("detToast");
  if (!toast) return;
  toast.hidden = false;
  setTimeout(function () { toast.hidden = true; }, 4000);
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = (val !== null && val !== undefined && val !== "") ? val : "\u2014";
}

