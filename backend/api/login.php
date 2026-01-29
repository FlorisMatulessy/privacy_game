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

if (!$input || !isset($input['username']) || !isset($input['password'])) {
    echo json_encode(['error' => 'Gebruikersnaam en wachtwoord zijn verplicht']);
    exit;
}

$username = sanitizeInput(trim($input['username']));
$password = $input['password'];
$isAdmin = isset($input['isAdmin']) ? $input['isAdmin'] : false;
$clientIP = getClientIP();

if (empty($username) || empty($password)) {
    echo json_encode(['error' => 'Gebruikersnaam en wachtwoord mogen niet leeg zijn']);
    exit;
}

// Database verbinding
$servername = "localhost";
$dbusername = "root";
$dbpassword = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database verbinding mislukt']);
    exit;
}

// Get lockout_duration from settings
$settingsStmt = $conn->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'lockout_duration'");
$settingsStmt->execute();
$settingsResult = $settingsStmt->get_result();
$lockoutMinutes = 15;
if ($row = $settingsResult->fetch_assoc()) {
    $lockoutMinutes = (int)$row['setting_value'];
}
$settingsStmt->close();

// Check rate limiting
$rateLimit = checkRateLimit($username, $conn, 5, $lockoutMinutes);
if (!$rateLimit['allowed']) {
    $lockoutTime = date('H:i', $rateLimit['lockoutUntil']);
    logSecurityEvent($conn, null, 'login_blocked', "Blocked login attempt for user: $username", $clientIP);
    echo json_encode(['error' => "Account tijdelijk vergrendeld tot $lockoutTime na te veel mislukte pogingen"]);
    $conn->close();
    exit;
}

// Haal gebruiker op
$stmt = $conn->prepare("SELECT id, password, role, department, points, achievements_unlocked, force_password_change, email FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    recordFailedAttempt($username, $conn);
    logSecurityEvent($conn, null, 'login_failed', "Failed login attempt for non-existent user: $username", $clientIP);
    echo json_encode(['error' => 'Gebruikersnaam bestaat niet']);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

if (!password_verify($password, $user['password'])) {
    recordFailedAttempt($username, $conn);
    logSecurityEvent($conn, $user['id'], 'login_failed', "Failed login attempt - incorrect password", $clientIP);

    $remainingAttempts = $rateLimit['remainingAttempts'] - 1;
    $message = 'Onjuist wachtwoord';
    if ($remainingAttempts > 0) {
        $message .= ". Nog $remainingAttempts poging(en) over.";
    }

    echo json_encode(['error' => $message]);
    $conn->close();
    exit;
}

if ($isAdmin && strtolower($user['role']) !== 'admin') {
    logSecurityEvent($conn, $user['id'], 'unauthorized_admin_access', "User attempted admin login without privileges", $clientIP);
    echo json_encode(['error' => 'Je bent geen admin. Probeer opnieuw.']);
    $conn->close();
    exit;
}

// Clear failed attempts on successful login
clearFailedAttempts($username, $conn);

// Update last login time and IP
$updateStmt = $conn->prepare("UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?");
$updateStmt->bind_param("si", $clientIP, $user['id']);
$updateStmt->execute();
$updateStmt->close();

// Log successful login
logSecurityEvent($conn, $user['id'], 'login_success', "Successful login", $clientIP);

$conn->close();

// Succesvol ingelogd - return user_id for subsequent API calls
echo json_encode([
    'success' => 'Inloggen succesvol!',
    'user' => [
        'id' => $user['id'],
        'username' => $username,
        'email' => $user['email'],
        'role' => $user['role'],
        'department' => $user['department'],
        'points' => $user['points'],
        'achievements_unlocked' => $user['achievements_unlocked'],
        'force_password_change' => (bool)$user['force_password_change']
    ]
]);
?>