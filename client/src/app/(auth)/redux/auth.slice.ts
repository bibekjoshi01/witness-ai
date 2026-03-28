import Cookies from 'js-cookie'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IAuthState } from './types'
import { PUBLIC_ACCESS_TOKEN } from '@/constants/public/tokens'

const initialState: IAuthState = {
  accessToken: null,
  tokenType: null,
  firstTime: null,
  isAuthenticated: false,
  profile: null,
}

// -------------------- Slice --------------------
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ access_token: string; token_type: string; first_time?: boolean }>
    ) => {
      state.accessToken = action.payload.access_token
      state.tokenType = action.payload.token_type
      state.firstTime = action.payload.first_time ?? null
      state.isAuthenticated = true

      Cookies.set(PUBLIC_ACCESS_TOKEN, action.payload.access_token, {
        path: '/',
        secure: true,
        sameSite: 'Lax',
      })
    },

    logoutSuccess: (state) => {
      Cookies.remove(PUBLIC_ACCESS_TOKEN, { path: '/' })

      state.accessToken = null
      state.tokenType = null
      state.firstTime = null
      state.isAuthenticated = false
      state.profile = null
    },

    setProfile: (state, action: PayloadAction<IAuthState['profile']>) => {
      state.profile = action.payload
    },
  },
})

export const { loginSuccess, logoutSuccess, setProfile } = authSlice.actions
export default authSlice.reducer
