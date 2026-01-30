<?php
session_start();

// Database configuratie
$host = 'localhost';
$dbname = 'privacy_game';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Database connectie mislukt: " . $e->getMessage());
}

// Redirect als al ingelogd
if (isset($_SESSION['user_id'])) {
    header('Location: textrpg.php');
    exit();
}

$error = '';
$success = '';

// Login handler
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Vul alle velden in.';
    } else {
        // Check login attempts
        $stmt = $pdo->prepare("SELECT * FROM login_attempts WHERE identifier = ?");
        $stmt->execute([$username]);
        $attempt = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($attempt && $attempt['lockout_until'] && strtotime($attempt['lockout_until']) > time()) {
            $error = 'Account tijdelijk vergrendeld. Probeer het later opnieuw.';
        } else {
            // Haal gebruiker op
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password'])) {
                // Succesvolle login
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                
                // Update last login
                $stmt = $pdo->prepare("UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?");
                $stmt->execute([$_SERVER['REMOTE_ADDR'], $user['id']]);
                
                // Log audit
                $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, event_type, event_description, ip_address) VALUES (?, 'login_success', 'Successful login', ?)");
                $stmt->execute([$user['id'], $_SERVER['REMOTE_ADDR']]);
                
                // Reset login attempts
                $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE identifier = ?");
                $stmt->execute([$username]);
                
                header('Location: textrpg.php');
                exit();
            } else {
                // Foute login
                $error = 'Onjuiste gebruikersnaam of wachtwoord.';
                
                // Track failed attempts
                if ($attempt) {
                    $failed_attempts = $attempt['failed_attempts'] + 1;
                    $lockout_until = null;
                    
                    if ($failed_attempts >= 5) {
                        $lockout_until = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                    }
                    
                    $stmt = $pdo->prepare("UPDATE login_attempts SET failed_attempts = ?, attempt_time = NOW(), lockout_until = ? WHERE identifier = ?");
                    $stmt->execute([$failed_attempts, $lockout_until, $username]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO login_attempts (identifier, failed_attempts, attempt_time) VALUES (?, 1, NOW())");
                    $stmt->execute([$username]);
                }
            }
        }
    }
}

// Registratie handler
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register'])) {
    $username = trim($_POST['reg_username'] ?? '');
    $password = $_POST['reg_password'] ?? '';
    $confirm_password = $_POST['reg_confirm_password'] ?? '';
    $department = $_POST['department'] ?? '';
    
    if (empty($username) || empty($password) || empty($confirm_password) || empty($department)) {
        $error = 'Vul alle velden in.';
    } elseif ($password !== $confirm_password) {
        $error = 'Wachtwoorden komen niet overeen.';
    } elseif (strlen($password) < 6) {
        $error = 'Wachtwoord moet minimaal 6 karakters bevatten.';
    } else {
        // Check of username al bestaat
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        
        if ($stmt->fetch()) {
            $error = 'Gebruikersnaam is al in gebruik.';
        } else {
            // Maak nieuwe gebruiker
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt = $pdo->prepare("INSERT INTO users (username, password, department, password_changed_at) VALUES (?, ?, ?, NOW())");
            $stmt->execute([$username, $hashed_password, $department]);
            $new_user_id = $pdo->lastInsertId();
            
            // Log audit
            $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, event_type, event_description, ip_address) VALUES (?, 'registration_success', 'New user registered: $username', ?)");
            $stmt->execute([$new_user_id, $_SERVER['REMOTE_ADDR']]);
            
            // Sla wachtwoord op in history
            $stmt = $pdo->prepare("INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)");
            $stmt->execute([$new_user_id, $hashed_password]);
            
            $success = 'Account succesvol aangemaakt! Je kunt nu inloggen.';
        }
    }
}

