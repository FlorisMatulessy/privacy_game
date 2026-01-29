# Email Beveiliging - Privacy Quest

## Overzicht
Dit document beschrijft de beveiligingsmaatregelen die zijn geïmplementeerd voor email verwerking in de Privacy Quest applicatie.

## Beveiligingslagen

### 1. Client-side Validatie (Register.jsx)
- **HTML5 Validatie**: `type="email"` voor browser-native validatie
- **Regex Pattern**: `[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+` voorkomt ongeldige karakters
- **Length Limit**: Maximum 254 karakters (RFC 5321 standaard)
- **XSS Preventie**: Controle op `<`, `>`, `"` karakters
- **Case Normalisatie**: Automatisch naar lowercase conversie
- **Trim**: Automatisch spaties verwijderen

```javascript
// Voorbeeld validatie
const emailRegex = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
if (!emailRegex.test(email)) {
  setBericht("Voer een geldig email adres in");
  return;
}
```

### 2. Server-side Validatie (register.php + security_helpers.php)

#### validateEmail() Functie
De centrale validatie functie controleert:

1. **Sanitization**: `htmlspecialchars()` met ENT_QUOTES en UTF-8
2. **Format Validatie**: PHP's `FILTER_VALIDATE_EMAIL`
3. **Suspicious Patterns**: Regex check voor `<>"`
4. **Length Check**: Maximum 254 karakters
5. **Domain Validatie**: Controleert of @ en domain bestaan
6. **Disposable Email Check**: Blokkeert tijdelijke email diensten

```php
function validateEmail($email) {
    $email = sanitizeInput($email);
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['valid' => false, 'error' => 'Ongeldig email adres'];
    }
    
    // Additional checks...
    
    return ['valid' => true, 'email' => strtolower($email)];
}
```

#### Geblokkeerde Disposable Email Providers
- tempmail.com
- throwaway.email
- guerrillamail.com
- 10minutemail.com
- mailinator.com

### 3. Database Beveiliging

#### Prepared Statements
Email wordt opgeslagen via prepared statements om SQL injection te voorkomen:

```php
$stmt = $conn->prepare("INSERT INTO users (username, email, password, department, role, points, achievements_unlocked) VALUES (?, ?, ?, ?, 'user', 0, 0)");
$stmt->bind_param("ssss", $username, $email, $hashedPassword, $department);
```

#### UNIQUE Constraint
De `email` kolom heeft een UNIQUE constraint in de database:
```sql
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
```

Dit voorkomt:
- Dubbele registraties met hetzelfde email adres
- Race conditions tijdens registratie
- Email spoofing

### 4. Privacy Bescherming (Account.jsx)

#### Email Masking
Email adressen worden gemaskeerd voor extra privacy:

```javascript
const maskEmail = (email) => {
  if (!email) return 'Niet ingesteld';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const localPart = parts[0];
  const domain = parts[1];
  if (localPart.length <= 2) return email;
  return localPart.substring(0, 2) + '***@' + domain;
};
```

**Voorbeelden**:
- `john.doe@example.com` → `jo***@example.com`
- `admin@company.nl` → `ad***@company.nl`

#### React XSS Bescherming
React's JSX automatisch escaped alle waarden, voorkomend:
- Cross-Site Scripting (XSS)
- HTML injection
- JavaScript injection

## Veiligheidscontroles Checklist

✅ **Input Validatie**
- Client-side regex validatie
- Server-side FILTER_VALIDATE_EMAIL
- Length controles (max 254 karakters)
- Suspicious pattern detection

✅ **SQL Injection Preventie**
- Prepared statements met bind_param
- UNIQUE database constraint
- Sanitization met htmlspecialchars

✅ **XSS Preventie**
- React JSX auto-escaping
- htmlspecialchars met ENT_QUOTES
- Pattern matching tegen `<>"` karakters

✅ **Privacy Bescherming**
- Email masking in UI
- Lowercase normalisatie
- Trim whitespace

✅ **Business Logic**
- Disposable email blocking
- Duplicate email check
- Domain format validation

## Potentiële Uitbreidingen

### Aanbevolen Toekomstige Verbeteringen:

1. **Email Verificatie**
   - Verstuur verificatie email bij registratie
   - Account pas activeren na email confirmatie

2. **MX Record Verificatie**
   - Controleer of email domain een geldig MX record heeft
   - Voorkomt fake domains

3. **Rate Limiting**
   - Beperk aantal registraties per IP
   - Voorkomt spam registraties

4. **DMARC/SPF Check**
   - Verificeer email domain authenticiteit
   - Extra laag tegen spoofing

5. **Password Reset via Email**
   - Implementeer "wachtwoord vergeten" functionaliteit
   - Verstuur reset links via email

## Compliance

### GDPR Overwegingen
- Email wordt opgeslagen met expliciete toestemming (registratie)
- Gebruiker kan eigen data inzien (Account pagina)
- Email wordt gemaskeerd voor privacy
- UNIQUE constraint voorkomt dubbele data

### RFC 5321 Compliance
- Maximum email length: 254 karakters ✅
- Format: local-part@domain ✅
- Case-insensitive behandeling ✅

## Testen

### Handmatige Test Cases

1. **Geldige Emails**
   - test@example.com ✅
   - user.name@domain.nl ✅
   - admin+tag@company.com ✅

2. **Ongeldige Emails**
   - plaintext ❌
   - @domain.com ❌
   - user@domain ❌
   - user name@domain.com ❌
   - user<script>@domain.com ❌

3. **Edge Cases**
   - Email met 254 karakters ✅
   - Email met 255 karakters ❌
   - Email met hoofdletters → lowercase ✅
   - Email met spaties → getrimd ✅

4. **Disposable Emails**
   - test@tempmail.com ❌
   - user@10minutemail.com ❌
   - admin@guerrillamail.com ❌

## Contact
Voor vragen over email beveiliging, raadpleeg de ontwikkelaar of zie `security_helpers.php` voor implementatie details.
