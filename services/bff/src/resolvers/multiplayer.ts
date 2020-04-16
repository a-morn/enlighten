import { Context, AnswerQuestionInput } from './types'

import {
    getGameByPlayerId,
    answerQuestion,
    removePlayerFromGame,
    updateTimestampForPlayer
} from '../models/multiplayer'
import {
    GAME_MULTIPLAYER,
} from '../triggers'
import { GameMultiplayer } from '../models/game'

import { filterGame } from '../models/utils'
import { Redis } from 'ioredis'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { withFilter } from 'graphql-subscriptions'

type RemovePlayerInput = {
    player: {
        id: string
    }
}

type GameMultiPlayerSubscription = {
    mutation: String
    gameMultiplayer: GameMultiplayer
}

export const multiplayerQueryResolvers = (redisClient: Redis) => ({
    gameMultiplayer:
        async (_: unknown, __: unknown, context: Context) => {
            const { currentUser: { playerId } } = context
            const game = await getGameByPlayerId(redisClient, playerId);
            const filteredGame = filterGame(game);
            return filteredGame
        }
})

export const multiplayerMutationResolvers = (redisClient: Redis, pubSub: RedisPubSub) => ({
    answerQuestionMultiplayer: async (_: unknown, { answer: { answerId, questionId } }: AnswerQuestionInput, context: Context) => {
        const { currentUser: { playerId } } = context
        const question = await answerQuestion(redisClient, pubSub, playerId, questionId, answerId)

        return {
            question,
            code: 201,
            success: true,
            message: 'Singleplayer game created'
        }
    },
    removePlayerFromGameMultiplayer: async (_: unknown, { player: { id } }: RemovePlayerInput, { currentUser: { playerId } }: Context) => {
        const game = await removePlayerFromGame(redisClient, pubSub, playerId, id)
        const filteredGame = filterGame(game)
        return {
            game: filteredGame,
            code: 201,
            success: true,
            message: 'Player left game created'
        }
    },
    pingMultiplayer: async (_: unknown, __: unknown, context: Context) => {
        const { currentUser: { playerId } } = context
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
            message: 'Pong'
        }
    },

})

export const multiplayerSubscriptionResolvers = (pubSub: RedisPubSub) => ({
    gameMultiplayerSubscription: {
        subscribe: withFilter(
            () => pubSub.asyncIterator(GAME_MULTIPLAYER),
            (payload: { gameMultiplayerSubscription: GameMultiPlayerSubscription }, _: unknown, context: Context) => {
                const { currentUser: { playerId } } = context
                const { gameMultiplayerSubscription: { gameMultiplayer: { players } } } = payload
                return players.some(p => p.id === playerId && !p.hasLeft)
            })
    },
})