<?php
header("Content-Type: application/json");
require __DIR__ . "/../config/database.php";

$type = $_GET["type"] ?? "home";
$type = preg_replace("/[^a-z0-9_-]/i", "", trim($type));

// Ambil data JSON dari kolom body
$stmt = $conn->prepare("SELECT body FROM contents WHERE type = ?");
$stmt->bind_param("s", $type);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();

if ($row) {
    // Kirim langsung data JSON-nya ke front-end
    echo $row["body"]; 
} else {
    echo json_encode([]);
}