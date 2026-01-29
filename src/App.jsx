import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Account from "./Account";
import Admin from "./Admin";
import GameResults from "./GameResults";
import SessionManager from "./SessionManager";

export default function App() {
  const [currentView, setCurrentView] = useState("login"); // "login", "register", "home", "account", "admin", "gameresults"
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false); // Track if user logged in as admin

  const handleLogin = (userData, isAdmin) => {
    setUser(userData);
    setIsAdminMode(isAdmin && userData.role?.toLowerCase() === 'admin'); // Only true if checked AND user is admin
    setCurrentView("home");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdminMode(false);
    setCurrentView("login");
  };

  const handleSessionExpired = () => {
    if (user) {
      alert("Uw sessie is verlopen door inactiviteit. Log opnieuw in.");
      handleLogout();
    }
  };

  const switchToRegister = () => setCurrentView("register");
  const switchToLogin = () => setCurrentView("login");
  const navigateTo = (view) => setCurrentView(view);

  // Wrap authenticated views with SessionManager
  const wrappedContent = () => {
    if (currentView === "register") {
      return <Register onSwitchToLogin={switchToLogin} />;
    }

    if (currentView === "home" && user) {
      return (
        <SessionManager onSessionExpired={handleSessionExpired}>
          <Home user={user} onNavigateTo={navigateTo} isAdminMode={isAdminMode} />
        </SessionManager>
      );
    }

    if (currentView === "gameresults" && user) {
      return (
        <SessionManager onSessionExpired={handleSessionExpired}>
          <GameResults user={user} onLogout={handleLogout} onNavigateTo={navigateTo} />
        </SessionManager>
      );
    }

    if (currentView === "account" && user) {
      return (
        <SessionManager onSessionExpired={handleSessionExpired}>
          <Account user={user} onLogout={handleLogout} onNavigateTo={navigateTo} />
        </SessionManager>
      );
    }

    if (currentView === "admin" && user && isAdminMode) {
      return (
        <SessionManager onSessionExpired={handleSessionExpired}>
          <Admin user={user} onLogout={handleLogout} />
        </SessionManager>
      );
    }

    return <Login onSwitchToRegister={switchToRegister} onLogin={handleLogin} />;
  };

  return wrappedContent();
}
