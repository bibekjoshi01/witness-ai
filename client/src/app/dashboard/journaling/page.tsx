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
      <LayoutShell title="Journaling" subtitle="Your space for gentle reflection.">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="rounded-2xl border border-slate-20 p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">Daily Reflection Calendar</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-slate-100">
                Pick a date to view or submit
              </h2>

              <div className="mt-6 w-full rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 p-5 shadow-md shadow-slate-200/60 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={displayedMonth.getMonth()}
                      onChange={(event) => {
                        const nextMonth = Number(event.target.value)
                        setDisplayedMonth(new Date(displayedMonth.getFullYear(), nextMonth, 1))
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
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
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
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

                <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                    <span key={day} className="rounded-md bg-slate-100 py-2 dark:bg-slate-700/70">{day}</span>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1.5">
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
                        className={`group relative h-16 w-16 rounded-xl border text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                          isSelected
                            ? isFilled
                              ? 'border-emerald-700 bg-emerald-600 text-white shadow-md shadow-emerald-200/70 dark:border-emerald-500 dark:bg-emerald-600 dark:shadow-none'
                              : 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-300/70 dark:border-sky-500 dark:bg-sky-600 dark:shadow-none'
                            : isFilled
                              ? 'border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
                            : isToday
                              ? 'border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-300 dark:hover:bg-sky-900/70'
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
                          <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-500" />
                        ) : null}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    Today
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Filled day
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-sky-600" />
                    Selected date
                  </span>
                </div>
              </div>
            </div>

          {isDateModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-6" role="dialog" aria-modal="true">
              <div className="h-[92vh] w-[96vw] max-w-[1400px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 md:px-8 md:py-5 dark:border-slate-700">
                  <h3 className="font-display text-2xl font-semibold text-slate-900 md:text-3xl dark:text-slate-100">Selected Date Entry</h3>
                  <button
                    type="button"
                    onClick={() => setIsDateModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    aria-label="Close entry popup"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-[calc(92vh-88px)] overflow-y-auto px-5 py-5 md:px-8 md:py-6">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-base font-semibold text-slate-700 md:text-lg dark:text-slate-300">{new Date(selectedDate).toLocaleDateString()}</p>
                    <button
                      type="button"
                      onClick={() => refetchByDate()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>

                  {isFetchingByDate ? (
                    <p className="mt-4 text-base text-slate-600 dark:text-slate-400">Loading entry...</p>
                  ) : null}

                  {byDateError && !isNoEntryForDate ? (
                    <p className="mt-4 text-base text-rose-600">Could not load selected date entry.</p>
                  ) : null}

                  {isNoEntryForDate ? (
                    <p className="mt-4 text-base text-slate-600 dark:text-slate-400">No entry yet for this date.</p>
                  ) : null}

                  {hasEntryForDate && journalByDate ? (
                    <article className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">{journalByDate.date}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">{new Date(journalByDate.created_at).toLocaleString()}</p>
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-slate-800 whitespace-pre-wrap md:text-lg dark:text-slate-200">{journalByDate.free_text}</p>

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <section>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Insights</p>
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
                                <div key={`modal-insight-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 dark:border-slate-700 dark:bg-slate-900">
                                  {title ? (
                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                                  ) : null}
                                  {summary ? (
                                    <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">{summary}</p>
                                  ) : (
                                    <p className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-300">{formatListValue(item)}</p>
                                  )}
                                  {tags.length ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {tags.map((tag, tagIndex) => (
                                        <span
                                          key={`modal-insight-tag-${index}-${tagIndex}`}
                                          className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
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
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No insights for this entry.</p>
                        )}
                      </section>

                      <section>
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Micro Actions</p>
                        {Array.isArray(journalByDate.micro_actions) && journalByDate.micro_actions.length ? (
                          <div className="mt-3 space-y-3">
                            {journalByDate.micro_actions.map((item, index) => {
                              const actionItem = toRecord(item)
                              const actionText = typeof actionItem?.action === 'string' ? actionItem.action : null
                              const status = typeof actionItem?.status === 'string' ? actionItem.status : null
                              const dueText = formatDueDays(actionItem?.due_days)

                              return (
                                <div key={`modal-micro-action-${index}`} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 dark:border-slate-700 dark:bg-slate-900">
                                  <p className="text-base leading-relaxed text-slate-800 md:text-lg dark:text-slate-200">{actionText ?? formatListValue(item)}</p>
                                  {(status || dueText) ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {status ? (
                                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                          {status}
                                        </span>
                                      ) : null}
                                      {dueText ? (
                                        <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300">
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
                          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No micro actions for this entry.</p>
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
