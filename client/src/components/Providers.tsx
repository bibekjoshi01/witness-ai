'use client'
import React, { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store } from '@/lib/redux/store'

export function Providers({ children }: PropsWithChildren) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Provider store={store}>{children}</Provider>
    </GoogleOAuthProvider>
  )
}
