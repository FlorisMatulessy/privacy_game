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

$user_id = $_GET['user_id'] ?? null;

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

// Verify user is admin
if ($user_id) {
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin toegang vereist']);
        $conn->close();
        exit;
    }
}

// Get all departments with stats
$query = "
    SELECT 
        d.id,
        d.name,
        d.display_name,
        d.color,
        d.description,
        COUNT(DISTINCT u.id) as user_count,
        COALESCE(SUM(u.points), 0) as total_points,
        COALESCE(ROUND(AVG(u.points), 1), 0) as avg_points,
        COALESCE(SUM(u.achievements_unlocked), 0) as total_achievements
    FROM departments d
    LEFT JOIN users u ON u.department = d.name
    GROUP BY d.id
    ORDER BY total_points DESC
";

$result = $conn->query($query);
$departments = [];

while ($row = $result->fetch_assoc()) {
    // Get users for this department
    $userQuery = $conn->prepare("
        SELECT id, username, points, achievements_unlocked, last_login_at 
        FROM users 
        WHERE department = ? 
        ORDER BY points DESC
    ");
    $userQuery->bind_param("s", $row['name']);
    $userQuery->execute();
    $userResult = $userQuery->get_result();
    
    $users = [];
    while ($user = $userResult->fetch_assoc()) {
        $users[] = $user;
    }
    $userQuery->close();
    
    $row['users'] = $users;
    $departments[] = $row;
}

$conn->close();

echo json_encode(['departments' => $departments]);
?>
