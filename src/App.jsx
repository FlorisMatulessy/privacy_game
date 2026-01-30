import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Account from "./Account";
import Admin from "./Admin";
import GameResults from "./GameResults";
import PapersPlease from "./PapersPlease";
import SessionManager from "./SessionManager";

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false); // Track if user logged in as admin

  const handleLogin = (userData, isAdmin) => {
    setUser(userData);
    setIsAdminMode(isAdmin && userData.role?.toLowerCase() === 'admin'); // Only true if checked AND user is admin
    navigate("/home");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdminMode(false);
    navigate("/");
  };

  const handleSessionExpired = () => {
    if (user) {
      alert("Uw sessie is verlopen door inactiviteit. Log opnieuw in.");
      handleLogout();
    }
  };

  const switchToRegister = () => navigate("/register");
  const switchToLogin = () => navigate("/");
  const navigateTo = (view) => navigate(`/${view}`);

  return (
    <Routes>
      <Route path="/" element={<Login onSwitchToRegister={switchToRegister} onLogin={handleLogin} />} />
      <Route path="/register" element={<Register onSwitchToLogin={switchToLogin} />} />
      <Route 
        path="/home" 
        element={
          user ? (
            <SessionManager onSessionExpired={handleSessionExpired}>
              <Home user={user} onNavigateTo={navigateTo} isAdminMode={isAdminMode} onLogout={handleLogout} />
            </SessionManager>
          ) : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/papers-please" 
        element={
          user ? (
            <SessionManager onSessionExpired={handleSessionExpired}>
              <PapersPlease onNavigateTo={navigateTo} />
            </SessionManager>
          ) : <Navigate to="" replace />
        } 
      />
      <Route 
        path="/gameresults" 
        element={
          user ? (
            <SessionManager onSessionExpired={handleSessionExpired}>
              <GameResults user={user} onNavigateTo={navigateTo} />
            </SessionManager>
          ) : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/account" 
        element={
          user ? (
            <SessionManager onSessionExpired={handleSessionExpired}>
              <Account user={user} onLogout={handleLogout} onNavigateTo={navigateTo} />
            </SessionManager>
          ) : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/admin" 
        element={
          user && isAdminMode ? (
            <SessionManager onSessionExpired={handleSessionExpired}>
              <Admin user={user} onLogout={handleLogout} />
            </SessionManager>
          ) : <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