// Haal departments op voor dropdown
$departments = $pdo->query("SELECT name, display_name FROM departments ORDER BY display_name")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Privacy Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .form-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .tab-button {
            transition: all 0.3s;
        }
        .tab-button.active {
            background: white;
            color: #667eea;
        }
        .input-field {
            transition: border-color 0.3s;
        }
        .input-field:focus {
            border-color: #667eea;
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
    </style>
</head>
<body>
    <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto">
            <!-- Logo/Header -->
            <div class="text-center mb-8">
                <h1 class="text-5xl font-bold text-white mb-2">🔒</h1>
                <h2 class="text-3xl font-bold text-white">Privacy Game</h2>
                <p class="text-white text-opacity-90 mt-2">Leer over databeveiliging</p>
            </div>

            <!-- Form Container -->
            <div class="form-container">
                <!-- Tabs -->
                <div class="flex bg-gray-100">
                    <button onclick="showTab('login')" id="login-tab" class="tab-button active flex-1 py-4 font-semibold text-gray-600">
                        Inloggen
                    </button>
                    <button onclick="showTab('register')" id="register-tab" class="tab-button flex-1 py-4 font-semibold text-gray-600">
                        Registreren
                    </button>
                </div>

                <!-- Messages -->
                <?php if ($error): ?>
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded">
                        <p class="font-bold">❌ Fout</p>
                        <p><?php echo htmlspecialchars($error); ?></p>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4 rounded">
                        <p class="font-bold">✅ Succes</p>
                        <p><?php echo htmlspecialchars($success); ?></p>
                    </div>
                <?php endif; ?>

                <!-- Login Form -->
                <div id="login-form" class="p-8">
                    <form method="POST" action="">
                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2" for="username">
                                👤 Gebruikersnaam
                            </label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username" 
                                class="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                placeholder="Voer je gebruikersnaam in"
                                required
                            >
                        </div>

                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2" for="password">
                                🔑 Wachtwoord
                            </label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                class="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                placeholder="Voer je wachtwoord in"
                                required
                            >
                        </div>

                        <button 
                            type="submit" 
                            name="login"
                            class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
                        >
                            🚀 Inloggen
                        </button>
                    </form>
                </div>

                <!-- Register Form -->
                <div id="register-form" class="p-8 hidden">
                    <form method="POST" action="">
                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2" for="reg_username">
                                👤 Gebruikersnaam
                            </label>
                            <input 
                                type="text" 
                                id="reg_username" 
                                name="reg_username" 
                                class="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                placeholder="Kies een gebruikersnaam"
                                required
                            >
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2" for="department">
                                🏢 Afdeling
                            </label>
                            <select 
                                id="department" 
                                name="department" 
                                class="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Kies een afdeling</option>
                                <?php foreach ($departments as $dept): ?>
                                    <option value="<?php echo htmlspecialchars($dept['name']); ?>">
                                        <?php echo htmlspecialchars($dept['display_name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-gray-700 font-semibold mb-2" for="reg_password">
                                🔑 Wachtwoord
                            </label>
                            <input 
                                type="password" 
                                id="reg_password" 
                                name="reg_password" 
                                class="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                placeholder="Kies een wachtwoord (min. 6 karakters)"
                                required
                            >
                        </div>

                        <div class="mb-6">
                            <label class="block text-gray-700 font-semibold mb-2" for="reg_confirm_password">
                                🔑 Bevestig Wachtwoord
                            </label>
                            <input 
                                type="password" 
                                id="reg_confirm_password" 
                                name="reg_confirm_password" 
                                class="input-field w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                                placeholder="Herhaal je wachtwoord"
                                required
                            >
                        </div>

                        <button 
                            type="submit" 
                            name="register"
                            class="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all shadow-lg"
                        >
                            ✨ Account Aanmaken
                        </button>
                    </form>
                </div>
            </div>

            <!-- Footer -->
            <div class="text-center mt-6 text-white text-opacity-90 text-sm">
                <p>© 2026 Privacy Game - Gemeente</p>
            </div>
        </div>
    </div>

    <script>
        function showTab(tab) {
            const loginTab = document.getElementById('login-tab');
            const registerTab = document.getElementById('register-tab');
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');

            if (tab === 'login') {
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginTab.classList.remove('active');
                registerTab.classList.add('active');
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }
        }

        // Show register tab if success message (after registration)
        <?php if ($success): ?>
            showTab('login');
        <?php endif; ?>
    </script>
</body>
</html>