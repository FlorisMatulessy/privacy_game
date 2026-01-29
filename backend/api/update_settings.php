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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Alleen POST verzoeken toegestaan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['settings'])) {
    echo json_encode(['error' => 'Instellingen zijn verplicht']);
    exit;
}

// Check for user_id (admin authentication)
$user_id = $input['user_id'] ?? null;

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database verbinding mislukt']);
    exit;
}

// If user_id provided, verify it's an admin
if ($user_id) {
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();
    
    if (!$user || $user['role'] !== 'admin') {
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }
}

// Validation function
function validateSetting($key, $value, $type) {
    if ($type === 'number') {
        if (!is_numeric($value) || $value < 0) {
            return "Ongeldige waarde voor $key. Moet een positief getal zijn.";
        }
    }

    if ($type === 'time') {
        if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $value)) {
            return "Ongeldige tijdnotatie voor $key. Gebruik HH:MM formaat.";
        }
    }

    if (strpos($key, 'timeout') !== false || strpos($key, 'duration') !== false) {
        if ($value > 86400) {
            return "Waarde voor $key is te groot (max 24 uur).";
        }
    }

    return null;
}

$conn->begin_transaction();

try {
    $stmt = $conn->prepare("UPDATE app_settings SET setting_value = ? WHERE setting_key = ?");

    foreach ($input['settings'] as $setting) {
        if (!isset($setting['key']) || !isset($setting['value'])) {
            throw new Exception('Ongeldige instelling data');
        }
        
        // Get setting type for validation
        $typeQuery = $conn->prepare("SELECT setting_type FROM app_settings WHERE setting_key = ?");
        $typeQuery->bind_param("s", $setting['key']);
        $typeQuery->execute();
        $typeResult = $typeQuery->get_result();
        $settingData = $typeResult->fetch_assoc();
        $typeQuery->close();

        if (!$settingData) {
            throw new Exception("Instelling niet gevonden: " . $setting['key']);
        }

        // Validate
        $error = validateSetting($setting['key'], $setting['value'], $settingData['setting_type']);
        if ($error) {
            throw new Exception($error);
        }

        $stmt->bind_param("ss", $setting['value'], $setting['key']);
        $stmt->execute();
    }

    $stmt->close();
    $conn->commit();

    echo json_encode(['success' => 'Instellingen succesvol opgeslagen']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => $e->getMessage()]);
}

$conn->close();
?>