<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database verbinding mislukt']);
    exit;
}

// Get total users
$userResult = $conn->query("SELECT COUNT(*) as total FROM users");
$userCount = $userResult->fetch_assoc()['total'];

// Get total achievements (you may need to adjust this based on your schema)
$achievementResult = $conn->query("SELECT COUNT(DISTINCT achievement_id) as total FROM user_achievements");
$achievementCount = 0;
if ($achievementResult) {
    $achievementCount = $achievementResult->fetch_assoc()['total'];
}

$conn->close();

echo json_encode([
    'users' => $userCount,
    'achievements' => $achievementCount
]);
?>
