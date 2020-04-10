import got from '../data/questions/game-of-thrones';
import countries from '../data/questions/countries'
import { Question } from './question';
const allQuestions = {
  'game-of-thrones': got,
  countries
};

const allQuestionsArray = Object.values(allQuestions).reduce(
  (acc: Question[], { ...levels }) =>
    acc.concat(
      Object.values(levels).reduce(
        (acc2, { questions }) => acc2.concat(questions),
        []
      )
    ), [])
  .filter(q => q);

const getQuestionById = (questionId: string) => {
  const question = allQuestionsArray.find(
    ({ id }) => id === questionId
  );

  if (!question) {
    throw new Error('Can\'t find question')
  }

  const { alternatives, ...rest } = question

  return {
    ...rest,
    alternatives
  };
};

export {
  getQuestionById
};
