'use client'

import { LayoutShell } from '@/components/LayoutShell'
import MarkdownRenderer from '@/components/markdown/markdown-renderer'
import { Protected } from '@/components/Protected'
import { useGetProfileQuery } from '@/app/(auth)/redux/auth.api'
import { RootState } from '@/lib/redux/store'
import {
  useGetSessionMessagesQuery,
  useListChatSessionsQuery,
  useSendChatMessageMutation,
} from '@/features/chat/chat.api'
import { IChatMessage } from '@/features/chat/chat.types'
import {
  CalendarCheck2,
  Check,
  CircleGauge,
  Copy,
  History,
  Paperclip,
  Plus,
  RefreshCcw,
  Send,
  Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'

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

const EMPTY_SESSIONS: Array<{ id: number; title: string; created_at: string; updated_at: string }> = []
const EMPTY_MESSAGES: IChatMessage[] = []

const formatTimeLabel = (dateValue: string) => {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ChatPage() {
  const profile = useSelector((s: RootState) => s.auth.profile)
  const { data: profileFromApi } = useGetProfileQuery()
  const [message, setMessage] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [isStartingNewChat, setIsStartingNewChat] = useState(false)
  const [localMessages, setLocalMessages] = useState<IChatMessage[]>([])
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const {
    data: sessionsData,
    isFetching: isFetchingSessions,
    refetch: refetchSessions,
  } = useListChatSessionsQuery()

  const {
    data: fetchedMessagesData,
    isFetching: isFetchingMessages,
    refetch: refetchMessages,
  } = useGetSessionMessagesQuery(activeSessionId as number, {
    skip: activeSessionId === null,
  })

  const sessions = sessionsData ?? EMPTY_SESSIONS
  const fetchedMessages = fetchedMessagesData ?? EMPTY_MESSAGES

  const [sendChatMessage, { isLoading: isSending }] = useSendChatMessageMutation()

  useEffect(() => {
    if (!sessions.length) {
      setActiveSessionId(null)
      return
    }

    if (isStartingNewChat) {
      return
    }

    if (activeSessionId === null || !sessions.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId, isStartingNewChat])

  useEffect(() => {
    if (activeSessionId === null) {
      setLocalMessages(EMPTY_MESSAGES)
      return
    }

    setLocalMessages(fetchedMessagesData ?? EMPTY_MESSAGES)
  }, [activeSessionId, fetchedMessagesData])

  useEffect(() => {
    if (!chatScrollRef.current) return
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }, [localMessages, isSending])

  const handleCopy = async (id: number, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(id)
      window.setTimeout(() => setCopiedMessageId(null), 2000)
    } catch {
      toast.error('Unable to copy message')
    }
  }

  const handleSendMessage = async () => {
    const content = message.trim()
    if (!content || isSending) return

    const optimisticUserMessage: IChatMessage = {
      id: Date.now(),
      session_id: activeSessionId ?? 0,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }

    setLocalMessages((prev) => [...prev, optimisticUserMessage])
    setMessage('')

    try {
      const payload = activeSessionId ? { message: content, session_id: activeSessionId } : { message: content }
      const response = await sendChatMessage(payload).unwrap()

      setIsStartingNewChat(false)
      setActiveSessionId(response.session_id)
      setLocalMessages(response.history)
      refetchSessions()
    } catch {
      const fallbackAssistantMessage: IChatMessage = {
        id: Date.now() + 1,
        session_id: activeSessionId ?? 0,
        role: 'assistant',
        content: 'Error connecting to chat service. Please try again in a moment.',
        created_at: new Date().toISOString(),
      }
      setLocalMessages((prev) => [...prev, fallbackAssistantMessage])
      toast.error('Unable to send message right now')
    }
  }

  const handleStartNewChat = () => {
    setIsStartingNewChat(true)
    setActiveSessionId(null)
    setLocalMessages([])
    setMessage('')
    setIsHistoryOpen(false)
  }

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  )

  const greetingName = useMemo(() => {
    const name = profile?.name?.trim() || profileFromApi?.name?.trim()
    return name && name.length > 0 ? name : 'there'
  }, [profile?.name, profileFromApi?.name])

  const showWelcomePanel = localMessages.length === 0

  return (
    <Protected>
      <LayoutShell
        title="Chat"
        headerActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNewChat}
              aria-label="Start new chat"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--wa-border)] bg-[var(--wa-panel)] px-3 text-xs font-semibold text-[var(--wa-text)] transition hover:bg-[var(--wa-panel-soft)]"
              title="Start a new chat"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>

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
          </div>
        }
      >
        <div className="h-[calc(100vh-120px)] min-h-[680px] w-full">
          <section className="relative flex h-full min-h-0 flex-col rounded-2xl border border-[var(--wa-border)] bg-[var(--wa-panel)] shadow-sm">
            {isHistoryOpen ? (
              <div className="absolute right-4 top-14 z-20 w-80 rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-3 shadow-xl">
                <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--wa-muted)]">Past chats</p>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {isFetchingSessions ? (
                    <p className="px-2 py-3 text-xs text-[var(--wa-muted)]">Loading sessions...</p>
                  ) : null}

                  {!isFetchingSessions && sessions.length === 0 ? (
                    <p className="px-2 py-3 text-xs text-[var(--wa-muted)]">No previous sessions yet.</p>
                  ) : null}

                  {sessions.map((session) => {
                    const isActive = session.id === activeSessionId
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => {
                          setIsStartingNewChat(false)
                          setActiveSessionId(session.id)
                          setIsHistoryOpen(false)
                        }}
                        className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                          isActive
                            ? 'border-[var(--wa-accent)] bg-[var(--wa-accent-soft)]'
                            : 'border-transparent bg-[rgba(255,255,255,0.05)] hover:border-[var(--wa-border)] hover:bg-[rgba(255,255,255,0.08)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-1 text-sm font-semibold text-[var(--wa-text)]">{session.title || 'Untitled session'}</p>
                          <span className="text-[11px] text-[var(--wa-muted)]">{formatTimeLabel(session.updated_at)}</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--wa-muted)]">Session #{session.id}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-8 py-10 lg:px-10">
              <div className="mx-auto w-full max-w-6xl">
                {showWelcomePanel ? (
                  <>
                    <h2 className="text-center font-display text-4xl font-semibold text-[var(--wa-text)]">
                      Hi, {greetingName}
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
                            onClick={() => setMessage(item.text)}
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
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-[var(--wa-text)]">
                        {activeSession?.title || 'Current chat'}
                      </p>
                      <button
                        type="button"
                        onClick={() => refetchMessages()}
                        className="inline-flex items-center gap-2 rounded-md border border-[var(--wa-border)] bg-[var(--wa-panel)] px-2.5 py-1.5 text-xs font-semibold text-[var(--wa-muted)] transition hover:bg-[var(--wa-panel-soft)] hover:text-[var(--wa-text)]"
                      >
                        <RefreshCcw className={`h-3.5 w-3.5 ${isFetchingMessages ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                    </div>

                    <div className="space-y-4">
                      {localMessages.map((chatMessage) => {
                        const isUser = chatMessage.role.toLowerCase() === 'user'
                        return (
                          <div
                            key={chatMessage.id}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[78%] rounded-xl border px-4 py-3 ${
                                isUser
                                  ? 'border-[var(--wa-accent)] bg-[var(--wa-accent-soft)] text-[var(--wa-text)]'
                                  : 'border-[var(--wa-border)] bg-[var(--wa-panel-soft)] text-[var(--wa-text)]'
                              }`}
                            >
                              <div className="[&>div]:mx-0 [&>div]:max-w-none [&>div]:px-0 [&>div]:text-inherit [&_p:last-child]:mb-0 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:my-3 [&_ol]:my-3">
                                <MarkdownRenderer content={chatMessage.content} />
                              </div>
                              <div className={`mt-2 flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(chatMessage.id, chatMessage.content)}
                                  className="rounded-md p-1 text-[var(--wa-muted)] transition hover:bg-[var(--wa-panel)] hover:text-[var(--wa-text)]"
                                  aria-label="Copy message"
                                >
                                  {copiedMessageId === chatMessage.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                                <p className="text-[11px] text-[var(--wa-muted)]">{formatTimeLabel(chatMessage.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {isSending ? (
                        <div className="flex justify-start">
                          <div className="max-w-[78%] rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel-soft)] px-4 py-3 text-sm text-[var(--wa-muted)]">
                            Thinking...
                          </div>
                        </div>
                      ) : null}

                      <div className="h-1 w-full" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-4">
              <div className="mx-auto w-full max-w-6xl">
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
                      onClick={handleSendMessage}
                      disabled={isSending || !message.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--wa-accent)] px-4 py-2 text-sm font-semibold text-[#090A0B] transition hover:opacity-90"
                    >
                      {isSending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isSending ? 'Sending...' : 'Send'}
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
