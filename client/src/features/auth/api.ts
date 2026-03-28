import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  }),
  endpoints: (builder) => ({
    googleLogin: builder.mutation<AuthResponse, { id_token: string; timezone?: string }>(
      {
        query: (body) => ({
          url: '/auth/google',
          method: 'POST',
          body,
        }),
      }
    ),
  }),
});

export const { useGoogleLoginMutation } = authApi;
