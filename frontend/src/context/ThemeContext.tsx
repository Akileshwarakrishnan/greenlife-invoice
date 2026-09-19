import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'organic-light' | 'organic-dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('greenlife_theme');
    return (saved === 'organic-dark' || saved === 'dark') ? 'organic-dark' : 'organic-light';
  });

  useEffect(() => {
    localStorage.setItem('greenlife_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-organic-light', 'theme-organic-dark', 'dark');

    if (theme === 'organic-dark') {
      root.classList.add('dark', 'theme-organic-dark');
    } else {
      root.classList.add('theme-organic-light');
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'organic-light' ? 'organic-dark' : 'organic-light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'organic-dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'organic-light' as ThemeMode,
      setTheme: (_: ThemeMode) => {},
      toggleTheme: () => {},
      isDark: false,
    };
  }
  return context;
};
