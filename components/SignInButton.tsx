"use client";

import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeContext';

export const SignInButton: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <button
      onClick={() => router.push('/signup')}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 font-inter ${
        theme === 'dark' 
          ? 'bg-[#14141C] text-white hover:bg-[#2A2A3C]' 
          : 'bg-[#FFB734] text-black hover:bg-[#E6A52F]'
      }`}
    >
      Sign In
    </button>
  );
}; 