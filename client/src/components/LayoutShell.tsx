'use client'

import React, { PropsWithChildren, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  Mic,
  ListTodo,
  MessageCircle,
  User,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
} from 'lucide-react'
import { AppDispatch } from '@/lib/redux/store'
import { logoutSuccess } from '@/app/(auth)/redux/auth.slice'
import { useTheme } from 'next-themes'
import { useGetJournalByDateQuery } from '@/features/journal/journal.api'

type LayoutShellProps = PropsWithChildren & {
  title?: string
  subtitle?: string
  headerActions?: React.ReactNode
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: ListTodo },
  { label: 'Journaling', href: '/journaling', icon: LayoutDashboard },
  { label: 'Reflect', href: '/reflect', icon: Mic },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
]

export function LayoutShell({ children, title, subtitle, headerActions }: LayoutShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const currentTheme = theme === 'system' ? resolvedTheme : theme

  const todayDateKey = new Date().toISOString().slice(0, 10)
  const { data: todayJournal } = useGetJournalByDateQuery(todayDateKey)
  const hasTodayJournal = Boolean(todayJournal)

  // Filter nav items - hide Reflect if today's journal exists
  const filteredNavItems = hasTodayJournal
    ? navItems.filter((item) => item.href !== '/reflect')
    : navItems

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect from /reflect if today's journal already exists
  useEffect(() => {
    if (hasTodayJournal && pathname === '/reflect') {
      router.push('/journaling')
    }
  }, [hasTodayJournal, pathname, router])

  const handleLogout = () => {
    dispatch(logoutSuccess())
    router.push('/')
  }

  const handleToggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="h-screen overflow-hidden text-[var(--wa-text)] [background:var(--wa-bg)]">
      <div className="flex h-full">
        <aside
          className={`hidden lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-r lg:border-[var(--wa-border)] lg:bg-[var(--wa-sidebar)] lg:shadow-[inset_-1px_0_0_rgba(143,161,191,0.08)] lg:transition-[width] lg:duration-300 lg:backdrop-blur-xl ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
            }`}
        >
          <div className={`py-6 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            <div className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
              <Link
                href="/"
                className={`flex items-center font-display text-lg font-semibold text-[var(--wa-text)] ${isSidebarCollapsed ? 'justify-center' : 'gap-3'
                  }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--wa-accent-soft)] text-[var(--wa-accent)] ring-1 ring-[var(--wa-border)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--wa-accent)]" />
                </span>
                {!isSidebarCollapsed ? 'Witness AI' : null}
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={`hidden h-9 w-9 items-center justify-center rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel)] text-[var(--wa-muted)] transition hover:bg-[var(--wa-panel-soft)] hover:text-[var(--wa-text)] lg:flex ${isSidebarCollapsed ? 'absolute -right-4 top-6 z-30 shadow-lg' : ''
                  }`}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>
            <nav className="mt-10 space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition ${isActive
                        ? 'border border-[var(--wa-border)] bg-[var(--wa-accent-soft)] text-[var(--wa-accent-strong)]'
                        : 'text-[var(--wa-muted)] hover:bg-[var(--wa-panel)] hover:text-[var(--wa-text)]'
                      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    {!isSidebarCollapsed ? item.label : null}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className={`py-6 space-y-3 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className={`flex w-full items-center justify-center rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel)] text-base font-semibold text-[var(--wa-muted)] transition hover:bg-[var(--wa-panel-soft)] hover:text-[var(--wa-text)] ${isSidebarCollapsed ? 'px-2 py-2.5' : 'gap-2 px-4 py-2.5'
                }`}
            >
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed ? 'Logout' : null}
            </button>
          </div>
        </aside>

        <div className="h-screen flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-[var(--wa-border)] bg-[var(--wa-bg)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-5 lg:px-10">
              <div>
                <h1 className="font-display text-3xl font-semibold text-[var(--wa-text)]">{title}</h1>
                {subtitle && <p className="text-base text-[var(--wa-muted)]">{subtitle}</p>}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  aria-label="Toggle theme"
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel)] text-[var(--wa-muted)] transition hover:bg-[var(--wa-panel-soft)] hover:text-[var(--wa-text)]"
                >
                  {mounted && currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                {headerActions}
              </div>
            </div>
          </header>
          <main className="px-6 pb-14 pt-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
