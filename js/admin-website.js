(function () {
  "use strict";

  if (!document.getElementById("websiteTbody")) return;

  var state = {
    banners: [
      { id: "banner1", name: "Banner 1", headline: "", subheadline: "", cta: "", photo: null },
      { id: "banner2", name: "Banner 2", headline: "", subheadline: "", cta: "", photo: null }
    ]
  };
  var editingId = null;

  var tbody = document.getElementById("websiteTbody");

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function iconEdit() {
    return '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11.3 2.3a1.4 1.4 0 0 1 2 2L6 11.6l-2.7.7.7-2.7 7.3-7.3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  }

  function render() {
    tbody.innerHTML = "";
    state.banners.forEach(function (b) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td>' + escapeHtml(b.name) + '</td>' +
        '<td class="row-actions"><div class="actions">' +
          '<button type="button" class="btn-icon edit" data-edit="' + b.id + '" title="Edit">' + iconEdit() + '</button>' +
        '</div></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () { openEditModal(btn.dataset.edit); });
    });
  }

  var editModal = document.getElementById("websiteEditModal");
  var editTitle = document.getElementById("websiteEditTitle");
  var editHeadlineInput = document.getElementById("websiteEditHeadline");
  var editSubheadlineInput = document.getElementById("websiteEditSubheadline");
  var editCtaInput = document.getElementById("websiteEditCta");
  var editPhotoSlot = document.getElementById("websiteEditPhotoSlot");
  var editPhotoPlaceholder = document.getElementById("websiteEditPhotoPlaceholder");
  var editPhotoInput = document.getElementById("websiteEditPhotoInput");
  var editSaveBtn = document.getElementById("websiteEditSaveBtn");

  function currentBanner() {
    return state.banners.find(function (x) { return x.id === editingId; });
  }

  function renderPhotoSlot() {
    var b = currentBanner();
    if (!b) return;
    var existingImg = editPhotoSlot.querySelector("img");
    if (existingImg) existingImg.remove();
    var existingRemove = editPhotoSlot.querySelector(".upload-slot__remove");
    if (existingRemove) existingRemove.remove();
    editPhotoSlot.classList.toggle("has-img", !!b.photo);
    if (b.photo) {
      editPhotoPlaceholder.hidden = true;
      var img = document.createElement("img");
      img.src = b.photo;
      editPhotoSlot.appendChild(img);
      var removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "upload-slot__remove";
      removeBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
      removeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        b.photo = null;
        editPhotoInput.value = "";
        renderPhotoSlot();
      });
      editPhotoSlot.appendChild(removeBtn);
    } else {
      editPhotoPlaceholder.hidden = false;
    }
  }

  editPhotoInput.addEventListener("change", function () {
    var file = editPhotoInput.files && editPhotoInput.files[0];
    if (!file) return;
    var b = currentBanner();
    if (!b) return;
    var reader = new FileReader();
    reader.onload = function () {
      b.photo = reader.result;
      renderPhotoSlot();
    };
    reader.readAsDataURL(file);
  });

  function openEditModal(id) {
    var b = state.banners.find(function (x) { return x.id === id; });
    if (!b) return;
    editingId = id;
    editTitle.textContent = "Edit " + b.name;
    editHeadlineInput.value = b.headline || "";
    editSubheadlineInput.value = b.subheadline || "";
    editCtaInput.value = b.cta || "";
    editPhotoInput.value = "";
    renderPhotoSlot();
    editModal.classList.add("open");
  }

  function closeEditModal() {
    editModal.classList.remove("open");
    editingId = null;
  }

  document.getElementById("websiteEditCloseBtn").addEventListener("click", closeEditModal);
  document.getElementById("websiteEditCancelBtn").addEventListener("click", closeEditModal);
  editModal.addEventListener("click", function (e) { if (e.target === editModal) closeEditModal(); });

  editSaveBtn.addEventListener("click", function () {
    var b = currentBanner();
    if (!b) return;
    b.headline = editHeadlineInput.value.trim();
    b.subheadline = editSubheadlineInput.value.trim();
    b.cta = editCtaInput.value.trim();
    render();
    closeEditModal();
    AdminShared.toast(b.name + " berhasil disimpan");
  });

  render();
})();
