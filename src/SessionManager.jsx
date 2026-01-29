import { useState, useEffect, useCallback } from "react";

export default function SessionManager({ children, onSessionExpired }) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [inactivityTimeout, setInactivityTimeout] = useState(1800000); // 30 min default

  useEffect(() => {
    // Fetch inactivity timeout from settings
    fetch("http://localhost/react-app/privacy_game/backend/api/get_settings.php")
      .then(res => {
        console.log('SessionManager fetch response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then(text => {
        console.log('SessionManager raw response:', text.substring(0, 200));
        const data = JSON.parse(text);
        if (data.settings) {
          const timeoutSetting = data.settings.find(s => s.setting_key === 'inactivity_timeout');
          if (timeoutSetting) {
            setInactivityTimeout(parseInt(timeoutSetting.setting_value) * 1000); // convert to ms
          }
        }
      })
      .catch(err => console.error('SessionManager - Failed to fetch timeout settings:', err));
  }, []);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  useEffect(() => {
    // Check for inactivity
    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= inactivityTimeout) {
        onSessionExpired();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(checkInactivity);
  }, [lastActivity, inactivityTimeout, onSessionExpired]);

  return <>{children}</>;
}
