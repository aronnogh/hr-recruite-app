// components/ThemeToggle.js
"use client"; // This is a client component
import React, { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import the desired icons


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
    // You'll use a standard HTML button or a custom React button component
    // and apply styling as needed. Tailwind CSS is a great choice here.
    <button
        onClick={toggleTheme}
        className="
            p-2 rounded-full
            bg-surface-container-low text-on-surface-variant
            hover:bg-surface-container-high
            focus:outline-none focus:ring-2 focus:ring-primary
            transition-colors duration-200
            flex items-center justify-center
        "
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        {isDarkMode ? (
            <FaSun className="w-6 h-6 text-on-surface" /> // Icon for light mode
        ) : (
            <FaMoon className="w-6 h-6 text-on-surface" /> // Icon for dark mode
        )}
    </button>
);
}