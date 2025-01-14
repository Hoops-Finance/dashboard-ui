import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext.tsx";

export function ThemeSwitch(props: { isMobile: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const widthHeightIcon: string = props.isMobile ? "w-5 h-6" : "w-5 h-5";
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "light" ? <MoonIcon className={`${widthHeightIcon} text-gray-600`} /> : <SunIcon className={`${widthHeightIcon} text-gray-400`} />}
    </button>
  );
}
