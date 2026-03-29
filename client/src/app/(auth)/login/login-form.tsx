'use client'

import type React from 'react'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useBasicAuthMutation } from '@/app/(auth)/redux/auth.api'
import { useAppDispatch } from '@/lib/redux/hooks'
import { loginSuccess } from '@/app/(auth)/redux/auth.slice'
import { Lock, Mail } from 'lucide-react'

export default function LoginPage({ onSuccess }: { onSuccess?: () => void }) {
  const [basicAuth, { isLoading }] = useBasicAuthMutation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await basicAuth({ username, password }).unwrap()
      dispatch(loginSuccess(response))
      toast.success('Login successful!')
      if (onSuccess) {
        onSuccess() // modal login => close modal
      } else {
        router.push('/profile') // page login => redirect
      }
    } catch {
      toast.error('Unable to sign in')
    }
  }

  return (
    <>
      <div className="w-full max-w-lg">
        <div className="rounded-3xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-10 shadow-[0_40px_120px_-70px_rgba(2,6,23,0.85)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-[var(--wa-muted)] transition hover:text-[var(--wa-text)]"
          >
            ← Back
          </button>
          <h1 className="text-center font-display text-3xl font-semibold text-[var(--wa-text)]">
            Sign In Your Account
          </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-4 py-4 text-sm text-[var(--wa-text)] transition focus-within:border-[var(--wa-accent)] focus-within:bg-[var(--wa-panel)]">
              <Mail className="h-5 w-5 text-[var(--wa-muted)]" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full bg-transparent text-base text-[var(--wa-text)] placeholder:text-[var(--wa-muted)] outline-none"
                placeholder="Enter your email address"
                autoComplete="username"
                required
              />
            </div>
          </div>
          <div>
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-4 py-4 text-sm text-[var(--wa-text)] transition focus-within:border-[var(--wa-accent)] focus-within:bg-[var(--wa-panel)]">
              <Lock className="h-5 w-5 text-[var(--wa-muted)]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-base text-[var(--wa-text)] placeholder:text-[var(--wa-muted)] outline-none"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-xl bg-[var(--wa-accent)] px-4 py-4 text-base font-semibold text-[#01261a] transition hover:bg-[var(--wa-accent-strong)] disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : (
              <span className="inline-flex items-center justify-center gap-2">
                Sign In <span aria-hidden="true">→</span>
              </span>
            )}
          </button>
        </form>
        </div>
      </div>
    </>
  )
}
