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

const games = []

const getGameByPlayerId = playerId => {
	const game = games
		.find(spg => spg.players.some(p => p.id === playerId))
  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${playerId}`);
  }
	return game
}

const getGameByGameId = gameId => {
	const game = games
		.find(spg => spg.id === gameId)
  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${gameId}`);
  }
	return game
}

const createGame = (players, category) => {
	const id = ''+Math.random()
	const game = {
		players: players.map(p => ({ score: 0, ...p})),
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
	games.push(game)

	return game	
}

const updateQuestionByPlayerId = playerId => {
	const game = getGameByPlayerId(playerId)
	game.questionIndex++
}

const getCurrentQuestionByPlayerId = playerId => {
	const game = getGameByPlayerId(playerId)
	const question = game.questions[game.questionIndex]
	return question
}

const getLastAnswerByPlayerId = playerId => {
	const game = getGameByPlayerId(playerId)
	if (game.questionIndex > 0) {
		const question =  game.questions[game.questionIndex - 1]
		return {
			id: question.answerId,
			questionId: question.id,
		}
	} else {
		return null
	}
}

const answerQuestion = (playerId, questionId, answerId) => {
	let gameEnded = false;
  const game = getGameByPlayerId(playerId);
  const question = getCurrentQuestionByPlayerId(playerId)
  if (questionId === question.id) {
    const player = getPlayersInGameById(game.id, playerId);
    const correct = answerId === question.answerId;
    player.score = Math.max(0, player.score + (correct ? 1 : -1));
    if (player.score >= 10) {
      player.won = true;
      gameEnded = true;
    }
  } else {
    console.log(`Tried to answer invalid question`);
  }
  return { correctAnswerId: question.answerId, players: game.players, gameEnded }
};

const getPlayersInGameById = (gameId, playerId) => {
  return getGameByGameId(gameId)
    .players
    .find(p => p.id === playerId)
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
  return game
}

module.exports = {
	getGameByPlayerId,
	createGame,
	getCurrentQuestionByPlayerId,
  getLastAnswerByPlayerId,
  answerQuestion,
  updateQuestionByPlayerId,
  deleteGameByGameId
};
