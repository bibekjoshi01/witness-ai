'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginForm from './login-form'

export default function LoginWrapper({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <LoginForm onSuccess={onSuccess} />
    </GoogleOAuthProvider>
  )
}
