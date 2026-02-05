import { useState, useEffect } from "react";

export default function GameResults({ user, onNavigateTo }) {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error", "warning"
  
  // Demo game results - kunnen in praktijk van game component komen
  const [gameResults] = useState({
    points: 250,
    achievements: [
      { id: 1, name: "First Win", description: "Je eerste game gewonnen", icon: "🏆" },
      { id: 2, name: "Speed Demon", description: "Game in minder dan 2 minuten afgerond", icon: "⚡" },
      { id: 3, name: "Perfect Score", description: "Alle vragen correct beantwoord", icon: "💯" }
    ],
    gameType: "Quiz Battle",
    duration: "2:45"
  });

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  // Auto-save resultaten wanneer pagina laadt
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const saveResultsOnMount = async () => {
      try {
        // Validate results
        if (!gameResults.points || gameResults.points < 0) {
          throw new Error("Ongeldige punten waarde");
        }

        // Save to database
        const response = await fetch("http://localhost/react-app/privacy_game/backend/api/save_game_results.php", {
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
          if (data.error.includes("duplicate")) {
            showMessage("⚠️ Sommige achievements waren al behaald. Deze zijn niet opnieuw toegevoegd.", "warning");
          } else {
            throw new Error(data.error);
          }
        } else {
          showMessage("✅ Resultaten automatisch opgeslagen!", "success");
          // Update user data locally
          user.points = (user.points || 0) + gameResults.points;
        }
      } catch (error) {
        console.error("Error saving results:", error);
        showMessage(`❌ Fout bij opslaan: ${error.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    saveResultsOnMount();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-border">
        {/* Header */}
        <div className="border-l-4 border-yellow-500 pl-4 mb-8">
          <h2 className="text-3xl font-semibold text-foreground">Game Resultaten</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {gameResults.gameType} - Duur: {gameResults.duration}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">⏳ Resultaten aan het opslaan...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Points Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 text-white">
              <p className="text-sm opacity-90 mb-2">Behaalde Punten</p>
              <p className="text-5xl font-bold">{gameResults.points}</p>
              <p className="text-sm mt-2 opacity-75">toegevoegd aan je totaal</p>
            </div>

            {/* Achievements Section */}
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

            {/* Messages */}
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

            {/* Action Button */}
            <button
              onClick={() => onNavigateTo("home")}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all bg-blue-500 hover:bg-blue-600 text-white"
            >
              🏠 Terug naar Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
