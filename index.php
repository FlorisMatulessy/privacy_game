<?php
require "leaderboard.php";

// tijdelijke test-user (later via login/session)
$currentUser = "TestUser";
$myScore = null;

foreach ($leaderboard as $row) {
    if ($row["username"] === $currentUser) {
        $myScore = $row["score"];
        break;
    }
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Leaderboard</title>

  <!-- Tailwind -->
  <script src="https://cdn.tailwindcss.com"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: "#1B4D2E",
            soft: "#E8F3E8"
          }
        }
      }
    }
  </script>

  <link rel="stylesheet" href="assets/style.css">
</head>

<body class="bg-soft min-h-screen">

<header class="bg-primary text-white p-6 rounded-b-3xl shadow">
  <h1 class="text-2xl font-bold">🏆 Leaderboard</h1>
  <p class="opacity-90 text-sm">Overzicht van scores</p>
</header>

<div class="max-w-4xl mx-auto mt-8 px-4">

  <!-- Tabs -->
  <div class="flex gap-3 mb-6">
    <button onclick="showTab('leaderboard', this)" class="tab-btn bg-primary text-white px-5 py-2 rounded-full">
      Leaderboard
    </button>
    <button onclick="showTab('personal', this)" class="tab-btn bg-white px-5 py-2 rounded-full">
      Eigen score
    </button>
  </div>

  <!-- Leaderboard -->
  <section id="leaderboard" class="tab bg-white p-6 rounded-3xl shadow">
    <h2 class="text-xl font-semibold mb-4">Ranking</h2>

    <?php if (count($leaderboard) === 0): ?>
      <p class="text-gray-500">
        Geen gebruikers hebben op dit moment een score.
      </p>
    <?php else: ?>
      <table class="w-full">
        <thead>
          <tr class="text-gray-500 border-b">
            <th class="text-left py-2">#</th>
            <th class="text-left">Naam</th>
            <th class="text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($leaderboard as $index => $user): ?>
            <tr class="border-b last:border-none <?= $user["username"] === $currentUser ? "bg-soft font-semibold" : "" ?>">
              <td class="py-3"><?= $index + 1 ?></td>
              <td><?= htmlspecialchars($user["username"]) ?></td>
              <td class="text-right"><?= $user["score"] ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </section>

  <!-- Personal -->
  <section id="personal" class="tab hidden bg-white p-6 rounded-3xl shadow">
    <h2 class="text-xl font-semibold mb-4">Jouw score</h2>

    <?php if ($myScore === null): ?>
      <p class="text-gray-500">
        Je hebt nog geen score behaald.
      </p>
    <?php else: ?>
      <div class="bg-soft p-5 rounded-2xl">
        <p class="text-lg font-medium"><?= $currentUser ?></p>
        <p class="mt-2">
          Beste score:
          <span class="text-primary font-bold text-2xl"><?= $myScore ?></span>
        </p>
      </div>
    <?php endif; ?>
  </section>

</div>

<script>
function showTab(id, btn) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.remove("bg-primary", "text-white");
    b.classList.add("bg-white");
  });

  btn.classList.add("bg-primary", "text-white");
}
</script>

</body>
</html>