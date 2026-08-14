<?php
header("Content-Type: application/json");
require __DIR__ . "/../config/database.php";

$SUPABASE_URL = "https://xjtkipgopiormwmbdtfa.supabase.co";
$SUPABASE_ANON_KEY = "sb_publishable_5abZti9M8zHWuHyh59q8Ew_Otn-QopO";

function getBearerToken() {
  $headers = function_exists("getallheaders") ? getallheaders() : [];
  foreach ($headers as $k => $v) {
    if (strtolower($k) === "authorization" && preg_match('/^Bearer\s+(.+)$/i', $v, $m)) {
      return $m[1];
    }
  }
  if (!empty($_SERVER["HTTP_AUTHORIZATION"]) && preg_match('/^Bearer\s+(.+)$/i', $_SERVER["HTTP_AUTHORIZATION"], $m)) {
    return $m[1];
  }
  return null;
}

function verifySupabaseToken($token, $url, $anonKey) {
  if (!$token) return null;
  $ch = curl_init(rtrim($url, "/") . "/auth/v1/user");
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $anonKey,
    "Authorization: Bearer " . $token
  ]);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 8);
  $resp = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($httpCode !== 200) return null;
  $data = json_decode($resp, true);
  return $data && isset($data["id"]) ? $data : null;
}

$token = getBearerToken();
$authedUser = verifySupabaseToken($token, $SUPABASE_URL, $SUPABASE_ANON_KEY);

if (!$authedUser) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$ALLOWED_TYPES = [
  "image/jpeg" => "jpg",
  "image/png"  => "png",
  "image/webp" => "webp",
  "video/mp4"  => "mp4",
  "video/webm" => "webm",
  "image/avif" => "avif",
  "image/gif"  => "gif",
];

$MAX_SIZE = 10 * 1024 * 1024; // 10MB
$UPLOAD_DIR = __DIR__ . "/../uploads/";

if (!is_dir($UPLOAD_DIR)) {
  mkdir($UPLOAD_DIR, 0755, true);
}

try {
  if (!isset($_FILES["file"])) {
    throw new Exception("No file uploaded");
  }

  $file = $_FILES["file"];
  $ftype = $file["type"];
  $fsize = $file["size"];
  $ftmp  = $file["tmp_name"];
  $fname = $file["name"];

  if (!isset($ALLOWED_TYPES[$ftype])) {
    throw new Exception("File type not allowed: $ftype");
  }

  if ($fsize > $MAX_SIZE) {
    throw new Exception("File too large. Max: " . ($MAX_SIZE / 1024 / 1024) . "MB");
  }

  if (!is_uploaded_file($ftmp)) {
    throw new Exception("Invalid upload");
  }

  $ext = $ALLOWED_TYPES[$ftype];
  $newname = md5(time() . $fname) . "." . $ext;
  $filepath = $UPLOAD_DIR . $newname;
  $publicpath = "/uploads/" . $newname;


  if (!move_uploaded_file($ftmp, $filepath)) {
    throw new Exception("Failed to save file");
  }

  // Downscale + recompress oversized images so the storefront doesn't ship
  // full camera-resolution photos to every visitor. Videos are left as-is.
  $isImage = in_array($ext, ["jpg", "png", "webp", "avif"], true);
  if ($isImage && function_exists("getimagesize")) {
    optimizeImage($filepath, $ext);
  }

  $fsize = filesize($filepath) ?: $fsize;

  $stmt = $conn->prepare("
    INSERT INTO file_uploads (filename, original_name, file_type, file_size, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  ");
  $uploaded_by = 0; 
  $stmt->bind_param("sssii", $newname, $fname, $ftype, $fsize, $uploaded_by);
  $stmt->execute();

  echo json_encode([
    "success" => true,
    "path" => $publicpath,
    "filename" => $newname,
    "original_name" => $fname
  ]);

} catch (Exception $e) {
  http_response_code(400);
  echo json_encode(["error" => $e->getMessage()]);
}

/**
 * Resizes an image in place if it's wider/taller than MAX_DIMENSION, and
 * re-encodes it at a sane quality. No-ops quietly (keeps the original file)
 * if the GD extension or the specific format isn't available on this host.
 */
function optimizeImage($filepath, $ext) {
  $MAX_DIMENSION = 1200;
  $JPEG_QUALITY = 82;
  $WEBP_QUALITY = 82;
  $AVIF_QUALITY = 65;
  $PNG_COMPRESSION = 6;

  $info = @getimagesize($filepath);
  if (!$info) return;
  list($width, $height) = $info;
  if ($width <= 0 || $height <= 0) return;

  $needsResize = $width > $MAX_DIMENSION || $height > $MAX_DIMENSION;

  switch ($ext) {
    case "jpg":
      if (!function_exists("imagecreatefromjpeg")) return;
      $src = @imagecreatefromjpeg($filepath);
      break;
    case "png":
      if (!function_exists("imagecreatefrompng")) return;
      $src = @imagecreatefrompng($filepath);
      break;
    case "webp":
      if (!function_exists("imagecreatefromwebp")) return;
      $src = @imagecreatefromwebp($filepath);
      break;
    case "avif":
      if (!function_exists("imagecreatefromavif") || !function_exists("imageavif")) return;
      $src = @imagecreatefromavif($filepath);
      break;
    default:
      return;
  }
  if (!$src) return;

  if ($needsResize) {
    $ratio = min($MAX_DIMENSION / $width, $MAX_DIMENSION / $height);
    $newWidth = max(1, (int) round($width * $ratio));
    $newHeight = max(1, (int) round($height * $ratio));
    $resized = imagecreatetruecolor($newWidth, $newHeight);
    if ($ext === "png" || $ext === "webp" || $ext === "avif") {
      imagealphablending($resized, false);
      imagesavealpha($resized, true);
    }
    imagecopyresampled($resized, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    imagedestroy($src);
    $src = $resized;
  }

  switch ($ext) {
    case "jpg":
      @imagejpeg($src, $filepath, $JPEG_QUALITY);
      break;
    case "png":
      @imagepng($src, $filepath, $PNG_COMPRESSION);
      break;
    case "webp":
      @imagewebp($src, $filepath, $WEBP_QUALITY);
      break;
    case "avif":
      @imageavif($src, $filepath, $AVIF_QUALITY);
      break;
  }
  imagedestroy($src);
}
?>
