export interface IChatSession {
  id: number
  title: string
  created_at: string
  updated_at: string
}

export interface IChatMessage {
  id: number
  session_id: number
  role: string
  content: string
  created_at: string
}

export interface ISendChatMessageRequest {
  message: string
  session_id?: number
}

export interface ISendChatMessageResponse {
  session_id: number
  user_message_id: number
  assistant_message_id: number
  reply: string
  title: string
  history: IChatMessage[]
}
