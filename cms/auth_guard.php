<?php
require __DIR__ . "/../config/session_init.php";
if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
  header("Location: /cms/login.php");
  exit;
}
