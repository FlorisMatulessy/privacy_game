<?php
// Security helper functions

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    // Sanitize first
    $email = sanitizeInput($email);
    
    // Basic format validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['valid' => false, 'error' => 'Ongeldig email adres'];
    }
    
    // Check for suspicious patterns
    if (preg_match('/[<>"]/', $email)) {
        return ['valid' => false, 'error' => 'Email bevat ongeldige karakters'];
    }
    
    // Check email length (RFC 5321)
    if (strlen($email) > 254) {
        return ['valid' => false, 'error' => 'Email adres is te lang'];
    }
    
    // Validate domain part exists
    $emailParts = explode('@', $email);
    if (count($emailParts) !== 2 || empty($emailParts[0]) || empty($emailParts[1])) {
        return ['valid' => false, 'error' => 'Ongeldig email formaat'];
    }
    
    // Check for disposable email domains
    $disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', '10minutemail.com', 'mailinator.com'];
    $domain = strtolower($emailParts[1]);
    if (in_array($domain, $disposableDomains)) {
        return ['valid' => false, 'error' => 'Tijdelijke email adressen zijn niet toegestaan'];
    }
    
    // Check if domain has MX records (can receive emails)
    if (!checkdnsrr($domain, 'MX') && !checkdnsrr($domain, 'A')) {
        return ['valid' => false, 'error' => 'Dit email domein bestaat niet of kan geen emails ontvangen'];
    }
    
    return ['valid' => true, 'email' => strtolower($email)];
}

function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    }
}

function checkRateLimit($username, $conn, $maxAttempts = 5, $lockoutMinutes = 15) {
    $stmt = $conn->prepare("SELECT COUNT(*) as attempts, MAX(attempt_time) as last_attempt FROM login_attempts WHERE username = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL ? MINUTE)");
    $stmt->bind_param("si", $username, $lockoutMinutes);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    
    $attempts = $row['attempts'] ?? 0;
    $remainingAttempts = $maxAttempts - $attempts;
    
    if ($attempts >= $maxAttempts) {
        $lockoutUntil = strtotime($row['last_attempt']) + ($lockoutMinutes * 60);
        return [
            'allowed' => false,
            'remainingAttempts' => 0,
            'lockoutUntil' => $lockoutUntil
        ];
    }
    
    return [
        'allowed' => true,
        'remainingAttempts' => $remainingAttempts,
        'lockoutUntil' => null
    ];
}

function recordFailedAttempt($username, $conn) {
    $ip = getClientIP();
    $stmt = $conn->prepare("INSERT INTO login_attempts (username, ip_address, attempt_time) VALUES (?, ?, NOW())");
    $stmt->bind_param("ss", $username, $ip);
    $stmt->execute();
    $stmt->close();
}

function clearFailedAttempts($username, $conn) {
    $stmt = $conn->prepare("DELETE FROM login_attempts WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->close();
}

function logSecurityEvent($conn, $user_id, $event_type, $event_description, $ip_address) {
    $stmt = $conn->prepare("INSERT INTO audit_logs (user_id, event_type, event_description, ip_address, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("isss", $user_id, $event_type, $event_description, $ip_address);
    $stmt->execute();
    $stmt->close();
}
?>
