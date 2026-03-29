import { rootAPI } from '@/lib/api/apiSlice'
import {
  IChatMessage,
  IChatSession,
  ISendChatMessageRequest,
  ISendChatMessageResponse,
} from './chat.types'

export const chatAPISlice = rootAPI.injectEndpoints({
  endpoints: (builder) => ({
    listChatSessions: builder.query<IChatSession[], void>({
      query: () => ({
        url: '/chat/sessions',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((session) => ({ type: 'Chat' as const, id: `session-${session.id}` })),
              { type: 'Chat' as const, id: 'SESSION_LIST' },
            ]
          : [{ type: 'Chat' as const, id: 'SESSION_LIST' }],
      keepUnusedDataFor: 30,
    }),
    getSessionMessages: builder.query<IChatMessage[], number>({
      query: (sessionId) => ({
        url: `/chat/sessions/${sessionId}/messages`,
        method: 'GET',
      }),
      providesTags: (result, _error, sessionId) =>
        result
          ? [
              ...result.map((message) => ({ type: 'Chat' as const, id: `message-${message.id}` })),
              { type: 'Chat' as const, id: `session-${sessionId}` },
            ]
          : [{ type: 'Chat' as const, id: `session-${sessionId}` }],
      keepUnusedDataFor: 15,
    }),
    sendChatMessage: builder.mutation<ISendChatMessageResponse, ISendChatMessageRequest>({
      query: (data) => ({
        url: '/chat/message',
        method: 'POST',
        data,
      }),
      invalidatesTags: (result) => {
        const tags = [{ type: 'Chat' as const, id: 'SESSION_LIST' }]
        if (result?.session_id) {
          tags.push({ type: 'Chat' as const, id: `session-${result.session_id}` })
        }
        return tags
      },
    }),
  }),
})

export const {
  useGetSessionMessagesQuery,
  useListChatSessionsQuery,
  useSendChatMessageMutation,
} = chatAPISlice
