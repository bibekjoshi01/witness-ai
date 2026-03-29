'use client'

import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { RootState } from '@/lib/redux/store'
import {
  CalendarCheck2,
  CircleGauge,
  History,
  Paperclip,
  Send,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'

const pastChats = [
  {
    id: 'c1',
    title: 'Anxiety before meeting',
    preview: 'I am feeling overwhelmed about this week\'s sprint planning...',
    time: '2m ago',
  },
  {
    id: 'c2',
    title: 'Morning check-in',
    preview: 'Feeling okay, a bit tired but ready for the day.',
    time: '9:00 AM',
  },
  {
    id: 'c3',
    title: 'Sleep pattern discussion',
    preview: 'I woke up a few times and felt restless overnight.',
    time: 'Yesterday',
  },
]

const promptCards = [
  {
    id: 'p1',
    title: 'Grounding Exercise',
    text: 'Try a short 60-second grounding sequence to settle racing thoughts.',
    icon: CircleGauge,
    iconStyle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  {
    id: 'p2',
    title: 'Pattern Check',
    text: 'Spot repeated thought loops from today and reframe one gently.',
    icon: Sparkles,
    iconStyle: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    id: 'p3',
    title: 'Plan to Task',
    text: 'Convert one reflection into a practical next step for tomorrow.',
    icon: CalendarCheck2,
    iconStyle: 'bg-amber-100 text-amber-700',
  },
]

export default function ChatPage() {
  const profile = useSelector((s: RootState) => s.auth.profile)
  const [message, setMessage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  return (
    <Protected>
      <LayoutShell
        title="Chat"
        headerActions={
          <button
            type="button"
            onClick={() => setIsHistoryOpen((prev) => !prev)}
            aria-label="Toggle past chats"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
              isHistoryOpen
                ? 'border-[var(--wa-accent)] bg-[rgba(0,209,129,0.12)] text-[var(--wa-accent)]'
                : 'border-[var(--wa-border)] bg-[var(--wa-panel)] text-[var(--wa-muted)] hover:bg-[var(--wa-panel)]'
            }`}
            title="Past chats"
          >
            <History className="h-4 w-4" />
          </button>
        }
      >
        <div className="h-[calc(100vh-120px)] min-h-[680px] w-full">
          <section className="relative flex h-full min-h-0 flex-col rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] shadow-sm">
            {isHistoryOpen ? (
              <div className="absolute right-4 top-14 z-20 w-80 rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-3 shadow-xl">
                <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--wa-muted)]">Past chats</p>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {pastChats.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      className="w-full rounded-lg border border-transparent bg-[rgba(255,255,255,0.05)] px-3 py-3 text-left transition hover:border-[var(--wa-border)] hover:bg-[rgba(255,255,255,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--wa-text)]">{chat.title}</p>
                        <span className="text-[11px] text-[var(--wa-muted)]">{chat.time}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-[var(--wa-muted)]">{chat.preview}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-10">
              <div className="mx-auto w-full max-w-6xl">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--wa-accent)] bg-[rgba(0,209,129,0.12)] text-[var(--wa-accent)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-center font-display text-4xl font-semibold text-[var(--wa-text)]">
                  Hi, {profile?.name || 'there'}
                </h2>
                <p className="mt-2 text-center text-[var(--wa-muted)]">
                  I am here to listen, reflect, and help you process clearly.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {promptCards.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="cursor-pointer rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-4 text-left transition hover:border-[var(--wa-border)] hover:bg-[var(--wa-panel-soft)]"
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.iconStyle}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-[var(--wa-text)]">{item.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-[var(--wa-muted)]">{item.text}</p>
                        <p className="mt-3 text-xs font-semibold text-[var(--wa-accent)]">Try now</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-4">
              <div className="mx-auto w-full max-w-6xl">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-[var(--wa-border)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs font-semibold text-[var(--wa-text)] hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    Journal Entry
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--wa-border)] bg-[rgba(255,255,255,0.05)] px-3 py-1 text-xs font-semibold text-[var(--wa-text)] hover:bg-[rgba(255,255,255,0.08)]"
                  >
                    Turn to Task
                  </button>
                </div>

                <div className="rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3">
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask anything..."
                    className="w-full resize-none bg-transparent text-sm text-[var(--wa-text)] placeholder:text-[var(--wa-muted)] outline-none"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--wa-muted)]">
                      <button
                        type="button"
                        className="rounded-md p-2 transition hover:bg-[var(--wa-panel-soft)]"
                        aria-label="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <p className="text-xs">{message.length}/240</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-accent)] px-4 py-2 text-sm font-semibold text-[#090A0B] transition hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutShell>
    </Protected>
  )
}
