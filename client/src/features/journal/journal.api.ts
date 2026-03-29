import { rootAPI } from '@/lib/api/apiSlice'
import {
  ICreateJournalRequest,
  ICreateJournalResponse,
  IGeneratedQuestion,
  IJournalByDateResponse,
  IListJournalsParams,
  IListJournalsResponse,
} from './journal.types'

export const journalAPISlice = rootAPI.injectEndpoints({
  endpoints: (builder) => ({
    generateQuestions: builder.query<IGeneratedQuestion[], void>({
      query: () => ({
        url: '/ai/generate-questions',
        method: 'GET',
      }),
      keepUnusedDataFor: 30,
    }),
    createJournal: builder.mutation<ICreateJournalResponse, ICreateJournalRequest>({
      query: (data) => ({
        url: '/journal',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Journal', id: 'LIST' }],
    }),
    listJournals: builder.query<IListJournalsResponse, IListJournalsParams | void>({
      query: (params) => ({
        url: '/journal',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: 'Journal' as const, id: item.id })),
              { type: 'Journal' as const, id: 'LIST' },
            ]
          : [{ type: 'Journal' as const, id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    getJournalByDate: builder.query<IJournalByDateResponse, string>({
      query: (date) => ({
        url: '/journal/by-date',
        method: 'GET',
        params: { date },
      }),
      providesTags: (result) =>
        result
          ? [
              { type: 'Journal' as const, id: result.id },
              { type: 'Journal' as const, id: 'LIST' },
            ]
          : [{ type: 'Journal' as const, id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),
  }),
})

export const {
  useCreateJournalMutation,
  useGenerateQuestionsQuery,
  useGetJournalByDateQuery,
  useListJournalsQuery,
} = journalAPISlice
