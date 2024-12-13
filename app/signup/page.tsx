'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Checkbox } from "@/components/ui/checkbox"
import { useTheme } from "@/components/ThemeContext"
import { useSession } from "next-auth/react";

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, toggleTheme } = useTheme()
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const passwordLength: number = 6
  const { data: session } = useSession();

  useEffect(() => {
    setIsLogin(searchParams.get('mode') === 'login')
    if (session?.user?.accessToken) {
      router.push("/profile");
    }

  }, [searchParams, router, session]);

  const toggleMode = () => {
    const newMode = !isLogin
    const newPath = `/signup${newMode ? '?mode=login' : ''}`
    router.push(newPath)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if(isLogin){
      try {
        const res = await fetch(`/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({username: email, password: password, type: "credentials" }),
        });

        if (res.ok) {
          window.location.href = '/profile';
        } else {
          setSuccess("");
          setError("Invalid credentials");
        }
      } catch (error) {
        setError("Internal server error");
      }

    }else{
      if (password.length < passwordLength) {
        setError("Passwords minimum length is 6 characters");
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password })
      });
      if (res.ok) {
        setEmail("");
        setPassword("");
        setError("");
        setSuccess("Registration successful, please login");
        setIsLogin(true);
      } else {
        setError(`Registration error`);
        throw new Error('Registration error');
      }
    }

  }
  const loginWithGoogle = async () => {
    router.push(process.env.GOOGLE_OAUTH_FLOW_URL || "");
  }

  const loginWithDiscord = async () => {
    router.push(process.env.DISCORD_OAUTH_FLOW_URL || "");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-secondary text-secondary-foreground"
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
      <div className="w-full max-w-md bg-card text-card-foreground rounded-[var(--radius)] p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">{isLogin ? 'Log In' : 'Create Your Account'}</h2>
          <p className="mt-2 text-muted-foreground">
            {isLogin ? 'Welcome back!' : 'Sign up to get started!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-[var(--radius)] bg-input text-foreground border-input focus:border-ring focus:ring-1 focus:ring-ring"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-[var(--radius)] bg-input text-foreground border-input focus:border-ring focus:ring-1 focus:ring-ring"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-[var(--radius)] text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>

          {!isLogin && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(checked: boolean | "indeterminate") => setAgreed(checked as boolean)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground"
              >
                I agree to the terms and conditions
              </label>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-input rounded-[var(--radius)] text-foreground bg-background hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={loginWithDiscord}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-input rounded-[var(--radius)] text-foreground bg-background hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Discord
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-primary hover:text-primary/90"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
