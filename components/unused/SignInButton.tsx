"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

export const SignInButton: FC = () => {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <button
      onClick={() => router.push("/signup?mode=login")}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 font-inter hidden ${
        theme === "dark" ? "bg-[#14141C] text-white hover:bg-[#2A2A3C]" : "bg-[#FFB734] text-black hover:bg-[#E6A52F]"
      }`}
    >
      Sign In
    </button>
  );
};
