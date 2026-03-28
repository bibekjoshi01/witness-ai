'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export default function HomePage() {
  const profile = useSelector((s: RootState) => s.auth.profile)
  return (
    <Protected>
      <LayoutShell>
        <div className="max-w-4xl mx-auto card p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/60">Welcome back</p>
              <h2 className="text-2xl font-semibold">{profile?.name || 'Friend'}</h2>
            </div>
            {profile?.profile_picture && (
              <img
                src={profile.profile_picture}
                alt="avatar"
                className="h-12 w-12 rounded-full border border-ink/10 object-cover"
              />
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-ink text-white">
              <p className="text-sm opacity-70">Next reflection</p>
              <p className="text-xl font-semibold mt-1">Ready when you are.</p>
              <p className="text-sm opacity-70 mt-1">We'll nudge you gently at your preferred time.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-ink/5">
              <p className="text-sm text-ink/60">Latest insight</p>
              <p className="text-lg font-semibold mt-1">Consistent low energy around deadlines.</p>
              <p className="text-sm text-ink/60">Try a micro-break + one small task before noon.</p>
            </div>
          </div>
        </div>
      </LayoutShell>
    </Protected>
  )
}

