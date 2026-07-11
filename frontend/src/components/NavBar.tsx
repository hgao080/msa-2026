'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { logout } from '@/app/(auth)/actions'
import { LayoutDashboard, List, History, LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Board', icon: List },
  { to: '/seasons', label: 'Seasons', icon: History },
]

export function NavBar({ username }: { username?: string }) {
  const pathname = usePathname()

  return (
    <>
      <nav className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link
            href="/dashboard"
            className="font-display text-xl font-bold tracking-tight text-accent"
            style={{ transform: 'skewX(-8deg)' }}
          >
            HORME
          </Link>
          <div className="hidden flex-1 items-center gap-1 sm:flex">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  href={to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  {active && (
                    <span className="-mr-0.5 text-accent" style={{ transform: 'skewX(-12deg)' }} aria-hidden>
                      ´
                    </span>
                  )}
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 sm:flex-none">
            <span className="hidden text-sm text-fg-3 sm:inline">{username}</span>
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md p-2 text-fg-3 hover:bg-surface-2 hover:text-fg"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              href={to}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 pt-2 pb-1 text-[10px] font-medium ${
                active ? 'text-accent' : 'text-fg-3'
              }`}
            >
              {active && <span className="absolute top-0 h-0.5 w-6 rounded-full bg-accent" aria-hidden />}
              <Icon size={19} />
              {label}
            </Link>
          )
        })}
      </div>
    </>
  )
}
