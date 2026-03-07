<?php
session_start();
header('Content-Type: application/json');
require __DIR__ . '/../config/database.php';

if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$file = $_FILES['file'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit;
}

$allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file['tmp_name']);

if (!in_array($mime, $allowed)) {
    http_response_code(400);
    echo json_encode(['error' => 'File type not allowed: ' . $mime]);
    exit;
}

$maxSize = 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large (max 5MB)']);
    exit;
}

$ext = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    'image/avif' => 'avif',
][$mime];

$uploadDir = __DIR__ . '/../assets/img/team/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$key = preg_replace('/[^a-z0-9_]/', '', strtolower($_POST['key'] ?? 'team'));
$filename = $key . '_' . time() . '.' . $ext;
$dest = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file']);
    exit;
}

$path = 'assets/img/team/' . $filename;

$type  = 'home';
$title = $_POST['key'] ?? $key;

$stmt = $conn->prepare("
    INSERT INTO contents (type, title, body)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE body = VALUES(body)
");
$stmt->bind_param('sss', $type, $title, $path);
$stmt->execute();

echo json_encode(['success' => true, 'path' => $path]);