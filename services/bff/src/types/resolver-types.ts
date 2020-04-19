export type MutationResponse = {
  code: number
  success: boolean
  message: string
}

export type Context = {
  currentUser: {
    playerId: string
  }
}

export type AnswerQuestionInput = {
  answer: {
    questionId: string
    answerId: string
  }
}
