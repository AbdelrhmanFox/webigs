import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, User } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || 
    (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Student Attendance System
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 rounded-full dark:bg-primary-800">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-200" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser?.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;