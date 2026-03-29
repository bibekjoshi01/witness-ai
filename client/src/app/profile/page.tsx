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
    const payload: any = {
      name: form.name,
      email: form.email,
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
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Profile Picture */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 ring-1 ring-blue-200" />
                )}
                <div>
                  <p className="font-display text-lg font-semibold text-slate-900">Profile picture</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  Remove
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white opacity-50 cursor-not-allowed"
                  title="Coming soon"
                >
                  Upload New
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-slate-900">Basic information</h3>
            <p className="mt-1 text-sm text-slate-700">
              Keep your details up to date so Witness AI can personalize your experience.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs uppercase tracking-wide font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-xs uppercase tracking-wide font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div>
                <label htmlFor="age" className="text-xs uppercase tracking-wide font-medium text-slate-700">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(event) => handleChange('age', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="hobbies" className="text-xs uppercase tracking-wide font-medium text-slate-700">
                  Hobbies (comma separated)
                </label>
                <input
                  id="hobbies"
                  type="text"
                  value={form.hobbies}
                  onChange={(event) => handleChange('hobbies', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="walking, journaling, music"
                />
              </div>
            </div>
          </div>

          {/* AI Personalization */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-slate-900">AI personalization</h3>
            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="mental_health_goal" className="text-xs uppercase tracking-wide font-medium text-slate-700">
                  Mental health goal
                </label>
                <input
                  id="mental_health_goal"
                  type="text"
                  value={form.mental_health_goal}
                  onChange={(event) => handleChange('mental_health_goal', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="Reduce stress, build steady routines"
                />
              </div>
              <div>
                <label htmlFor="extra_notes" className="text-xs uppercase tracking-wide font-medium text-slate-700">
                  Extra notes
                </label>
                <textarea
                  id="extra_notes"
                  value={form.extra_notes}
                  onChange={(event) => handleChange('extra_notes', event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
                  placeholder="Anything else you want Witness AI to know."
                />
              </div>
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-700">
              {isLoading ? 'Loading profile...' : 'Unsaved changes will be lost if you leave.'}
            </p>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white">
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </LayoutShell>
    </Protected>
  )
}
