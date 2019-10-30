const shuffle = require('shuffle-array');

const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};
const { getQuestion } = require('./questions');
const NotFoundError = require('../exceptions/not-found');
const { produce } = require('immer');
const moment = require('moment');

let limitBreaks = {};

const defaultLimitBreak = playerId => ({
  status: 'charging',
  internalLevel: 5,
  charge: 0,
  streak: 0,
  playerId
});

const chargeDecreasePerSecondByStatus = status => {
  switch (status) {
    case 'charging':
      return 0.1;
    case 'charged':
      return 10;
    case 'decharge':
      return 20;
  }
};

const getUpdatedLevel = lb => {
  switch (lb.status) {
    case 'charging':
      return lb.internalLevel;
    case 'charged':
    case 'decharge':
      return lb.internalLevel + lb.charge;
    default:
      return 0;
  }
};

const getUpdatedStatus = (lb, now) => {
  switch (lb.status) {
    case 'charging':
      if (lb.streak > 5 && lb.charge > 5) {
        return 'charged';
      } else {
        return lb.status;
      }
    case 'charged':
      if (lb.streak === 0 && lb.charge < 5) {
        return 'charging';
      } else if (
        lb.streak === -1 ||
        lb.charge < 5 ||
        moment.duration(moment(now).diff(lb.date)).seconds() > 2
      ) {
        return 'decharge';
      } else {
        return lb.status;
      }
    case 'decharge':
      if (lb.charge <= 0) {
        return 'charging';
      } else {
        return lb.status;
      }
    default:
      return 'charging';
  }
};

const getUpdatedLimitBreak = (baseLb, isAnswerCorrect, date) =>
  produce(baseLb, draftLb => {
    if (isAnswerCorrect) {
      draftLb.streak++;
      draftLb.charge++;
    } else {
      draftLb.streak = Math.min(draftLb.streak - 1, 0);
      draftLb.charge--;
    }

    draftLb.status = getUpdatedStatus(draftLb);

    draftLb.level = getUpdatedLevel(draftLb);

    if (isAnswerCorrect) {
      if (draftLb.status === 'charged') {
        draftLb.charge += 25;
      }
    } else {
      if (draftLb.status === 'charged') {
        draftLb.charge -= 30;
      }
    }
    draftLb.date = date;
  });

const limitBreakLoop = () =>
  setInterval(() => {
    Object.values(listGames())
      .filter(({ player }) => player)
      .forEach(({ player: { wsClient, playerId } }) => {
        const lb = limitBreaks[playerId] || defaultLimitBreak(playerId);
        const updatedLb = produce(lb, draftLb => {
          draftLb.charge = Math.max(
            0,
            draftLb.charge - chargeDecreasePerSecondByStatus(draftLb.status) / 2
          );
          draftLb.level = getUpdatedLevel(draftLb);
          draftLb.status = getUpdatedStatus(draftLb);
        });
        wsClient.send(
          JSON.stringify({
            resource: 'limit-break',
            method: 'PUT',
            payload: updatedLb
          })
        );
        limitBreaks[playerId] = updatedLb;
      });
  }, 500);

const updateLimitBreakOnAnswer = (gameId, isAnswerCorrect, date) => {
  const {
    player: { wsClient, playerId }
  } = getGame(gameId);

  const updatedLb = getUpdatedLimitBreak(
    limitBreaks[playerId] || defaultLimitBreak(playerId),
    isAnswerCorrect,
    date
  );
  limitBreaks[playerId] = updatedLb;
  wsClient.send(
    JSON.stringify({
      resource: 'limit-break',
      method: 'PUT',
      payload: updatedLb
    })
  );
};

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

const answerQuestion = (gameId, questionId, answerId) => {
  const question = getQuestion(questionId);
  const { userLevel, levels } = games[gameId];
  levels[userLevel].find(({ id }) => id === questionId).record +=
    answerId === question.answer ? 1 : -1;

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

const getGame = gameId => {
  if (!games[gameId]) {
    throw NotFoundError('Game does not exists');
  }

  return games[gameId];
};

const listGames = () => {
  return games;
};

const connectPlayerToWsSingleplayer = (gameId, wsClient) => {
  const playerId = Math.random();
  const game = getGame(gameId);
  game.player = { wsClient, playerId };
};

const handleIncomingMessagesSingleplayer = (
  ws,
  gameId,
  playerId,
  { resource, method, payload }
) => {
  switch (resource) {
    case 'answers': {
      switch (method) {
        case 'POST': {
          const { answerId } = payload;
          const { lastQuestionId } = games[gameId];
          const correctAnswerId = answerQuestion(
            gameId,
            lastQuestionId,
            answerId
          );
          const isAnswerCorrect = correctAnswerId === answerId;
          updateLimitBreakOnAnswer(gameId, isAnswerCorrect, new Date());
          ws.send(
            JSON.stringify({
              resource: 'answers',
              method: 'POST',
              payload: { correctAnswerId }
            })
          );
          const questionId = getNextQuestionId(gameId);
          const { answer, record, ...question } = getQuestion(questionId);
          setTimeout(() => {
            games[gameId].lastQuestionId;
            ws.send(
              JSON.stringify({
                resource: 'questions',
                method: 'POST',
                payload: question
              })
            );
          }, 300);
          break;
        }
      }
      break;
    }
    case 'questions': {
      switch (method) {
        case 'GET': {
          const questionId = getNextQuestionId(gameId);
          const { answer, record, ...question } = getQuestion(questionId);
          ws.send(
            JSON.stringify({
              resource: 'questions',
              method: 'POST',
              payload: question
            })
          );
          break;
        }
      }
      break;
    }
    default:
      console.log(`Unsupported resource ${resource}`);
  }
};

const cleanUpLoop = () => {
  setInterval(() => {
    const gamesToRemove = games
      .filter(({ player: { wsClient } }) => wsClient)
      .filter(({ wsClient: { readyState, OPEN } }) => readyState !== OPEN);

    games = games.filter(g => !gamesToRemove.includes(g));
  });
};

module.exports = {
  answerQuestion,
  getNextQuestionId,
  createGame,
  deleteGame,
  listGames,
  getGame,
  connectPlayerToWsSingleplayer,
  handleIncomingMessagesSingleplayer,
  limitBreakLoop,
  updateLimitBreakOnAnswer,
  cleanUpLoop
};
