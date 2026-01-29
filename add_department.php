<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = 'localhost';
$dbusername = 'root';
$dbpassword = '';
$dbname = 'privacy_game';

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$conn->set_charset('utf8mb4');
require_once 'security_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Accept user_id from POST body (since sessions don't work with CORS)
$user_id = filter_var($input['user_id'] ?? null, FILTER_VALIDATE_INT);
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

// Verify user is admin
$stmt = $conn->prepare('SELECT role FROM users WHERE id = ?');
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user || $user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$name = $input['name'] ?? '';
$display_name = $input['display_name'] ?? '';
$color = $input['color'] ?? '';
$description = $input['description'] ?? '';

if (empty($name) || empty($display_name) || empty($color)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, display_name, and color are required']);
    exit;
}

if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $color)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid hex color format']);
    exit;
}

$stmt = $conn->prepare('SELECT id FROM departments WHERE name = ?');
$stmt->bind_param('s', $name);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'Department already exists']);
    $stmt->close();
    exit;
}
$stmt->close();

$stmt = $conn->prepare('INSERT INTO departments (name, display_name, color, description) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $name, $display_name, $color, $description);

if ($stmt->execute()) {
    logSecurityEvent($conn, $user_id, 'department_created', 'Created new department: ' . $display_name, getClientIP());
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create department']);
}

$stmt->close();
$conn->close();
?>