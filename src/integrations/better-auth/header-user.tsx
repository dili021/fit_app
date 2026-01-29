import { Link } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    )
  }

  if (session?.user) {
    const displayName = session.user.name || session.user.email || 'User'

    return (
      <div className="flex items-center gap-2 w-full">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full shrink-0"
          />
        ) : null}
        <span className="text-sm font-medium text-sidebar-foreground flex-1 truncate">
          {displayName}
        </span>
        <ThemeToggle />
        <Button
          onClick={() => {
            void authClient.signOut()
          }}
          variant="ghost"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0 whitespace-nowrap"
        >
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Link
      to="/sign-in"
      className="h-9 px-4 text-sm font-medium bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border active:bg-sidebar-accent/80 transition-colors inline-flex items-center rounded-md min-h-[48px]"
    >
      Sign in
    </Link>
  )
}
