import countries from '../generated-data/countries.json'
import got from '../generated-data/game-of-thrones.json'
import musicTheory from '../generated-data/music-theory.json'
import { GameQuestion, Question, CategoryId, QuestionObject } from '../types'

const allQuestions: { [key in CategoryId]: QuestionObject } = {
  'game-of-thrones': got as QuestionObject,
  countries,
  'music-theory': musicTheory as QuestionObject,
}

const allQuestionsArray = Object.values(allQuestions)
  .reduce(
    (acc: Question[], { ...levels }) =>
      acc.concat(
        Object.values(levels).reduce(
          (acc2, { questions }) => acc2.concat(questions),
          [] as Question[],
        ),
      ),
    [],
  )
  .filter(q => q)

const getQuestionById = (questionId: string): GameQuestion => {
  const question = allQuestionsArray.find(({ id }) => id === questionId)

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

const getQuestionsByCategory = (categoryId: CategoryId): QuestionObject =>
  allQuestions[categoryId]

export { getQuestionById, getQuestionsByCategory }
