<?php
require "db.php";

// Verander dit naar de echte login gebruiker
$currentUserId = 1;

// Alle gebruikers met score en achievements
$sql = "
SELECT 
    u.id AS user_id,
    u.username,
    u.points AS score,
    u.achievements_unlocked
FROM users u
ORDER BY score DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute();
$leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Huidige gebruiker ophalen
$currentUserScore = null;
$currentUserAchievements = null;
$currentUsername = null;

foreach ($leaderboard as $row) {
    if ($row['user_id'] == $currentUserId) {
        $currentUserScore = $row['score'];
        $currentUserAchievements = $row['achievements_unlocked'];
        $currentUsername = $row['username'];
        break;
    }
}