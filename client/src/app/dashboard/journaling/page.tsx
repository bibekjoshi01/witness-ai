'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, RefreshCcw, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateJournalMutation, useGetJournalByDateQuery, useListJournalsQuery } from '@/features/journal/journal.api'

export default function JournalingPage() {
  const selectedDateDefault = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(selectedDateDefault)
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const d = new Date(selectedDateDefault)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [dailyReflection, setDailyReflection] = useState('')
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filtersDraft, setFiltersDraft] = useState({
    start_date: '',
    end_date: '',
  })
  const [filtersApplied, setFiltersApplied] = useState(filtersDraft)

  const queryParams = useMemo(() => {
    return {
      start_date: filtersApplied.start_date || undefined,
      end_date: filtersApplied.end_date || undefined,
    }
  }, [filtersApplied])

  const [createJournal, { isLoading: isSaving }] = useCreateJournalMutation()
  const {
    data: journalByDate,
    isFetching: isFetchingByDate,
    error: byDateError,
    refetch: refetchByDate,
  } = useGetJournalByDateQuery(selectedDate)
  const {
    data: journalsResponse,
    isLoading: isLoadingJournals,
    isFetching: isFetchingJournals,
    isError: isJournalError,
    refetch,
  } = useListJournalsQuery(queryParams)
  const monthMarkerParams = useMemo(() => {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const year = displayedMonth.getFullYear()
    const month = displayedMonth.getMonth()
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)

    return {
      start_date: formatDate(monthStart),
      end_date: formatDate(monthEnd),
    }
  }, [displayedMonth])
  const { data: monthEntriesResponse } = useListJournalsQuery(monthMarkerParams)

  const byDateStatus = byDateError as { status?: number } | undefined
  const isNoEntryForDate = byDateStatus?.status === 404
  const hasEntryForDate = Boolean(journalByDate)
  const todayDateKey = new Date().toISOString().slice(0, 10)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const toDateKey = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  useEffect(() => {
    const selected = new Date(selectedDate)
    if (Number.isNaN(selected.getTime())) return

    setDisplayedMonth((prev) => {
      if (
        prev.getFullYear() === selected.getFullYear() &&
        prev.getMonth() === selected.getMonth()
      ) {
        return prev
      }
      return new Date(selected.getFullYear(), selected.getMonth(), 1)
    })
  }, [selectedDate])

  const calendarDays = useMemo(() => {
    const year = displayedMonth.getFullYear()
    const month = displayedMonth.getMonth()
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7
    const startDate = new Date(year, month, 1 - firstDay)

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + index)
      return {
        date,
        isCurrentMonth: date.getMonth() === month,
      }
    })
  }, [displayedMonth])

  const selectableYears = useMemo(() => {
    const year = displayedMonth.getFullYear()
    return Array.from({ length: 13 }, (_, i) => year - 6 + i)
  }, [displayedMonth])

  const filledDateSet = useMemo(() => {
    return new Set((monthEntriesResponse?.items ?? []).map((entry) => entry.date))
  }, [monthEntriesResponse])

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
      const preferredKeys = ['text', 'message', 'insight', 'action', 'title', 'label', 'value']
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

      return JSON.stringify(record)
    }

    return String(value)
  }

  const formatDueDays = (days: unknown): string | null => {
    if (typeof days !== 'number' || Number.isNaN(days)) return null
    if (days <= 0) return 'Today'
    if (days === 1) return 'In 1 day'
    return `In ${days} days`
  }

  const toRecord = (value: unknown): Record<string, unknown> => {
    if (typeof value === 'object' && value !== null) {
      return value as Record<string, unknown>
    }
    return {}
  }

  const handleSave = async () => {
    const text = dailyReflection.trim()
    if (!text) return

    try {
      await createJournal({
        date: selectedDate,
        free_text: text,
        questions: [],
        insights: [],
        micro_actions: [],
      }).unwrap()
      toast.success('Journal entry saved')
      setDailyReflection('')
      refetchByDate()
      refetch()
    } catch {
      toast.error('Unable to save journal entry')
    }
  }

  const handleApplyFilters = () => {
    setFiltersApplied(filtersDraft)
  }

  const handleResetFilters = () => {
    const reset = {
      start_date: '',
      end_date: '',
    }
    setFiltersDraft(reset)
    setFiltersApplied(reset)
  }

  return (
    <Protected>
      <LayoutShell title="Journaling">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-8">
              <p className="text-sm font-medium uppercase tracking-wide text-[var(--wa-muted)]">Daily Reflection Calendar</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--wa-text)]">
                Pick a date to view or submit
              </h2>

              <div className="mt-6 w-full rounded-3xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={displayedMonth.getMonth()}
                      onChange={(event) => {
                        const nextMonth = Number(event.target.value)
                        setDisplayedMonth(new Date(displayedMonth.getFullYear(), nextMonth, 1))
                      }}
                      className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-2.5 py-1.5 text-xs font-semibold text-[var(--wa-text)] outline-none transition hover:bg-[var(--wa-panel-soft)] focus:border-[var(--wa-accent)] focus:ring-2 focus:ring-[var(--wa-accent-soft)]"
                      aria-label="Select month"
                    >
                      {monthNames.map((month, index) => (
                        <option key={month} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={displayedMonth.getFullYear()}
                      onChange={(event) => {
                        const nextYear = Number(event.target.value)
                        setDisplayedMonth(new Date(nextYear, displayedMonth.getMonth(), 1))
                      }}
                      className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-2.5 py-1.5 text-xs font-semibold text-[var(--wa-text)] outline-none transition hover:bg-[var(--wa-panel-soft)] focus:border-[var(--wa-accent)] focus:ring-2 focus:ring-[var(--wa-accent-soft)]"
                      aria-label="Select year"
                    >
                      {selectableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-7 justify-items-center gap-1.5 text-center text-sm font-semibold uppercase tracking-wide text-[var(--wa-muted)]">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                    <span
                      key={day}
                      className="w-16 rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] py-2"
                    >
                      {day}
                    </span>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 justify-items-center gap-1.5">
                  {calendarDays.map((day) => {
                    const dateKey = toDateKey(day.date)
                    const isSelected = dateKey === selectedDate
                    const isToday = dateKey === todayDateKey
                    const isFilled = filledDateSet.has(dateKey)
                    const dayOfWeek = day.date.getDay()
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateKey)
                          if (!day.isCurrentMonth) {
                            setDisplayedMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1))
                          }
                          if (isFilled) {
                            setIsDateModalOpen(true)
                          }
                        }}
                        className={`group relative h-16 w-16 rounded-xl border text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wa-accent)] ${
                          isSelected
                            ? isFilled
                              ? 'border-emerald-700 bg-emerald-600 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-600 dark:shadow-none'
                              : isToday
                                ? 'border-amber-700 bg-amber-600 text-white shadow-sm dark:border-amber-500 dark:bg-amber-600 dark:shadow-none'
                                : 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-[var(--wa-accent)] dark:bg-[var(--wa-accent)] dark:shadow-none'
                            : isFilled
                              ? 'border-emerald-400 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/70'
                            : isToday
                              ? 'border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/70'
                            : !day.isCurrentMonth
                              ? 'border-slate-100 bg-slate-50/60 text-slate-400 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-800'
                            : isWeekend
                              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                        aria-label={`Select ${day.date.toDateString()}`}
                      >
                        {day.date.getDate()}
                        {isToday && !isSelected ? (
                          <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--wa-accent)]" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--wa-accent)]" />
                    Today
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Filled day
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-[var(--wa-accent)]" />
                    Selected date
                  </span>
                </div>
              </div>
            </div>

          {isDateModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 md:p-6" role="dialog" aria-modal="true">
              <div className="h-[92vh] w-[96vw] max-w-[1320px] overflow-hidden rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] shadow-xl">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--wa-border)] px-5 py-4 md:px-8 md:py-5">
                  <h3 className="font-display text-2xl font-semibold text-[var(--wa-text)] md:text-3xl">Selected Date Entry</h3>
                  <button
                    type="button"
                    onClick={() => setIsDateModalOpen(false)}
                    className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] p-2.5 text-[var(--wa-muted)] transition hover:bg-[var(--wa-panel-soft)] hover:text-[var(--wa-text)]"
                    aria-label="Close entry popup"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-[calc(92vh-88px)] overflow-y-auto px-5 py-5 md:px-8 md:py-6">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-4 py-3">
                    <p className="text-base font-semibold text-[var(--wa-text)] md:text-lg">{new Date(selectedDate).toLocaleDateString()}</p>
                    <button
                      type="button"
                      onClick={() => refetchByDate()}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-3.5 py-2 text-sm font-semibold text-[var(--wa-text)] transition hover:bg-[var(--wa-panel-soft)]"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>

                  {isFetchingByDate ? (
                    <p className="mt-4 text-base text-[var(--wa-muted)]">Loading entry...</p>
                  ) : null}

                  {byDateError && !isNoEntryForDate ? (
                    <p className="mt-4 text-base text-rose-600">Could not load selected date entry.</p>
                  ) : null}

                  {isNoEntryForDate ? (
                    <p className="mt-4 text-base text-[var(--wa-muted)]">No entry yet for this date.</p>
                  ) : null}

                  {hasEntryForDate && journalByDate ? (
                    <article className="mt-4 rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--wa-muted)]">{journalByDate.date}</p>
                      <p className="text-sm text-[var(--wa-muted)]">{new Date(journalByDate.created_at).toLocaleString()}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-[var(--wa-text)] md:text-lg">{journalByDate.free_text}</p>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <section>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--wa-muted)]">Insights</p>
                        {Array.isArray(journalByDate.insights) && journalByDate.insights.length ? (
                          <div className="mt-3 space-y-3">
                            {journalByDate.insights.map((item, index) => {
                              const insight = toRecord(item)
                              const title = typeof insight?.title === 'string' ? insight.title : null
                              const summary = typeof insight?.summary === 'string' ? insight.summary : null
                              const tags = Array.isArray(insight?.tags)
                                ? insight.tags.filter((tag): tag is string => typeof tag === 'string')
                                : []

                              return (
                                <div key={`modal-insight-${index}`} className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] p-4 md:p-5">
                                  {title ? (
                                    <p className="text-lg font-semibold text-[var(--wa-text)]">{title}</p>
                                  ) : null}
                                  {summary ? (
                                    <p className="mt-2 text-base leading-relaxed text-[var(--wa-text)]">{summary}</p>
                                  ) : (
                                    <p className="mt-2 text-base leading-relaxed text-[var(--wa-text)]">{formatListValue(item)}</p>
                                  )}
                                  {tags.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {tags.map((tag, tagIndex) => (
                                        <span
                                          key={`modal-insight-tag-${index}-${tagIndex}`}
                                          className="rounded-full border border-[var(--wa-border)] px-2.5 py-1 text-xs font-medium text-[var(--wa-muted)]"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--wa-muted)]">No insights for this entry.</p>
                        )}
                      </section>

                      <section>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--wa-muted)]">Micro Actions</p>
                        {Array.isArray(journalByDate.micro_actions) && journalByDate.micro_actions.length ? (
                          <div className="mt-3 space-y-3">
                            {journalByDate.micro_actions.map((item, index) => {
                              const actionItem = toRecord(item)
                              const actionText = typeof actionItem?.action === 'string' ? actionItem.action : null
                              const status = typeof actionItem?.status === 'string' ? actionItem.status : null
                              const dueText = formatDueDays(actionItem?.due_days)

                              return (
                                <div key={`modal-micro-action-${index}`} className="rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] p-4 md:p-5">
                                  <p className="text-base leading-relaxed text-[var(--wa-text)] md:text-lg">{actionText ?? formatListValue(item)}</p>
                                  {(status || dueText) ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {status ? (
                                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                          {status}
                                        </span>
                                      ) : null}
                                      {dueText ? (
                                        <span className="rounded-full border border-[var(--wa-border)] px-2.5 py-1 text-xs font-medium text-[var(--wa-muted)]">
                                          {dueText}
                                        </span>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-[var(--wa-muted)]">No micro actions for this entry.</p>
                        )}
                      </section>
                    </div>
                  </article>
                ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </LayoutShell>
    </Protected>
  )
}
