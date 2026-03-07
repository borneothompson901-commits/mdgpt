<?php
session_start();
header("Content-Type: application/json");
require __DIR__ . "/../config/database.php";

if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
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

  $stmt = $conn->prepare("
    INSERT INTO file_uploads (filename, original_name, file_type, file_size, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  ");
  $uploaded_by = $_SESSION["admin_id"] ?? "unknown";
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
?>