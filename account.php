<?php
session_start();

// Niet ingelogd? → terug naar login
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Uitloggen
if (isset($_POST['logout'])) {
    session_unset();
    session_destroy();
    header('Location: login.php');
    exit();
}

// Simpele data uit de sessie
$username   = $_SESSION['username'] ?? 'Onbekend';
$role       = $_SESSION['role'] ?? 'user';
$department = $_SESSION['department'] ?? 'Onbekend';
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Account</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center bg-gray-100">

    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center">👤 Mijn account</h1>

        <div class="space-y-3 mb-6">
            <p><strong>Gebruikersnaam:</strong> <?= htmlspecialchars($username) ?></p>
            <p><strong>Rol:</strong> <?= htmlspecialchars($role) ?></p>
            <p><strong>Afdeling:</strong> <?= htmlspecialchars($department) ?></p>
        </div>

        <form method="POST">
            <button
                type="submit"
                name="logout"
                class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
                🚪 Uitloggen
            </button>
        </form>
    </div>

</body>
</html>
