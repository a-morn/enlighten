const shuffle = require('shuffle-array');
const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};

const allQuestionsArray = Object.values(allQuestions).reduce(
  (acc, { ...levels }) =>
    acc.concat(
      Object.values(levels).reduce(
        (acc2, { questions }) => acc2.concat(questions),
        []
      )
    ),
  []
);

const getQuestion = questionId => {
  const { alternatives, ...question } = allQuestionsArray.find(
    ({ id }) => id === questionId
  );

  return {
    ...question,
    alternatives: shuffle(alternatives)
  };
};

module.exports = {
  getQuestion
};
