'use client'

import type React from 'react'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { GoogleLogin } from '@react-oauth/google'
import { useGoogleAuthMutation } from '@/app/(auth)/redux/auth.api'
import { useAppDispatch } from '@/lib/redux/hooks'
import { loginSuccess } from '@/app/(auth)/redux/auth.slice'

export default function LoginPage({ onSuccess }: { onSuccess?: () => void }) {
  const [googleAuth, { isLoading: loadingGoogleAuth }] = useGoogleAuthMutation()

  const dispatch = useAppDispatch()
  const router = useRouter()

  const handleGoogleLogin = async (idToken: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    try {
      const response = await googleAuth({ id_token: idToken, timezone }).unwrap()
      dispatch(loginSuccess(response))
      toast.success('Login successful!')
      if (onSuccess) {
        onSuccess() // modal login => close modal
      } else {
        router.push('/profile') // page login => redirect
      }
    } catch {
      toast.error('Error signin with google')
    }
  }

  return (
    <>
      <div className="my-16 w-full max-w-lg lg:my-0">
        {/* Google Login Button */}
        <div className="flex h-12 w-full items-center justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (!credentialResponse.credential) {
                toast.error('Google login failed to return a token')
                return
              }
              handleGoogleLogin(credentialResponse.credential)
            }}
            onError={() => toast.error('Google login failed')}
            useOneTap={false}
          />
        </div>
        {loadingGoogleAuth && (
          <p className="mt-2 text-sm text-muted-foreground">Signing in...</p>
        )}
      </div>
    </>
  )
}
