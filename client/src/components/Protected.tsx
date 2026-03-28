'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useSelector((state: RootState) => state.auth.accessToken)

  useEffect(() => {
    if (!token) {
      router.replace('/')
    }
  }, [token, router])

  if (!token) return null
  return <>{children}</>
}
