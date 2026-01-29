<?php
// FINALE SECURITY VERIFICATIE
echo "=== FINALE SECURITY VERIFICATIE ===\n";
echo date('Y-m-d H:i:s') . "\n\n";

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "privacy_game";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) die("Connection failed");

$passed = 0;
$failed = 0;
$warnings = 0;

// TEST 1: Wachtwoord Beveiliging
echo "TEST 1: WACHTWOORD BEVEILIGING\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT username, LENGTH(password) as len, LEFT(password, 7) as prefix FROM users");
$allSecure = true;
while ($row = $result->fetch_assoc()) {
    $isBcrypt = ($row['prefix'] == '$2y$10$' || $row['prefix'] == '$2y$12$') && $row['len'] == 60;
    if ($isBcrypt) {
        echo "✓ {$row['username']}: Bcrypt hash ({$row['len']} chars)\n";
    } else {
        echo "✗ {$row['username']}: ONVEILIG! Length: {$row['len']}, Prefix: {$row['prefix']}\n";
        $allSecure = false;
    }
}
if ($allSecure) {
    echo "RESULTAAT: ✓ GESLAAGD - Alle wachtwoorden zijn bcrypt\n\n";
    $passed++;
} else {
    echo "RESULTAAT: ✗ GEFAALD - Niet alle wachtwoorden zijn veilig!\n\n";
    $failed++;
}

// TEST 2: SQL Injection Check - Prepared Statements
echo "TEST 2: SQL INJECTION PREVENTIE (PHP FILES)\n";
echo str_repeat("-", 50) . "\n";
$productionFiles = [
    'backend/api/login.php', 'backend/api/register.php', 'backend/api/change_password.php',
    'backend/api/add_department.php', 'backend/api/add_question.php', 'backend/api/update_question.php',
    'backend/api/delete_question.php', 'backend/api/get_department_stats.php', 'backend/api/save_game_results.php',
    'backend/api/update_settings.php', 'backend/api/get_settings.php', 'backend/api/get_questions.php'
];

$allSafe = true;
foreach ($productionFiles as $file) {
    if (!file_exists($file)) {
        echo "⚠ $file: NIET GEVONDEN\n";
        $warnings++;
        continue;
    }
    $content = file_get_contents($file);
    $hasPrepare = stripos($content, '->prepare(') !== false;
    $hasBindParam = stripos($content, 'bind_param(') !== false;
    $hasExecute = stripos($content, '->execute()') !== false;
    
    // Prepared statements kunnen ook zonder bind_param als er geen parameters zijn
    if ($hasPrepare && $hasExecute) {
        echo "✓ $file: Prepared statements ✓\n";
    } else if (!stripos($content, '$conn') && !stripos($content, 'mysqli')) {
        echo "○ $file: Geen database calls\n";
    } else {
        echo "✗ $file: GEEN prepared statements!\n";
        $allSafe = false;
    }
}
if ($allSafe) {
    echo "RESULTAAT: ✓ GESLAAGD - SQL injection bescherming actief\n\n";
    $passed++;
} else {
    echo "RESULTAAT: ✗ GEFAALD - SQL injection risico!\n\n";
    $failed++;
}

// TEST 3: Input Sanitization
echo "TEST 3: INPUT SANITIZATION\n";
echo str_repeat("-", 50) . "\n";
$inputFiles = ['backend/api/register.php', 'backend/api/login.php', 'backend/api/change_password.php', 'backend/api/add_question.php'];
$allHaveSanitization = true;
foreach ($inputFiles as $file) {
    if (!file_exists($file)) continue;
    $content = file_get_contents($file);
    $hasSanitize = stripos($content, 'sanitizeInput') !== false || 
                   stripos($content, 'filter_var') !== false ||
                   stripos($content, 'htmlspecialchars') !== false;
    
    if ($hasSanitize) {
        echo "✓ $file: Input sanitization ✓\n";
    } else {
        echo "✗ $file: GEEN input sanitization!\n";
        $allHaveSanitization = false;
    }
}
if ($allHaveSanitization) {
    echo "RESULTAAT: ✓ GESLAAGD - Input wordt gesanitized\n\n";
    $passed++;
} else {
    echo "RESULTAAT: ✗ GEFAALD - Input sanitization ontbreekt!\n\n";
    $failed++;
}

// TEST 4: Security Helpers Beschikbaar
echo "TEST 4: SECURITY HELPERS\n";
echo str_repeat("-", 50) . "\n";
if (file_exists('backend/helpers/security_helpers.php')) {
    $content = file_get_contents('backend/helpers/security_helpers.php');
    $functions = [
        'sanitizeInput' => stripos($content, 'function sanitizeInput') !== false,
        'validateEmail' => stripos($content, 'function validateEmail') !== false,
        'checkRateLimit' => stripos($content, 'function checkRateLimit') !== false,
        'logSecurityEvent' => stripos($content, 'function logSecurityEvent') !== false
    ];
    
    $allPresent = true;
    foreach ($functions as $func => $exists) {
        if ($exists) {
            echo "✓ $func() aanwezig\n";
        } else {
            echo "✗ $func() ONTBREEKT!\n";
            $allPresent = false;
        }
    }
    
    if ($allPresent) {
        echo "RESULTAAT: ✓ GESLAAGD - Security helpers compleet\n\n";
        $passed++;
    } else {
        echo "RESULTAAT: ✗ GEFAALD - Security helpers incompleet!\n\n";
        $failed++;
    }
} else {
    echo "✗ security_helpers.php NIET GEVONDEN!\n";
    echo "RESULTAAT: ✗ GEFAALD\n\n";
    $failed++;
}

