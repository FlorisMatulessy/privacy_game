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

$stmt = $conn->prepare("SELECT id, question_text, answer_type, options, correct_answer, category, difficulty FROM questions ORDER BY id DESC");
$stmt->execute();
$result = $stmt->get_result();

$questions = [];
while ($row = $result->fetch_assoc()) {
    // Parse options if they're stored as JSON
    if ($row['options']) {
        $row['options'] = json_decode($row['options']);
    }
    $questions[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode(['questions' => $questions]);
?>
