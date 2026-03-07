<?php
require __DIR__ . "/auth_guard.php";
require __DIR__ . "/../config/database.php";

$type = $_GET["type"] ?? "home";
$type = preg_replace("/[^a-z0-9_-]/i", "", $type);
if ($type === "") $type = "home";

$allowed = ["home","layanan","portfolio","member","workshop"];
if (!in_array($type, $allowed, true)) $type = "home";

$stmt = $conn->prepare("SELECT id, title, body FROM contents WHERE type=? ORDER BY title ASC");
$stmt->bind_param("s", $type);
$stmt->execute();
$res = $stmt->get_result();

$rows = [];
while ($r = $res->fetch_assoc()) $rows[] = $r;
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Manage</title>
<style>
body{font-family:Arial;padding:30px;max-width:1000px;margin:auto}
.nav{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}
.nav a{padding:8px 12px;border:1px solid #ddd;border-radius:999px;text-decoration:none;color:#111}
.nav a.active{background:#111;color:#fff}
.card{border:1px solid #ddd;border-radius:12px;padding:16px;margin-bottom:16px}
input,textarea,button{width:100%;padding:10px;margin-top:8px}
textarea{min-height:120px}
button{cursor:pointer}
.small{font-size:12px;color:#666}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
</style>
</head>
<body>

<div class="topbar">
  <h1>CMS Editor</h1>
  <div>
 <a href="/cms.php">Dashboard</a>
    <a href="logout.php">Logout</a>
  </div>
</div>

<div class="nav">
  <a href="?type=home" class="<?= $type==="home"?"active":"" ?>">Home</a>
  <a href="?type=layanan" class="<?= $type==="layanan"?"active":"" ?>">Layanan</a>
  <a href="?type=portfolio" class="<?= $type==="portfolio"?"active":"" ?>">Portfolio</a>
  <a href="?type=member" class="<?= $type==="member"?"active":"" ?>">Member</a>
  <a href="?type=workshop" class="<?= $type==="workshop"?"active":"" ?>">Workshop</a>
</div>

<div class="card">
  <h3>Tambah / Update Key</h3>
  <div class="small">Page: <strong><?= htmlspecialchars($type) ?></strong></div>
  <input id="new_key" placeholder="key contoh: hero_headline">
  <textarea id="new_value" placeholder="isi teks..."></textarea>
  <button id="save_new">Simpan</button>
  <div id="msg_new" class="small"></div>
</div>

<?php foreach ($rows as $row): ?>
<div class="card">
  <strong><?= htmlspecialchars($row["title"]) ?></strong>
  <textarea data-id="<?= (int)$row["id"] ?>"><?= htmlspecialchars($row["body"]) ?></textarea>
  <button class="save_btn" data-id="<?= (int)$row["id"] ?>">Update</button>
  <div class="small msg" id="msg_<?= (int)$row["id"] ?>"></div>
</div>
<?php endforeach; ?>

<script>
const PAGE_TYPE = <?= json_encode($type) ?>;

document.querySelectorAll(".save_btn").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const id = btn.dataset.id;
    const textarea = document.querySelector('textarea[data-id="'+id+'"]');
    const body = textarea.value;

    const fd = new FormData();
    fd.append("id", id);
    fd.append("body", body);

    const res = await fetch("/api/update_content.php",{method:"POST",body:fd});
    const j = await res.json();

    const msg = document.getElementById("msg_"+id);
    msg.textContent = j.success ? "Updated" : (j.error || "Error");
  });
});

document.getElementById("save_new").addEventListener("click", async ()=>{
  const key = document.getElementById("new_key").value.trim();
  const val = document.getElementById("new_value").value;

  if(!key) return alert("Key wajib diisi");

  const fd = new FormData();
  fd.append("type", PAGE_TYPE);
  fd.append("title", key);
  fd.append("body", val);

  const res = await fetch("/mdgpt/api/contents_upsert.php",{method:"POST",body:fd});
  const j = await res.json();

  document.getElementById("msg_new").textContent = j.success ? "Saved" : (j.error || "Error");
  if(j.success) location.reload();
});
</script>

</body>
</html>
