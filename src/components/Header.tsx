import { Link } from '@tanstack/react-router'

import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'
import { cn } from '@/lib/utils'

import { useState } from 'react'
import {
  ClipboardType,
  Home,
  Menu,
  SquareFunction,
  StickyNote,
  X,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Bottom Header - Menu and Logo */}
      <header className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <button
            onClick={() => setIsOpen(true)}
            className="min-h-[48px] min-w-[48px] text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 transition-colors rounded-md flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ fontFamily: "'Bungee', cursive" }}>
              Gainz
            </span>
          </Link>
          <div className="w-12" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-80 border-r bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-300 ease-in-out',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="min-h-[48px] min-w-[48px] text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 transition-colors rounded-md flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink
            to="/"
            icon={Home}
            label="Dashboard"
            onClick={() => setIsOpen(false)}
          />

          {/* Routes */}
          <div className="my-4 space-y-1 border-t border-sidebar-border pt-4">
            <NavLink
              to="/mesocycle/setup"
              icon={SquareFunction}
              label="Setup Mesocycle"
              onClick={() => setIsOpen(false)}
            />
            <NavLink
              to="/history"
              icon={StickyNote}
              label="History"
              onClick={() => setIsOpen(false)}
            />
            {/* TODO: Add exercises route */}
            {/* <NavLink
              to="/exercises"
              icon={ClipboardType}
              label="Exercises"
              onClick={() => setIsOpen(false)}
            /> */}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-sidebar-border bg-sidebar-accent/50 p-4">
          <BetterAuthHeader />
        </div>
      </aside>
    </>
  )
}

function NavLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
      )}
      activeProps={{
        className: cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'bg-sidebar-primary text-sidebar-primary-foreground',
          'hover:bg-sidebar-primary/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring'
        ),
      }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  )
}
