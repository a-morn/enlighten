import { GAME_SINGLEPLAYER } from 'enlighten-common-graphql'
import {
  AnswerQuestionInput,
  Context,
  GameSingeplayer,
  MutationResponse,
} from 'enlighten-common-types'
import { filterGame } from 'enlighten-common-utils'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ResolverFn, withFilter } from 'graphql-subscriptions'
import { Redis } from 'ioredis'
import {
  answerQuestion,
  createGame,
  deleteGameByPlayerId,
  getGameByPlayerId,
  changeLevel,
} from '../models/singleplayer'

type CreateGameSingleplayerInput = {
  game: {
    categoryId: string
    playerId: string
  }
}

type GameSingleplayeMutationResponse = MutationResponse & {
  game: GameSingeplayer | null
}

type DeleteGameSingleplayerInput = {
  id: string
}

type GameChangeLevelSingleplayerResponse = MutationResponse & {
  game: GameSingeplayer | null
}

type ChangeLevelSingleplayerInput = {
  levelId: string
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
  ) => Promise<GameSingleplayeMutationResponse>
  deleteGameSingleplayer: (
    _: unknown,
    input: DeleteGameSingleplayerInput,
    context: Context,
  ) => Promise<GameSingleplayeMutationResponse>
  answerQuestionSingleplayer: (
    _: unknown,
    input: AnswerQuestionInput,
    context: Context,
  ) => Promise<GameSingleplayeMutationResponse>
  changeLevelSingleplayer: (
    _: unknown,
    input: ChangeLevelSingleplayerInput,
    context: Context,
  ) => Promise<GameSingleplayeMutationResponse>
} => ({
  createGameSingleplayer: async (
    _,
    { game: { playerId, categoryId } },
  ): Promise<GameSingleplayeMutationResponse> => {
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
  ): Promise<GameSingleplayeMutationResponse> => {
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
    { answer: { answerIds, questionId } },
    context,
  ): Promise<GameSingleplayeMutationResponse> => {
    const {
      currentUser: { playerId },
    } = context

    const game = await answerQuestion(
      redisClient,
      pubSub,
      playerId,
      questionId,
      answerIds,
    )
    const filteredGame = filterGame(game)
    return {
      game: filteredGame,
      code: 200,
      success: true,
      message: 'Question answered',
    }
  },
  changeLevelSingleplayer: async (
    _,
    { levelId },
    context,
  ): Promise<GameChangeLevelSingleplayerResponse> => {
    const {
      currentUser: { playerId },
    } = context

    const game = await changeLevel(redisClient, pubSub, playerId, levelId)
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
