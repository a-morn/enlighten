const shuffle = require('shuffle-array');

const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};
const { getQuestion } = require('./questions');
const NotFoundError = require('../exceptions/not-found');

let games = {};

const getNextQuestionId = gameId => {
  const { userLevel, lastQuestionId, levels } = games[gameId];
  const uL =
    Math.random() < 0.33 ? Math.ceil(Math.random() * userLevel) : userLevel;
  const questionId = shuffle(
    levels[uL].filter(({ id, record }) => id !== lastQuestionId && record < 2)
  )[0].id;

  games[gameId].lastQuestionId = questionId;
  return questionId;
};

const answerQuestion = (gameId, questionId, answer) => {
  const question = getQuestion(questionId);
  const { userLevel, levels } = games[gameId];
  levels[userLevel].find(({ id }) => id === questionId).record +=
    answer === question.answer ? 1 : -1;

  if (levels[userLevel].every(q => q.record >= 2)) {
    games[gameId].userLevel++;
  } else if (levels[userLevel].every(q => q.record < 0)) {
    games[gameId].userLevel--;
  }
  return question.answer;
};

const createGame = category => {
  const id = Math.random();
  games[id] = {
    userLevel: 1,
    lastQuestionId: null,
    levels: Object.entries(allQuestions[category]).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.questions.map(({ id }) => ({
          id,
          record: 0
        }))
      }),
      {}
    )
  };
  return id;
};

const deleteGame = gameId => {
  if (!games[gameId]) {
    throw NotFoundError('Game does not exists');
  }

  delete games[gameId];
};

module.exports = {
  answerQuestion,
  getNextQuestionId,
  createGame,
  deleteGame
};
