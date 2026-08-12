import { useState, useEffect } from "react";
import { isLoggedIn, getUser, logout } from "./api/authApi";
import Login from "./components/Login";
import Register from "./components/Register";
import Layout from "./components/Layout";
import "./App.css";

// This is the root component — the starting point of your entire UI.
// It makes ONE decision: is the user logged in?
//   Yes → show the main app (Layout)
//   No  → show Login or Register form

function App() {
  // ---- State ----
  // useState creates a variable that, when changed, causes the component
  // to re-render (redraw on screen). Normal variables don't do this.

  // Is the user currently logged in?
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn());

  // Are we showing the login form or the register form?
  const [showRegister, setShowRegister] = useState<boolean>(false);

  // The logged-in user's name (for "Welcome, Pakhi" display)
  const [userName, setUserName] = useState<string>("");

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ---- Effects ----
  // useEffect runs code AFTER the component renders.
  // The [] at the end means "run this only once, when the component first appears."

  // Load user name from localStorage on startup
  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.name);
    }
  }, []);

  // Apply dark mode class to the HTML body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]); // [darkMode] means "re-run whenever darkMode changes"

  // ---- Handlers ----
  // These functions get passed down to child components.
  // When Login calls onLoginSuccess, it triggers here in App.

  function handleLoginSuccess(name: string) {
    setLoggedIn(true);
    setUserName(name);
  }

  function handleLogout() {
    logout();             // Clear token from localStorage
    setLoggedIn(false);   // Re-render → shows login form
    setUserName("");
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  // ---- Render ----
  // This is what actually appears on screen.
  // In React, you write HTML-like syntax called JSX inside JavaScript.

  // If not logged in, show auth forms
  if (!loggedIn) {
    return (
      <div className={`app ${darkMode ? "dark" : ""}`}>
        {showRegister ? (
          // Show register form
          // onSuccess: called after successful registration
          // onSwitchToLogin: called when user clicks "Already have an account?"
          <Register
            onSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          // Show login form
          <Login
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    );
  }

  // If logged in, show the main app
  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <Layout
        userName={userName}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;