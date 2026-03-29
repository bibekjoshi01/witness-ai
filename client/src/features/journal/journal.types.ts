export interface IQuestionField {
  name: string
  type: 'select' | 'multi_select' | 'text'
  label: string
  options?: string[]
}

export interface IQuestionSchema {
  type: 'multi_input' | string
  fields?: IQuestionField[]
  [key: string]: unknown
}

export interface IGeneratedQuestion {
  question_text: string
  schema: IQuestionSchema
}

export interface IJournalQuestionAnswer {
  question_text: string
  schema: IQuestionSchema
  answer_data: Record<string, unknown>
}

export interface ICreateJournalRequest {
  date: string
  free_text: string
  questions: IJournalQuestionAnswer[]
  insights?: string[]
  micro_actions?: string[]
}

export interface ICreateJournalResponse {
  message: string
}

export interface IJournalItem {
  id: number
  date: string
  free_text: string
  insights: string[]
  micro_actions: string[]
  created_at: string
}

export interface IListJournalsParams {
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
  entry_id?: number
}

export interface IListJournalsResponse {
  items: IJournalItem[]
  total: number
}
