"use client";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export function ThemeSwitch(props: { isMobile: boolean }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const widthHeightIcon = props.isMobile ? "w-5 h-6" : "w-5 h-5";

  // On mount, read the HTML class
  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Immediately reflect in the DOM for no flicker
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "light" ? (
        <MoonIcon className={`${widthHeightIcon} text-gray-600`} />
      ) : (
        <SunIcon className={`${widthHeightIcon} text-gray-400`} />
      )}
    </button>
  );
}
