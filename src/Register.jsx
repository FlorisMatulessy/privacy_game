import { useState } from "react";

export default function Register({ onSwitchToLogin }) {
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [department, setDepartment] = useState("");
  const [bericht, setBericht] = useState("");

  const verstuur = async (e) => {
    e.preventDefault();

    // Client-side email validation
    const emailRegex = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
    if (!emailRegex.test(email)) {
      setBericht("Voer een geldig email adres in");
      return;
    }

    // Check for suspicious patterns
    if (email.includes('<') || email.includes('>') || email.includes('"')) {
      setBericht("Email bevat ongeldige karakters");
      return;
    }

    // Check email length
    if (email.length > 254) {
      setBericht("Email adres is te lang");
      return;
    }

    const response = await fetch("http://localhost/react-app/privacy_game/backend/api/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: gebruikersnaam, email: email, password: wachtwoord, department: department }),
    });

    const data = await response.json();
    setBericht(data.error || data.success);
    if (data.success) {
      onSwitchToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <form className="bg-card p-8 rounded-2xl shadow-xl w-full max-w-md border border-border" onSubmit={verstuur}>
        <h2 className="text-3xl font-semibold text-center text-foreground mb-6">Registreren</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Gebruikersnaam</label>
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
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground placeholder-muted-foreground"
            placeholder="voorbeeld@bedrijf.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
            required
            maxLength="254"
            title="Voer een geldig email adres in"
          />
          {bericht && !bericht.includes('succes') && (
            <p className="mt-2 text-sm text-red-600 font-medium">
              {bericht}
            </p>
          )}
        </div>

        <div className="mb-6">
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

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Afdeling</label>
          <select
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Selecteer een afdeling</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div className="mb-6 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Wachtwoord eisen:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Minimaal 8 karakters</li>
            <li>• Minimaal 1 hoofdletter</li>
            <li>• Minimaal 1 kleine letter</li>
            <li>• Minimaal 1 cijfer</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Registreren
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary underline"
          >
            Al een account? Log in hier
          </button>
        </div>

        {bericht && bericht.includes('succes') && (
          <p className="mt-4 text-center text-sm text-green-600 font-medium">
            {bericht}
          </p>
        )}
      </form>
    </div>
  );
}
