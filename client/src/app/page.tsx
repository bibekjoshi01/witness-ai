'use client'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { logoutSuccess } from './(auth)/redux/auth.slice'
import { useTheme } from 'next-themes'

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const token = useSelector((s: RootState) => s.auth.accessToken)
  const profile = useSelector((s: RootState) => s.auth.profile)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = () => {
    dispatch(logoutSuccess())
  }

  return (
    <div className="relative">
      <HeroGeometric
        badge="Witness AI"
        title1="See What Your"
        title2="Mind Has Been Telling You"
        description="A calm way to understand your patterns, one daily check-in at a time."
        theme={currentTheme === 'dark' ? 'dark' : 'light'}
      />

      <div className="absolute inset-x-4 top-6 z-20 flex items-start justify-between md:inset-x-8">
        <h2
          className={
            currentTheme === 'dark'
              ? 'text-white/90 text-lg font-semibold tracking-wide'
              : 'text-slate-900 text-lg font-semibold tracking-wide'
          }
        >
          Witness AI
        </h2>
        <div className="flex items-center gap-2">
          <button
            className={
              currentTheme === 'dark'
                ? 'inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 transition'
                : 'inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-white/70 px-3 py-2 text-sm text-slate-800 backdrop-blur-md hover:bg-white transition'
            }
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && currentTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {mounted && currentTheme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {!token ? (
            <button
              className={
                currentTheme === 'dark'
                  ? 'rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300 transition'
                  : 'rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition'
              }
              onClick={() => router.push('/login')}
            >
              Sign in
            </button>
          ) : (
            <button
              className={
                currentTheme === 'dark'
                  ? 'rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-md hover:bg-white/10 transition'
                  : 'rounded-full border border-slate-900/15 bg-white/70 px-4 py-2 text-sm text-slate-800 backdrop-blur-md hover:bg-white transition'
              }
              onClick={() => router.push('/home')}
            >
              Dashboard
            </button>
          )}
        </div>
      </div>

      
    </div>
  )
}
