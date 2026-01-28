interface SignInHeaderProps {
  isSignUp: boolean
}

export function SignInHeader({ isSignUp }: SignInHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-card-foreground">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {isSignUp
          ? 'Start tracking your training progress'
          : 'Welcome back to Training Tracker'}
      </p>
    </div>
  )
}
