"use client";

import SignUp from '../../components/SignUp';
import { useTheme } from '../../components/ThemeContext';

export default function SignUpPage() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <SignUp />
    </div>
  );
} 