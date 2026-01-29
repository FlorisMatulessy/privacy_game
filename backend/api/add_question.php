<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../helpers/security_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Alleen POST verzoeken toegestaan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['question_text'])) {
    echo json_encode(['error' => 'Vraag tekst is verplicht']);
    exit;
}

$question_text = sanitizeInput($input['question_text']);
$answer_type = sanitizeInput($input['answer_type'] ?? 'multiple_choice');
$options = isset($input['options']) ? json_encode($input['options']) : null;
$correct_answer = sanitizeInput($input['correct_answer'] ?? '');
$category = sanitizeInput($input['category'] ?? '');
$difficulty = sanitizeInput($input['difficulty'] ?? '');
$user_id = filter_var($input['user_id'] ?? null, FILTER_VALIDATE_INT);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Database verbinding mislukt']);
    exit;
}

// Verify user is admin
if ($user_id) {
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user || $user['role'] !== 'admin') {
        echo json_encode(['error' => 'Admin toegang vereist']);
        $conn->close();
        exit;
    }
}

$stmt = $conn->prepare("INSERT INTO questions (question_text, answer_type, options, correct_answer, category, difficulty) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $question_text, $answer_type, $options, $correct_answer, $category, $difficulty);

if ($stmt->execute()) {
    echo json_encode(['success' => 'Vraag succesvol toegevoegd']);
} else {
    echo json_encode(['error' => 'Fout bij toevoegen van vraag: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
