'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useState } from 'react'
import { Mic, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateJournalMutation, useListJournalsQuery } from '@/features/journal/journal.api'

export default function HomePage() {
  const profile = useSelector((s: RootState) => s.auth.profile)
  const [isReflecting, setIsReflecting] = useState(false)
  const [reflection, setReflection] = useState('')
  const [createJournal, { isLoading: isSaving }] = useCreateJournalMutation()
  const {
    data: journalsResponse,
    isLoading: isLoadingJournals,
    isFetching: isFetchingJournals,
    isError: isJournalError,
    refetch,
  } = useListJournalsQuery({ limit: 5, offset: 0 })

  const handleSave = async () => {
    const text = reflection.trim()
    if (!text) return

    const date = new Date().toISOString().slice(0, 10)

    try {
      await createJournal({
        date,
        free_text: text,
        questions: [],
      }).unwrap()
      toast.success('Journal entry saved')
      setReflection('')
      setIsReflecting(false)
    } catch {
      toast.error('Unable to save journal entry')
    }
  }

  return (
    <Protected>
      <LayoutShell title="Dashboard" subtitle="Your space for gentle reflection.">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Welcome Card */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border border-slate-200">
            <p className="text-sm text-slate-600 uppercase tracking-wide font-medium">Welcome</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
              {profile?.name || 'Friend'}
            </h2>
            <p className="mt-3 text-slate-700 text-base">Take a moment to reflect on what's on your mind.</p>
          </div>

          {/* Reflection Box */}
          <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-sm">
            {!isReflecting ? (
              <div className="text-center">
                <h3 className="font-display text-2xl font-semibold text-slate-900">Start a reflection</h3>
                <p className="mt-2 text-slate-600">What's on your mind today?</p>
                <button
                  onClick={() => setIsReflecting(true)}
                  className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-md hover:shadow-lg hover:bg-blue-600 transition"
                >
                  <Mic className="h-7 w-7" />
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label htmlFor="reflection" className="block text-sm font-semibold text-slate-900 mb-2">
                    Your thoughts
                  </label>
                  <textarea
                    id="reflection"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={6}
                    placeholder="What's on your mind?"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 text-white px-5 py-2.5 font-medium hover:bg-blue-600 transition disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsReflecting(false)
                      setReflection('')
                    }}
                    className="flex-1 rounded-lg border border-slate-300 text-slate-900 px-5 py-2.5 font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-semibold text-slate-900">Recent journal entries</h3>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Refresh
              </button>
            </div>

            {isLoadingJournals || isFetchingJournals ? (
              <p className="mt-4 text-sm text-slate-600">Loading entries...</p>
            ) : null}

            {isJournalError ? (
              <p className="mt-4 text-sm text-rose-600">Could not load journal entries right now.</p>
            ) : null}

            {!isLoadingJournals && !isJournalError && (journalsResponse?.items?.length ?? 0) === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No journal entries yet. Start with your first reflection above.</p>
            ) : null}

            <div className="mt-4 space-y-3">
              {journalsResponse?.items?.map((entry) => (
                <article key={entry.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{entry.date}</p>
                    <p className="text-xs text-slate-500">{new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{entry.free_text}</p>
                  {entry.mood ? <p className="mt-2 text-xs text-slate-600">Mood: {entry.mood}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </LayoutShell>
    </Protected>
  )
}

