import { useState, useEffect } from "react";

export default function AppSettings({ onBack, userId }) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      console.log("Fetching settings from: http://localhost/react-app/privacy_game/backend/api/get_settings.php");
      const response = await fetch("http://localhost/react-app/privacy_game/backend/api/get_settings.php");
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched settings data:", data);
      console.log("Number of settings:", data.settings?.length);
      
      if (data.error) {
        setMessage(data.error);
        setSettings([]);
      } else if (data.settings && Array.isArray(data.settings)) {
        console.log("Setting settings array with", data.settings.length, "items");
        setSettings(data.settings);
        
        const initialData = {};
        data.settings.forEach(setting => {
          initialData[setting.setting_key] = setting.setting_value;
        });
        console.log("Form data initialized:", Object.keys(initialData).length, "keys");
        setFormData(initialData);
        
        if (data.settings.length === 0) {
          setMessage("Geen instellingen gevonden in database");
        }
      } else {
        console.error("Invalid data structure:", data);
        setMessage("Ongeldige data structuur ontvangen");
        setSettings([]);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      setMessage(`Fout bij ophalen van instellingen: ${error.message}`);
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
      key,
      value
    }));

    try {
      const response = await fetch("http://localhost/react-app/privacy_game/backend/api/update_settings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          settings: settingsToUpdate,
          user_id: userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.success);
        setHasChanges(false);
        fetchSettings();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Fout bij opslaan van instellingen");
    }
  };

  const categorizeSettings = () => {
    const categories = {
      "Tijd & Regio": ["timezone", "date_format"],
      "Sessies & Time-outs": ["session_duration", "inactivity_timeout", "auto_logout"],
      "Beveiliging": ["password_validity", "force_password_change", "token_validity", "api_key_validity", "lockout_duration"],
      "Notificaties & Processen": ["notification_delay", "email_send_time"],
      "Data & Opslag": ["backup_frequency", "log_retention", "data_retention", "auto_cleanup"]
    };

    const categorized = {};
    Object.entries(categories).forEach(([category, keys]) => {
      categorized[category] = settings.filter(s => keys.includes(s.setting_key));
    });

    return categorized;
  };

  const renderInput = (setting) => {
    const value = formData[setting.setting_key] || "";

    if (setting.setting_key === "date_format") {
      return (
        <select
          value={value}
          onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
        >
          <option value="24h">24 uur</option>
          <option value="12h">12 uur (AM/PM)</option>
        </select>
      );
    }

    if (setting.setting_type === "time") {
      return (
        <input
          type="time"
          value={value}
          onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
        />
      );
    }

    if (setting.setting_type === "number") {
      return (
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors bg-card text-card-foreground"
      />
    );
  };

  const getUnit = (key) => {
    if (key.includes("duration") || key.includes("timeout") || key.includes("validity")) {
      if (key === "session_duration" || key === "inactivity_timeout" || key === "token_validity") {
        return "seconden";
      }
      if (key === "auto_logout" || key === "notification_delay" || key === "lockout_duration") {
        return "minuten";
      }
      if (key === "backup_frequency") {
        return "uren";
      }
      return "dagen";
    }
    if (key.includes("retention") || key.includes("cleanup")) {
      return "dagen";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <p className="text-foreground">Laden...</p>
      </div>
    );
  }

  if (settings.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border max-w-md">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Geen Instellingen</h2>
          <p className="text-muted-foreground mb-4">Er zijn geen instellingen gevonden in de database.</p>
          {message && (
            <p className="text-destructive mb-4">{message}</p>
          )}
          <button
            onClick={onBack}
            className="w-full bg-primary hover:bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Terug
          </button>
        </div>
      </div>
    );
  }

  const categorizedSettings = categorizeSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="border-l-4 border-green-500 pl-4 flex-1">
              <h2 className="text-3xl font-semibold text-foreground">App Beheer Instellingen</h2>
            </div>
            <button
              onClick={onBack}
              className="bg-muted hover:bg-muted text-muted-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Terug
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.includes('succesvol') ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {Object.entries(categorizedSettings).map(([category, categorySettings]) => (
              <div key={category} className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b-2 border-green-500">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categorySettings.map((setting) => (
                    <div key={setting.setting_key} className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        {setting.description}
                        {getUnit(setting.setting_key) && (
                          <span className="text-muted-foreground ml-1">({getUnit(setting.setting_key)})</span>
                        )}
                      </label>
                      {renderInput(setting)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-6 border-t-2 border-green-500">
              <button
                type="submit"
                disabled={!hasChanges}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Wijzigingen Opslaan
              </button>
              {hasChanges && (
                <button
                  type="button"
                  onClick={() => {
                    fetchSettings();
                    setHasChanges(false);
                  }}
                  className="flex-1 bg-muted hover:bg-muted text-muted-foreground font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-card p-6 rounded-2xl shadow-xl border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-3">ℹ️ Validatie & Foutafhandeling</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Alle tijdswaarden moeten positieve getallen zijn</li>
            <li>• Tijdnotatie moet in HH:MM formaat zijn</li>
            <li>• Time-outs en duurtijden mogen niet groter zijn dan 24 uur</li>
            <li>• Conflicterende instellingen worden gedetecteerd</li>
            <li>• Wijzigingen worden gevalideerd voor opslaan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
