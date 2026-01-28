import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { SignInHeader } from '@/features/auth/components/SignInHeader'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton'
import { Divider } from '@/features/auth/components/Divider'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export const Route = createFileRoute('/sign-in')({
  component: SignIn,
})

function SignIn() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [, setError] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-md border">
        <SignInHeader isSignUp={isSignUp} />

        <SignInForm
          isSignUp={isSignUp}
          onToggleMode={() => setIsSignUp(!isSignUp)}
          onSuccess={() => {
            void navigate({ to: '/' })
          }}
          onErrorChange={setError}
        />

        {GOOGLE_CLIENT_ID && (
          <>
            <Divider />
            <GoogleSignInButton
              loading={loading}
              onError={setError}
              onLoadingChange={setLoading}
            />
          </>
        )}
      </div>
    </div>
  )
}
