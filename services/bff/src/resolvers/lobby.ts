import { Context } from './types'

import { ForbiddenError, UserInputError } from 'apollo-server'

import {
  getPlayers,
  addGameRequest,
  getGameRequestIdByPlayerId,
  deleteGameRequest,
  updatePlayerTimestamp,
  join,
  answerGameRequest,
} from '../models/lobby'
import { LOBBY_PLAYERS_SUBSCRIPTION, GAME_REQUEST } from '../triggers'

import { PlayerLobby } from '../models/player'

import { createGame } from '../models/multiplayer'

import { CategoryId, isCategoryId } from '../models/category'

import { Redis } from 'ioredis'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { withFilter } from 'graphql-subscriptions'

type JoinLobbyInput = {
  player: {
    id: string
    categoryId: string
    name: string
  }
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

export const lobbyQueryResolvers = (redisClient: Redis) => ({
  lobby: async (_: unknown, __: unknown, context: Context) => {
    const players = getPlayers(redisClient)
    return {
      players,
    }
  },
  gameRequest: (_: unknown, __: unknown, context: Context) => {
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
) => ({
  joinLobby: (
    _: unknown,
    { player: { id, categoryId, name } }: JoinLobbyInput,
  ) => {
    if (!isCategoryId(categoryId)) {
      throw new UserInputError('Incorrect category')
    }
    const player = join(redisClient, pubSub, id, categoryId, name)

    return {
      player,
      code: 200,
      success: true,
      message: 'Player joined lobby',
    }
  },
  pingLobby: async (_: unknown, __: unknown, context: Context) => {
    const {
      currentUser: { playerId },
    } = context
    const player = await updatePlayerTimestamp(redisClient, playerId)

    return {
      player,
      code: 200,
      success: player !== null,
      message: 'Pong',
    }
  },
  requestGame: async (
    _: unknown,
    {
      gameRequest: { playerRequestId, playerOfferedId, categoryId },
    }: RequestGameInput,
    context: Context,
  ) => {
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
  ) => {
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
  ) => {
    const gameRequest = await deleteGameRequest(
      redisClient,
      pubSub,
      playerId,
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

export const lobbySubscriptionResolvers = (pubSub: RedisPubSub) => ({
  lobbyPlayerSubscription: {
    subscribe: () => pubSub.asyncIterator(LOBBY_PLAYERS_SUBSCRIPTION),
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
        if (!payload.gameRequestSubscription.gameRequest) {
          debugger
        }
        return (
          [playerOfferedId, playerRequestId].includes(playerId) &&
          (!variables.mutation || variables.mutation === mutation)
        )
      },
    ),
  },
})
