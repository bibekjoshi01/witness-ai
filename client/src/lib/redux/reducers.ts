import { combineReducers } from '@reduxjs/toolkit'
import { rootAPI } from '@/lib/api/apiSlice'
import authReducer from '@/app/(auth)/redux/auth.slice'

export const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here as needed
  [rootAPI.reducerPath]: rootAPI.reducer,
})
