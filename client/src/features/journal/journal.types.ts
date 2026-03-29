export interface IQuestionField {
  name: string
  type: 'select' | 'multi_select' | 'text' | 'scale'
  label: string
  options?: string[] | null
  scale_min?: number | null
  scale_max?: number | null
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

export interface IJournalByDateResponse {
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
  entry_id?: number
}

export interface IListJournalsResponse {
  items: IJournalItem[]
  total: number
}

export interface IDashboardNoticingItem {
  title: string
  summary: string
}

export interface IDashboardTryTodayItem {
  action: string
  status: string
  due_days: number
}

export interface IDashboardProgress {
  streak_days: number
  total_entries: number
  weekly_entries: number
}

export interface IDashboardResponse {
  current_state: string
  current_date: string
  last_entry_date: string
  what_were_noticing: IDashboardNoticingItem[]
  try_this_today: IDashboardTryTodayItem[]
  progress: IDashboardProgress
}
