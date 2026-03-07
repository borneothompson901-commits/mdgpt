<?php
session_start();
header("Content-Type: application/json");
require __DIR__ . "/../config/database.php";

if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
  http_response_code(401);
  echo json_encode(["error"=>"Unauthorized"]);
  exit;
}

$id = $_POST["id"] ?? "";
$body = $_POST["body"] ?? "";

if(!$id){
  http_response_code(400);
  echo json_encode(["error"=>"Missing id"]);
  exit;
}

$stmt = $conn->prepare("UPDATE contents SET body=? WHERE id=?");
$stmt->bind_param("si",$body,$id);
$stmt->execute();

echo json_encode(["success"=>true]);