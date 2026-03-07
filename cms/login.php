<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $u = $_POST["username"] ?? "";
  $p = $_POST["password"] ?? "";
  $valid_user = getenv("CMS_USER") ?: "admin";
  $valid_pass = getenv("CMS_PASS") ?: "admin123";
  if ($u === $valid_user && $p === $valid_pass) {
    $_SESSION["admin"] = true;
    header("Location: /cms.php");
    exit;
  }
  $error = "Username atau password salah.";
}
?>
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login — M-DGPT Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --grad-1: #a91ab6;
      --grad-2: #b104ff;
      --grad-3: #393df5;
      --grad-4: #047bfe;
      --gradient: linear-gradient(90deg, var(--grad-1), var(--grad-2), var(--grad-3), var(--grad-4));
      --gradient-diag: linear-gradient(135deg, var(--grad-1), var(--grad-2), var(--grad-3), var(--grad-4));
      --white: #ffffff;
      --gray-50: #fafafa;
      --gray-100: #f4f4f5;
      --gray-200: #e4e4e7;
      --gray-300: #d1d5db;
      --gray-600: #4b5563;
      --gray-900: #111827;
      --bg: #ffffff;
      --border: rgba(0,0,0,0.08);
      --shadow: 0 4px 24px rgba(0,0,0,0.07);
      --shadow-lg: 0 16px 48px rgba(0,0,0,0.10);
      --radius: 12px;
      --font: "Geist", -apple-system, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font);
      background: var(--gray-50);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    /* Background subtle grid */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
      background-size: 32px 32px;
      pointer-events: none;
    }

    /* Gradient orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
      pointer-events: none;
    }
    .orb-1 {
      width: 400px; height: 400px;
      background: var(--grad-1);
      top: -100px; left: -100px;
    }
    .orb-2 {
      width: 350px; height: 350px;
      background: var(--grad-4);
      bottom: -80px; right: -80px;
    }
    .orb-3 {
      width: 250px; height: 250px;
      background: var(--grad-3);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.07;
    }

    /* Card */
    .card {
      background: var(--white);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 400px;
      padding: 40px;
      position: relative;
      animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Logo area */
    .logo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 32px;
      gap: 12px;
    }

    .logo-img {
      width: 48px;
      height: 48px;
      object-fit: contain;
    }

    .logo-text {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--gray-900);
      letter-spacing: -0.01em;
    }

    .logo-pill {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--gray-600);
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      padding: 3px 10px;
      border-radius: 999px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: var(--gray-100);
      margin-bottom: 28px;
    }

    /* Heading */
    .heading {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--gray-900);
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }

    .subheading {
      font-size: 0.85rem;
      color: var(--gray-600);
      margin-bottom: 28px;
    }

    /* Form */
    .field {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--gray-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }

    .input-wrap {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--gray-300);
      display: flex;
      pointer-events: none;
    }

    input {
      width: 100%;
      padding: 10px 12px 10px 38px;
      border: 1.5px solid var(--gray-200);
      border-radius: 10px;
      font-family: var(--font);
      font-size: 0.9rem;
      color: var(--gray-900);
      background: var(--gray-50);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }

    input:focus {
      border-color: var(--grad-3);
      background: var(--white);
      box-shadow: 0 0 0 3px rgba(57,61,245,0.08);
    }

    input::placeholder { color: var(--gray-300); }

    /* Toggle password */
    .toggle-pass {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--gray-300);
      display: flex;
      padding: 0;
      transition: color 0.15s;
    }
    .toggle-pass:hover { color: var(--gray-600); }

    /* Error */
    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.83rem;
      color: #dc2626;
      margin-bottom: 20px;
      animation: shake 0.35s ease;
    }

    @keyframes shake {
      0%,100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    /* Submit button */
    .btn-submit {
      width: 100%;
      padding: 11px;
      border: none;
      border-radius: 10px;
      font-family: var(--font);
      font-size: 0.9rem;
      font-weight: 600;
      color: #fff;
      background: var(--gradient);
      background-size: 200% 100%;
      cursor: pointer;
      margin-top: 8px;
      transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      position: relative;
      overflow: hidden;
    }

    .btn-submit:hover {
      opacity: 0.92;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(57,61,245,0.2);
    }

    .btn-submit:active {
      transform: translateY(0);
      opacity: 1;
    }

    /* Footer */
    .card-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 0.78rem;
      color: var(--gray-300);
    }

    .card-footer span {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }
  </style>
</head>
<body>

<div class="orb orb-1"></div>
<div class="orb orb-2"></div>
<div class="orb orb-3"></div>

<div class="card">
  <div class="logo-wrap">
    <img src="../assets/icons/logo.png" alt="Logo" class="logo-img" />
    <div class="logo-text">M-DGPT Admin</div>
    <div class="logo-pill">CMS Panel</div>
  </div>

  <div class="divider"></div>

  <div class="heading">Selamat datang</div>
  <p class="subheading">Masuk untuk mengelola konten website</p>

  <?php if (!empty($error)): ?>
  <div class="error-msg">
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="#dc2626" stroke-width="1.4"/>
      <path d="M7.5 4.5v3.5M7.5 10h.01" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <?= htmlspecialchars($error) ?>
  </div>
  <?php endif; ?>

  <form method="post" autocomplete="off">
    <div class="field">
      <label for="username">Username</label>
      <div class="input-wrap">
        <span class="input-icon">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.35"/>
            <path d="M2 13c0-2.76 2.46-5 5.5-5S13 10.24 13 13" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>
          </svg>
        </span>
        <input type="text" id="username" name="username" placeholder="admin" required autocomplete="username" />
      </div>
    </div>

    <div class="field">
      <label for="password">Password</label>
      <div class="input-wrap">
        <span class="input-icon">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <rect x="2.5" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.35"/>
            <path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>
          </svg>
        </span>
        <input type="password" id="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
        <button type="button" class="toggle-pass" id="togglePass" aria-label="Tampilkan password">
          <svg id="eyeIcon" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M1 7.5S3.5 3 7.5 3s6.5 4.5 6.5 4.5S12.5 12 7.5 12 1 7.5 1 7.5z" stroke="currentColor" stroke-width="1.35"/>
            <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" stroke-width="1.35"/>
          </svg>
        </button>
      </div>
    </div>

    <button type="submit" class="btn-submit">Masuk</button>
  </form>

  <div class="card-footer">
    Powered by <span>M-DGPT</span>
  </div>
</div>

<script>
(function() {
  var btn = document.getElementById('togglePass');
  var inp = document.getElementById('password');
  btn.addEventListener('click', function() {
    var show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    document.getElementById('eyeIcon').innerHTML = show
      ? '<path d="M2 2l11 11M6.5 6.7A1.8 1.8 0 0010 9M1 7.5S3.5 3 7.5 3c1 0 2 .3 2.8.8M14 7.5S12.2 11 8.5 12" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>'
      : '<path d="M1 7.5S3.5 3 7.5 3s6.5 4.5 6.5 4.5S12.5 12 7.5 12 1 7.5 1 7.5z" stroke="currentColor" stroke-width="1.35"/><circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" stroke-width="1.35"/>';
  });
})();
</script>

</body>
</html>
