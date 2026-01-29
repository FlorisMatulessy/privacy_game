<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Alleen POST verzoeken toegestaan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['username']) || !isset($input['email']) || !isset($input['password']) || !isset($input['department'])) {
    echo json_encode(['error' => 'Gebruikersnaam, email, wachtwoord en afdeling zijn verplicht']);
    exit;
}

require_once __DIR__ . '/../helpers/security_helpers.php';

$username = sanitizeInput($input['username']);
$emailRaw = trim($input['email']);
$password = $input['password'];
$department = sanitizeInput($input['department']);

// Validate email using security helper
$emailValidation = validateEmail($emailRaw);
if (!$emailValidation['valid']) {
    echo json_encode(['error' => $emailValidation['error']]);
    exit;
}
$email = $emailValidation['email']; // Use the sanitized and validated email

// Validate input
if (strlen($username) < 3 || strlen($username) > 20) {
    echo json_encode(['error' => 'Gebruikersnaam moet tussen 3 en 20 karakters zijn']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['error' => 'Wachtwoord moet minimaal 8 karakters zijn']);
    exit;
}

// Password complexity check
if (!preg_match('/[A-Z]/', $password) || !preg_match('/[a-z]/', $password) || !preg_match('/[0-9]/', $password)) {
    echo json_encode(['error' => 'Wachtwoord moet minimaal 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten']);
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

// Check if username already exists
$stmt = $conn->prepare("SELECT username, email FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $existingUser = $result->fetch_assoc();
    if ($existingUser['username'] === $username) {
        echo json_encode(['error' => 'Deze gebruikersnaam is al in gebruik']);
    } else {
        echo json_encode(['error' => 'Dit email adres is al geregistreerd']);
    }
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (username, email, password, department, role, points, achievements_unlocked) VALUES (?, ?, ?, ?, 'user', 0, 0)");
$stmt->bind_param("ssss", $username, $email, $hashedPassword, $department);

if ($stmt->execute()) {
    echo json_encode(['success' => 'Registratie succesvol! Je kunt nu inloggen.']);
} else {
    echo json_encode(['error' => 'Registratie mislukt: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
