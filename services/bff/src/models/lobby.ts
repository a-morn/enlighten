import { ForbiddenError, UserInputError } from 'apollo-server'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Redis } from 'ioredis'
import {
  GAME_REQUEST,
  LOBBY_PLAYERS_SUBSCRIPTION,
} from 'enlighten-common-graphql'
import {
  CategoryId,
  GameRequest,
  PlayerLobby,
  isGameRequest,
  isPlayerLobby,
} from 'enlighten-common-types'
import { v4 as uuid } from 'uuid'

import { getAllByPattern } from './redis-utils'

const getGameRequest = async (
  redisClient: Redis,
  gameRequestId: string,
): Promise<GameRequest | null> => {
  const gameRequestString = await redisClient.get(
    `lobby:game-requests:${gameRequestId}`,
  )
  if (!gameRequestString) {
    return null
  }

  const gameRequest = JSON.parse(gameRequestString)

  if (!isGameRequest(gameRequest)) {
    throw new Error(`That's no game request... ${Object.keys(gameRequest)}`)
  }

  return gameRequest
}

const getGameRequestIdByPlayerId = async (
  redisClient: Redis,
  playerId: string,
): Promise<GameRequest | null> => {
  const gameRequestIdString = await redisClient.get(
    `lobby:player-game-request-id:${playerId}`,
  )

  if (!gameRequestIdString) {
    return null
  }

  const gameRequest = getGameRequest(redisClient, gameRequestIdString)
  return gameRequest
}

// todo: this won't scale for shit
const getPlayers = async (
  redisClient: Redis,
  categoryId?: CategoryId,
): Promise<PlayerLobby[]> => {
  const playersStringArray = await getAllByPattern(
    redisClient,
    `lobby:players*`,
  )

  if (!playersStringArray) {
    return []
  }

  const players = playersStringArray
    .map(ps => JSON.parse(ps))
    .filter(isPlayerLobby)

  return players.filter(player =>
    categoryId ? player.categoryId === categoryId : true,
  )
}

const getPlayer = async (
  redisClient: Redis,
  playerId: string,
): Promise<PlayerLobby | null> => {
  const playerString = await redisClient.get(`lobby:players:${playerId}`)

  if (!playerString) {
    return null
  }

  const player = JSON.parse(playerString)

  if (!isPlayerLobby(player)) {
    throw new Error(`That's no player... ${Object.keys(player)}`)
  }

  return player
}

const addPlayer = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  player: PlayerLobby,
): Promise<PlayerLobby> => {
  // todo: (re)add duplicate name check

  await redisClient.set(
    `lobby:players:${player.id}`,
    JSON.stringify(player),
    'EX',
    10,
  )
  pubSub.publish(LOBBY_PLAYERS_SUBSCRIPTION, {
    lobbyPlayerMutated: {
      mutation: 'CREATE',
      lobbyPlayer: player,
    },
  })

  return player
}

const updatePlayer = async (
  redisClient: Redis,
  player: PlayerLobby,
): Promise<PlayerLobby> => {
  const result = await redisClient.set(
    `lobby:players:${player.id}`,
    JSON.stringify(player),
    'EX',
    10,
  )
  if (result !== 'OK') {
    throw new Error('Redis failed updating player')
  }
  return player
}

const removePlayer = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
): Promise<void> => {
  const result = await redisClient.del(`lobby:players:${playerId}`)
  if (result !== 0) {
    // todo: log this
  }
  const players = await getPlayers(redisClient)
  pubSub.publish(LOBBY_PLAYERS_SUBSCRIPTION, {
    players,
  })
}

const addGameRequest = async (
  redisClient: Redis,
  pubsub: RedisPubSub,
  playerRequestId: string,
  playerOfferedId: string,
  categoryId: CategoryId,
): Promise<GameRequest> => {
  const playerRequest = await getPlayer(redisClient, playerRequestId)
  const playerOffered = await getPlayer(redisClient, playerOfferedId)

  if (playerRequest === null || playerOffered === null) {
    throw new UserInputError(`Users don't exist`)
  }

  const { name: playerRequestName } = playerRequest
  const { name: playerOfferedName } = playerOffered
  const id = uuid()
  const created = new Date().toISOString()
  const gameRequest: GameRequest = {
    accepted: null,
    id,
    playerRequestId,
    playerOfferedId,
    categoryId,
    playerRequestName,
    playerOfferedName,
    created,
  }

  redisClient.set(
    `lobby:game-requests:${gameRequest.id}`,
    JSON.stringify(gameRequest),
    'EX',
    600,
  )
  redisClient.set(
    `lobby:player-game-request-id:${playerOfferedId}`,
    gameRequest.id,
    'EX',
    300,
  )
  redisClient.set(
    `lobby:player-game-request-id:${playerRequestId}`,
    gameRequest.id,
    'EX',
    300,
  )

  pubsub.publish(GAME_REQUEST, {
    gameRequestSubscription: {
      gameRequest,
      mutation: 'CREATE',
    },
  })

  return gameRequest
}

