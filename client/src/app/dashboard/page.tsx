'use client'
import Link from 'next/link'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useGetProfileQuery } from '@/app/(auth)/redux/auth.api'
import { useListJournalsQuery } from '@/features/journal/journal.api'
import { IJournalItem } from '@/features/journal/journal.types'
import { Flame, Lightbulb } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const ACTION_CHECKS_STORAGE_KEY = 'wa.dashboard.tryTodayChecks.v1'

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const computeStreak = (entries: IJournalItem[]) => {
  const daySet = new Set(entries.map((entry) => entry.date))
  let streak = 0
  const cursor = new Date()

  while (daySet.has(formatDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

const scoreMood = (entries: IJournalItem[]) => {
  const positiveTerms = ['calm', 'better', 'grateful', 'good', 'steady', 'clear', 'confident']
  const stressTerms = ['stress', 'anxious', 'overwhelmed', 'tired', 'panic', 'worry', 'drained']

  let score = 0
  for (const entry of entries) {
    const text = entry.free_text.toLowerCase()
    for (const term of positiveTerms) {
      if (text.includes(term)) score += 1
    }
    for (const term of stressTerms) {
      if (text.includes(term)) score -= 1
    }
  }

  if (score >= 3) return { label: 'Stable and improving', tone: 'positive' as const }
  if (score <= -3) return { label: 'Under pressure, needs grounding', tone: 'heavy' as const }
  return { label: 'Mixed but self-aware', tone: 'neutral' as const }
}

const formatListValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatListValue(item)).filter(Boolean).join(', ')
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const preferredKeys = ['text', 'message', 'insight', 'action', 'title', 'label', 'value', 'summary']
    for (const key of preferredKeys) {
      if (record[key] !== undefined && record[key] !== null) {
        const normalized = formatListValue(record[key])
        if (normalized) return normalized
      }
    }

    const firstPrimitive = Object.values(record).find(
      (entry) => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean'
    )
    if (firstPrimitive !== undefined) return String(firstPrimitive)

    return ''
  }

  return String(value)
}

const uniqueFirst = (values: unknown[], limit: number) => {
  const seen = new Set<string>()
  const picked: string[] = []

  for (const value of values) {
    const str = formatListValue(value)
    const normalized = str.trim()
    if (!normalized) continue
    if (seen.has(normalized.toLowerCase())) continue
    seen.add(normalized.toLowerCase())
    picked.push(normalized)
    if (picked.length >= limit) break
  }

  return picked
}

const toRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }
  return {}
}

const formatDueDays = (days: unknown): string | null => {
  if (typeof days !== 'number' || Number.isNaN(days)) return null
  if (days <= 0) return 'Today'
  if (days === 1) return 'In 1 day'
  return `In ${days} days`
}

