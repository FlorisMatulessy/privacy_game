import { useState } from "react";

export default function Account({ user, onLogout, onNavigateTo }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bericht, setBericht] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setBericht("Nieuwe wachtwoorden komen niet overeen");
      return;
    }

    const response = await fetch("http://localhost/react-app/privacy_game/backend/api/change_password.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        old_password: oldPassword,
        new_password: newPassword
      }),
    });

    const data = await response.json();
    setBericht(data.error || data.success);
    if (data.success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md border border-border">
        <h2 className="text-3xl font-semibold text-center text-foreground mb-6">Account</h2>
        <p className="text-lg text-card-foreground mb-2">Welkom, {user.username}!</p>
        <p className="text-sm text-muted-foreground mb-2">Email: {user.email || 'Niet ingesteld'}</p>
        <p className="text-sm text-muted-foreground mb-2">Rol: {user.role}</p>
        <p className="text-sm text-muted-foreground mb-2">Afdeling: {user.department}</p>
        <p className="text-sm text-muted-foreground mb-2">Punten: {user.points || 0}</p>
        <p className="text-sm text-muted-foreground mb-6">Achievements Ontgrendeld: {user.achievements_unlocked || 0}</p>

        {!showChangePassword && (
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full bg-primary hover:bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 mb-4"
          >
            Wachtwoord Wijzigen
          </button>
        )}

        {showChangePassword && (
          <form onSubmit={changePassword} className="mb-6">
            <h3 className="text-xl font-medium text-foreground mb-4">Wachtwoord Wijzigen</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Huidig Wachtwoord</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground placeholder-muted-foreground"
                placeholder="Voer uw huidige wachtwoord in"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Nieuw Wachtwoord</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground placeholder-muted-foreground"
                placeholder="Voer uw nieuwe wachtwoord in"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Bevestig Nieuw Wachtwoord</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground placeholder-muted-foreground"
                placeholder="Bevestig uw nieuwe wachtwoord"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Opslaan
              </button>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-muted hover:bg-muted text-muted-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-muted focus:ring-offset-2"
              >
                Annuleren
              </button>
            </div>
          </form>
        )}

        {bericht && (
          <p className={`mb-4 text-center text-sm ${bericht.includes('succes') ? 'text-success' : 'text-destructive'}`}>
            {bericht}
          </p>
        )}

        <button
          onClick={() => onNavigateTo("gameresults")}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 mb-4"
        >
          🎮 Debug: Game Resultaten Testen
        </button>

        <button
          onClick={onLogout}
          className="w-full bg-destructive hover:bg-destructive text-destructive-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-destructive focus:ring-offset-2"
        >
          Uitloggen
        </button>
      </div>
    </div>
  );
}