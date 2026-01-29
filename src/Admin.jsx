import { useState, useEffect } from "react";
import QuestionManagement from "./QuestionManagement";
import AppSettings from "./AppSettings";
import DepartmentManagement from "./DepartmentManagement";

export default function Admin({ user, onLogout }) {
  const [stats, setStats] = useState({ users: 0, achievements: 0 });
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    // Fetch stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost/react-app/privacy_game/backend/api/admin_stats.php");
      const data = await response.json();
      if (data.error) {
        console.error('Error:', data.error);
      } else {
        setStats({ users: data.users || 0, achievements: data.achievements || 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (currentView === "questions") {
    return <QuestionManagement onBack={() => setCurrentView("dashboard")} userId={user.id} />;
  }

  if (currentView === "settings") {
    return <AppSettings onBack={() => setCurrentView("dashboard")} userId={user.id} />;
  }

  if (currentView === "departments") {
    return <DepartmentManagement onBack={() => setCurrentView("dashboard")} userId={user.id} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-4xl border border-border">
        <div className="border-l-4 border-green-500 pl-4 mb-6">
          <h2 className="text-3xl font-semibold text-foreground">Admin Dashboard</h2>
          <p className="text-lg text-card-foreground mt-2">Welkom, {user.username}</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="game-card border-t-2 border-green-500">
            <h3 className="text-xl font-medium text-foreground mb-2">👥 Gebruikers</h3>
            <p className="text-3xl font-bold text-green-500">{stats.users}</p>
          </div>
          <div className="game-card border-t-2 border-green-500">
            <h3 className="text-xl font-medium text-foreground mb-2">🏆 Achievements</h3>
            <p className="text-3xl font-bold text-green-500">{stats.achievements}</p>
          </div>
        </div>

        {/* Management Options */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-green-500 uppercase tracking-wide mb-4">⚙️ Beheeropties</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => setCurrentView("questions")}
              className="game-card game-card-hover text-left border-l-4 border-green-500 hover:border-green-600 transition-colors"
            >
              <h3 className="text-xl font-medium text-foreground mb-2">❓ Vragen Beheren</h3>
              <p className="text-muted-foreground">Voeg, bewerk of verwijder vragen</p>
            </button>
            <button
              onClick={() => setCurrentView("settings")}
              className="game-card game-card-hover text-left border-l-4 border-green-500 hover:border-green-600 transition-colors"
            >
              <h3 className="text-xl font-medium text-foreground mb-2">⚡ App Beheren</h3>
              <p className="text-muted-foreground">Algemene applicatie-instellingen</p>
            </button>
            <button
              onClick={() => setCurrentView("departments")}
              className="game-card game-card-hover text-left border-l-4 border-green-500 hover:border-green-600 transition-colors"
            >
              <h3 className="text-xl font-medium text-foreground mb-2">🏢 Afdelingen Beheren</h3>
              <p className="text-muted-foreground">Bekijk afdelingen, gebruikers en punten</p>
            </button>
          </div>
        </div>

        <div className="border-t border-green-500 pt-6">
          <button
            onClick={onLogout}
            className="w-full bg-destructive hover:bg-destructive text-destructive-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-destructive focus:ring-offset-2"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </div>
  );
}