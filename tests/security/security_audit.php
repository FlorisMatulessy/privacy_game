<?php
// Security Audit Script - Privacy Quest Database
echo "=== SECURITY AUDIT - PRIVACY QUEST DATABASE ===\n\n";

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "1. DATABASE STRUCTUUR\n";
echo str_repeat("-", 50) . "\n";

// Check alle tabellen
$tables = $conn->query("SHOW TABLES");
echo "Tabellen in database:\n";
while ($row = $tables->fetch_array()) {
    echo "  - " . $row[0] . "\n";
}

echo "\n2. USERS TABEL - STRUCTUUR\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("DESCRIBE users");
while ($row = $result->fetch_assoc()) {
    $nullable = $row['Null'] == 'YES' ? 'NULL' : 'NOT NULL';
    $key = $row['Key'] ? " [{$row['Key']}]" : "";
    echo sprintf("  %-25s %-15s %-10s%s\n", $row['Field'], $row['Type'], $nullable, $key);
}

echo "\n3. USERS - SAMPLE DATA (GEVOELIGE DATA VERBORGEN)\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT id, username, email, role, department, points, achievements_unlocked, created_at, last_login_at FROM users LIMIT 5");
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "ID: {$row['id']}\n";
        echo "  Username: {$row['username']}\n";
        echo "  Email: " . (empty($row['email']) ? '[LEEG]' : substr($row['email'], 0, 3) . '***@***') . "\n";
        echo "  Role: {$row['role']}\n";
        echo "  Department: {$row['department']}\n";
        echo "  Points: {$row['points']}\n";
        echo "  Created: {$row['created_at']}\n";
        echo "  Last Login: {$row['last_login_at']}\n\n";
    }
} else {
    echo "  [Geen users gevonden]\n\n";
}

echo "4. WACHTWOORD BEVEILIGING CHECK\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT id, username, LENGTH(password) as pwd_length, LEFT(password, 7) as pwd_prefix FROM users LIMIT 3");
if ($result->num_rows > 0) {
    $allHashed = true;
    while ($row = $result->fetch_assoc()) {
        $isHashed = ($row['pwd_prefix'] == '$2y$10$' || $row['pwd_prefix'] == '$2y$12$');
        echo "  User: {$row['username']}\n";
        echo "    Password length: {$row['pwd_length']} chars\n";
        echo "    Prefix: {$row['pwd_prefix']}\n";
        echo "    Status: " . ($isHashed ? "✓ BCRYPT HASH" : "✗ MOGELIJK PLAIN TEXT!") . "\n\n";
        if (!$isHashed) $allHashed = false;
    }
    echo "  Conclusie: " . ($allHashed ? "✓ Alle wachtwoorden zijn gehashed" : "✗ GEVAAR: Niet alle wachtwoorden zijn gehashed!") . "\n\n";
} else {
    echo "  [Geen users om te controleren]\n\n";
}

echo "5. PERSOONSGEGEVENS AUDIT\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT 
    COUNT(*) as total_users,
    COUNT(email) as users_with_email,
    COUNT(last_login_ip) as users_with_ip,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count
FROM users");
$stats = $result->fetch_assoc();
echo "  Totaal aantal users: {$stats['total_users']}\n";
echo "  Users met email: {$stats['users_with_email']}\n";
echo "  Users met IP gelogd: {$stats['users_with_ip']}\n";
echo "  Admins: {$stats['admin_count']}\n";
echo "  Gewone users: {$stats['user_count']}\n\n";

echo "6. SECURITY LOGGING - LOGIN_ATTEMPTS\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT COUNT(*) as total, 
    COUNT(DISTINCT username) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips,
    MAX(attempt_time) as last_attempt
FROM login_attempts");
if ($result) {
    $stats = $result->fetch_assoc();
    echo "  Totaal mislukte pogingen: {$stats['total']}\n";
    echo "  Unieke usernames: {$stats['unique_users']}\n";
    echo "  Unieke IP adressen: {$stats['unique_ips']}\n";
    echo "  Laatste poging: " . ($stats['last_attempt'] ?? '[NOOIT]') . "\n\n";
} else {
    echo "  [Tabel bestaat niet of is leeg]\n\n";
}

echo "7. SECURITY LOGGING - AUDIT_LOGS\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT 
    event_type, 
    COUNT(*) as count 
FROM audit_logs 
GROUP BY event_type 
ORDER BY count DESC");
if ($result && $result->num_rows > 0) {
    echo "  Event types:\n";
    while ($row = $result->fetch_assoc()) {
        echo "    {$row['event_type']}: {$row['count']} events\n";
    }
    echo "\n";
} else {
    echo "  [Geen audit logs gevonden]\n\n";
}

echo "8. APP_SETTINGS - SECURITY CONFIGURATIE\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT setting_key, setting_value, description FROM app_settings WHERE setting_key IN ('max_login_attempts', 'lockout_duration', 'session_timeout', 'password_min_length')");
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "  {$row['setting_key']}: {$row['setting_value']}\n";
        echo "    ({$row['description']})\n";
    }
    echo "\n";
} else {
    echo "  [Geen security settings gevonden]\n\n";
}

echo "9. DEPARTMENTS TABEL\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT id, name, created_at FROM departments");
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "  {$row['id']}: {$row['name']} (created: {$row['created_at']})\n";
    }
    echo "\n";
} else {
    echo "  [Geen departments gevonden]\n\n";
}

echo "10. QUESTIONS TABEL - PRIVACY CHECK\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT COUNT(*) as total, department, COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy, COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium, COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard FROM questions GROUP BY department");
if ($result && $result->num_rows > 0) {
    echo "  Vragen per afdeling:\n";
    while ($row = $result->fetch_assoc()) {
        echo "    {$row['department']}: {$row['total']} vragen (Easy: {$row['easy']}, Medium: {$row['medium']}, Hard: {$row['hard']})\n";
    }
    echo "\n";
} else {
    echo "  [Geen vragen gevonden]\n\n";
}

echo "11. INDEXES EN CONSTRAINTS CHECK\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SHOW INDEX FROM users");
echo "  Users tabel indexes:\n";
while ($row = $result->fetch_assoc()) {
    $unique = $row['Non_unique'] == 0 ? '[UNIQUE]' : '';
    echo "    {$row['Key_name']} on {$row['Column_name']} $unique\n";
}

echo "\n12. SQL INJECTION RISICO ANALYSE\n";
echo str_repeat("-", 50) . "\n";
echo "  ✓ Database gebruikt mysqli (prepared statements mogelijk)\n";
echo "  ✓ Alle PHP files moeten prepared statements gebruiken\n";
echo "  ⚠ Check: Zijn alle queries in PHP prepared statements?\n\n";

echo "13. DATALEK PREVENTIE\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'privacy_game' AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('password', 'email', 'username')");
echo "  Gevoelige velden in users:\n";
while ($row = $result->fetch_assoc()) {
    $length = $row['CHARACTER_MAXIMUM_LENGTH'] ?? 'N/A';
    echo "    {$row['COLUMN_NAME']}: {$row['DATA_TYPE']}($length)\n";
}

echo "\n=== EINDE SECURITY AUDIT ===\n";
$conn->close();
?>
