import { configureStore } from '@reduxjs/toolkit'
import { rootAPI } from '@/lib/api/apiSlice'
import { rootReducer } from './reducers'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(rootAPI.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
