'use client'

import Link from 'next/link'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useGetProfileQuery } from '@/app/(auth)/redux/auth.api'
import { useGetDashboardQuery } from '@/features/journal/journal.api'
import { Flame, Lightbulb } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const ACTION_CHECKS_STORAGE_KEY = 'wa.dashboard.tryTodayChecks.v1'

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateLabel = (dateValue?: string) => {
  if (!dateValue) return 'No entries yet'
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDueDays = (days: number): string => {
  if (days <= 0) return 'Today'
  if (days === 1) return 'In 1 day'
  return `In ${days} days`
}

const inferTone = (currentState: string): 'positive' | 'heavy' | 'neutral' => {
  const value = currentState.toLowerCase()
  if (/(good|better|steady|calm|improving|positive)/.test(value)) return 'positive'
  if (/(heavy|stress|anxious|overwhelm|tired|drained|low|panic)/.test(value)) return 'heavy'
  return 'neutral'
}

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useGetDashboardQuery()
  const { data: profile } = useGetProfileQuery()
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({})

  const currentDateKey = dashboard?.current_date ?? formatDateKey(new Date())
  const hasFilledTodayEntry = Boolean(
    dashboard?.last_entry_date && dashboard.last_entry_date === dashboard.current_date
  )
  const showStartReflectionHero = !hasFilledTodayEntry

  const greetingName = useMemo(() => {
    const name = profile?.name?.trim()
    if (!name) return 'there'
    return name
  }, [profile?.name])

  const moodTone = inferTone(dashboard?.current_state ?? '')
  const moodToneClass =
    moodTone === 'positive'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      : moodTone === 'heavy'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300'

  const noticingItems = dashboard?.what_were_noticing ?? []

  const tryTodayItems = useMemo(() => {
    return (dashboard?.try_this_today ?? []).map((item) => ({
      action: item.action,
      status: item.status,
      dueText: formatDueDays(item.due_days),
    }))
  }, [dashboard?.try_this_today])

  const actionCheckKeys = useMemo(
    () => tryTodayItems.map((item, index) => `${currentDateKey}::${index}::${item.action}`),
    [tryTodayItems, currentDateKey]
  )

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ACTION_CHECKS_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, boolean>
      if (parsed && typeof parsed === 'object') {
        setCheckedActions(parsed)
      }
    } catch {
      setCheckedActions({})
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(ACTION_CHECKS_STORAGE_KEY, JSON.stringify(checkedActions))
  }, [checkedActions])

  const completedCount = actionCheckKeys.reduce((count, key) => count + (checkedActions[key] ? 1 : 0), 0)

  const handleToggleAction = (key: string) => {
    setCheckedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const getStatusChipClass = (status: string) => {
    const normalized = status.toLowerCase()
    if (normalized === 'pending') {
      return 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    }
    if (normalized === 'done' || normalized === 'completed') {
      return 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
    }
    return 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
  }

  const getDueChipClass = (dueText: string) => {
    if (dueText === 'Today') {
      return 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
    }
    if (dueText === 'In 1 day') {
      return 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    }
    return 'border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300'
  }

  return (
    <Protected>
      <LayoutShell title="Dashboard">
        <div className="mx-auto w-full max-w-7xl">
          {showStartReflectionHero ? (
            <section className="mb-6 rounded-xl border border-[var(--wa-border)] bg-gradient-to-r from-[var(--wa-panel)] via-[var(--wa-panel)] to-[var(--wa-panel-soft)] p-8 shadow-sm">
              <p className="text-lg font-semibold text-[var(--wa-accent)]">Good Morning, {greetingName}</p>
              <h2 className="mt-3 max-w-4xl font-display text-5xl font-semibold leading-[1.05] text-[var(--wa-text)]">
                How are you feeling today?
              </h2>
              <p className="mt-5 max-w-3xl text-xl leading-relaxed text-[var(--wa-muted)]">
                Take a moment to reflect. Even a short check-in can help center your thoughts for the day ahead.
              </p>
              <div className="mt-8">
                <Link
                  href="/reflect"
                  className="inline-flex items-center rounded-md bg-[var(--wa-accent)] px-8 py-3 text-lg font-semibold text-white transition hover:bg-[var(--wa-accent-strong)]"
                >
                  Start Reflection
                </Link>
              </div>
            </section>
          ) : null}

          <div className="grid auto-rows-[minmax(150px,auto)] grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="rounded-xl border border-[var(--wa-border)] bg-gradient-to-br from-[var(--wa-panel)] via-[var(--wa-panel)] to-[var(--wa-panel-soft)] p-8 shadow-sm lg:col-span-8">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--wa-accent)]">Current State</p>
              <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.05] text-[var(--wa-text)] sm:text-5xl">
                {isLoading ? 'Loading dashboard...' : dashboard?.current_state || 'No state available'}
              </h2>
              <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-[var(--wa-muted)]">
                {isLoading
                  ? 'Fetching your dashboard summary.'
                  : 'Live summary from your dashboard endpoint for today.'}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className={`rounded-md border px-3 py-1.5 ${moodToneClass}`}>{moodTone}</span>
                <span className="rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-3 py-1.5 text-[var(--wa-muted)]">
                  Last entry: {formatDateLabel(dashboard?.last_entry_date)}
                </span>
                <span className="rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-3 py-1.5 text-[var(--wa-muted)]">
                  Current date: {formatDateLabel(dashboard?.current_date)}
                </span>
              </div>
            </section>

            <section className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-7 shadow-sm lg:col-span-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">Your Progress</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="font-display text-6xl font-semibold leading-none text-[var(--wa-text)]">{dashboard?.progress?.streak_days ?? 0}</p>
                <Flame className="h-9 w-9 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="mt-2 font-body text-base text-amber-600 dark:text-amber-400">day streak</p>
              <p className="mt-4 text-base text-[var(--wa-muted)]">
                Total entries: {dashboard?.progress?.total_entries ?? 0} · Weekly entries: {dashboard?.progress?.weekly_entries ?? 0}
              </p>
            </section>

            <section className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-7 shadow-sm lg:col-span-12">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--wa-accent)]">Try This Today</p>
              <p className="mt-2 text-base text-[var(--wa-muted)]">
                {completedCount}/{tryTodayItems.length} completed
              </p>
              <ol className="mt-5 space-y-3">
                {tryTodayItems.map((item, index) => (
                  <li key={`${item.action}-${index}`} className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-4 py-3.5">
                    <label className="flex cursor-pointer items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[var(--wa-border)] text-xs font-semibold text-[var(--wa-muted)]">
                        {index + 1}
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(checkedActions[actionCheckKeys[index]])}
                        onChange={() => handleToggleAction(actionCheckKeys[index])}
                        className="mt-0.5 h-6 w-6 rounded border-[var(--wa-border)] bg-[var(--wa-panel)] text-[var(--wa-accent)] focus:ring-2 focus:ring-[var(--wa-accent)]"
                      />
                      <span
                        className={`font-body text-base leading-relaxed ${checkedActions[actionCheckKeys[index]] ? 'text-[var(--wa-muted)] line-through' : 'text-[var(--wa-text)]'}`}
                      >
                        {item.action}
                      </span>
                    </label>
                    <div className="mt-3 ml-9 flex flex-wrap gap-2">
                      <span className={`rounded-md border px-3 py-1 text-sm font-medium capitalize ${getStatusChipClass(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`rounded-md border px-3 py-1 text-sm font-medium ${getDueChipClass(item.dueText)}`}>
                        {item.dueText}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-base text-[var(--wa-muted)]">Pulled directly from the dashboard try_this_today output.</p>
            </section>

            <section className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-7 shadow-sm lg:col-span-12">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--wa-accent)]">What We&apos;re Noticing</p>
                <Lightbulb className="h-4 w-4 text-[var(--wa-accent)]" />
              </div>
              <div className="mt-5 space-y-3.5">
                {(noticingItems.length > 0
                  ? noticingItems
                  : [{ title: 'Insight', summary: 'No insight rows available yet.' }]
                ).map((insight, index) => (
                  <article key={`${insight.title}-${index}`} className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] p-4">
                    <p className="font-display text-lg font-semibold text-[var(--wa-text)]">{insight.title}</p>
                    <p className="mt-2 font-body text-base leading-relaxed text-[var(--wa-text)]">{insight.summary}</p>
                  </article>
                ))}
              </div>
              <p className="mt-4 text-base text-[var(--wa-muted)]">Pulled directly from the dashboard insights output.</p>
            </section>
          </div>
        </div>
      </LayoutShell>
    </Protected>
  )
}
