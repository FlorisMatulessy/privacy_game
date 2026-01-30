// Database functions
const API_URL = 'http://localhost:3000/api';

async function fetchUserData(id) {
  try {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) throw new Error('User not found');
    const data = await response.json();
    console.log('User data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}

async function fetchAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    const data = await response.json();
    console.log('All users:', data);
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

async function createUser(username, email) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    const data = await response.json();
    console.log('User created:', data);
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Dark mode functionality
function initializeDarkMode() {
  // Check if user has a saved preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Determine if dark mode should be enabled
  let isDarkMode = savedTheme === 'dark' || (savedTheme === null && prefersDark);
  
  // Apply the theme
  applyTheme(isDarkMode);
}

function applyTheme(isDark) {
  const body = document.body;
  const themeSelect = document.getElementById('theme-select');
  
  if (isDark) {
    body.classList.add('dark');
    if (themeSelect) {
      themeSelect.value = 'dark';
    }
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark');
    if (themeSelect) {
      themeSelect.value = 'light';
    }
    localStorage.setItem('theme', 'light');
  }
}

function toggleDarkMode() {
  const body = document.body;
  const isDarkMode = body.classList.contains('dark');
  applyTheme(!isDarkMode);
}

// Load welcome message with username
async function loadWelcomeMessage() {
  const welcomeElement = document.getElementById('welcome-message');
  if (!welcomeElement) return;
  
  // Get stored user ID from localStorage (or use default user ID 1)
  const userId = localStorage.getItem('id') || 1;
  
  try {
    const user = await fetchUserData(userId);
    if (user && user.username) {
      welcomeElement.textContent = `Welkom ${user.username}`;
    }
  } catch (error) {
    console.error('Failed to load welcome message:', error);
  }
}

// Add event listener to theme selector
document.addEventListener('DOMContentLoaded', function() {
  initializeDarkMode();
  loadWelcomeMessage();
  
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      if (this.value === 'dark') {
        applyTheme(true);
      } else if (this.value === 'light') {
        applyTheme(false);
      }
    });
  }
  
  const saveButton = document.querySelector('.save-settings');
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      window.location.href = 'homepage.html';
    });
  }
});
