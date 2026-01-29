<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Creating security tables...\n\n";

// Create login_attempts table
$conn->query("DROP TABLE IF EXISTS login_attempts");
$sql = "CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    attempt_time DATETIME NOT NULL,
    INDEX idx_username (username),
    INDEX idx_attempt_time (attempt_time)
)";

if ($conn->query($sql)) {
    echo "âœ“ login_attempts table created\n";
} else {
    echo "âœ— Error: " . $conn->error . "\n";
}

// Create audit_logs table
$sql = "CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    event_type VARCHAR(50),
    event_description TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
)";

if ($conn->query($sql)) {
    echo "âœ“ audit_logs table created\n";
} else {
    echo "âœ— Error: " . $conn->error . "\n";
}

// Create user_achievements table if not exists
$sql = "CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at DATETIME,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id)
)";

if ($conn->query($sql)) {
    echo "âœ“ user_achievements table created\n";
} else {
    echo "âœ— Error: " . $conn->error . "\n";
}

echo "\nAll tables created successfully!";
$conn->close();
?>
