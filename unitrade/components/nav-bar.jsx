'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export function NavBar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth() || { user: null, signOut: () => {} }

  const navItems = [
    {
      name: 'Home',
      href: '/',
      protected: false
    },
    {
      name: 'Listings',
      href: '/listings',
      protected: false
    },
    {
      name: 'Chats',
      href: '/chats',
      protected: true
    },
    {
      name: 'My Dashboard',
      href: '/mydashboard',
      protected: true
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 px-4">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link 
            href="/" 
            className="mr-6 flex items-center space-x-2"
          >
            <span className="font-bold text-xl">UniTrade</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => 
              (!item.protected || (item.protected && user)) ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.name}
                </Link>
              ) : null
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user ? (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-4">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link 
                href="/auth/login"
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/sign-up"
                className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 