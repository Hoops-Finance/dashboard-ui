"use client";

import * as React from "react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  toggleTheme: () => void;
}

const initialState: ThemeProviderState = {
  theme: "dark",
  toggleTheme: () => null
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = "dark", storageKey = "ui-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only enable theme logic after hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    const initialTheme = storedTheme ?? defaultTheme;

    setTheme(initialTheme);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);
    localStorage.setItem(storageKey, initialTheme);
  }, [isClient, defaultTheme, storageKey]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light";
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      localStorage.setItem(storageKey, newTheme);
      return newTheme;
    });
  }, [storageKey]);

  const value = {
    theme,
    toggleTheme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
