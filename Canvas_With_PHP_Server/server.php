<?php

if ($_SERVER['REQUEST_METHOD'] == "GET") {
    if (isset($_GET['getalldata'])) {
        header('Content-Type: application/json');
        $files = glob('data/*.json');
        $data = [];
        foreach ($files as $file) {
            array_push($data, json_decode(file_get_contents($file)));
        }
        echo json_encode($data);
    } elseif (isset($_GET['getsingledata'])) {
        header('Content-Type: application/json');
        $id = $_REQUEST['getsingledata'];
        $data = json_decode(file_get_contents("data/data$id.json"));
        echo json_encode($data);
    }
}

if ($_SERVER['REQUEST_METHOD'] == "POST" && isset($_GET['updatecanvas'])) {
    $id = $_REQUEST['updatecanvas'];
    $requestPayload = file_get_contents("php://input");
    file_put_contents("data/data$id.json", $requestPayload);
}
