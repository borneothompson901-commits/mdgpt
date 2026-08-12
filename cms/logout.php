<?php
require __DIR__ . "/../config/session_init.php";
session_destroy();
header("Location: login.php");
exit;
