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
    iconStyle: 'bg-sky-100 text-sky-700',
  },
  {
    id: 'p2',
    title: 'Pattern Check',
    text: 'Spot repeated thought loops from today and reframe one gently.',
    icon: Sparkles,
    iconStyle: 'bg-indigo-100 text-indigo-700',
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
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Past chats"
          >
            <History className="h-4 w-4" />
          </button>
        }
      >
        <div className="h-[calc(100vh-120px)] min-h-[680px] w-full">
          <section className="relative flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {isHistoryOpen ? (
              <div className="absolute right-4 top-14 z-20 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Past chats</p>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {pastChats.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      className="w-full rounded-lg border border-transparent bg-slate-50 px-3 py-3 text-left transition hover:border-slate-200 hover:bg-white dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{chat.title}</p>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{chat.time}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{chat.preview}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-8 py-10 lg:px-10">
              <div className="mx-auto w-full max-w-6xl">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="text-center font-display text-4xl font-semibold text-slate-900 dark:text-slate-100">
                  Hi, {profile?.name || 'there'}
                </h2>
                <p className="mt-2 text-center text-slate-600 dark:text-slate-400">
                  I am here to listen, reflect, and help you process clearly.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {promptCards.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.iconStyle}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{item.text}</p>
                        <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Try now</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto w-full max-w-6xl">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Journal Entry
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Turn to Task
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Ask anything..."
                    className="w-full resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        className="rounded-md p-2 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                        aria-label="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <p className="text-xs">{message.length}/240</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
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
