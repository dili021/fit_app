import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 min-h-[48px]"
            placeholder="Your name"
          />
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 min-h-[48px]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 min-h-[48px]"
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
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {getButtonText()}
        </Button>
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={() => {
            onToggleMode()
            onErrorChange('')
          }}
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </Button>
      </div>
    </form>
  )
}
