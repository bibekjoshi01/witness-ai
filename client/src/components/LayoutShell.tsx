'use client'

import React, { PropsWithChildren } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Mic,
  ListTodo,
  MessageCircle,
  User,
  Settings,
} from 'lucide-react'

type LayoutShellProps = PropsWithChildren & {
  title?: string
  subtitle?: string
}

const navItems = [
  { label: 'Dashboard', href: '/home', icon: LayoutDashboard },
  { label: 'Reflect', href: '/home#reflect', icon: Mic },
  { label: 'Tasks', href: '/home#tasks', icon: ListTodo },
  { label: 'Chat', href: '/home#chat', icon: MessageCircle },
  { label: 'Profile', href: '/profile', icon: User },
]

export function LayoutShell({ children, title, subtitle }: LayoutShellProps) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:justify-between lg:border-r lg:border-ink/10 lg:bg-white/70 lg:backdrop-blur-xl">
          <div className="px-6 py-6">
            <Link href="/" className="flex items-center gap-3 font-display text-lg font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink text-white">
                W
              </span>
              Witness AI
            </Link>
            <nav className="mt-10 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-ink text-white shadow-lg shadow-ink/10'
                        : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="px-6 py-6">
            <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Plan</p>
              <p className="mt-1 font-display text-sm font-semibold">Calm Starter</p>
              <p className="text-xs text-ink/60">Daily reflection + voice</p>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-5 py-4 lg:px-10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/40">Witness AI</p>
                <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
                {subtitle && <p className="text-sm text-ink/60">{subtitle}</p>}
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/70 transition hover:text-ink">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="px-4 pb-10 pt-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
