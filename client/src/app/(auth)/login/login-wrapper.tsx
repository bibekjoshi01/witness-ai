'use client'

import LoginForm from './login-form'

export default function LoginWrapper({ onSuccess }: { onSuccess?: () => void }) {
  return <LoginForm onSuccess={onSuccess} />
}
