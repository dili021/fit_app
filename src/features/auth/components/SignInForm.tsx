import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

interface SignInFormProps {
  isSignUp: boolean
  onToggleMode: () => void
  onSuccess: () => void
  onErrorChange: (error: string) => void
}

export function SignInForm({
  isSignUp,
  onToggleMode,
  onSuccess,
  onErrorChange,
}: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getButtonText = () => {
    if (loading) return 'Loading...'
    return isSignUp ? 'Sign Up' : 'Sign In'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name || email.split('@')[0],
        })
        if (result.error) {
          const errorMessage = result.error.message || 'Sign up failed'
          setError(errorMessage)
          onErrorChange(errorMessage)
        } else {
          onSuccess()
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
        })
        if (result.error) {
          const errorMessage = result.error.message || 'Sign in failed'
          setError(errorMessage)
          onErrorChange(errorMessage)
        } else {
          onSuccess()
        }
      }
    } catch {
      const errorMessage = 'An unexpected error occurred'
      setError(errorMessage)
      onErrorChange(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit(e)
      }}
      className="mt-8 space-y-6"
    >
      {isSignUp && (
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]"
            placeholder="Your name"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring min-h-[48px]"
          placeholder="••••••••"
          minLength={8}
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive-foreground">{error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
        >
          {getButtonText()}
        </button>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            onToggleMode()
            onErrorChange('')
          }}
          className="text-sm text-primary active:opacity-80 transition-opacity min-h-[48px] px-2"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </form>
  )
}
