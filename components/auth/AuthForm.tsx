"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { getCsrfToken } from "next-auth/react";
import { signIn } from "@/utils/auth"; // your custom NextAuth-based auth export
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { usePlausible } from "next-plausible";
import { TosModal } from "@/components/TosModal";
import Image from "next/image";

interface RegisterResponse {
  ok: boolean;
  error?: string;
  message?: string;
}

/** NextAuth's signIn("credentials", { redirect:false }) returns this shape on success/failure. */
interface SignInResult {
  ok: boolean;
  error?: string;
  status?: number;
  url?: string;
}

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

/**
 * For reCAPTCHA usage in the browser, e.g. window.grecaptcha.execute(...)
 */
declare global {
  interface Window {
    grecaptcha?: {
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

export default function AuthForm({ isLogin, defaultEmail = "", defaultError = "", recaptchaSiteKey }: AuthFormProps) {
  const router = useRouter();
  const plausible = usePlausible();

  const [email, setEmail] = useState<string>(defaultEmail);
  const [password, setPassword] = useState<string>("");
  const [agreed, setAgreed] = useState<boolean>(false);
  const [error, setError] = useState<string>(defaultError);
  const [success, setSuccess] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [showTos, setShowTos] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const passwordLength = 6;

  // Fetch CSRF token on mount
  useEffect(() => {
    void (async () => {
      const token = await getCsrfToken();
      if (token) setCsrfToken(token);
    })();
  }, []);

  // Handles both sign-up and login
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!csrfToken) {
      setError("Missing CSRF token, please refresh the page.");
      return;
    }

    if (!isLogin) {
      // ================== SIGN UP ==================
      if (password.length < passwordLength) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!agreed) {
        setError("You must agree to the terms of service.");
        return;
      }

      // reCAPTCHA token if needed
      let recaptchaToken = "";
      if (recaptchaSiteKey && typeof window !== "undefined" && window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, {
          action: "submit"
        });
      }

      // Send request to our local /api/auth/register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, recaptchaToken })
      });

      const jsonData = (await res.json().catch(() => ({}))) as RegisterResponse;
      if (!res.ok) {
        setError(jsonData.error ?? res.statusText);
        return;
      }

      // success
      setSuccess("Registration successful. Check your email for verification.");
      plausible("Signup", { props: { method: "password" } });

      // In your original scenario, you might do auto-login or linking steps next
      return;
    }

    // ================== LOGIN ==================
    const result = (await signIn("credentials", {
      redirect: false,
      email,
      password
    })) as SignInResult;

    if (result.ok) {
      plausible("Login", { props: { method: "password" } });
      router.push("/profile");
    } else {
      setError(`Login failed: ${result.error ?? "Invalid credentials"}`);
    }
  };

  // Start Google OAuth
  function loginWithGoogle(): void {
    if (!csrfToken) {
      setError("Missing CSRF token, please refresh the page.");
      return;
    }
    plausible("OAuth Start", { props: { provider: "google" } });
    window.location.href = `/api/auth/oauth/start?provider=google&state=${encodeURIComponent(csrfToken)}`;
  }

  // Start Discord OAuth
  function loginWithDiscord(): void {
    if (!csrfToken) {
      setError("Missing CSRF token, please refresh the page.");
      return;
    }
    plausible("OAuth Start", { props: { provider: "discord" } });
    window.location.href = `/api/auth/oauth/start?provider=discord&state=${encodeURIComponent(csrfToken)}`;
  }

  return (
    <div className="auth-container">
      <div className="text-center">
        <h2 className="auth-title">{isLogin ? "Log In" : "Create Your Account"}</h2>
        <p className="auth-description">{isLogin ? "Welcome back!" : "Sign up to get started!"}</p>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="mt-8 space-y-6"
      >
        <div className="relative">
          <input
            type="email"
            required
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
            }}
            autoComplete="username"
          />
          <span className="absolute inset-y-0 right-3 flex items-center">
            <EnvelopeIcon className="h-5 w-5" />
          </span>
        </div>
        <div className="relative">
          <input
            type={isPasswordVisible ? "text" : "password"}
            required
            className="auth-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
            }}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center"
            onClick={() => {
              setIsPasswordVisible(!isPasswordVisible);
            }}
            tabIndex={-1}
          >
            {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" className="auth-submit-button" disabled={isLogin ? false : !agreed}>
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        {!isLogin && (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setAgreed(e.target.checked);
                }}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label className="text-sm text-muted-foreground">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => {
                    setShowTos(true);
                  }}
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </button>
                .
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
          <button onClick={loginWithGoogle} type="button" className="auth-button" disabled={isLogin ? false : !agreed}>
            <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
            Google
          </button>
          <button onClick={loginWithDiscord} type="button" className="auth-button" disabled={isLogin ? false : !agreed}>
            <Image src="/icons/discord.svg" alt="Discord" width={24} height={24} />
            Discord
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => {
            // If user is on Sign Up, let them go to /signup?mode=login => the login variant
            const newPath = `/signup${!isLogin ? "?mode=login" : ""}`;
            router.push(newPath);
          }}
          className="auth-toggle text-primary hover:underline"
        >
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </div>

      <TosModal
        open={showTos}
        onClose={() => {
          setShowTos(false);
        }}
      />
    </div>
  );
}
