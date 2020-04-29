import { Question } from 'enlighten-common-types'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ResolverFn, withFilter } from 'graphql-subscriptions'
import { Redis } from 'ioredis'
import {
  answerQuestion,
  getGameByPlayerId,
  removePlayerFromGame,
  updateTimestampForPlayer,
} from '../models/multiplayer'
import { filterGame } from '../models/utils'
import { GAME_MULTIPLAYER } from '../triggers'

import {
  AnswerQuestionInput,
  Context,
  GameMultiplayer,
  MutationResponse,
  PlayerMultiplayer,
} from '../types'

type RemovePlayerInput = {
  player: {
    id: string
  }
}

type GameMultiPlayerSubscription = {
  mutation: string
  gameMultiplayer: GameMultiplayer
}

type GameQuestionMutationResponse = MutationResponse & {
  question: Question
}

type GameMultiplayerMutationResponse = MutationResponse & {
  game: GameMultiplayer | null
}

type PlayerMultiplayerMutationResponse = MutationResponse & {
  player: PlayerMultiplayer | null
}

export const multiplayerQueryResolvers = (
  redisClient: Redis,
): {
  gameMultiplayer(
    _: unknown,
    __: unknown,
    context: Context,
  ): Promise<GameMultiplayer | null>
} => ({
  gameMultiplayer: async (_, __, context): Promise<GameMultiplayer | null> => {
    const {
      currentUser: { playerId },
    } = context
    const game = await getGameByPlayerId(redisClient, playerId)
    const filteredGame = filterGame(game)
    return filteredGame
  },
})

export const multiplayerMutationResolvers = (
  redisClient: Redis,
  pubSub: RedisPubSub,
): {
  answerQuestionMultiplayer(
    _: unknown,
    input: AnswerQuestionInput,
    context: Context,
  ): Promise<GameQuestionMutationResponse>
  removePlayerFromGameMultiplayer(
    _: unknown,
    input: RemovePlayerInput,
    context: Context,
  ): Promise<GameMultiplayerMutationResponse>
  pingMultiplayer(
    _: unknown,
    __: unknown,
    context: Context,
  ): Promise<PlayerMultiplayerMutationResponse>
} => ({
  answerQuestionMultiplayer: async (
    _,
    { answer: { answerId, questionId } },
    context,
  ): Promise<GameQuestionMutationResponse> => {
    const {
      currentUser: { playerId },
    } = context
    const question = await answerQuestion(
      redisClient,
      pubSub,
      playerId,
      questionId,
      answerId,
    )

    return {
      question,
      code: 201,
      success: true,
      message: 'Multiplayer game created',
    }
  },
  removePlayerFromGameMultiplayer: async (
    _,
    { player: { id } },
    { currentUser: { playerId } },
  ): Promise<GameMultiplayerMutationResponse> => {
    const game = await removePlayerFromGame(redisClient, pubSub, playerId, id)
    const filteredGame = filterGame(game)
    return {
      game: filteredGame,
      code: 201,
      success: true,
      message: 'Player left game created',
    }
  },
  pingMultiplayer: async (
    _: unknown,
    __: unknown,
    context: Context,
  ): Promise<PlayerMultiplayerMutationResponse> => {
    const {
      currentUser: { playerId },
    } = context
    let player = null
    let success = false
    player = await updateTimestampForPlayer(redisClient, pubSub, playerId)

    if (player === null) {
      success = true
    }

    return {
      player,
      code: 200,
      success,
      message: 'Pong',
    }
  },
})

export const multiplayerSubscriptionResolvers = (
  pubSub: RedisPubSub,
): {
  gameMultiplayerSubscription: { subscribe: ResolverFn }
} => ({
  gameMultiplayerSubscription: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(GAME_MULTIPLAYER),
      (
        payload: { gameMultiplayerSubscription: GameMultiPlayerSubscription },
        _: unknown,
        context: Context,
      ) => {
        const {
          currentUser: { playerId },
        } = context
        const {
          gameMultiplayerSubscription: {
            gameMultiplayer: { players },
          },
        } = payload
        return players.some(p => p.id === playerId && !p.hasLeft)
      },
    ),
  },
})
