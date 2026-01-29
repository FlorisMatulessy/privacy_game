// Frontend Security Check
const fs = require('fs');
const path = require('path');

console.log('=== FRONTEND SECURITY CHECK ===\n');

const srcDir = './src';
const jsxFiles = [
    'Login.jsx', 'Register.jsx', 'Account.jsx', 'Admin.jsx',
    'QuestionManagement.jsx', 'DepartmentManagement.jsx', 
    'SessionManager.jsx', 'GameResults.jsx', 'App.jsx'
];

let passed = 0;
let failed = 0;
let warnings = 0;

// TEST 1: XSS Prevention - geen dangerouslySetInnerHTML
console.log('TEST 1: XSS PREVENTIE');
console.log('-'.repeat(50));
let hasDangerousHTML = false;
jsxFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠ ${file}: Niet gevonden`);
        warnings++;
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('dangerouslySetInnerHTML')) {
        console.log(`✗ ${file}: Gebruikt dangerouslySetInnerHTML!`);
        hasDangerousHTML = true;
    } else {
        console.log(`✓ ${file}: Geen dangerouslySetInnerHTML`);
    }
});
if (!hasDangerousHTML) {
    console.log('RESULTAAT: ✓ GESLAAGD - Geen XSS risico\n');
    passed++;
} else {
    console.log('RESULTAAT: ✗ GEFAALD - XSS risico aanwezig!\n');
    failed++;
}

// TEST 2: Input Validation
console.log('TEST 2: CLIENT-SIDE INPUT VALIDATIE');
console.log('-'.repeat(50));
const validationFiles = ['Register.jsx', 'Login.jsx'];
let allHaveValidation = true;
validationFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasRequired = content.includes('required');
    const hasTypeValidation = content.includes('type="email"') || content.includes('type="password"');
    const hasPattern = content.includes('pattern=') || content.includes('regex');
    const hasMinLength = content.includes('minLength') || content.includes('maxLength');
    
    if (hasRequired && (hasTypeValidation || hasPattern || hasMinLength)) {
        console.log(`✓ ${file}: Input validatie aanwezig`);
    } else {
        console.log(`✗ ${file}: Geen adequate input validatie!`);
        allHaveValidation = false;
    }
});
if (allHaveValidation) {
    console.log('RESULTAAT: ✓ GESLAAGD - Client-side validatie actief\n');
    passed++;
} else {
    console.log('RESULTAAT: ✗ GEFAALD - Input validatie ontbreekt!\n');
    failed++;
}

// TEST 3: Geen hardcoded credentials
console.log('TEST 3: HARDCODED CREDENTIALS');
console.log('-'.repeat(50));
let hasCredentials = false;
jsxFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check voor common credential patterns (case insensitive)
    const patterns = [
        /password\s*[:=]\s*["'][^"']{6,}["']/i,
        /apikey\s*[:=]\s*["'][^"']+["']/i,
        /secret\s*[:=]\s*["'][^"']+["']/i
    ];
    
    patterns.forEach(pattern => {
        if (pattern.test(content)) {
            // Exclude variable declarations and props
            if (!content.match(/const.*password/i) && !content.match(/useState.*password/i)) {
                hasCredentials = true;
            }
        }
    });
});
if (!hasCredentials) {
    console.log('✓ Geen hardcoded credentials gevonden');
    console.log('RESULTAAT: ✓ GESLAAGD - Geen credentials in code\n');
    passed++;
} else {
    console.log('✗ Mogelijke hardcoded credentials gevonden!');
    console.log('RESULTAAT: ✗ GEFAALD - Credentials in code!\n');
    failed++;
}

// TEST 4: HTTPS in productie (check voor localhost)
console.log('TEST 4: API ENDPOINT CONFIGURATIE');
console.log('-'.repeat(50));
let hasLocalhost = false;
jsxFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('http://localhost')) {
        hasLocalhost = true;
    }
});
if (hasLocalhost) {
    console.log('⚠ Localhost URLs gevonden (OK voor development)');
    console.log('RESULTAAT: ⚠ WARNING - Verander naar HTTPS voor productie\n');
    warnings++;
} else {
    console.log('✓ Geen localhost URLs');
    console.log('RESULTAAT: ✓ GESLAAGD\n');
    passed++;
}

// TEST 5: Sensitive data in console.log
console.log('TEST 5: CONSOLE.LOG SECURITY');
console.log('-'.repeat(50));
let hasSensitiveLog = false;
jsxFiles.forEach(file => {
    const filePath = path.join(srcDir, file);
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        if (line.includes('console.log') && 
            (line.toLowerCase().includes('password') || 
             line.toLowerCase().includes('token'))) {
            console.log(`⚠ ${file}:${index+1} - Mogelijk gevoelige data in console.log`);
            hasSensitiveLog = true;
        }
    });
});
if (!hasSensitiveLog) {
    console.log('✓ Geen gevoelige data in console.log gevonden');
    console.log('RESULTAAT: ✓ GESLAAGD\n');
    passed++;
} else {
    console.log('RESULTAAT: ⚠ WARNING - Check console.log statements\n');
    warnings++;
}

// FINALE SCORE
console.log('='.repeat(50));
console.log('FRONTEND SECURITY SCORE');
console.log('='.repeat(50));
console.log(`Tests geslaagd:  ${passed}`);
console.log(`Tests gefaald:   ${failed}`);
console.log(`Waarschuwingen:  ${warnings}`);
console.log('');

const total = passed + failed;
const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
console.log(`Score: ${percentage}%\n`);

if (failed === 0) {
    console.log('✓✓✓ FRONTEND SECURITY OK ✓✓✓');
} else {
    console.log('✗✗✗ FRONTEND HEEFT SECURITY ISSUES ✗✗✗');
}
