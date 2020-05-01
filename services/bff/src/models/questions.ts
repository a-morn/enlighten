import { GameQuestion, Question, CategoryId } from 'enlighten-common-types'
import { getClient } from '../data/client'
import { findQuestions, findOneQuestion } from '../data/questions'

const getQuestionById = async (questionId: string): Promise<GameQuestion> => {
  const client = await getClient()
  const question = await findOneQuestion(client, questionId)

  if (!question) {
    throw new Error("Can't find question")
  }

  const { alternatives, ...rest } = question

  return {
    answered: false,
    record: 0,
    ...rest,
    alternatives,
  }
}

const getQuestionsByCategory = async (
  categoryId: CategoryId,
): Promise<Question[]> => {
  const client = await getClient()
  return findQuestions(client, categoryId)
}

export { getQuestionById, getQuestionsByCategory }
