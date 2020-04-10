import {
	PlayerNotFoundError,
	GameRequestNotFoundError
} from '../errors';
import {
	GAME_REQUEST,
} from '../triggers'
import {
	PlayerLobby,
} from './player'
import {
	GameRequest
} from './gameRequest'
import { PubSub } from 'graphql-subscriptions';
import { Category } from './category';

const players: PlayerLobby[] = []
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
	const player = players.find(p => p.id == playerId);
	if (!player) {
		throw new PlayerNotFoundError(`No such player: ${playerId}`);
	}

	return player;
};

const addPlayer = (player: PlayerLobby) => {
	if (player.name && players.some(({ name }) => name === player.name)) {
		throw new Error('Duplicate name')
	}

	players.push(player)
}

const getPlayers = (category?: string) => {
	return players
		.filter(p => !category || p.category === category)
}

const addGameRequest = (pubsub: PubSub, playerRequestId: string, playerOfferedId: string, category: Category) => {
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

const deleteGameRequestById = (pubsub: PubSub, playerId: string, id: string) => {
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

export {
	getGameRequestById,
	getPlayerById,
	addPlayer,
	getPlayers,
	addGameRequest,
	getGameRequestByPlayerId,
	deleteGameRequestById
};
