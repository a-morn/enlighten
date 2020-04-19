import { ForbiddenError, UserInputError } from 'apollo-server'

import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ResolverFn, withFilter } from 'graphql-subscriptions'

import { Redis } from 'ioredis'
import {
  addGameRequest,
  answerGameRequest,
  deleteGameRequest,
  getGameRequestIdByPlayerId,
  getPlayers,
  join,
  updatePlayerTimestamp,
} from '../models/lobby'
import { createGame } from '../models/multiplayer'
import { GAME_REQUEST, LOBBY_PLAYERS_SUBSCRIPTION } from '../triggers'

import {
  Context,
  GameRequest,
  MutationResponse,
  PlayerLobby,
  isCategoryId,
} from '../types'

type QueryLobbyResponse = { players: PlayerLobby[] }

type JoinLobbyInput = {
  player: {
    id: string
    categoryId: string
    name: string
  }
}

type PlayerLobbyMutationResponse = MutationResponse & {
  player: PlayerLobby | null
}

type GameRequestMutationResponse = MutationResponse & {
  gameRequest: GameRequest | null
}

type RequestGameInput = {
  gameRequest: {
    playerRequestId: string
    playerOfferedId: string
    categoryId: string
  }
}

type AnswerGameRequestInput = {
  answer: {
    gameRequestId: string
    accepted: boolean
  }
}

type DeleteGameRequestInput = {
  gameRequest: {
    gameRequestId: string
  }
}

export const lobbyQueryResolvers = (
  redisClient: Redis,
): {
  lobby(): Promise<QueryLobbyResponse>
  gameRequest(
    _: unknown,
    __: unknown,
    context: Context,
  ): Promise<GameRequest | null>
} => ({
  lobby: async (): Promise<QueryLobbyResponse> => {
    const players = await getPlayers(redisClient)
    return {
      players,
    }
  },
  gameRequest: (_, __, context): Promise<GameRequest | null> => {
    const {
      currentUser: { playerId },
    } = context
    const gameRequest = getGameRequestIdByPlayerId(redisClient, playerId)
    return gameRequest
  },
})

export const lobbyMutationResolvers = (
  redisClient: Redis,
  pubSub: RedisPubSub,
): {
  joinLobby(
    _: unknown,
    input: JoinLobbyInput,
  ): Promise<PlayerLobbyMutationResponse>
  pingLobby(
    _: unknown,
    __: unknown,
    context: Context,
  ): Promise<PlayerLobbyMutationResponse>
  requestGame(
    _: unknown,
    input: RequestGameInput,
    context: Context,
  ): Promise<GameRequestMutationResponse>
  answerGameRequest(
    _: unknown,
    input: AnswerGameRequestInput,
    context: Context,
  ): Promise<GameRequestMutationResponse>
  deleteGameRequest(
    _: unknown,
    input: DeleteGameRequestInput,
    context: Context,
  ): Promise<GameRequestMutationResponse>
} => ({
  joinLobby: async (
    _,
    { player: { id, categoryId, name } },
  ): Promise<PlayerLobbyMutationResponse> => {
    if (!isCategoryId(categoryId)) {
      throw new UserInputError('Incorrect category')
    }
    const player = await join(redisClient, pubSub, id, categoryId, name)

    return {
      player,
      code: 200,
      success: true,
      message: 'Player joined lobby',
    }
  },
  pingLobby: async (_, __, context): Promise<PlayerLobbyMutationResponse> => {
    const {
      currentUser: { playerId },
    } = context
    const player = await updatePlayerTimestamp(redisClient, playerId)

    return {
      player,
      code: player !== null ? 200 : 404,
      success: player !== null,
      message: player !== null ? 'Pong' : 'No pong :(',
    }
  },
  requestGame: async (
    _,
    { gameRequest: { playerRequestId, playerOfferedId, categoryId } },
    context,
  ): Promise<GameRequestMutationResponse> => {
    const {
      currentUser: { playerId },
    } = context
    if (!isCategoryId(categoryId)) {
      throw new UserInputError('Incorrect category')
    }
    if (playerId !== playerRequestId) {
      throw new ForbiddenError("Can't request games for other players")
    }
    const gameRequest = await addGameRequest(
      redisClient,
      pubSub,
      playerRequestId,
      playerOfferedId,
      categoryId,
    )

    return {
      gameRequest,
      code: 201,
      success: true,
      message: 'Game request created',
    }
  },
  answerGameRequest: async (
    _: unknown,
    { answer: { gameRequestId, accepted } }: AnswerGameRequestInput,
    { currentUser: { playerId } }: Context,
  ): Promise<GameRequestMutationResponse> => {
    const gameRequest = await answerGameRequest(
      redisClient,
      pubSub,
      gameRequestId,
      accepted,
      playerId,
      createGame,
    )

    return {
      gameRequest,
      code: 200,
      success: true,
      message: 'Game request answered',
    }
  },
  deleteGameRequest: async (
    _: unknown,
    { gameRequest: { gameRequestId } }: DeleteGameRequestInput,
    { currentUser: { playerId } }: Context,
  ): Promise<GameRequestMutationResponse> => {
    const gameRequest = await deleteGameRequest(
      redisClient,
      pubSub,
      playerId,
      null,
      gameRequestId,
    )

    return {
      gameRequest,
      code: 200,
      success: true,
      message: 'Game request deleted',
    }
  },
})

export const lobbySubscriptionResolvers = (
  pubSub: RedisPubSub,
): {
  lobbyPlayerSubscription: { subscribe: ResolverFn }
  gameRequestSubscription: { subscribe: ResolverFn }
} => ({
  lobbyPlayerSubscription: {
    subscribe: (): AsyncIterator<unknown, unknown, undefined> =>
      pubSub.asyncIterator(LOBBY_PLAYERS_SUBSCRIPTION),
  },
  gameRequestSubscription: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(GAME_REQUEST),
      (payload, variables, context) => {
        const {
          currentUser: { playerId },
        } = context
        const {
          gameRequestSubscription: {
            gameRequest: { playerOfferedId, playerRequestId },
            mutation,
          },
        } = payload
        return (
          [playerOfferedId, playerRequestId].includes(playerId) &&
          (!variables.mutation || variables.mutation === mutation)
        )
      },
    ),
  },
})
