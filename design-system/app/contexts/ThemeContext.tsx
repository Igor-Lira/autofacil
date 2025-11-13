import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'nativewind';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    // Set initial theme
    setColorScheme('light');
    setIsDark(false);
  }, []);

  // Sync isDark state with colorScheme changes
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  // Create a stable toggleTheme function with useCallback
  const toggleTheme = useCallback(() => {
    const nextTheme = isDark ? 'light' : 'dark';
    
    // Use requestAnimationFrame to defer state updates
    requestAnimationFrame(() => {
      setColorScheme(nextTheme);
    });
  }, [isDark, setColorScheme]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
