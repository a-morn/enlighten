import { isUndefined } from 'util';
import { withFilter } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import {
  GameNotFoundError,
} from './errors';

import {
  LOBBY_SUBSCRIPTION,
  LOBBY_PING,
  GAME_REQUEST,
  GAME_SINGLEPLAYER,
  GAME_MULTIPLAYER,
} from './triggers'
import { PlayerLobby } from './models/player'
import { GameMultiplayer } from './models/game'

import {
  getGameByPlayerId as getGameByPlayerIdSingleplayer,
  createGame as createGameSingleplayer,
  deleteGame as deleteGameSingleplayer,
  answerQuestion as answerQuestionSingleplayer,
  updateQuestionByPlayerId as updateQuestionByPlayerIdSingleplayer,
} from './models/singleplayer'

import {
  getGameRequestById as getGameRequestByIdLobby,
  getPlayerById as getPlayerByIdLobby,
  addPlayer as addPlayerLobby,
  removePlayer as removePlayerLobby,
  getPlayers as getPlayersLobby,
  addGameRequest as addGameRequestLobby,
  getGameRequestByPlayerId as getGameRequestByPlayerIdLobby,
  deleteGameRequestById as deleteGameRequestByIdLobby
} from './models/lobby'

import {
  getGameByPlayerId as getGameByPlayerIdMultiplayer,
  createGame as createGameMultiplayer,
  updateQuestionByPlayerId as updateQuestionByPlayerIdMultiplayer,
  answerQuestion as answerQuestionMultiplayer,
  removePlayerFromGame as removePlayerFromGameMultiplayer,
  updateTimestampForPlayer as updateTimestampForPlayerMultiplayer
} from './models/multiplayer'

import { Category } from './models/category'

import { filterGame, isCategory } from './models/utils'

const options = {
  retryStrategy: (times: number) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  }
};

if (isUndefined(process.env.REDIS_PORT_NUMBER)) {
  throw new Error()
}

const pubsub = new RedisPubSub({
  publisher: new Redis(
    parseInt(process.env.REDIS_PORT_NUMBER, 10),
    process.env.REDIS_DOMAIN_NAME,
    options
  ),
  subscriber: new Redis(
    parseInt(process.env.REDIS_PORT_NUMBER, 10),
    process.env.REDIS_DOMAIN_NAME,
    options
  )
})

export type Context = {
  currentUser: {
    playerId: string
  }
}

type CreateGameSingleplayerInput = {
  category: Category
  playerId: string
}

type DeleteGameSingleplayerInput = {
  id: string
}

type AnswerQuestionInput = {
  questionId: string
  answerId: string
}

type RemovePlayerInput = {
  id: string
}

type JoinLobbyInput = {
  player: {
    id: string
    category: string
    name: string
  }
}

type RequestGameInput = {
  gameRequest: {
    playerRequestId: string
    playerOfferedId: string
    category: string
  }
}

type AnswerGameRequestInput = {
  id: string,
  accepted: boolean
}

type DeleteGameRequestInput = {
  id: string,
}

type GameMultiPlayerSubscription = {
  mutation: String
  gameMultiplayer: GameMultiplayer
}

