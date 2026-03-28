'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export default function ProfilePage() {
  const profile = useSelector((s: RootState) => s.auth.profile)
  return (
    <Protected>
      <LayoutShell>
        <div className="max-w-3xl mx-auto card p-8 space-y-6">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <div className="flex items-center gap-4">
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="avatar"
                className="h-16 w-16 rounded-full border border-ink/10 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-ink/10" />
            )}
            <div>
              <p className="text-lg font-semibold">{profile?.name || 'Unnamed'}</p>
              <p className="text-ink/60">{profile?.email || 'No email'}</p>
            </div>
          </div>
          <p className="text-sm text-ink/60">
            Coming soon: edit goals, reflection cadence, and share settings.
          </p>
        </div>
      </LayoutShell>
    </Protected>
  )
}
