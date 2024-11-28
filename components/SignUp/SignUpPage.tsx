"use client"

import SignUp from '@/components/SignUp/SignUp';
import { useTheme } from "@/components/ThemeContext";

export default function SignUpPage() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <SignUp />
    </div>
  );
} 