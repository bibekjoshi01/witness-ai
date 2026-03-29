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

type LayoutShellProps = PropsWithChildren & {
  title?: string
  subtitle?: string
  headerActions?: React.ReactNode
}

const navItems = [
  { label: 'Dashboard', href: '/home', icon: LayoutDashboard },
  { label: 'Reflect', href: '/reflect', icon: Mic },
  { label: 'Tasks', href: '/home#tasks', icon: ListTodo },
  { label: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
]

export function LayoutShell({ children, title, subtitle, headerActions }: LayoutShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [mounted, resolvedTheme])

  const handleLogout = () => {
    dispatch(logoutSuccess())
    router.push('/')
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex h-full">
        <aside
          className={`hidden lg:flex lg:h-screen lg:flex-col lg:justify-between lg:border-r lg:border-slate-200 lg:bg-white lg:shadow-sm lg:transition-[width] lg:duration-300 dark:lg:border-slate-800 dark:lg:bg-slate-900 ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-68'
          }`}
        >
          <div className={`py-6 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            <div className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
              <Link
                href="/"
                className={`flex items-center font-display text-lg font-semibold text-slate-900 dark:text-slate-100 ${
                  isSidebarCollapsed ? 'justify-center' : 'gap-3'
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
                className={`hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white lg:flex ${
                  isSidebarCollapsed ? 'absolute -right-4 top-6 z-30 bg-white shadow-sm dark:bg-slate-800' : ''
                }`}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </button>
            </div>
            <nav className="mt-10 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
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
            {!isSidebarCollapsed ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-600 font-medium dark:text-slate-400">Plan</p>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">Calm Starter</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Daily reflection + voice</p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className={`flex w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 ${
                isSidebarCollapsed ? 'px-2 py-2.5' : 'gap-2 px-4 py-2.5'
              }`}
            >
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed ? 'Logout' : null}
            </button>
          </div>
        </aside>

        <div className="h-screen flex-1 overflow-y-auto">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between px-5 py-4 lg:px-10">
              <div>
                <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
                {subtitle && <p className="text-sm text-slate-700 dark:text-slate-300">{subtitle}</p>}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  {mounted && resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                {headerActions}
                <button
                  aria-label="Notifications"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
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
