"use client";

import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { signIn, getCsrfToken } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { usePlausible } from "next-plausible";
import { TosModal } from "@/components/TosModal";
import Image from 'next/image';

interface AuthFormProps {
  isLogin: boolean;
  defaultEmail?: string;
  defaultError?: string;
  oauthEmail?: string;
  oauthProvider?: string;
  oauthCode?: string;
  errorParam?: string;
  recaptchaSiteKey?: string;
}

declare global {
  interface Window {
    grecaptcha?: {
      execute(siteKey:string, options:{action:string}):Promise<string>;
    }
  }
}

export default function AuthForm({
  isLogin,
  defaultEmail = "",
  defaultError = "",
  oauthEmail,
  oauthProvider,
  oauthCode,
  errorParam,
  recaptchaSiteKey
}: AuthFormProps) {
  const router = useRouter();
  const plausible = usePlausible();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(defaultError);
  const [success, setSuccess] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const passwordLength = 6;

  const [showTos, setShowTos] = useState(false);

  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    // get the csrf token from next-auth
    (async () => {
      const token = await getCsrfToken();
      if (token) setCsrfToken(token);
    })();
  }, []);

  useEffect(() => {
    if (errorParam?.startsWith('NO_ACCOUNT') && oauthEmail && !isLogin) {
      setEmail(oauthEmail);
    }
  }, [errorParam, oauthEmail, isLogin]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!csrfToken) {
      setError("Missing CSRF token, please refresh the page.");
      return;
    }

    if (!isLogin) {
      if (password.length < passwordLength) {
        setError("Passwords minimum length is 6 characters");
        return;
      }

      if (!agreed) {
        setError("You must agree to the terms of service.");
        return;
      }

      let recaptchaToken = "";
      if (recaptchaSiteKey && typeof window !== 'undefined' && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {action: 'submit'});
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password, recaptchaToken })
      });

      if (res.ok) {
        setSuccess("Registration successful. Please check your email for verification link.");
        plausible('Signup', { props: { method: 'password' } });

        if (errorParam?.startsWith('NO_ACCOUNT') && oauthProvider && oauthCode) {
          // After signup, log in
          const signInRes = await signIn("credentials", { redirect: false, email, password });
          if (!signInRes?.ok) {
            setError("Failed to login after registration");
            return;
          }

          // Link account
          const linkRes = await fetch("/api/auth/oauth/link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provider: oauthProvider, code: oauthCode, state: csrfToken })
          });

          if (!linkRes.ok) {
            const errData = await linkRes.json().catch(() => ({}));
            setError(`Failed to link OAuth: ${errData.message || linkRes.statusText}`);
            return;
          }

          plausible('OAuth Link', { props: { provider: oauthProvider } });
          router.push("/profile");
        } else {
          // normal signup: user must verify email and then login
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(`Error: ${errData.error || res.statusText}`);
      }
    } else {
      // Login
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.ok) {
        plausible('Login', { props: { method: 'password' } });
        router.push("/profile");
      } else {
        setError(signInRes?.error || "Invalid credentials");
      }
    }
  };

  const loginWithGoogle = async () => {
    if (!csrfToken) {
      setError("Missing CSRF token, please refresh the page.");
      return;
    }
    plausible('OAuth Start', { props: { provider: 'google' } });
    window.location.href = `/api/auth/oauth/start?provider=google&state=${encodeURIComponent(csrfToken)}`;
  };

  const loginWithDiscord = async () => {
    if (!csrfToken) {
      setError("Missing CSRF token, please refresh the page.");
      return;
    }
    plausible('OAuth Start', { props: { provider: 'discord' } });
    window.location.href = `/api/auth/oauth/start?provider=discord&state=${encodeURIComponent(csrfToken)}`;
  };

  return (
    <div className="auth-container">
      <div className="text-center">
        <h2 className="auth-title">{isLogin ? 'Log In' : 'Create Your Account'}</h2>
        <p className="auth-description">
          {isLogin ? 'Welcome back!' : 'Sign up to get started!'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <input
          type="email"
          required
          className="auth-input"
          placeholder="Email address"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <div className="relative">
          <input
            type={isPasswordVisible ? "text" : "password"}
            required
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            tabIndex={-1}
          >
            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" className="auth-submit-button">
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>

        {!isLogin && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                }}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label className="text-sm text-muted-foreground">
                I agree to the{" "}
                <button type="button" onClick={() => setShowTos(true)} className="text-primary hover:underline">
                  Terms of Service
                </button>.
              </label>
            </div>
          </div>
        )}

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="auth-divider">
            <span className="px-2 bg-card text-muted-foreground">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={loginWithGoogle} type="button" className="auth-button">
            <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
            Google
          </button>
          <button onClick={loginWithDiscord} type="button" className="auth-button">
            <Image src="/icons/discord.svg" alt="Discord" width={24} height={24} />
            Discord
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            const newPath = `/signup${!isLogin ? '?mode=login' : ''}`;
            router.push(newPath);
          }}
          className="auth-toggle"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>

      {/* Only TOS Modal now */}
      <TosModal open={showTos} onClose={() => setShowTos(false)} />
    </div>
  );
}
