const {
  PlayerNotFoundError,
  GameRequestNotFoundError
} = require('../errors');

const {
	GAME_REQUEST,
} = require('../triggers')

const players = []
const gameRequests = []

const getGameRequestById = gameRequestId => {
	const gameRequest = gameRequests.find(gr => gr.id === gameRequestId)
	if (!gameRequest) {
		throw new GameRequestNotFoundError(`No such gameRequest: ${gameRequestId}`)
	}

	return gameRequest
}

const getGameRequestByPlayerId = playerId => {
	return gameRequests
		.find(({playerOfferedId, playerRequestId}) => playerOfferedId === playerId || playerRequestId === playerId)
}

const getPlayerById = playerId => {
  const player = players.find(p => p.id == playerId);
  if (!player) {
    throw new PlayerNotFoundError(`No such player: ${playerId}`);
  }

  return player;
};

const addPlayer = player => {
	if (player.name && players.some(({ name }) => name === player.name)) {
		throw new Error('Duplicate name')
	}

	players.push(player)
}

const getPlayers = (category) => {
	return players
		.filter(p => !category || p.category === category)	
}

const addGameRequest = (pubsub, playerRequestId, playerOfferedId, category) => {
	const { name: playerRequestName } = getPlayerById(playerRequestId);
	const { name: playerOfferedName } = getPlayerById(playerOfferedId);
	const id = ''+Math.random()
	const gameRequest = {
		accepted: null,
		id,
		playerRequestId,
		playerOfferedId,
		category,
		playerRequestName,
		playerOfferedName,
	}
	gameRequests.push(gameRequest)
	pubsub.publish(GAME_REQUEST, {
		gameRequestSubscription: {
			gameRequest,
			mutation: "CREATE"
		}
	})
	return gameRequest;
}

const deleteGameRequestById = (pubsub, playerId, id) => {
	const { playerRequestId, playerOfferedId } = getGameRequestById(id)
	if (![playerRequestId, playerOfferedId].includes(playerId)) {
	  throw new Error('Unauthorized')
	}

	const index = gameRequests.findIndex(g => g.id === id)
	if (index === -1) {
		throw new GameRequestNotFoundError('Tried deleting non existent game request')
	}
	const [gameRequest] = gameRequests.splice(index, 1)

	pubsub.publish(GAME_REQUEST, {
		gameRequestSubscription: {
			gameRequest,
			mutation: "DELETE"
		}
	})

	return gameRequest
}

module.exports = {
	getGameRequestById,
	getPlayerById,
	addPlayer,
	getPlayers,
	addGameRequest,
	getGameRequestByPlayerId,
	deleteGameRequestById
};
