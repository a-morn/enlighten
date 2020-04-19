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
