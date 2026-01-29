<?php
$conn = new mysqli('localhost', 'root', '', 'privacy_game');
$result = $conn->query('SELECT username, role, email FROM users');
echo "Gebruikers in database:\n";
while($row = $result->fetch_assoc()) {
    echo "- " . $row['username'] . " (" . $row['role'] . ") - " . $row['email'] . "\n";
}
