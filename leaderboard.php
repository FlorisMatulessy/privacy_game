<?php
require "db.php";

$sql = "
SELECT 
    u.user_id,
    u.username,
    MAX(s.value) AS score
FROM users u
LEFT JOIN score s ON s.user_id = u.user_id
GROUP BY u.user_id, u.username
HAVING score IS NOT NULL
ORDER BY score DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute();
$leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);