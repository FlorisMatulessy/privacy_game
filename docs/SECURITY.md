# Privacy Quest - Security Documentatie

## 🔒 Security Implementaties

### 1. Verantwoordelijkheid & Veilige Code

#### Input Validatie
- **Alle gebruikersinvoer wordt gevalideerd** via `security_helpers.php`
- **SQL Injection preventie**: Alle queries gebruiken prepared statements
- **XSS preventie**: `sanitizeInput()` functie gebruikt `htmlspecialchars()` met `ENT_QUOTES`
- **Username validatie**: Alleen alphanumeriek en underscore, 3-20 karakters
- **Email validatie**: PHP `filter_var()` met `FILTER_VALIDATE_EMAIL`
- **Department validatie**: Whitelist van toegestane afdelingen

#### Data Opslag
- **Geen gevoelige data in localStorage**: Applicatie gebruikt geen client-side opslag voor credentials
- **Session data**: Alleen user ID en role in geheugen, geen wachtwoorden in frontend

### 2. Authenticatie & Wachtwoorden

#### Wachtwoord Beveiliging
- **Hashing**: `password_hash()` met `PASSWORD_DEFAULT` (bcrypt)
- **Verificatie**: `password_verify()` voor veilige vergelijking
- **Geen plaintext**: Wachtwoorden worden NOOIT leesbaar opgeslagen

#### Wachtwoord Complexiteit
**Reguliere gebruikers** (minimaal 8 karakters):
- Minimaal één hoofdletter
- Minimaal één kleine letter
- Minimaal één cijfer

**Admin accounts** (minimaal 12 karakters):
- Minimaal één hoofdletter
- Minimaal één kleine letter
- Minimaal één cijfer
- Minimaal één speciaal teken

#### Wachtwoord Beheer
- **Change password**: Gebruikers kunnen eigen wachtwoord wijzigen via `change_password.php`
- **Password history**: `password_history` tabel voorkomt hergebruik van oude wachtwoorden
- **Force change**: Admin kan `force_password_change` flag instellen voor nieuwe gebruikers
- **Password validity**: Configureerbaar via app settings (standaard 90 dagen)

### 3. Rate Limiting & Account Lockout

#### Brute Force Preventie
- **Failed attempts tracking**: `login_attempts` tabel registreert mislukte pogingen
- **Lockout mechanisme**: Na 5 mislukte pogingen wordt account tijdelijk vergrendeld
- **Lockout duration**: Configureerbaar via `lockout_duration` setting (standaard 15 minuten)
- **Automatic reset**: Failed attempts worden gereset na succesvolle login
- **IP tracking**: Login attempts worden gekoppeld aan IP adres

#### Implementatie
```php
// In login.php
$rateLimit = checkRateLimit($username, $conn, 5, $lockoutMinutes);
if (!$rateLimit['allowed']) {
    // Account is locked
}
```

### 4. Autorisatie & Toegangscontrole

#### Role-Based Access Control (RBAC)
- **User roles**: `user` (standaard) en `admin`
- **Role checking**: Admin endpoints controleren `role === 'admin'`
- **Least privilege**: Users zien alleen eigen data
- **Admin verification**: Login met admin checkbox vereist admin role in database

#### API Beveiliging
- **Method validation**: API endpoints accepteren alleen POST requests waar nodig
- **Input sanitization**: Alle input wordt gefilterd via `sanitizeInput()`
- **Error messages**: Geen gevoelige info in foutmeldingen
- **SQL prepared statements**: Bescherming tegen SQL injection

### 5. Session Management

#### Inactiviteit Detectie
- **SessionManager component**: Detecteert gebruikersactiviteit (muis, keyboard, scroll)
- **Inactivity timeout**: Configureerbaar via `inactivity_timeout` setting
- **Auto logout**: Gebruiker wordt automatisch uitgelogd na inactiviteit
- **Warning**: Alert voordat sessie verloopt

#### Session Settings
- `session_duration`: Maximale sessieduur (standaard 3600 seconden / 1 uur)
- `inactivity_timeout`: Time-out bij geen activiteit (standaard 1800 seconden / 30 min)
- `auto_logout`: Automatische uitlog tijd (standaard 30 minuten)

### 6. Audit Logging

#### Security Events
Alle belangrijke acties worden gelogd in `audit_logs` tabel:

| Event Type | Beschrijving |
|------------|-------------|
| `login_success` | Succesvolle login |
| `login_failed` | Mislukte login poging |
| `login_blocked` | Geblokkeerde login (lockout) |
| `unauthorized_access` | Ongeautoriseerde toegang poging |
| `unauthorized_admin_access` | Niet-admin probeert admin login |
| `registration_success` | Nieuwe gebruiker geregistreerd |
| `registration_failed` | Mislukte registratie |
| `password_changed` | Wachtwoord gewijzigd |
| `admin_stats_viewed` | Admin bekijkt statistieken |

#### Log Structuur
```sql
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    event_type VARCHAR(50),
    event_description TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME
);
```

