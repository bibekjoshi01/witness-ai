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
  Bell,
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
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950/95 dark:text-slate-100 dark:[background-image:radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_82%_3%,rgba(16,185,129,0.14),transparent_30%)]">
      <div className="flex h-full">
        <aside
          className={`hidden lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-r lg:border-slate-200 lg:bg-white lg:shadow-sm lg:transition-[width] lg:duration-300 dark:lg:border-white/10 dark:lg:bg-slate-900/55 dark:lg:backdrop-blur-xl ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-68'
            }`}
        >
          <div className={`py-6 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            <div className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
              <Link
                href="/"
                className={`flex items-center font-display text-lg font-semibold text-slate-900 dark:text-slate-100 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'
                  }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 ring-1 ring-blue-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                </span>
                {!isSidebarCollapsed ? 'Witness AI' : null}
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className={`hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/70 dark:hover:text-white lg:flex ${isSidebarCollapsed ? 'absolute -right-4 top-6 z-30 bg-white shadow-sm dark:bg-slate-800/80' : ''
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
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${isActive
                        ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-sky-600/50 dark:bg-sky-900/35 dark:text-sky-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:text-white'
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
              className={`flex w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-900/30 dark:text-rose-200 dark:hover:bg-rose-900/45 ${isSidebarCollapsed ? 'px-2 py-2.5' : 'gap-2 px-4 py-2.5'
                }`}
            >
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed ? 'Logout' : null}
            </button>
          </div>
        </aside>

        <div className="h-screen flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/55 dark:backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 lg:px-10">
              <div>
                <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
                {subtitle && <p className="text-sm text-slate-700 dark:text-slate-300">{subtitle}</p>}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  aria-label="Toggle theme"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/70 dark:hover:text-white"
                >
                  {mounted && currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                {headerActions}
                <button
                  aria-label="Notifications"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/70 dark:hover:text-white"
                >
                  <Bell className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>
          <main className="px-4 pb-12 pt-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
