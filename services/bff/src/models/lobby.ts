import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis'
import { getAllByPattern } from './redis-utils'
import {
	GAME_REQUEST,
	LOBBY_PLAYERS_SUBSCRIPTION,
} from '../triggers'
import {
	PlayerLobby,
	isPlayerLobby,
} from './player'
import {
	GameRequest,
	isGameRequest
} from './gameRequest'
import { CategoryId } from './category';
import { ForbiddenError, UserInputError } from 'apollo-server';

const getGameRequest = async (redisClient: Redis, gameRequestId: string) => {
	const gameRequestString = await redisClient.get(`lobby:game-requests:${gameRequestId}`)
	if (!gameRequestString) {
		return null
	}

	const gameRequest = JSON.parse(gameRequestString)

	if (!isGameRequest(gameRequest)) {
		throw new Error(`That's no game request... ${Object.keys(gameRequest)}`)
	}

	return gameRequest
}

const getGameRequestIdByPlayerId = async (redisClient: Redis, playerId: string) => {
	const gameRequestIdString = await redisClient.get(`lobby:player-game-request-id:${playerId}`)

	if (!gameRequestIdString) {
		return null
	}

	const gameRequestId = JSON.parse(gameRequestIdString)

	if (typeof gameRequestId !== 'number') {
		throw new Error(`That's no game request id... ${gameRequestId}`)
	}

	const gameRequest = getGameRequest(redisClient, gameRequestIdString)
	return gameRequest
}

// todo: this won't scale for shit
const getPlayers = async (redisClient: Redis, categoryId?: CategoryId): Promise<PlayerLobby[]> => {
	const playersStringArray = await getAllByPattern(redisClient, `lobby:players*`)

	if (!playersStringArray) {
		return []
	}

	const players = playersStringArray
		.map(ps => JSON.parse(ps))
		.filter(isPlayerLobby)

	return players
		.filter((player) => categoryId ? player.categoryId === categoryId : true)
}

const getPlayer = async (redisClient: Redis, playerId: string): Promise<PlayerLobby | null> => {
	const playerString = await redisClient.get(`lobby:players:${playerId}`)

	if (!playerString) {
		return null
	}

	const player = JSON.parse(playerString)

	if (!isPlayerLobby(player)) {
		throw new Error(`That's no player... ${Object.keys(player)}`)
	}

	return player;
};

const addPlayer = async (redisClient: Redis, pubSub: RedisPubSub, player: PlayerLobby): Promise<PlayerLobby> => {
	// todo: (re)add duplicate name check

	await redisClient.set(`lobby:players:${player.id}`, JSON.stringify(player))
	const players = await getPlayers(redisClient)

	pubSub.publish(LOBBY_PLAYERS_SUBSCRIPTION, {
		lobby: {
			players
		}
	})

	return player
}

const updatePlayer = async (redisClient: Redis, player: PlayerLobby): Promise<PlayerLobby> => {
	const result = await redisClient.set(`lobby:players:${player.id}`, JSON.stringify(player))
	if (result !== 'OK') {
		throw new Error('Redis failed updating player')
	}
	return player
}

const removePlayer = async (redisClient: Redis, pubSub: RedisPubSub, playerId: string) => {
	await redisClient.del(`lobby:players:${playerId}`)
	const players = await getPlayers(redisClient)
	pubSub.publish(LOBBY_PLAYERS_SUBSCRIPTION, {

		players
	})
}

const addGameRequest = async (redisClient: Redis, pubsub: RedisPubSub, playerRequestId: string, playerOfferedId: string, categoryId: CategoryId) => {
	const playerRequest = await getPlayer(redisClient, playerRequestId);
	const playerOffered = await getPlayer(redisClient, playerOfferedId);

	if (playerRequest === null || playerOffered === null) {
		throw new UserInputError(`Users don't exist`)
	}

	const { name: playerRequestName } = playerRequest
	const { name: playerOfferedName } = playerOffered
	const id = '' + Math.random()
	const created = new Date().toISOString()
	const gameRequest: GameRequest = {
		accepted: null,
		id,
		playerRequestId,
		playerOfferedId,
		categoryId,
		playerRequestName,
		playerOfferedName,
		created
	}

	redisClient.set(`lobby:game-requests:${gameRequest.id}`, JSON.stringify(gameRequest))
	redisClient.set(`lobby:player-game-request-id:${playerOfferedId}`, gameRequest.id)
	redisClient.set(`lobby:player-game-request-id:${playerRequestId}`, gameRequest.id)

	pubsub.publish(GAME_REQUEST, {
		gameRequestSubscription: {
			gameRequest,
			mutation: "CREATE"
		}
	})

	return gameRequest;
}

