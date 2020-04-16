import { Context, AnswerQuestionInput } from './types'
import {
    getGameByPlayerId,
    createGame,
    deleteGameByPlayerId,
    answerQuestion,
} from '../models/singleplayer'

import {
    GAME_SINGLEPLAYER,
} from '../triggers'
import { CategoryId } from '../models/category'

import { filterGame } from '../models/utils'
import { Redis } from 'ioredis'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { withFilter } from 'graphql-subscriptions'
import { filter } from 'ramda'

type CreateGameSingleplayerInput = {
    game: {
        categoryId: CategoryId
        playerId: string
    }
}

type DeleteGameSingleplayerInput = {
    id: string
}

export const singleplayerQueryResolvers = (redisClient: Redis) => ({
    gameSingleplayer: async (_: unknown, __: unknown, context: Context) => {
        const { currentUser: { playerId } } = context
        const game = await getGameByPlayerId(redisClient, playerId)
        const filteredGame = filterGame(game)
        return filteredGame
    }
})

export const singleplayerMutationResolvers = (redisClient: Redis, pubSub: RedisPubSub) => ({
    createGameSingleplayer: async (_: unknown, { game: { playerId, categoryId } }: CreateGameSingleplayerInput) => {
        const game = await createGame(redisClient, playerId, categoryId)
        const filteredGame = filterGame(game)
        return {
            game: filteredGame,
            code: 201,
            success: true,
            message: 'Singleplayer game created'
        }
    },
    deleteGameSingleplayer: async (_: unknown, { }: DeleteGameSingleplayerInput, context: Context) => {
        const { currentUser: { playerId } } = context
        const game = await deleteGameByPlayerId(redisClient, playerId)
        const filteredGame = filterGame(game)
        return {
            game: filteredGame,
            code: 200,
            success: true,
            message: 'Singleplayer game deleted'
        }
    },
    answerQuestionSingleplayer: async (_: unknown, { answer: { answerId, questionId } }: AnswerQuestionInput, context: Context) => {
        const { currentUser: { playerId } } = context

        const game = await answerQuestion(redisClient, pubSub, playerId, questionId, answerId)
        const filteredGame = filterGame(game)
        return {
            game: filteredGame,
            code: 200,
            success: true,
            message: 'Question answered'
        }
    }
})

export const singleplayerSubscriptionResolvers = (pubSub: RedisPubSub) =>
    ({
        gameSingleplayerSubscription: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(GAME_SINGLEPLAYER),
                (payload, _: unknown, context) => {
                    const { currentUser: { playerId } } = context
                    const { gameSingleplayerSubscription: { gameSingleplayer } } = payload
                    return playerId === gameSingleplayer.playerId
                })
        },
    })