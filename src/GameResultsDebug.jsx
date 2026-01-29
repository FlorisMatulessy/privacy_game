import { useState } from "react";

export default function GameResultsDebug() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  const gameResults = {
    points: 250,
    achievements: [
      { id: 1, name: "First Win", description: "Je eerste game gewonnen", icon: "🏆" },
      { id: 2, name: "Speed Demon", description: "Game in minder dan 2 minuten afgerond", icon: "⚡" },
      { id: 3, name: "Perfect Score", description: "Alle vragen correct beantwoord", icon: "💯" }
    ],
    gameType: "Quiz Battle",
    duration: "2:45"
  };

  const user = {
    username: "testuser",
    points: 100
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleSaveResults = async () => {
    setLoading(true);
    showMessage("Bezig met opslaan...", "info");

    try {
      const response = await fetch("http://localhost/react-app/backend/api/save_game_results.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          points: gameResults.points,
          achievements: gameResults.achievements.map(a => a.id),
          game_type: gameResults.gameType
        })
      });

      const data = await response.json();

      if (data.error) {
        showMessage(`⚠️ ${data.error}`, "warning");
      } else {
        showMessage("✅ Resultaten succesvol opgeslagen!", "success");
      }
    } catch (error) {
      showMessage(`❌ Fout: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-border">
        <div className="border-l-4 border-yellow-500 pl-4 mb-8">
          <h2 className="text-3xl font-semibold text-foreground">Game Resultaten (Debug)</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {gameResults.gameType} - Duur: {gameResults.duration}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 text-white">
          <p className="text-sm opacity-90 mb-2">Behaalde Punten</p>
          <p className="text-5xl font-bold">{gameResults.points}</p>
          <p className="text-sm mt-2 opacity-75">worden toegevoegd aan je totaal</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            🏅 Achievements ({gameResults.achievements.length})
          </h3>
          <div className="space-y-3">
            {gameResults.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-secondary p-4 rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              messageType === "success"
                ? "bg-green-500/10 text-green-700 border border-green-500"
                : messageType === "error"
                ? "bg-red-500/10 text-red-700 border border-red-500"
                : messageType === "warning"
                ? "bg-yellow-500/10 text-yellow-700 border border-yellow-500"
                : "bg-blue-500/10 text-blue-700 border border-blue-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg mb-8 text-xs text-muted-foreground">
          <p className="font-mono">DEBUG: Gebruiker: {user.username} | Punten: {user.points}</p>
        </div>

        <button
          onClick={handleSaveResults}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {loading ? "⏳ Bezig met opslaan..." : "💾 Resultaten Opslaan"}
        </button>
      </div>
    </div>
  );
}
