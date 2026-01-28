import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches

    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    // Return placeholder to prevent hydration mismatch
    return (
      <button
        className="size-12 min-h-[48px] min-w-[48px] text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 transition-colors rounded-md flex items-center justify-center"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="size-12 min-h-[48px] min-w-[48px] text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 transition-colors rounded-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  )
}
