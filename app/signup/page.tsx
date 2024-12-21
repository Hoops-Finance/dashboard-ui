'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import GetLoginFromParams from "@/components/GetLoginFromParams"

const GoogleIcon = () => <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
const DiscordIcon = () => <Image src="/icons/discord.svg" alt="Discord" width={24} height={24} />

const AuthHeader = ({ isLogin }: { isLogin: boolean }) => (
  <div className="text-center">
    <h2 className="auth-title">{isLogin ? 'Log In' : 'Create Your Account'}</h2>
    <p className="auth-description">
      {isLogin ? 'Welcome back!' : 'Sign up to get started!'}
    </p>
  </div>
)

const EmailInput = ({ value, onChange }: { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type="email"
    required
    className="auth-input"
    placeholder="Email address"
    value={value}
    onChange={onChange}
  />
)

const PasswordInput = ({ value, onChange }: { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type="password"
    required
    className="auth-input"
    placeholder="Password"
    value={value}
    onChange={onChange}
  />
)

const SubmitButton = ({ label }: { label: string }) => (
  <button type="submit" className="auth-submit-button">
    {label}
  </button>
)

const Divider = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border" />
    </div>
    <div className="auth-divider">
      <span className="px-2 bg-card text-muted-foreground">or continue with</span>
    </div>
  </div>
)

const OAuthButtons = ({
  loginWithGoogle,
  loginWithDiscord,
}: {
  loginWithGoogle: () => void
  loginWithDiscord: () => void
}) => (
  <div className="grid grid-cols-2 gap-3">
    <button onClick={loginWithGoogle} className="auth-button">
      <GoogleIcon />
      Google
    </button>
    <button onClick={loginWithDiscord} className="auth-button">
      <DiscordIcon />
      Discord
    </button>
  </div>
)

const TermsAndConditions = ({
  agreed,
  setAgreed,
}: {
  agreed: boolean
  setAgreed: (checked: boolean) => void
}) => (
  <div className="flex items-center space-x-2">
    <Checkbox
      id="terms"
      checked={agreed}
      onCheckedChange={(checked: boolean | "indeterminate") =>
        setAgreed(checked as boolean)
      }
      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
    />
    <label htmlFor="terms" className="text-sm text-muted-foreground">
      I agree to the terms and conditions
    </label>
  </div>
)

const AuthToggle = ({ isLogin, toggleMode }: { isLogin: boolean; toggleMode: () => void }) => (
  <button onClick={toggleMode} className="auth-toggle">
    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
  </button>
)

const AuthForm = ({
  isLogin,
  email,
  password,
  setEmail,
  setPassword,
  agreed,
  setAgreed,
  error,
  success,
  handleSubmit,
  loginWithGoogle,
  loginWithDiscord,
}: {
  isLogin: boolean;
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  agreed: boolean;
  setAgreed: (agreed: boolean) => void;
  error: string;
  success: string;
  handleSubmit: (e: FormEvent) => void;
  loginWithGoogle: () => void;
  loginWithDiscord: () => void;
}) => (
  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
    <EmailInput value={email} onChange={(e) => setEmail(e.target.value)} />
    <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />

    {error && <p style={{ color: "red" }}>{error}</p>}
    {success && <p style={{ color: "green" }}>{success}</p>}

    <SubmitButton label={isLogin ? 'Log In' : 'Sign Up'} />

    {!isLogin && (
      <TermsAndConditions agreed={agreed} setAgreed={setAgreed} />
    )}

    <Divider />

    <OAuthButtons loginWithGoogle={loginWithGoogle} loginWithDiscord={loginWithDiscord} />
  </form>
)

export default function Component() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const passwordLength = 6

  const { session, signIn } = useAuth();

  // We'll receive all params from GetLoginFromParams
  const [errorParam, setErrorParam] = useState("");
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthProvider, setOauthProvider] = useState("");
  const [oauthCode, setOauthCode] = useState("");

  const handleParamsLoaded = ({ isLogin: loginMode, errorParam, oauthEmail, oauthProvider, oauthCode }: {
    isLogin: boolean; errorParam: string; oauthEmail?: string; oauthProvider?: string; oauthCode?: string;
  }) => {
    setIsLogin(loginMode);
    setErrorParam(errorParam);
    if (oauthEmail) setOauthEmail(oauthEmail);
    if (oauthProvider) setOauthProvider(oauthProvider);
    if (oauthCode) setOauthCode(oauthCode);
  };

  useEffect(() => {
    if (session?.user?.accessToken && !errorParam) {
      router.push("/profile")
    }
  }, [session, router, errorParam])

  // If NO_ACCOUNT scenario, prefill email if available
  useEffect(() => {
    if (errorParam.startsWith('NO_ACCOUNT')) {
      setIsLogin(false) // ensure signup mode
      if (oauthEmail) {
        setEmail(oauthEmail)
      }
    }
  }, [errorParam, oauthEmail])

  const toggleMode = () => {
    const newMode = !isLogin
    const newPath = `/signup${newMode ? '?mode=login' : ''}`
    router.push(newPath)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (isLogin) {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        })

        if (res?.ok) {
          router.push("/profile")
        } else {
          setSuccess("")
          setError("Invalid credentials")
        }
      } catch (error: unknown) {
        setError("Internal server error")
      }
    } else {
      if (password.length < passwordLength) {
        setError("Passwords minimum length is 6 characters")
        return
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password })
        })

        if (res.ok) {
          setSuccess("Registration successful, please login")
          // If NO_ACCOUNT scenario, link their OAuth now
          if (errorParam.startsWith('NO_ACCOUNT') && oauthProvider && oauthCode) {
            // Sign in with credentials
            const signInRes = await signIn("credentials", { redirect: false, email, password })
            if (!signInRes?.ok) {
              setError("Failed to login after registration")
              return
            }

            // Link endpoint
            const linkRes = await fetch("/api/auth/oauth/link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ provider: oauthProvider, code: oauthCode })
            })

            if (!linkRes.ok) {
              const errData = await linkRes.json()
              setError(`Failed to link OAuth: ${errData.message || linkRes.statusText}`)
              return
            }
            router.push("/profile")
          } else {
            // normal sign-up without oauth scenario
            setIsLogin(true)
          }
        } else {
          setError(`Error: ${res.statusText}`)
          const errData = await res.json().catch(() => ({}))
          if (errData?.error) {
            console.error(errData.error)
          }
        }
      } catch (error: unknown) {
        setError("Unexpected error")
      }
    }
  }

  const loginWithGoogle = () => {
    // Initiate OAuth flow
    window.location.href = "/api/auth/oauth/start?provider=google";
  }

  const loginWithDiscord = () => {
    // Initiate OAuth flow
    window.location.href = "/api/auth/oauth/start?provider=discord";
  }

  return (
    <div className="page-container flex items-center justify-center">
      {/* GetLoginFromParams handles all search param reading under Suspense */}
      <GetLoginFromParams onParamsLoaded={handleParamsLoaded} />
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="theme-button"
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
      <div className="auth-container">
        <AuthHeader isLogin={isLogin} />
        <AuthForm
          isLogin={isLogin}
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          agreed={agreed}
          setAgreed={setAgreed}
          error={error}
          success={success}
          handleSubmit={handleSubmit}
          loginWithGoogle={loginWithGoogle}
          loginWithDiscord={loginWithDiscord}
        />
        <div className="mt-6 text-center">
          <AuthToggle isLogin={isLogin} toggleMode={toggleMode} />
        </div>
      </div>
    </div>
  )
}
