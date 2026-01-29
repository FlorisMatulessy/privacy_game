<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../helpers/security_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Alleen POST verzoeken toegestaan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['username']) || !isset($input['old_password']) || !isset($input['new_password'])) {
    echo json_encode(['error' => 'Alle velden zijn verplicht']);
    exit;
}

$username = sanitizeInput($input['username']);
$old_password = $input['old_password']; // Passwords niet sanitizen, alleen valideren
$new_password = $input['new_password'];

// Validate new password
if (strlen($new_password) < 8) {
    echo json_encode(['error' => 'Nieuw wachtwoord moet minimaal 8 karakters zijn']);
    exit;
}

if (!preg_match('/[A-Z]/', $new_password) || !preg_match('/[a-z]/', $new_password) || !preg_match('/[0-9]/', $new_password)) {
    echo json_encode(['error' => 'Nieuw wachtwoord moet minimaal Ã©Ã©n hoofdletter, Ã©Ã©n kleine letter en Ã©Ã©n cijfer bevatten']);
    exit;
}

$servername = "localhost";
$dbusername = "root";
$dbpassword = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database verbinding mislukt']);
    exit;
}

// Get current password hash
$stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['error' => 'Gebruiker niet gevonden']);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Verify old password
if (!password_verify($old_password, $user['password'])) {
    echo json_encode(['error' => 'Huidig wachtwoord is onjuist']);
    $conn->close();
    exit;
}

// Hash new password
$new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

// Update password
$stmt = $conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param("si", $new_password_hash, $user['id']);

if ($stmt->execute()) {
    echo json_encode(['success' => 'Wachtwoord succesvol gewijzigd']);
} else {
    echo json_encode(['error' => 'Fout bij wijzigen van wachtwoord']);
}

$stmt->close();
$conn->close();
?>