export default function DashboardPage() {
  const { data, isLoading } = useListJournalsQuery()
  const { data: profile } = useGetProfileQuery()
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({})

  const journals = data?.items ?? []

  const sortedEntries = useMemo(() => {
    return [...journals].sort((a, b) => b.date.localeCompare(a.date))
  }, [journals])

  const latestEntries = sortedEntries.slice(0, 7)
  const mood = scoreMood(latestEntries)
  const streak = computeStreak(journals)
  const todayDateKey = useMemo(() => formatDateKey(new Date()), [])
  const hasFilledTodayEntry = useMemo(
    () => journals.some((entry) => entry.date === todayDateKey),
    [journals, todayDateKey]
  )

  const greetingName = useMemo(() => {
    const name = profile?.name?.trim()
    if (!name) return 'there'
    return name
  }, [profile?.name])

  const showStartReflectionHero = !hasFilledTodayEntry

  const latestEntryLabel = useMemo(() => {
    if (!sortedEntries[0]?.date) return 'No entries yet'
    const date = new Date(`${sortedEntries[0].date}T00:00:00`)
    return Number.isNaN(date.getTime())
      ? sortedEntries[0].date
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }, [sortedEntries])

  const latestEntryCreatedAtLabel = useMemo(() => {
    if (!sortedEntries[0]?.created_at) return null
    const date = new Date(sortedEntries[0].created_at)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [sortedEntries])

  const latestStructuredEntry = useMemo(() => {
    return sortedEntries.find((entry) => {
      const insights = (entry.insights ?? []) as unknown[]
      const actions = (entry.micro_actions ?? []) as unknown[]
      return insights.length > 0 || actions.length > 0
    })
  }, [sortedEntries])

  const noticingItems = useMemo(() => {
    const rawInsights = ((latestStructuredEntry?.insights ?? []) as unknown[]).slice(0, 3)

    if (rawInsights.length > 0) {
      return rawInsights.map((item, index) => {
        const insight = toRecord(item)
        const title = typeof insight.title === 'string' && insight.title.trim()
          ? insight.title.trim()
          : `Insight ${index + 1}`

        const summary = typeof insight.summary === 'string' && insight.summary.trim()
          ? insight.summary.trim()
          : formatListValue(item)

        const tags = Array.isArray(insight.tags)
          ? insight.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
          : []

        return { title, summary, tags }
      })
    }

    return uniqueFirst(sortedEntries.flatMap((entry) => entry.insights ?? []), 3).map((text, index) => ({
      title: `Insight ${index + 1}`,
      summary: text,
      tags: [],
    }))
  }, [latestStructuredEntry, sortedEntries])

  const tryTodayItems = useMemo(() => {
    const rawActions = ((latestStructuredEntry?.micro_actions ?? []) as unknown[]).slice(0, 3)

    if (rawActions.length > 0) {
      return rawActions.map((item) => {
        const actionItem = toRecord(item)
        const action = typeof actionItem.action === 'string' && actionItem.action.trim()
          ? actionItem.action.trim()
          : formatListValue(item)

        const status = typeof actionItem.status === 'string' ? actionItem.status : null
        const dueText = formatDueDays(actionItem.due_days)

        return { action, status, dueText }
      }).filter((item) => item.action.length > 0)
    }

    const fromActions = uniqueFirst(sortedEntries.flatMap((entry) => entry.micro_actions ?? []), 2)
      .map((action) => ({ action, status: 'pending', dueText: null }))

    if (fromActions.length > 0) return fromActions

    if (mood.tone === 'heavy') {
      return [{ action: 'Take a 2-minute breathing reset before your next task.', status: 'pending', dueText: 'Today' }]
    }

    if (mood.tone === 'positive') {
      return [{ action: 'Capture one win and repeat the routine that helped today.', status: 'pending', dueText: 'Today' }]
    }

    return [{ action: 'Write one sentence about what felt hardest and one next step.', status: 'pending', dueText: 'Today' }]
  }, [latestStructuredEntry, sortedEntries, mood.tone])

  const todayKey = useMemo(() => formatDateKey(new Date()), [])

  const actionCheckKeys = useMemo(
    () => tryTodayItems.map((item, index) => `${todayKey}::${index}::${item.action}`),
    [tryTodayItems, todayKey]
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

  const moodToneClass =
    mood.tone === 'positive'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      : mood.tone === 'heavy'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300'

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
      <LayoutShell
        title="Dashboard"
      >
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
                {isLoading ? 'Checking recent entries...' : mood.label}
              </h2>
              <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-[var(--wa-muted)]">
                {isLoading
                  ? 'Analyzing your journal activity.'
                  : 'Computed from your last entries so you can quickly see where you are right now.'}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-medium">
                <span className={`rounded-md border px-3 py-1.5 ${moodToneClass}`}>{mood.tone}</span>
                <span className="rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-3 py-1.5 text-[var(--wa-muted)]">
                  Last entry: {latestEntryLabel}
                </span>
                {latestEntryCreatedAtLabel ? (
                  <span className="rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-3 py-1.5 text-[var(--wa-muted)]">
                    Logged: {latestEntryCreatedAtLabel}
                  </span>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-7 shadow-sm lg:col-span-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">Your Progress</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="font-display text-6xl font-semibold leading-none text-[var(--wa-text)]">{streak}</p>
                <Flame className="h-9 w-9 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="mt-2 font-body text-base text-amber-600 dark:text-amber-400">day streak</p>
              <p className="mt-4 text-base text-[var(--wa-muted)]">Computed streak from consecutive journal days.</p>
            </section>

            <section className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-7 shadow-sm lg:col-span-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--wa-accent)]">What We&apos;re Noticing</p>
                <Lightbulb className="h-4 w-4 text-[var(--wa-accent)]" />
              </div>
              <div className="mt-5 space-y-3.5">
                {(noticingItems.length > 0 ? noticingItems : [{ title: 'Insight', summary: 'No insight rows available yet.', tags: [] }]).map((insight, index) => (
                  <article key={`${insight.title}-${index}`} className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] p-4">
                    <p className="font-display text-lg font-semibold text-[var(--wa-text)]">{insight.title}</p>
                    <p className="mt-2 font-body text-base leading-relaxed text-[var(--wa-text)]">{insight.summary}</p>
                    {insight.tags.length > 0 ? (
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        {insight.tags.map((tag, tagIndex) => (
                          <span
                            key={`${insight.title}-${tag}`}
                            className={`rounded-md border px-3 py-1 text-sm font-medium ${
                              tagIndex % 3 === 0
                                ? 'border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300'
                                : tagIndex % 3 === 1
                                  ? 'border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                                  : 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
              <p className="mt-4 text-base text-[var(--wa-muted)]">Pulled directly from your insights table entries.</p>
            </section>

            <section className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-7 shadow-sm lg:col-span-6">
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
                    {(item.status || item.dueText) ? (
                      <div className="mt-3 ml-9 flex flex-wrap gap-2">
                        {item.status ? (
                          <span className={`rounded-md border px-3 py-1 text-sm font-medium capitalize ${getStatusChipClass(item.status)}`}>
                            {item.status}
                          </span>
                        ) : null}
                        {item.dueText ? (
                          <span className={`rounded-md border px-3 py-1 text-sm font-medium ${getDueChipClass(item.dueText)}`}>
                            {item.dueText}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-base text-[var(--wa-muted)]">From micro_action and suggestion outputs in your latest entries.</p>
            </section>
          </div>
        </div>
      </LayoutShell>
    </Protected>
  )
}
