import { useState } from "react";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [bericht, setBericht] = useState("");

  const inloggen = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost/react-app/privacy_game/backend/api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: gebruikersnaam, password: wachtwoord, isAdmin: isAdmin }),
    });

    const data = await response.json();
    if (data.success) {
      onLogin(data.user, isAdmin);
    } else {
      setBericht(data.error);
    }
  };

  const skipLogin = () => {
    // Mock user data for testing
    const mockUser = {
      id: 999,
      username: "testuser",
      email: "test@example.com",
      role: "user"
    };
    onLogin(mockUser, false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <form className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md border border-border" onSubmit={inloggen}>
        <h2 className="text-3xl font-semibold text-center text-foreground mb-6">Inloggen</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Gebruikersnaam</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground placeholder-muted-foreground"
            placeholder="Voer uw gebruikersnaam in"
            value={gebruikersnaam}
            onChange={(e) => setGebruikersnaam(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Wachtwoord</label>
          <input
            type="password"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground placeholder-muted-foreground"
            placeholder="Voer uw wachtwoord in"
            value={wachtwoord}
            onChange={(e) => setWachtwoord(e.target.value)}
            required
          />
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="admin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="admin" className="text-sm text-foreground">Inloggen als admin</label>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 mb-4"
        >
          Inloggen
        </button>

        <button
          type="button"
          onClick={skipLogin}
          className="w-full bg-warning hover:bg-warning/90 text-warning-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-warning focus:ring-offset-2 mb-4"
        >
          🚀 Skip Login (Testing)
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary underline"
          >
            Nog geen account? Registreer hier
          </button>
        </div>

        {bericht && (
          <p className={`mt-4 text-center text-sm ${bericht.includes('succes') ? 'text-success' : 'text-destructive'}`}>
            {bericht}
          </p>
        )}
      </form>
    </div>
  );
}