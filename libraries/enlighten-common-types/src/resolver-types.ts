import { UserToken } from './authentication-types'

export type MutationResponse = {
  code: number
  success: boolean
  message: string
}

export type Context = {
  currentUser: UserToken
}

export type AnswerQuestionInput = {
  answer: {
    questionId: string
    answerIds: string[]
  }
}
