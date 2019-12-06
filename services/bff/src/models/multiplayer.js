const {
  GameNotFoundError,
} = require('../errors');
const {
  GAME_MULTIPLAYER
} = require('../triggers')
const shuffle = require('shuffle-array');
const periodicTable = require('../data/questions/periodic-table');
const got = require('../data/questions/game-of-thrones');
const allQuestions = {
  'game-of-thrones': got,
  'periodic-table': periodicTable
};
const { filterGame } = require('./utils')

const games = []

const getGameByPlayerId = playerId => {
	const game = games
    .find(spg => spg.players.some(({ id, hasLeft }) => !hasLeft && id === playerId))

  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${playerId}`);
  }
	return filterGame(game)
}

const getGameByGameId = gameId => {
	const game = games
		.find(spg => spg.id === gameId)
  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${gameId}`);
  }
	return filterGame(game)
}

const createGame = (players, category) => {
	const id = ''+Math.random()
	const game = {
		players: players.map(p => ({ score: 0, won: false, hasLeft: false, ...p})),
		category,
		id,
		questions: shuffle(
			Object.values(allQuestions[category])
				.reduce((acc, { questions }) => (
					acc.concat(questions)
				), [])
		),
    questionIndex: 0
  }
  
  game.currentQuestion = game.questions[0]
	games.push(game)

	return filterGame(game)	
}

const updateQuestionByPlayerId = playerId => {
  const game = getGameByPlayerId(playerId)
  game.lastQuestion = game.questions[game.questionIndex]
  game.questionIndex++
  game.currentQuestion = game.questions[game.questionIndex]
  return filterGame(game);
}

const getLastAnswerByPlayerId = playerId => {
	const game = getGameByPlayerId(playerId)
	if (game.lastQuestion) {
		const question = game.lastQuestion
		return {
			id: question.answerId,
			questionId: question.id,
		}
	} else {
		return null
	}
}

const answerQuestion = (playerId, questionId, answerId) => {
  const game = getGameByPlayerId(playerId);
  const question = game.currentQuestion
  if (questionId === question.id) {
    const player = getPlayersInGameById(game.id, playerId);
    const correct = answerId === question.answerId;
    player.score = Math.max(0, player.score + (correct ? 1 : -1));
    if (player.score >= 20) {
      player.won = true;
      gameEnded = true;
    }
    question.answered = true
  } else {
    throw new Error(`Tried to answer invalid question`);
  }
  return filterGame(game)
};

const getPlayersInGameById = (gameId, playerId) => {
  return getGameByGameId(gameId)
    .players
    .find(p => p.id === playerId)
}

const removePlayerFromGame  = (pubsub, playerId, gameId) => {
  const game = getGameByGameId(gameId)
  game.players
    .find(({ id }) => id === playerId)
    .hasLeft = true

  if (game.players.every(({ hasLeft }) => hasLeft)) {
    return deleteGameByGameId(pubsub, gameId)
  }
  return filterGame(game)
}

const deleteGameByGameId = (pubsub, gameId) => {
  const index = games.findIndex(g => g.id === gameId)
  if (index === -1) {
    throw new GameNotFoundError('Tried deleting non existent game')
  }
  const [game] = games.splice(index, 1)
  pubsub.publish(GAME_MULTIPLAYER, {
    gameMultiplayer: {
      game,
      mutation: 'DELETE'
    }
  })
  return filterGame(game)
}

module.exports = {
	getGameByPlayerId,
	createGame,
  getLastAnswerByPlayerId,
  answerQuestion,
  updateQuestionByPlayerId,
  removePlayerFromGame,
};
