import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/outline";
import { useTheme } from "../ThemeContext"; // Import the useTheme hook

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="focus:outline-none">
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
};

export default ThemeToggle;
