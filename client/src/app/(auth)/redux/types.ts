export interface IUserProfile {
  name: string
  email: string
  profile_picture: string
  age: number
  gender: string
  hobbies: string[]
  mental_health_goal: string
  extra_notes: string
}

export type IUserProfileUpdatePayload = Partial<IUserProfile>

export interface IAuthState {
  accessToken: string | null
  tokenType: string | null
  firstTime: boolean | null
  isAuthenticated: boolean
  profile: IUserProfile | null
}

export interface ILoginFormDataType {
  email: string
}
