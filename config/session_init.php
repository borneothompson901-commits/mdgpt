<?php
require_once __DIR__ . "/database.php";

$conn->query("
  CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(191) PRIMARY KEY,
    data MEDIUMTEXT NOT NULL,
    updated_at INT UNSIGNED NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

class DbSessionHandler implements SessionHandlerInterface {
  private $conn;
  private $maxlifetime;

  public function __construct($conn, $maxlifetime) {
    $this->conn = $conn;
    $this->maxlifetime = $maxlifetime;
  }

  public function open($savePath, $sessionName): bool { return true; }
  public function close(): bool { return true; }

  public function read($id): string|false {
    $stmt = $this->conn->prepare("SELECT data FROM sessions WHERE id = ? AND updated_at > ?");
    $cutoff = time() - $this->maxlifetime;
    $stmt->bind_param("si", $id, $cutoff);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    return $row ? $row["data"] : "";
  }

  public function write($id, $data): bool {
    $now = time();
    $stmt = $this->conn->prepare("
      INSERT INTO sessions (id, data, updated_at) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)
    ");
    $stmt->bind_param("ssi", $id, $data, $now);
    return $stmt->execute();
  }

  public function destroy($id): bool {
    $stmt = $this->conn->prepare("DELETE FROM sessions WHERE id = ?");
    $stmt->bind_param("s", $id);
    return $stmt->execute();
  }

  public function gc($max_lifetime): int|false {
    $cutoff = time() - $max_lifetime;
    $stmt = $this->conn->prepare("DELETE FROM sessions WHERE updated_at <= ?");
    $stmt->bind_param("i", $cutoff);
    $stmt->execute();
    return $this->conn->affected_rows;
  }
}

$maxlifetime = 60 * 60 * 24 * 7; // 7 hari
ini_set("session.gc_maxlifetime", $maxlifetime);
session_set_cookie_params($maxlifetime, "/");

$handler = new DbSessionHandler($conn, $maxlifetime);
session_set_save_handler($handler, true);
session_start();
