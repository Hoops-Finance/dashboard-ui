'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTheme } from './ThemeContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const { theme } = useTheme()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      console.log('Login submitted:', { email, password })
    } else {
      console.log('Signup submitted:', { email, password, confirmPassword })
    }
  }

  const handleGoogleAuth = () => {
    console.log(`Google ${isLogin ? 'login' : 'sign up'} clicked`)
  }

  const handleDiscordAuth = () => {
    console.log(`Discord ${isLogin ? 'login' : 'sign up'} clicked`)
  }

  return (
    <div className={`w-full max-w-md p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl relative`}>
      <button
        onClick={() => router.push('/dashboard')}
        className={`absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
        }`}
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 text-center`}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className={`mt-1 block w-full px-3 py-2 ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className={`mt-1 block w-full px-3 py-2 ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required={!isLogin}
              className={`mt-1 block w-full px-3 py-2 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FFB734] hover:bg-[#E6A52F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB734]"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB734]`}
          >
            <Image
              src="/icons/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Google
          </button>
          <button
            type="button"
            onClick={handleDiscordAuth}
            className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFB734]`}
          >
            <Image
              src="/icons/discord.svg"
              alt="Discord"
              width={20}
              height={20}
              className="mr-2"
            />
            Discord
          </button>
        </div>

        <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#FFB734] hover:text-[#E6A52F]"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}