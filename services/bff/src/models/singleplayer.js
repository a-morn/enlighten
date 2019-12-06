const shuffle = require('shuffle-array');

const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};
const {
  GameNotFoundError,
} = require('../errors');
const { getQuestionById } = require('./questions');
const { filterGame } = require('./utils')

const games = []

const getGameByPlayerIdInternal = playerId => {
	const game = games
		.find(spg => spg.playerId === playerId)
  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${playerId}`);
  }
	return game
}

const createGame = (playerId, category) => {
	const id = ''+Math.random()
	const game = {
		playerId,
		category,
		id,
		levels: Object.entries(allQuestions[category]).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.questions.map(({ id }) => ({
          id,
          record: 0
        }))
      }),
      {}
    ),
		userLevel: 1
	}
	games.push(game)
	updateQuestionByPlayerId(playerId)

	return filterGame(game)
}

const getLastAnswerByPlayerId = playerId => {
	const game = getGameByPlayerIdInternal(playerId)
	if (game.lastQuestionId) {
		const question =  getQuestionById(game.lastQuestionId)
		return {
			id: question.answerId,
			questionId: game.lastQuestionId,
			playerId
		}
	} else {
		return null
	}
}

const updateQuestionByPlayerId = playerId => {
  const game = getGameByPlayerIdInternal(playerId);
  const questionId = shuffle(
    game.levels[game.userLevel].filter(
      ({ id , record }) => id !== game.lastQuestionId && record < 2
    )
  )[0].id;

	game.lastQuestion = game.currentQuestion
  game.currentQuestion = { answered: false, ...getQuestionById(questionId) }
  return filterGame(game)
};

const answerQuestion = (playerId, questionId, answerId) => {
  const game = getGameByPlayerIdInternal(playerId)
  if (questionId !== game.currentQuestion.id) {
    throw new Error("Tried answering the wrong question")
  }
  const { userLevel, levels } = game;
  game.levels[userLevel].find(({ id }) => id === game.currentQuestion.id).record +=
    answerId === game.currentQuestion.answerId ? 1 : -1;

  if (levels[userLevel].every(q => q.record >= 2)) {
    game.userLevel++;
  } else if (levels[userLevel].every(q => q.record < 0)) {
    game.userLevel--;
  }

  game.currentQuestion.answered = true;

  return filterGame(game);
};

const deleteGame = gameId => {
	const index = games.findIndex(g => g.id === gameId)
	const game = games.splice(index, 1)
	return filterGame(game[0])
}

const getGameByPlayerId = playerId => {
  return filterGame(getGameByPlayerIdInternal(playerId))
}

module.exports = {
	getGameByPlayerId,
	createGame,
	answerQuestion,
	getLastAnswerByPlayerId,
  updateQuestionByPlayerId,
  deleteGame
};
