import { GameQuestion, Question } from 'enlighten-common-types'
import { getClient } from '../data/client'
import { findQuestionsByCategory, findOneQuestion } from '../data/questions'

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
  categoryId: string,
): Promise<Question[]> => {
  const client = await getClient()
  const questions = findQuestionsByCategory(client, categoryId).catch((e) => {
    console.log(e)
    throw e
  })
  
  if (!questions) {
    throw new Error(`No questions with categoryId ${categoryId}`)
  }

  return questions
}

export { getQuestionById, getQuestionsByCategory }
