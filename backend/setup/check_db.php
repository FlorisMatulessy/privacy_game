<?php
$conn = new mysqli('localhost', 'root', '', 'privacy_game');
if ($conn->connect_error) {
    echo 'Connection failed: ' . $conn->connect_error . "\n";
    exit;
}

echo "Database connected\n";

$result = $conn->query("SHOW TABLES LIKE 'app_settings'");
if ($result->num_rows > 0) {
    echo "app_settings table exists\n";
    
    $count = $conn->query("SELECT COUNT(*) as cnt FROM app_settings");
    $row = $count->fetch_assoc();
    echo "Number of settings: " . $row['cnt'] . "\n";
    
    if ($row['cnt'] > 0) {
        echo "\nFirst few settings:\n";
        $settings = $conn->query("SELECT setting_key, setting_value FROM app_settings LIMIT 5");
        while ($setting = $settings->fetch_assoc()) {
            echo "  - {$setting['setting_key']}: {$setting['setting_value']}\n";
        }
    }
} else {
    echo "app_settings table NOT found - creating it now...\n";
    
    $create_table = "CREATE TABLE app_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50),
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    if ($conn->query($create_table)) {
        echo "Table created successfully\n";
        
        // Insert default settings
        $defaults = [
            ['timezone', 'UTC', 'string', 'Tijdzone'],
            ['date_format', '24h', 'string', 'Datum formaat'],
            ['session_duration', '3600', 'number', 'Sessie duur (seconden)'],
            ['inactivity_timeout', '1800', 'number', 'Inactiviteit timeout (seconden)'],
            ['auto_logout', '30', 'number', 'Auto logout (minuten)'],
            ['password_validity', '90', 'number', 'Wachtwoord geldigheid (dagen)'],
            ['force_password_change', '0', 'number', 'Forceer wachtwoord wijziging'],
            ['token_validity', '86400', 'number', 'Token geldigheid (seconden)'],
            ['api_key_validity', '365', 'number', 'API key geldigheid (dagen)'],
            ['lockout_duration', '15', 'number', 'Account lockout duur (minuten)'],
            ['notification_delay', '5', 'number', 'Notificatie vertraging (minuten)'],
            ['email_send_time', '09:00', 'time', 'Email verzend tijd'],
            ['backup_frequency', '24', 'number', 'Backup frequentie (uren)'],
            ['log_retention', '30', 'number', 'Log bewaarperiode (dagen)'],
            ['data_retention', '365', 'number', 'Data bewaarperiode (dagen)'],
            ['auto_cleanup', '7', 'number', 'Auto cleanup (dagen)']
        ];
        
        $stmt = $conn->prepare("INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)");
        
        foreach ($defaults as $setting) {
            $stmt->bind_param("ssss", $setting[0], $setting[1], $setting[2], $setting[3]);
            $stmt->execute();
        }
        
        echo "Default settings inserted\n";
        $stmt->close();
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }
}

$conn->close();
?>
