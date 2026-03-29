'use client'
import React, { PropsWithChildren, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { store } from '@/lib/redux/store'
import Cookies from 'js-cookie'
import { PUBLIC_ACCESS_TOKEN } from '@/constants/public/tokens'
import { AppDispatch } from '@/lib/redux/store'
import { hydrateSession } from '@/app/(auth)/redux/auth.slice'
import { ThemeProvider } from '@/lib/providers/theme-provider'

function AuthHydrator() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const token = Cookies.get(PUBLIC_ACCESS_TOKEN) ?? null
    dispatch(hydrateSession(token))
  }, [dispatch])

  return null
}

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AuthHydrator />
        {children}
      </Provider>
    </ThemeProvider>
  )
}
