<?php
require __DIR__ . "/../config/session_init.php";
header("Content-Type: application/json");

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