const deleteGameRequest = async (redisClient: Redis, pubsub: RedisPubSub, playerId: string, gameRequestId: string) => {
	const gameRequest = await getGameRequest(redisClient, gameRequestId)
	if (!gameRequest) {
		throw new UserInputError(`No game request with id ${gameRequestId}`)
	}
	if (![gameRequest.playerRequestId, gameRequest.playerOfferedId].includes(playerId)) {
		throw new ForbiddenError('Can\'t delete other players game request')
	}

	const result = await Promise.all([
		redisClient.del(`lobby:game-requests:${gameRequestId}`),
		redisClient.set(`lobby:player-game-request-id:${gameRequest.playerOfferedId}`, gameRequest.id),
		redisClient.set(`lobby:player-game-request-id:${gameRequest.playerRequestId}`, gameRequest.id)
	])

	if (result.some(r => r !== 1)) {
		// todo: this should be logged
	}

	pubsub.publish(GAME_REQUEST, {
		gameRequestSubscription: {
			gameRequest,
			mutation: "DELETE"
		}
	})

	return gameRequestId
}

const updatePlayerTimestamp = async (redisClient: Redis, playerId: string, player?: PlayerLobby): Promise<PlayerLobby | null> => {
	const p = player || await getPlayer(redisClient, playerId)
	if (p === null) {
		return null
	}
	p.timestamp = new Date().toISOString()
	return updatePlayer(redisClient, p)
}

// todo: refactor
const join = async (
	redisClient: Redis,
	pubSub: RedisPubSub,
	id: string,
	categoryId: CategoryId,
	name: string
) => {
	const player = { id, categoryId, name, timestamp: new Date().toISOString() }
	return addPlayer(redisClient, pubSub, player)
}

const answerGameRequest = async (
	redisClient: Redis,
	pubSub: RedisPubSub,
	id: string,
	accepted: boolean,
	playerId: string,
	createGameMultiplayer: ( // todo: figure out how to handle models calling models
		redisClient: Redis,
		pubSub: RedisPubSub,
		players: PlayerLobby[],
		categoryId: CategoryId) => Promise<unknown>
) => {
	const gameRequestAnswered = await getGameRequest(redisClient, id)

	if (!gameRequestAnswered) {
		throw new UserInputError(`No game request with id ${id}`)
	}

	if (gameRequestAnswered.playerOfferedId !== playerId) {
		throw new ForbiddenError('Can\'t answer requests directed to other platers')
	}

	gameRequestAnswered.accepted = accepted
	pubSub.publish(GAME_REQUEST, {
		gameRequestSubscription: {
			gameRequest: gameRequestAnswered,
			mutation: "UPDATE"
		}
	})

	const gameRequest = await deleteGameRequest(redisClient, pubSub, playerId, id)

	if (accepted) {
		const players = [
			getPlayer(redisClient, playerId),
			getPlayer(redisClient, gameRequestAnswered.playerRequestId)
		]

		const playersResolved = await Promise.all(players)
		if (playersResolved.some(p => p === null)) {
			throw new Error(`Player deleted`)
		}

		await createGameMultiplayer(
			redisClient,
			pubSub,
			playersResolved as PlayerLobby[],
			gameRequestAnswered.categoryId
		)
	}

	return gameRequest
}

export {
	getGameRequest,
	getPlayer,
	addPlayer,
	removePlayer,
	getPlayers,
	addGameRequest,
	getGameRequestIdByPlayerId,
	deleteGameRequest,
	updatePlayerTimestamp,
	join,
	answerGameRequest
};
