<?php

if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['getsuggestions'])) {
  header('Content-Type: text/xml');
  $data = file_get_contents('suggestions.xml');
  echo $data;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_GET['postsuggestions'])) {
  $requestPayload = file_get_contents('php://input');
  file_put_contents('suggestions.xml', $requestPayload);
}
