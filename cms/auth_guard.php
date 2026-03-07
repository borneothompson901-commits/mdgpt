<?php
session_start();
if (!isset($_SESSION["admin"]) || $_SESSION["admin"] !== true) {
  header("Location: /cms/login.php");
  exit;
}
