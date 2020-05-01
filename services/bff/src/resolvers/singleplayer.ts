import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ResolverFn, withFilter } from 'graphql-subscriptions'
import { Redis } from 'ioredis'
import {
  answerQuestion,
  createGame,
  deleteGameByPlayerId,
  getGameByPlayerId,
} from '../models/singleplayer'
import { GAME_SINGLEPLAYER } from 'enlighten-common-graphql'
import { filterGame } from 'enlighten-common-utils'
import {
  AnswerQuestionInput,
  CategoryId,
  Context,
  GameSingeplayer,
  MutationResponse,
} from 'enlighten-common-types'

type CreateGameSingleplayerInput = {
  game: {
    categoryId: CategoryId
    playerId: string
  }
}

type GameSingleplayeMutationrResponse = MutationResponse & {
  game: GameSingeplayer | null
}

type DeleteGameSingleplayerInput = {
  id: string
}

export function singleplayerQueryResolvers(
  redisClient: Redis,
): {
  gameSingleplayer: (
    _: unknown,
    __: unknown,
    context: Context,
  ) => Promise<GameSingeplayer | null>
} {
  return {
    gameSingleplayer: async (
      _,
      __,
      context,
    ): Promise<GameSingeplayer | null> => {
      const {
        currentUser: { playerId },
      } = context
      const game = await getGameByPlayerId(redisClient, playerId)
      const filteredGame = filterGame(game)
      return filteredGame
    },
  }
}

export const singleplayerMutationResolvers = (
  redisClient: Redis,
  pubSub: RedisPubSub,
): {
  createGameSingleplayer: (
    _: unknown,
    input: CreateGameSingleplayerInput,
  ) => Promise<GameSingleplayeMutationrResponse>
  deleteGameSingleplayer: (
    _: unknown,
    input: DeleteGameSingleplayerInput,
    context: Context,
  ) => Promise<GameSingleplayeMutationrResponse>
  answerQuestionSingleplayer: (
    _: unknown,
    input: AnswerQuestionInput,
    context: Context,
  ) => Promise<GameSingleplayeMutationrResponse>
} => ({
  createGameSingleplayer: async (
    _,
    { game: { playerId, categoryId } },
  ): Promise<GameSingleplayeMutationrResponse> => {
    const game = await createGame(redisClient, playerId, categoryId)
    const filteredGame = filterGame(game)

    return {
      game: filteredGame,
      code: game ? 201 : 500,
      success: game !== null,
      message: game ? 'Singleplayer game created' : '',
    }
  },
  deleteGameSingleplayer: async (
    _,
    __,
    context,
  ): Promise<GameSingleplayeMutationrResponse> => {
    const {
      currentUser: { playerId },
    } = context
    const game = await deleteGameByPlayerId(redisClient, playerId)
    const filteredGame = filterGame(game)
    return {
      game: filteredGame,
      code: 200,
      success: true,
      message: 'Singleplayer game deleted',
    }
  },
  answerQuestionSingleplayer: async (
    _,
    { answer: { answerId, questionId } },
    context,
  ): Promise<GameSingleplayeMutationrResponse> => {
    const {
      currentUser: { playerId },
    } = context

    const game = await answerQuestion(
      redisClient,
      pubSub,
      playerId,
      questionId,
      answerId,
    )
    const filteredGame = filterGame(game)
    return {
      game: filteredGame,
      code: 200,
      success: true,
      message: 'Question answered',
    }
  },
})

export const singleplayerSubscriptionResolvers = (
  pubSub: RedisPubSub,
): {
  gameSingleplayerSubscription: { subscribe: ResolverFn }
} => ({
  gameSingleplayerSubscription: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(GAME_SINGLEPLAYER),
      (payload, _: unknown, context) => {
        const {
          currentUser: { playerId },
        } = context
        const {
          gameSingleplayerSubscription: { gameSingleplayer },
        } = payload
        return playerId === gameSingleplayer.playerId
      },
    ),
  },
})
