"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface ThemeContextProps {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
    setTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
      localStorage.setItem("theme", "light");
    }
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