#### Log Retention
- **Configureerbaar**: `log_retention` setting (standaard 30 dagen)
- **Geen gevoelige data**: Logs bevatten GEEN wachtwoorden of persoonlijke data
- **IP tracking**: Client IP wordt opgeslagen voor security audit

### 7. Data Bescherming & Privacy

#### Persoonsgegevens
Opgeslagen persoonsgegevens:
- **Username**: Unieke identifier
- **Department**: Afdeling gebruiker
- **Points**: Gamevoortgang
- **Achievements**: Behaalde prestaties
- **Email**: (optioneel, indien geïmplementeerd)

#### Data Retention
Configureerbare settings:
- `data_retention`: Bewaartermijn data (standaard 365 dagen)
- `auto_cleanup`: Automatische opschoning oude data (standaard 7 dagen)
- `log_retention`: Bewaartermijn logs (standaard 30 dagen)

#### Privacy Compliance
- **Purpose specification**: Data wordt alleen gebruikt voor game functionaliteit
- **Data minimization**: Alleen noodzakelijke data wordt opgeslagen
- **User rights**: Gebruikers kunnen eigen data inzien/wijzigen
- **Breach notification**: Datalekken moeten direct gemeld worden

### 8. HTTPS & Transport Security

#### Productie Configuratie
```php
// In config.php
define('REQUIRE_HTTPS', true); // Set to true in production

// Force HTTPS redirect
if (REQUIRE_HTTPS && (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on')) {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}
```

#### Security Headers
Geïmplementeerd via `setSecurityHeaders()` in `config.php`:

```php
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains (alleen HTTPS)
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
```

### 9. Database Beveiliging

#### Credentials Management
- **Development**: Credentials in `config.php`
- **Production**: Gebruik `.env` bestand (NIET in git!)
- **Environment variables**: Aanbevolen voor productie

#### Database User Privileges
Aanbevolen privileges voor productie:
```sql
CREATE USER 'privacy_game_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON privacy_game.* TO 'privacy_game_user'@'localhost';
FLUSH PRIVILEGES;
```

### 10. Email & Communicatie

#### Email Settings
Configureerbaar via app settings:
- `email_send_time`: Standaard tijd voor email verzending (HH:MM)
- `notification_delay`: Vertraging voor notificaties (minuten)

#### Security
- **TLS/SSL**: Email moet versleuteld verzonden worden
- **Rate limiting**: Voorkom spam via email flooding
- **Validation**: Email adressen worden gevalideerd

## 🚀 Deployment Checklist

### Pre-Production
- [ ] `.env` bestand aanmaken met database credentials
- [ ] `REQUIRE_HTTPS` op `true` zetten in `config.php`
- [ ] SSL certificaat installeren (Let's Encrypt aanbevolen)
- [ ] Database user met minimale privileges aanmaken
- [ ] `error_reporting` en `display_errors` uitschakelen
- [ ] Admin wachtwoorden updaten naar sterke wachtwoorden (12+ chars)

### Security Tables Setup
```bash
# Run deze scripts om security tables aan te maken:
curl http://localhost/api/create_security_tables.php
curl http://localhost/api/create_settings_table.php
```

### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName privacyquest.example.com
    DocumentRoot /var/www/privacy-quest
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/privacyquest.crt
    SSLCertificateKeyFile /etc/ssl/private/privacyquest.key
    
    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000"
    
    # Disable directory listing
    Options -Indexes
    
    # Protect sensitive files
    <FilesMatch "\.(env|log|sql)$">
        Require all denied
    </FilesMatch>
</VirtualHost>
```

## 🔍 Security Monitoring

### Regular Checks
- **Audit logs**: Review wekelijks voor verdachte activiteit
- **Failed logins**: Monitor voor brute force aanvallen
- **Database backups**: Dagelijks (configureerbaar via `backup_frequency`)
- **Dependency updates**: Maandelijks controleren op security patches

### Incident Response
Bij security incident:
1. **Isoleer** het getroffen systeem
2. **Analyseer** audit logs voor scope van breach
3. **Meld** incident binnen 72 uur (GDPR vereiste)
4. **Patch** de kwetsbaarheid
5. **Communiceer** met gebruikers indien nodig

## 📚 Dependencies & Updates

### PHP Dependencies
- **PHP**: 7.4+ (8.0+ aanbevolen)
- **MySQLi**: Voor database connecties
- **password_hash**: Bcrypt voor wachtwoorden

### Frontend Dependencies
```json
{
  "react": "^18.x",
  "vite": "^7.x",
  "tailwindcss": "^4.x"
}
```

### Update Procedure
1. Check release notes voor security fixes
2. Test updates in development environment
3. Backup database en code
4. Deploy updates naar production
5. Verify functionality en security

## 📞 Contact & Support

Voor security issues:
- **Email**: security@privacyquest.example.com
- **Responsible disclosure**: 90 dagen voor publieke disclosure

---

**Laatste update**: Januari 2026  
**Versie**: 1.0
