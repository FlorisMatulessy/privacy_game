<?php
$conn = new mysqli('localhost', 'root', '', 'privacy_game');

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "Adding email column to users table...\n";

$sql = "ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE AFTER username";

if ($conn->query($sql)) {
    echo "✓ Email column added successfully\n";
} else {
    if (strpos($conn->error, 'Duplicate column') !== false) {
        echo "ℹ Email column already exists\n";
    } else {
        echo "✗ Error: " . $conn->error . "\n";
    }
}

$conn->close();
?>
