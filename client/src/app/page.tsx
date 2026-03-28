'use client'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { useGoogleAuthMutation } from './(auth)/redux/auth.api'
import { loginSuccess, logoutSuccess } from './(auth)/redux/auth.slice'

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const token = useSelector((s: RootState) => s.auth.accessToken)
  const profile = useSelector((s: RootState) => s.auth.profile)
  const [googleAuth] = useGoogleAuthMutation()

  const handleSuccess = async (credentialResponse: any) => {
    const id_token = credentialResponse.credential
    if (!id_token) return
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const apiResp = await googleAuth({ id_token, timezone }).unwrap()
      dispatch(loginSuccess(apiResp))
      router.replace('/home')
    } catch (err) {
      console.error('login failed', err)
    }
  }

  const handleSignOut = () => {
    googleLogout()
    dispatch(logoutSuccess())
  }

  return (
    <div className="relative">
      <HeroGeometric
        badge="Witness AI"
        title1="Structured Reflection"
        title2="Without Stigma"
        description="A calm way to understand your patterns, one daily check-in at a time."
        theme={theme}
      />

      <div className="absolute inset-x-4 top-6 z-20 flex items-start justify-between md:inset-x-8">
        <h2
          className={
            theme === 'dark'
              ? 'text-white/90 text-lg font-semibold tracking-wide'
              : 'text-slate-900 text-lg font-semibold tracking-wide'
          }
        >
          Witness AI
        </h2>
        <div className="flex items-center gap-2">
          <button
            className={
              theme === 'dark'
                ? 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 transition'
                : 'inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-white/70 px-3 py-2 text-sm text-slate-800 backdrop-blur-md hover:bg-white transition'
            }
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <button
            className={
              theme === 'dark'
                ? 'rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 transition'
                : 'rounded-full border border-slate-900/15 bg-white/70 px-4 py-2 text-sm text-slate-800 backdrop-blur-md hover:bg-white transition'
            }
            onClick={() => router.push('/profile')}
          >
            Profile
          </button>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-8 z-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2">
        <div
          className={
            theme === 'dark'
              ? 'w-full md:w-[560px] rounded-3xl border border-white/20 bg-black/45 p-5 text-white backdrop-blur-xl shadow-2xl'
              : 'w-full md:w-[560px] rounded-3xl border border-slate-900/10 bg-white/80 p-5 text-slate-900 backdrop-blur-xl shadow-2xl'
          }
        >
          <p className={theme === 'dark' ? 'text-sm uppercase tracking-[0.2em] text-emerald-200/80' : 'text-sm uppercase tracking-[0.2em] text-emerald-700'}>Start Today</p>
          <p className={theme === 'dark' ? 'mt-2 text-sm text-white/75' : 'mt-2 text-sm text-slate-700'}>
            Minimal daily reflection, adaptive prompts, and practical micro-actions for better emotional clarity.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!token ? (
              <div className="rounded-xl bg-white p-1.5">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => console.error('Google Login Failed')}
                  useOneTap
                />
              </div>
            ) : (
              <>
                <button
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300 transition"
                  onClick={() => router.push('/home')}
                >
                  Continue to Dashboard
                </button>
                <button
                  className={
                    theme === 'dark'
                      ? 'rounded-full border border-white/25 px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition'
                      : 'rounded-full border border-slate-900/20 px-4 py-2 text-sm text-slate-800 hover:bg-slate-900/5 transition'
                  }
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
          {profile?.name && (
            <p
              className={
                theme === 'dark' ? 'mt-2 text-sm text-white/70' : 'mt-2 text-sm text-slate-700'
              }
            >
              Signed in as {profile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
