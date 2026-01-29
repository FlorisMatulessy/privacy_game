<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Log everything for debugging
$rawInput = file_get_contents('php://input');
$decoded = json_decode($rawInput, true);

echo json_encode([
    'raw_input' => $rawInput,
    'decoded' => $decoded,
    'json_error' => json_last_error_msg(),
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'request_method' => $_SERVER['REQUEST_METHOD']
]);
