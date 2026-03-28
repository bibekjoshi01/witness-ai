'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useEffect, useState } from 'react'
import { useGetProfileQuery, useUpdateProfileMutation } from '@/app/(auth)/redux/auth.api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfileQuery()
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()
  const [form, setForm] = useState({
    name: '',
    email: '',
    profile_picture: '',
    age: '',
    gender: '',
    hobbies: '',
    mental_health_goal: '',
    extra_notes: '',
  })

  useEffect(() => {
    if (!profile) return
    setForm({
      name: profile.name ?? '',
      email: profile.email ?? '',
      profile_picture: profile.profile_picture ?? '',
      age: profile.age ? String(profile.age) : '',
      gender: profile.gender ?? '',
      hobbies: Array.isArray(profile.hobbies) ? profile.hobbies.join(', ') : '',
      mental_health_goal: profile.mental_health_goal ?? '',
      extra_notes: profile.extra_notes ?? '',
    })
  }, [profile])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const payload = {
      name: form.name,
      email: form.email,
      profile_picture: form.profile_picture,
      age: form.age ? Number(form.age) : 0,
      gender: form.gender,
      hobbies: form.hobbies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      mental_health_goal: form.mental_health_goal,
      extra_notes: form.extra_notes,
    }

    try {
      await updateProfile(payload).unwrap()
      toast.success('Profile updated')
    } catch {
      toast.error('Unable to update profile')
    }
  }
  return (
    <Protected>
      <LayoutShell
        title="Settings & Profile"
        subtitle="Manage your personal details, preferences, and wellness goals."
      >
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-2 rounded-3xl border border-ink/10 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Account settings</p>
            {[
              'Personal details',
              'Preferences & style',
              'Privacy & data',
              'Account security',
              'Subscription',
            ].map((item, index) => (
              <button
                key={item}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  index === 0
                    ? 'bg-ink text-white shadow-lg shadow-ink/10'
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-ink/10 bg-white/90 p-6 shadow-lg shadow-ink/5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {form.profile_picture ? (
                    <img
                      src={form.profile_picture}
                      alt="Profile"
                      className="h-16 w-16 rounded-full border border-ink/10 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-ink/10" />
                  )}
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">Profile picture</p>
                    <p className="text-xs text-ink/60">PNG or JPG up to 5MB</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink transition hover:bg-ink/5">
                    Remove
                  </button>
                  <button className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-ink/90">
                    Upload new
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="profile_picture" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  Profile picture URL
                </label>
                <input
                  id="profile_picture"
                  type="text"
                  value={form.profile_picture}
                  onChange={(event) => handleChange('profile_picture', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white/90 p-6">
              <h3 className="font-display text-lg font-semibold text-ink">Basic information</h3>
              <p className="text-sm text-ink/60">
                This helps Witness AI personalize reflections and prompts.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                  />
                </div>
                <div>
                  <label htmlFor="age" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Age
                  </label>
                  <input
                    id="age"
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(event) => handleChange('age', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Gender
                  </label>
                  <input
                    id="gender"
                    type="text"
                    value={form.gender}
                    onChange={(event) => handleChange('gender', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                    placeholder="e.g. Woman, Man, Non-binary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="hobbies" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Hobbies (comma separated)
                  </label>
                  <input
                    id="hobbies"
                    type="text"
                    value={form.hobbies}
                    onChange={(event) => handleChange('hobbies', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                    placeholder="walking, journaling, music"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-ink/10 bg-white/90 p-6">
              <h3 className="font-display text-lg font-semibold text-ink">AI personalization</h3>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="mental_health_goal" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Mental health goal
                  </label>
                  <input
                    id="mental_health_goal"
                    type="text"
                    value={form.mental_health_goal}
                    onChange={(event) => handleChange('mental_health_goal', event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                    placeholder="Reduce stress, build steady routines"
                  />
                </div>
                <div>
                  <label htmlFor="extra_notes" className="text-xs uppercase tracking-[0.2em] text-ink/50">
                    Extra notes
                  </label>
                  <textarea
                    id="extra_notes"
                    value={form.extra_notes}
                    onChange={(event) => handleChange('extra_notes', event.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-ink/30"
                    placeholder="Anything else you want Witness AI to know."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-ink/10 bg-white/90 p-5">
              <p className="text-sm text-ink/60">
                {isLoading ? 'Loading profile...' : 'Unsaved changes will be lost if you leave.'}
              </p>
              <div className="flex items-center gap-2">
                <button className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5">
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </LayoutShell>
    </Protected>
  )
}
