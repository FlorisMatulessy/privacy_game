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

if (!$input || !isset($input['username']) || !isset($input['points'])) {
    echo json_encode(['error' => 'Gebruikersnaam en punten zijn verplicht']);
    exit;
}

$username = $input['username'];
$points = intval($input['points']);
$achievements = $input['achievements'] ?? [];
$game_type = $input['game_type'] ?? 'Unknown';

$servername = "localhost";
$dbusername = "root";
$dbpassword = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database verbinding mislukt']);
    exit;
}

// Get user
$stmt = $conn->prepare("SELECT id, points FROM users WHERE username = ?");
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

// Update user points
$new_points = $user['points'] + $points;
$stmt = $conn->prepare("UPDATE users SET points = ? WHERE id = ?");
$stmt->bind_param("ii", $new_points, $user['id']);
$stmt->execute();
$stmt->close();

// Save achievements (if applicable)
// This is a simplified version - adjust based on your actual achievements schema
if (!empty($achievements)) {
    foreach ($achievements as $achievement_id) {
        // Check if achievement already unlocked
        $checkStmt = $conn->prepare("SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?");
        $checkStmt->bind_param("ii", $user['id'], $achievement_id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            // Insert new achievement
            $insertStmt = $conn->prepare("INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, NOW())");
            $insertStmt->bind_param("ii", $user['id'], $achievement_id);
            $insertStmt->execute();
            $insertStmt->close();
        }
        $checkStmt->close();
    }
    
    // Update achievements count
    $countStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM user_achievements WHERE user_id = ?");
    $countStmt->bind_param("i", $user['id']);
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $count = $countResult->fetch_assoc()['cnt'];
    $countStmt->close();
    
    $updateStmt = $conn->prepare("UPDATE users SET achievements_unlocked = ? WHERE id = ?");
    $updateStmt->bind_param("ii", $count, $user['id']);
    $updateStmt->execute();
    $updateStmt->close();
}

$conn->close();

echo json_encode([
    'success' => 'Resultaten succesvol opgeslagen',
    'new_points' => $new_points
]);
?>
