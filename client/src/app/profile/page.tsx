'use client'
import { LayoutShell } from '@/components/LayoutShell'
import { Protected } from '@/components/Protected'
import { useEffect, useRef, useState } from 'react'
import { useGetProfileQuery, useUpdateProfileMutation, useUploadProfilePictureMutation } from '@/app/(auth)/redux/auth.api'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfileQuery()
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation()
  const [uploadProfilePicture, { isLoading: isUploadingPicture }] = useUploadProfilePictureMutation()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!form.email.trim()) {
      toast.error('Email is required')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(form.email.trim())) {
      toast.error('Please enter a valid email')
      return
    }

    const payload: any = {
      name: form.name,
      email: form.email.trim(),
      age: form.age ? Number(form.age) : 0,
      gender: form.gender,
      hobbies: form.hobbies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      mental_health_goal: form.mental_health_goal,
      extra_notes: form.extra_notes,
    }

    const toastId = toast.loading('Saving profile...')

    try {
      await updateProfile(payload).unwrap()
      toast.success('Profile updated', { id: toastId })
    } catch {
      toast.error('Unable to update profile', { id: toastId })
    }
  }

  const handleDiscard = () => {
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

    toast.info('Changes discarded')
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handlePictureFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      event.target.value = ''
      return
    }

    const toastId = toast.loading('Uploading profile picture...')

    try {
      await uploadProfilePicture(file).unwrap()
      toast.success('Profile picture updated', { id: toastId })
    } catch {
      toast.error('Unable to upload profile picture', { id: toastId })
    } finally {
      event.target.value = ''
    }
  }

  return (
    <Protected>
      <LayoutShell
        title="Settings & Profile"
      >
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Profile Picture */}
          <div className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="h-16 w-16 rounded-full border border-[var(--wa-border)] object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[rgba(0,209,129,0.2)] to-[rgba(0,209,129,0.1)] ring-1 ring-[var(--wa-accent)]" />
                )}
                <div>
                  <p className="font-display text-lg font-semibold text-[var(--wa-text)]">Profile picture</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureFileChange}
                />
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-[var(--wa-border)] px-4 py-2 text-xs font-semibold text-[var(--wa-muted)] opacity-50"
                  title="Coming soon"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isUploadingPicture}
                  className="rounded-lg bg-[var(--wa-accent)] px-4 py-2 text-xs font-semibold text-[#090A0B] transition hover:opacity-90 disabled:opacity-60"
                >
                  {isUploadingPicture ? 'Uploading...' : 'Upload New'}
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-[var(--wa-text)]">Basic information</h3>
            <p className="mt-1 text-sm text-[var(--wa-muted)]">
              Keep your details up to date so Witness AI can personalize your experience.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3 text-sm text-[var(--wa-text)] outline-none transition focus:border-[var(--wa-accent)] focus:ring-1 focus:ring-[var(--wa-accent)]"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3 text-sm text-[var(--wa-text)] outline-none transition focus:border-[var(--wa-accent)] focus:ring-1 focus:ring-[var(--wa-accent)]"
                />
              </div>
              <div>
                <label htmlFor="age" className="text-xs font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(event) => handleChange('age', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3 text-sm text-[var(--wa-text)] outline-none transition focus:border-[var(--wa-accent)] focus:ring-1 focus:ring-[var(--wa-accent)]"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="hobbies" className="text-xs font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Hobbies (comma separated)
                </label>
                <input
                  id="hobbies"
                  type="text"
                  value={form.hobbies}
                  onChange={(event) => handleChange('hobbies', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3 text-sm text-[var(--wa-text)] outline-none transition focus:border-[var(--wa-accent)] focus:ring-1 focus:ring-[var(--wa-accent)]"
                  placeholder="walking, journaling, music"
                />
              </div>
            </div>
          </div>

          {/* AI Personalization */}
          <div className="rounded-xl border border-[var(--wa-border)] bg-[var(--wa-panel)] p-6 shadow-sm">
            <h3 className="font-display text-lg font-semibold text-[var(--wa-text)]">AI personalization</h3>
            <div className="mt-6 grid gap-4">
              <div>
                <label htmlFor="mental_health_goal" className="text-xs font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Mental health goal
                </label>
                <input
                  id="mental_health_goal"
                  type="text"
                  value={form.mental_health_goal}
                  onChange={(event) => handleChange('mental_health_goal', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3 text-sm text-[var(--wa-text)] outline-none transition focus:border-[var(--wa-accent)] focus:ring-1 focus:ring-[var(--wa-accent)]"
                  placeholder="Reduce stress, build steady routines"
                />
              </div>
              <div>
                <label htmlFor="extra_notes" className="text-xs font-medium uppercase tracking-wide text-[var(--wa-muted)]">
                  Extra notes
                </label>
                <textarea
                  id="extra_notes"
                  value={form.extra_notes}
                  onChange={(event) => handleChange('extra_notes', event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-[var(--wa-border)] bg-[var(--wa-panel)] px-4 py-3 text-sm text-[var(--wa-text)] outline-none transition focus:border-[var(--wa-accent)] focus:ring-1 focus:ring-[var(--wa-accent)]"
                  placeholder="Anything else you want Witness AI to know."
                />
              </div>
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--wa-border)] bg-[rgba(0,209,129,0.05)] p-5">
            <p className="text-sm text-[var(--wa-muted)]">
              {isLoading ? 'Loading profile...' : 'Unsaved changes will be lost if you leave.'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscard}
                className="rounded-lg border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold text-[var(--wa-text)] transition hover:bg-[rgba(255,255,255,0.05)]"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-[var(--wa-accent)] px-5 py-2 text-sm font-semibold text-[#090A0B] transition hover:opacity-90 disabled:opacity-60"
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
