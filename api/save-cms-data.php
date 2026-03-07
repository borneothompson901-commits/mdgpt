<?php
session_start();
header("Content-Type: application/json");
require __DIR__ . "/../config/database.php";

// Check auth
if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
  http_response_code(401);
  echo json_encode(["error" => "Unauthorized"]);
  exit;
}

$action = $_POST["action"] ?? "";
$type   = $_POST["type"]   ?? "";
$data   = $_POST["data"]   ?? "{}";

if (!$action || !$type) {
  http_response_code(400);
  echo json_encode(["error" => "Missing action or type"]);
  exit;
}

$type = preg_replace("/[^a-z0-9_-]/i", "", trim($type));
$action = preg_replace("/[^a-z0-9_-]/i", "", trim($action));

// Parse data
if (is_string($data)) {
  $data = json_decode($data, true);
}
if (!is_array($data)) {
  $data = [];
}

try {
  if ($action === "save") {
    // Save/update data
    $dataJson = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    $stmt = $conn->prepare("
      INSERT INTO contents (type, body, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        body = VALUES(body),
        updated_at = NOW()
    ");
    
    $stmt->bind_param("ss", $type, $dataJson);
    $ok = $stmt->execute();
    
    if ($ok) {
      echo json_encode(["success" => true, "message" => "Data saved"]);
    } else {
      throw new Exception($stmt->error);
    }
    
  } elseif ($action === "get") {
    // Get data
    $stmt = $conn->prepare("SELECT body FROM contents WHERE type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    
    if ($row) {
      $body = json_decode($row["body"], true);
      echo json_encode($body ?: []);
    } else {
      echo json_encode([]);
    }
    
  } elseif ($action === "delete") {
    // Delete specific item
    $id = $_POST["id"] ?? "";
    if (!$id) {
      throw new Exception("Missing id");
    }
    
    // Get current data
    $stmt = $conn->prepare("SELECT body FROM contents WHERE type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    
    if ($row) {
      $body = json_decode($row["body"], true);
      if (is_array($body)) {
        // Remove item by id
        $body = array_filter($body, function($item) use ($id) {
          return ($item["id"] ?? null) !== $id;
        });
        $body = array_values($body); // Re-index array
        
        $dataJson = json_encode($body, JSON_UNESCAPED_UNICODE);
        $stmt2 = $conn->prepare("UPDATE contents SET body = ?, updated_at = NOW() WHERE type = ?");
        $stmt2->bind_param("ss", $dataJson, $type);
        $ok = $stmt2->execute();
        
        echo json_encode(["success" => $ok, "message" => "Item deleted"]);
      }
    } else {
      echo json_encode(["success" => false, "message" => "Type not found"]);
    }
    
  } else {
    http_response_code(400);
    echo json_encode(["error" => "Unknown action"]);
  }
  
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["error" => $e->getMessage()]);
}
?>