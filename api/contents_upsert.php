<?php
session_start();
header("Content-Type: application/json");
require __DIR__ . "/../config/database.php";

if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
  http_response_code(401);
  echo json_encode(["error"=>"Unauthorized"]);
  exit;
}

$type  = $_POST["type"]  ?? "home";
$title = $_POST["title"] ?? "";
$body  = $_POST["body"]  ?? "";

$type  = preg_replace("/[^a-z0-9_-]/i", "", trim($type));
$title = trim($title);

if ($type === "" || $title === "") {
  http_response_code(400);
  echo json_encode(["error"=>"Missing type/title"]);
  exit;
}

$stmt = $conn->prepare("
  INSERT INTO contents (type, title, body)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE body=VALUES(body)
");
$stmt->bind_param("sss", $type, $title, $body);
$ok = $stmt->execute();

echo json_encode(["success"=>$ok]);