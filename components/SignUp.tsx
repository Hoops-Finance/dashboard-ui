"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "./ThemeContext";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      console.log("Login submitted:", { email, password });
    } else {
      console.log("Signup submitted:", { email, password, confirmPassword });
    }
  };

  const handleGoogleAuth = () => {
    console.log(`Google ${isLogin ? "login" : "sign up"} clicked`);
  };

  const handleDiscordAuth = () => {
    console.log(`Discord ${isLogin ? "login" : "sign up"} clicked`);
  };

  return (
    <div className="signup-container">
      <button onClick={() => router.push("/dashboard")} className="close-button">
        <XMarkIcon className="h-6 w-6" />
      </button>

      <h2 className="signup-heading">{isLogin ? "Welcome Back" : "Create Account"}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className={`input-field ${theme === "dark" ? "input-field-dark" : "input-field-light"}`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className={`input-field ${theme === "dark" ? "input-field-dark" : "input-field-light"}`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required={!isLogin}
              className={`input-field ${theme === "dark" ? "input-field-dark" : "input-field-light"}`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-black bg-[#FFB734] hover:bg-[#E6A52F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB734]"
        >
          {isLogin ? "Sign In" : "Sign Up"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="separator-line"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="separator-text">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={handleGoogleAuth} className={`social-button ${theme === "dark" ? "social-button-dark" : "social-button-light"}`}>
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} className="mr-2" />
            Google
          </button>
          <button type="button" onClick={handleDiscordAuth} className={`social-button ${theme === "dark" ? "social-button-dark" : "social-button-light"}`}>
            <Image src="/icons/discord.svg" alt="Discord" width={20} height={20} className="mr-2" />
            Discord
          </button>
        </div>

        <div className="footer-text">
          {isLogin ? `Don't have an account? ` : `Already have an account? `}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[#FFB734] hover:text-[#E6A52F]">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}
