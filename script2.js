let users = [];

// Data ophalen
fetch("api/leaderboard.php")
  .then(res => res.json())
  .then(data => {
    users = data.map(u => ({
      user_id: u.user_id,
      username: u.username,
      score: parseInt(u.score)
    }));

    if (users.length === 0) {
      document.getElementById("leaderboard-table").classList.add("hidden");
      document.getElementById("no-users").classList.remove("hidden");
      return;
    }

    renderLeaderboard();
    renderPersonalScore();
    renderGroups();
  });

// Tabs wisselen (GEFIXT)
function showTab(tabId, button) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.add("hidden");
    tab.classList.remove("block");
  });

  const activeTab = document.getElementById(tabId);
  activeTab.classList.remove("hidden");
  activeTab.classList.add("block");

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("bg-primary", "text-white");
    btn.classList.add("bg-white", "text-gray-700");
  });

  button.classList.remove("bg-white", "text-gray-700");
  button.classList.add("bg-primary", "text-white");
}

// Medailles
function medal(index) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return "";
}

// Leaderboard
function renderLeaderboard() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const highlight = user.username === "Jij" ? "bg-white font-semibold" : "";
    tbody.innerHTML += `
      <tr class="border-b last:border-none ${highlight}">
        <td class="py-3">${index + 1} ${medal(index)}</td>
        <td>${user.username}</td>
        <td class="text-right">${user.score}</td>
      </tr>
    `;
  });
}

// Personal
function renderPersonalScore() {
  const me = users.find(u => u.username === "Jij") || users[0];
  if (!me) return;
  document.getElementById("my-score").textContent = me.score;
}

// Groups placeholder
function renderGroups() {
  document.getElementById("group-list").innerHTML = `
    <li class="bg-white p-4 rounded-2xl shadow-sm text-gray-600">
      Teams zijn nog niet gekoppeld aan de database.
    </li>
  `;
}