async function deleteGameRequest(
  redisClient: Redis,
  pubsub: RedisPubSub,
  playerId: string,
  gameRequest: GameRequest,
): Promise<GameRequest>
async function deleteGameRequest(
  redisClient: Redis,
  pubsub: RedisPubSub,
  playerId: string,
  gameRequest: null,
  gameRequestId: string,
): Promise<GameRequest>
async function deleteGameRequest(
  redisClient: Redis,
  pubsub: RedisPubSub,
  playerId: string,
  gameRequest: GameRequest | null,
  gameRequestId?: string,
): Promise<GameRequest> {
  let _gameRequest: GameRequest
  if (!gameRequest && gameRequestId) {
    const gr = await getGameRequest(redisClient, gameRequestId)
    if (!gr) {
      throw new UserInputError(`No game request with id ${gameRequestId}`)
    }
    _gameRequest = gr
  } else if (gameRequest) {
    _gameRequest = gameRequest
  } else {
    throw new Error('This will never happen')
  }
  if (
    ![_gameRequest.playerRequestId, _gameRequest.playerOfferedId].includes(
      playerId,
    )
  ) {
    throw new ForbiddenError("Can't delete other players game request")
  }

  const result = await Promise.all([
    redisClient.del(`lobby:game-requests:${_gameRequest.id}`),
    redisClient.del(
      `lobby:player-game-request-id:${_gameRequest.playerOfferedId}`,
    ),
    redisClient.del(
      `lobby:player-game-request-id:${_gameRequest.playerRequestId}`,
    ),
  ])

  if (result[0] !== 1) {
    // todo: Should log this
  }

  if (result.some(r => r !== 1)) {
    // todo: this should be logged
  }

  pubsub.publish(GAME_REQUEST, {
    gameRequestSubscription: {
      gameRequest: _gameRequest,
      mutation: 'DELETE',
    },
  })

  return _gameRequest
}

const updatePlayerTimestamp = async (
  redisClient: Redis,
  playerId: string,
  player?: PlayerLobby,
): Promise<PlayerLobby | null> => {
  const p = player || (await getPlayer(redisClient, playerId))
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
  name: string,
): Promise<PlayerLobby> => {
  const player = { id, categoryId, name, timestamp: new Date().toISOString() }
  return addPlayer(redisClient, pubSub, player)
}

const answerGameRequest = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  id: string,
  accepted: boolean,
  playerId: string,
  createGameMultiplayer: (
    // todo: figure out how to handle models calling models
    redisClient: Redis,
    pubSub: RedisPubSub,
    players: PlayerLobby[],
    categoryId: CategoryId,
  ) => Promise<unknown>,
): Promise<GameRequest> => {
  const gameRequestAnswered = await getGameRequest(redisClient, id)

  if (!gameRequestAnswered) {
    throw new UserInputError(`No game request with id ${id}`)
  }

  if (gameRequestAnswered.playerOfferedId !== playerId) {
    throw new ForbiddenError("Can't answer requests directed to other platers")
  }

  gameRequestAnswered.accepted = accepted
  pubSub.publish(GAME_REQUEST, {
    gameRequestSubscription: {
      gameRequest: gameRequestAnswered,
      mutation: 'UPDATE',
    },
  })

  await deleteGameRequest(redisClient, pubSub, playerId, gameRequestAnswered)

  if (accepted) {
    const players = [
      getPlayer(redisClient, playerId),
      getPlayer(redisClient, gameRequestAnswered.playerRequestId),
    ]

    const playersResolved = await Promise.all(players)
    if (playersResolved.some(p => p === null)) {
      throw new Error(`Player deleted`)
    }

    await createGameMultiplayer(
      redisClient,
      pubSub,
      playersResolved as PlayerLobby[],
      gameRequestAnswered.categoryId,
    )
  }

  return gameRequestAnswered
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
  answerGameRequest,
}