const resolvers = ({
  Query: {
    categories: () => {
      return [
        { id: 'game-of-thrones', label: 'Game of Thrones' },
        { id: 'countries', label: 'Countries' }
      ]
    },
    gameSingleplayer: (_: unknown, __: unknown, context: Context) => {
      const { currentUser: { playerId } } = context
      try {
        const filteredGame = filterGame(getGameByPlayerIdSingleplayer(playerId))
        return filteredGame
      } catch (e) {
        if (e instanceof GameNotFoundError) {
          return null
        } else {
          throw e
        }
      }
    },
    lobby: (_: unknown, __: unknown, context: Context) => {
      const { currentUser: { playerId } } = context
      try {
        const player = getPlayerByIdLobby(playerId)
        player.timestamp = new Date()
      } catch {
        // Player not in lobbyy
      }

      const players = getPlayersLobby()
      return {
        players,
      }
    },
    gameRequest: (_: unknown, __: unknown, context: Context) => {
      const { currentUser: { playerId } } = context
      const gameRequest = getGameRequestByPlayerIdLobby(playerId)
      return gameRequest
    },
    gameMultiplayer: (_: unknown, __: unknown, context: Context) => {
      const { currentUser: { playerId } } = context
      try {
        updateTimestampForPlayerMultiplayer(playerId)
        const game = getGameByPlayerIdMultiplayer(playerId);
        const filteredGame = filterGame(game);
        return filteredGame
      } catch (e) {
        if (e instanceof GameNotFoundError) {
          return null
        } else {
          throw e
        }
      }
    },
  },
  Mutation: {
    createGameSingleplayer: (_: unknown, { playerId, category }: CreateGameSingleplayerInput) => {
      return createGameSingleplayer(playerId, category)
    },
    deleteGameSingleplayer: (_: unknown, { id }: DeleteGameSingleplayerInput) => {
      const filteredGame = filterGame(deleteGameSingleplayer(id))
      return filteredGame
    },
    answerQuestionSingleplayer: (_: unknown, { answerId, questionId }: AnswerQuestionInput, context: Context) => {
      const { currentUser: { playerId } } = context

      const game = answerQuestionSingleplayer(playerId, questionId, answerId)

      pubsub.publish(GAME_SINGLEPLAYER, {
        gameSingleplayerSubscription: {
          gameSingleplayer: game,
          mutation: 'UPDATE'
        }
      })

      setTimeout(() => {
        const gameFiltered = filterGame(updateQuestionByPlayerIdSingleplayer(playerId))
        pubsub.publish(GAME_SINGLEPLAYER, {
          gameSingleplayerSubscription: {
            mutation: 'UPDATE',
            gameSingleplayer: gameFiltered
          }
        })
      }, 800)
      return game
    },
    joinLobby: (_: unknown, { player: { id, category, name } }: JoinLobbyInput) => {
      let player
      try {
        player = getPlayerByIdLobby(id)
        player.timestamp = new Date()
      } catch {
        player = { id, category, name, timestamp: new Date() }
        addPlayerLobby(pubsub, player as PlayerLobby)
      }
      return player
    },
    requestGame: (_: unknown, { gameRequest: { playerRequestId, playerOfferedId, category } }: RequestGameInput) => {
      if (!isCategory(category)) {
        throw new Error('Incorrect category')
      }
      const gameRequested = addGameRequestLobby(pubsub, playerRequestId, playerOfferedId, category)

      return gameRequested
    },
    answerGameRequest: async (_: unknown, { id, accepted }: AnswerGameRequestInput, { currentUser: { playerId } }: Context) => {
      const gameRequestAnswered = getGameRequestByIdLobby(id)
      if (gameRequestAnswered.playerOfferedId !== playerId) {
        return null
      }
      gameRequestAnswered.accepted = accepted
      pubsub.publish(GAME_REQUEST, {
        gameRequestSubscription: {
          gameRequest: gameRequestAnswered,
          mutation: "UPDATE"
        }
      })

      if (accepted) {
        const players = [
          getPlayerByIdLobby(playerId),
          getPlayerByIdLobby(gameRequestAnswered.playerRequestId)
        ]
        createGameMultiplayer(pubsub, players, gameRequestAnswered.category)
      } else {
        deleteGameRequestByIdLobby(pubsub, playerId, id)
      }
      return gameRequestAnswered
    },
    answerQuestionMultiplayer: (_: unknown, { answerId, questionId }: AnswerQuestionInput, context: Context) => {
      const { currentUser: { playerId } } = context
      const filteredGame = filterGame(answerQuestionMultiplayer(playerId, questionId, answerId))

      pubsub.publish(GAME_MULTIPLAYER, {
        gameMultiplayerSubscription: {
          gameMultiplayer: filteredGame,
          mutation: 'UPDATE'
        }
      })

      setTimeout(() => {
        const filteredGameWithNewQuestion = filterGame(updateQuestionByPlayerIdMultiplayer(playerId))

        pubsub.publish(GAME_MULTIPLAYER, {
          gameMultiplayerSubscription: {
            gameMultiplayer: filteredGameWithNewQuestion,
            mutation: 'UPDATE'
          }
        })
      }, 800)

      return filteredGame
    },
    removePlayerFromGameMultiplayer: (_: unknown, { id }: RemovePlayerInput, { currentUser: { playerId } }: Context) => {
      const filteredGame = filterGame(removePlayerFromGameMultiplayer(pubsub, playerId, id))

      return filteredGame
    },
    deleteGameRequest: (_: unknown, { id }: DeleteGameRequestInput, { currentUser: { playerId } }: Context) => {
      const gameRequest = deleteGameRequestByIdLobby(pubsub, playerId, id)

      return gameRequest
    }
  },
  Subscription: {
    gameSingleplayerSubscription: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GAME_SINGLEPLAYER),
        (payload, _: unknown, context) => {
          const { currentUser: { playerId } } = context
          const { gameSingleplayerSubscription: { gameSingleplayer } } = payload
          return playerId === gameSingleplayer.playerId
        })
    },
    lobby: {
      subscribe: () => pubsub.asyncIterator(LOBBY_SUBSCRIPTION)
    },
    pingLobby: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(LOBBY_PING),
        (payload: { player: PlayerLobby }, _: unknown, context: Context) => {
          const { currentUser: { playerId } } = context
          const { player: { id } } = payload
          return id === playerId
        })
    },
    gameRequestSubscription: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GAME_REQUEST),
        (payload, variables, context) => {
          const { currentUser: { playerId } } = context
          const {
            gameRequestSubscription: {
              gameRequest: { playerOfferedId, playerRequestId }, mutation
            }
          } = payload
          return [playerOfferedId, playerRequestId].includes(playerId)
            && (!variables.mutation || variables.mutation === mutation)
        }
      )
    },
    gameMultiplayerSubscription: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GAME_MULTIPLAYER),
        (payload: { gameMultiplayerSubscription: GameMultiPlayerSubscription }, _: unknown, context: Context) => {
          const { currentUser: { playerId } } = context
          const { gameMultiplayerSubscription: { gameMultiplayer: { players } } } = payload
          return players.some(p => p.id === playerId)
        })
    },
  }
})

export default resolvers
