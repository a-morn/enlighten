import countries from '../generated-data/countries.json'
import got from '../generated-data/game-of-thrones.json'
import musicTheory from '../generated-data/music-theory.json'
import { GameQuestion, Question } from '../types/question-types'
const allQuestions = {
  'game-of-thrones': got,
  countries,
  'music-theory': musicTheory,
}

const allQuestionsArray = Object.values(allQuestions)
  .reduce(
    (acc: Question[], { ...levels }) =>
      acc.concat(
        Object.values(levels).reduce(
          (acc2, { questions }) => acc2.concat(questions),
          [],
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

export { getQuestionById }
