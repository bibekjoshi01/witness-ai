'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useSelector((state: RootState) => state.auth.accessToken)
  const isHydrated = useSelector((state: RootState) => state.auth.isHydrated)

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace('/')
    }
  }, [isHydrated, token, router])

  if (!isHydrated) return null

  if (!token) return null
  return <>{children}</>
}
