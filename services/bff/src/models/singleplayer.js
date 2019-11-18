const shuffle = require('shuffle-array');

const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};
const {
  PlayerNotFoundError,
  GameNotFoundError,
  GameRequestNotFoundError
} = require('../errors');
const { getQuestionById } = require('./questions');

const games = []

const getGameByPlayerId = playerId => {
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

	return game	
}

const getCurrentQuestionByPlayerId = playerId => {
	const game = getGameByPlayerId(playerId)
	return getQuestionById(game.currentQuestion.id)
}

const getLastAnswerByPlayerId = playerId => {
	const game = getGameByPlayerId(playerId)
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
  const game = getGameByPlayerId(playerId);
  const questionId = shuffle(
    game.levels[game.userLevel].filter(
      ({ id , record }) => id !== game.lastQuestionId && record < 2
    )
  )[0].id;

	game.lastQuestion = game.currentQuestion
  game.currentQuestion = getQuestionById(questionId)
};

const answerQuestion = (playerId, questionId, answerId) => {
  const game = getGameByPlayerId(playerId)
  if (questionId !== game.currentQuestion.id) {
    throw new Error("Tried answering the wrong question")
  }
  const question = getQuestionById(questionId);
  const { userLevel, levels } = game;
  game.levels[userLevel].find(({ id }) => id === game.currentQuestion.id).record +=
    answerId === question.answer ? 1 : -1;

  if (levels[userLevel].every(q => q.record >= 2)) {
    game.userLevel++;
  } else if (levels[userLevel].every(q => q.record < 0)) {
    game.userLevel--;
  }

  return question.answerId;
};

const deleteGame = gameId => {
	const index = games.findIndex(g => g.id === gameId)
	const game = games.splice(index, 1)
	return game[0]
}

module.exports = {
	getGameByPlayerId,
	createGame,
	getCurrentQuestionByPlayerId,
	answerQuestion,
	deleteGame,
	getLastAnswerByPlayerId,
	updateQuestionByPlayerId
};
