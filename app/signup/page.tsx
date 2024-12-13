'use client'

import React, { useState, useEffect, ChangeEvent, FormEvent, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { useTheme } from "@/components/ThemeContext"
import { useSession, signIn } from "next-auth/react"

const GoogleIcon = () => <Image src="/GoogleIcon.svg" alt="Google" width={24} height={24} />
const DiscordIcon = () => <Image src="/discord.svg" alt="Discord" width={24} height={24} />

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
}: any) => (
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

function SuspenseSearchParams({
  setIsLogin,
}: {
  setIsLogin: (isLogin: boolean) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    setIsLogin(searchParams.get('mode') === 'login')
  }, [searchParams])
  return null
}

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
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.accessToken) {
      router.push("/profile")
    }
  }, [session])

  const toggleMode = () => {
    const newMode = !isLogin
    const newPath = `/signup${newMode ? '?mode=login' : ''}`
    router.push(newPath)
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
      } catch (error) {
        setError("Internal server error")
      }
    } else {
      if (password.length < passwordLength) {
        setError("Passwords minimum length is 6 characters")
        return
      }

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password })
        })
        if (res.ok) {
          setSuccess("Registration successful, please login")
          setIsLogin(true)
        } else {
          setError(`Error: ${res.statusText}`)
          throw new Error(`${res.statusText}`)
        }
      } catch (err) {
        setError("Unexpected error")
      }
    }
  }

  const loginWithGoogle = () => {
    signIn("google")
  }

  const loginWithDiscord = () => {
    signIn("discord")
  }

  return (
    <div className="page-container">
      <Suspense fallback={<div>Loading...</div>}>
        <SuspenseSearchParams setIsLogin={setIsLogin} />
      </Suspense>
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
