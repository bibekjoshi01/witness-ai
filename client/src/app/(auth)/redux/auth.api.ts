import { rootAPI } from '@/lib/api/apiSlice'
import { IUserProfile, IUserProfileUpdatePayload } from './types'


export const authAPISlice = rootAPI.injectEndpoints({
  endpoints: (builder) => ({
    basicAuth: builder.mutation<
      { access_token: string; token_type: string; first_time?: boolean },
      { username: string; password: string }
    >({
      query: (data) => ({
        url: '/auth/basic',
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
    uploadProfilePicture: builder.mutation<IUserProfile, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)

        return {
          url: '/profile/picture',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      },
      invalidatesTags: ['Profile'],
    }),
  }),
})

export const {
  useBasicAuthMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
} = authAPISlice


