import { rootAPI } from '@/lib/api/apiSlice'
import { IUserProfile, IUserProfileUpdatePayload } from './types'


export const authAPISlice = rootAPI.injectEndpoints({
  endpoints: (builder) => ({
    googleAuth: builder.mutation<
      { access_token: string; token_type: string; first_time?: boolean },
      { id_token: string; timezone?: string }
    >({
      query: (data) => ({
        url: '/auth/google',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Profile'],
    }),
    getProfile: builder.query<IUserProfile, void>({
      query: () => ({
        url: '/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
      keepUnusedDataFor: 60,
    }),
    updateProfile: builder.mutation<IUserProfile, IUserProfileUpdatePayload>({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        data,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const {
  useGoogleAuthMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authAPISlice