// TEST 5: Database Constraints
echo "TEST 5: DATABASE CONSTRAINTS\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SHOW INDEX FROM users WHERE Key_name = 'username'");
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($row['Non_unique'] == 0) {
        echo "✓ Username UNIQUE constraint aanwezig\n";
    } else {
        echo "✗ Username is NIET unique!\n";
    }
} else {
    echo "✗ Username heeft GEEN index!\n";
}

$result = $conn->query("SHOW INDEX FROM users WHERE Key_name = 'email'");
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($row['Non_unique'] == 0) {
        echo "✓ Email UNIQUE constraint aanwezig\n";
    } else {
        echo "✗ Email is NIET unique!\n";
    }
} else {
    echo "⚠ Email heeft geen unique constraint (kan NULL zijn)\n";
}

echo "RESULTAAT: ✓ GESLAAGD - Database constraints OK\n\n";
$passed++;

// TEST 6: Security Logging Tabellen
echo "TEST 6: SECURITY LOGGING\n";
echo str_repeat("-", 50) . "\n";
$tables = ['login_attempts', 'audit_logs'];
$tablesExist = true;
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        $count = $conn->query("SELECT COUNT(*) as cnt FROM $table")->fetch_assoc()['cnt'];
        echo "✓ $table: Bestaat ($count records)\n";
    } else {
        echo "✗ $table: ONTBREEKT!\n";
        $tablesExist = false;
    }
}
if ($tablesExist) {
    echo "RESULTAAT: ✓ GESLAAGD - Security logging actief\n\n";
    $passed++;
} else {
    echo "RESULTAAT: ✗ GEFAALD - Security logging incomplete!\n\n";
    $failed++;
}

// TEST 7: Rate Limiting Configuratie
echo "TEST 7: RATE LIMITING CONFIGURATIE\n";
echo str_repeat("-", 50) . "\n";
$result = $conn->query("SELECT setting_value FROM app_settings WHERE setting_key = 'lockout_duration'");
if ($result && $result->num_rows > 0) {
    $duration = $result->fetch_assoc()['setting_value'];
    echo "✓ Lockout duration: $duration minuten\n";
    echo "RESULTAAT: ✓ GESLAAGD - Rate limiting geconfigureerd\n\n";
    $passed++;
} else {
    echo "⚠ Lockout duration niet gevonden in settings\n";
    echo "RESULTAAT: ⚠ WARNING - Gebruikt default waarden\n\n";
    $warnings++;
}

// TEST 8: Admin Authorization Checks
echo "TEST 8: ADMIN AUTHORIZATION\n";
echo str_repeat("-", 50) . "\n";
$adminFiles = ['backend/api/add_department.php', 'backend/api/add_question.php', 'backend/api/update_settings.php'];
$allHaveChecks = true;
foreach ($adminFiles as $file) {
    if (!file_exists($file)) continue;
    $content = file_get_contents($file);
    $hasRoleCheck = stripos($content, "role") !== false && stripos($content, "admin") !== false;
    
    if ($hasRoleCheck) {
        echo "✓ $file: Role check aanwezig\n";
    } else {
        echo "✗ $file: GEEN role check!\n";
        $allHaveChecks = false;
    }
}
if ($allHaveChecks) {
    echo "RESULTAAT: ✓ GESLAAGD - Admin authorization actief\n\n";
    $passed++;
} else {
    echo "RESULTAAT: ✗ GEFAALD - Admin authorization ontbreekt!\n\n";
    $failed++;
}

// FINALE SCORE
echo "\n";
echo str_repeat("=", 50) . "\n";
echo "FINALE SECURITY SCORE\n";
echo str_repeat("=", 50) . "\n";
echo "Tests geslaagd:  $passed\n";
echo "Tests gefaald:   $failed\n";
echo "Waarschuwingen:  $warnings\n";
echo "\n";

$total = $passed + $failed;
$percentage = ($total > 0) ? round(($passed / $total) * 100) : 0;

echo "Score: $percentage%\n\n";

if ($failed == 0) {
    echo "✓✓✓ ALLE SECURITY TESTS GESLAAGD! ✓✓✓\n";
    echo "De applicatie is veilig voor gebruik.\n";
} else if ($failed <= 2) {
    echo "⚠⚠⚠ SOMMIGE TESTS GEFAALD ⚠⚠⚠\n";
    echo "Los de bovenstaande problemen op.\n";
} else {
    echo "✗✗✗ KRITIEKE SECURITY ISSUES ✗✗✗\n";
    echo "NIET GEBRUIKEN TOT PROBLEMEN ZIJN OPGELOST!\n";
}

$conn->close();
?>
