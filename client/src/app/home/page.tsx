'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { useState } from 'react'
import { Mic, Sparkles, Wand2 } from 'lucide-react'

export default function HomePage() {
  const profile = useSelector((s: RootState) => s.auth.profile)
  const [isReflecting, setIsReflecting] = useState(false)
  const [reflection, setReflection] = useState('')
  return (
    <Protected>
      <LayoutShell title="Dashboard" subtitle="Your calm workspace for reflection and growth.">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="space-y-4">
            <div className="rounded-3xl border border-ink/10 bg-white/90 p-5 shadow-lg shadow-ink/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Welcome back</p>
                  <p className="font-display text-lg font-semibold">{profile?.name || 'Friend'}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink/60">
                Today's gentle focus: notice what feels heavy, then lighten it with one small action.
              </p>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Current sessions</p>
              <div className="mt-4 space-y-3">
                {[
                  { title: 'Morning check-in', time: '9:10 AM', note: 'Low energy, gentle start' },
                  { title: 'Anxious before meeting', time: '2:15 PM', note: 'Grounding first' },
                  { title: 'Evening reset', time: 'Yesterday', note: 'Short gratitude list' },
                ].map((item) => (
                  <button
                    key={item.title}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left transition hover:border-ink/20 hover:bg-ink/5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <span className="text-xs text-ink/50">{item.time}</span>
                    </div>
                    <p className="text-xs text-ink/60">{item.note}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div
              id="reflect"
              className="rounded-[32px] border border-ink/10 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]"
            >
              {!isReflecting ? (
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-ink/60">
                    Voice first
                  </span>
                  <h2 className="mt-6 font-display text-3xl font-semibold text-ink">
                    What's been on your mind lately?
                  </h2>
                  <p className="mt-3 text-sm text-ink/60">
                    Tap the mic to begin. We'll capture the voice note and open the reflection form
                    automatically.
                  </p>
                  <button
                    onClick={() => setIsReflecting(true)}
                    className="mx-auto mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-ink text-white shadow-lg shadow-ink/20 transition hover:translate-y-[-2px]"
                  >
                    <Mic className="h-8 w-8" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">Voice capture active</p>
                      <p className="text-xs text-ink/60">Share what you're noticing, then refine below.</p>
                    </div>
                  </div>
                  <label className="text-xs uppercase tracking-[0.2em] text-ink/50" htmlFor="reflection">
                    Reflection notes
                  </label>
                  <textarea
                    id="reflection"
                    value={reflection}
                    onChange={(event) => setReflection(event.target.value)}
                    rows={6}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:border-ink/30"
                    placeholder="What felt heavy? What helped? What will you try next?"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90">
                      <Wand2 className="h-4 w-4" />
                      Save reflection
                    </button>
                    <button
                      onClick={() => setIsReflecting(false)}
                      className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5"
                    >
                      Finish
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div id="tasks" className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Grounding',
                  desc: 'Two-minute reset when anxiety spikes.',
                },
                {
                  title: 'Pattern check',
                  desc: 'Spot recurring stress loops gently.',
                },
                {
                  title: 'Plan to task',
                  desc: "Turn today's reflection into one doable step.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-ink/10 bg-white/90 p-4 shadow-sm transition hover:border-ink/20"
                >
                  <p className="font-display text-base font-semibold text-ink">{card.title}</p>
                  <p className="mt-2 text-xs text-ink/60">{card.desc}</p>
                  <button className="mt-4 text-xs font-semibold text-ink/70 hover:text-ink">
                    Try now -&gt;
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </LayoutShell>
    </Protected>
  )
}

