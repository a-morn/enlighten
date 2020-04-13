import { RedisPubSub } from 'graphql-redis-subscriptions';
import {
	PlayerNotFoundError,
	GameRequestNotFoundError
} from '../errors';
import {
	GAME_REQUEST,
	LOBBY_SUBSCRIPTION,
} from '../triggers'
import {
	PlayerLobby,
} from './player'
import {
	GameRequest
} from './gameRequest'
import { Category } from './category';
import moment from 'moment'

const playersInLobby: { [key: string]: PlayerLobby } = {}
const gameRequests: GameRequest[] = []

const getGameRequestById = (gameRequestId: string) => {
	const gameRequest = gameRequests.find(gr => gr.id === gameRequestId)
	if (!gameRequest) {
		throw new GameRequestNotFoundError(`No such gameRequest: ${gameRequestId}`)
	}

	return gameRequest
}

const getGameRequestByPlayerId = (playerId: string) => {
	return gameRequests
		.sort(({ date: d1 }, { date: d2 }) => d2 > d1
			? 1
			: d1 > d2
				? -1
				: 0)
		.find(
			({ playerOfferedId, playerRequestId }) =>
				playerOfferedId === playerId
				|| playerRequestId === playerId
		)
}

const getPlayerById = (playerId: string) => {
	const player = Object.values(playersInLobby).find(p => p.id == playerId);
	if (!player) {
		throw new PlayerNotFoundError(`No such player: ${playerId}`);
	}

	return player;
};

const addPlayer = (pubSub: RedisPubSub, player: PlayerLobby) => {
	if (player.name && Object.values(playersInLobby).some(({ name }) => name === player.name)) {
		throw new Error('Duplicate name')
	}
	playersInLobby[player.id] = player
	pubSub.publish(LOBBY_SUBSCRIPTION, {
		lobby: {
			players: getPlayers(player.category)
		}
	})
}

const removePlayer = (pubSub: RedisPubSub, playerId: string) => {
	const category = playersInLobby[playerId].category
	delete playersInLobby[playerId]
	pubSub.publish(LOBBY_SUBSCRIPTION, {
		lobby: {
			players: getPlayers(category)
		}
	})
}

const getPlayers = (category?: string) => {
	return Object.values(playersInLobby)
		.filter(p => !category || p.category === category)
}

const addGameRequest = (pubsub: RedisPubSub, playerRequestId: string, playerOfferedId: string, category: Category) => {
	const { name: playerRequestName } = getPlayerById(playerRequestId);
	const { name: playerOfferedName } = getPlayerById(playerOfferedId);
	const id = '' + Math.random()
	const date = new Date()
	const gameRequest: GameRequest = {
		accepted: null,
		id,
		playerRequestId,
		playerOfferedId,
		category,
		playerRequestName,
		playerOfferedName,
		date
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

const deleteGameRequestById = (pubsub: RedisPubSub, playerId: string, id: string) => {
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

let interval: NodeJS.Timeout
const startFilterInactive = () => {
	if (!interval) {
		interval = setInterval(() => {
			Object.values(playersInLobby)
				.filter(({ timestamp }) => {
					const diff = moment().diff(timestamp, 'seconds');
					return diff > 3
				}).forEach(({ id }) => {
					delete playersInLobby[id]
				})
		}, 500)
	}
}
startFilterInactive()

export {
	getGameRequestById,
	getPlayerById,
	addPlayer,
	removePlayer,
	getPlayers,
	addGameRequest,
	getGameRequestByPlayerId,
	deleteGameRequestById,
	startFilterInactive
};
