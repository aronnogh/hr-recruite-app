// components/ThemeToggle.js
"use client"; // This is a client component
import React, { useEffect, useState } from 'react';

// We no longer need these direct imports here
// import '@material/web/iconbutton/icon-button.js';
// import '@material/web/icon/icon.js';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference or default to system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    // Ensure these custom elements are registered before this component renders.
    // This is handled by the importmap and the import '@material/web/all.js' in layout.js
    <md-icon-button onClick={toggleTheme}>
      <md-icon>{isDarkMode ? 'light_mode' : 'dark_mode'}</md-icon>
    </md-icon-button>
  );
}