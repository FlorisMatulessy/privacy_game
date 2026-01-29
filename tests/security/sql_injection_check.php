<?php
// Check all PHP files for SQL injection vulnerabilities
echo "=== SQL INJECTION VULNERABILITY SCAN ===\n\n";

$phpFiles = glob("*.php");
$vulnerabilities = [];
$safeFiles = [];

foreach ($phpFiles as $file) {
    if ($file === 'sql_injection_check.php') continue; // Skip this script
    
    $content = file_get_contents($file);
    $issues = [];
    
    // Check for direct string concatenation in queries
    if (preg_match_all('/\$conn->query\s*\(\s*["\'].*?\$.*?["\']\s*\)/', $content, $matches)) {
        $issues[] = "Direct string concatenation in query()";
    }
    
    // Check for mysqli_query with variables
    if (preg_match('/mysqli_query\s*\(.*?\$.*?\)/', $content)) {
        $issues[] = "mysqli_query with variable concatenation";
    }
    
    // Check if file uses database but no prepare()
    $usesDatabase = (stripos($content, '$conn') !== false || stripos($content, 'mysqli') !== false);
    $usesPrepare = (stripos($content, 'prepare(') !== false);
    
    if ($usesDatabase && !$usesPrepare && stripos($content, 'SHOW TABLES') === false && stripos($content, 'DESCRIBE') === false) {
        $issues[] = "Uses database but NO prepared statements found";
    }
    
    // Check for good practices
    $hasPrepare = stripos($content, '->prepare(') !== false;
    $hasBindParam = stripos($content, 'bind_param(') !== false;
    
    if (count($issues) > 0) {
        $vulnerabilities[$file] = $issues;
    } else if ($usesDatabase && $hasPrepare && $hasBindParam) {
        $safeFiles[$file] = "✓ Uses prepared statements";
    }
}

echo "VEILIGE FILES (met prepared statements):\n";
echo str_repeat("-", 50) . "\n";
foreach ($safeFiles as $file => $status) {
    echo "✓ $file - $status\n";
}

echo "\n\nPOTENTIËLE KWETSBAARHEDEN:\n";
echo str_repeat("-", 50) . "\n";
if (count($vulnerabilities) > 0) {
    foreach ($vulnerabilities as $file => $issues) {
        echo "⚠ $file:\n";
        foreach ($issues as $issue) {
            echo "    - $issue\n";
        }
        echo "\n";
    }
} else {
    echo "✓ Geen SQL injection kwetsbaarheden gevonden!\n";
}

echo "\n=== INPUT VALIDATIE CHECK ===\n";
echo str_repeat("-", 50) . "\n";

$inputFiles = ['register.php', 'login.php', 'change_password.php', 'add_department.php', 'add_question.php'];
foreach ($inputFiles as $file) {
    if (!file_exists($file)) {
        echo "⚠ $file - NIET GEVONDEN\n";
        continue;
    }
    
    $content = file_get_contents($file);
    $checks = [];
    
    if (stripos($content, 'sanitizeInput') !== false) {
        $checks[] = "✓ sanitizeInput()";
    }
    if (stripos($content, 'htmlspecialchars') !== false) {
        $checks[] = "✓ htmlspecialchars()";
    }
    if (stripos($content, 'filter_var') !== false) {
        $checks[] = "✓ filter_var()";
    }
    if (stripos($content, 'trim(') !== false) {
        $checks[] = "✓ trim()";
    }
    
    echo "$file:\n";
    if (count($checks) > 0) {
        foreach ($checks as $check) {
            echo "  $check\n";
        }
    } else {
        echo "  ⚠ GEEN input validatie gevonden!\n";
    }
    echo "\n";
}

echo "=== EINDE SQL INJECTION SCAN ===\n";
?>
