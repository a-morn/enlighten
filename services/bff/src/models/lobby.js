const {
  PlayerNotFoundError,
  GameRequestNotFoundError
} = require('../errors');

const {
	GAME_REQUESTED,
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
		.find(gr => gr.playerOfferedId === playerId ||
			gr.playerRequestedId === playerId && [true, false].includes(gr.accepted))
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
	const id = ''+Math.random()
	const gameRequested = {
		accepted: null,
		id,
		playerRequestId,
		playerOfferedId,
		category,
		playerRequestName
	}
	gameRequests.push(gameRequested)
	pubsub.publish(GAME_REQUESTED, {
		gameRequested,
	})
	return gameRequested;
}

module.exports = {
	getGameRequestById,
	getPlayerById,
	addPlayer,
	getPlayers,
	addGameRequest,
	getGameRequestByPlayerId,
};
