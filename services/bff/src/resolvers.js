const { PubSub, withFilter } = require('graphql-subscriptions')
const {
  GameNotFoundError,
} = require('./errors');

const {
  PLAYER_JOINED,
  GAME_REQUEST,
  GAME_SINGLEPLAYER,
  GAME_MULTIPLAYER,
} = require('./triggers')

const {
  getGameByPlayerId: getGameByPlayerIdSingleplayer,
  createGame: createGameSingleplayer,
  deleteGame: deleteGameSingleplayer,
  answerQuestion: answerQuestionSingleplayer,
  updateQuestionByPlayerId: updateQuestionByPlayerIdSingleplayer,
} = require('./models/singleplayer')

const {
  getGameRequestById: getGameRequestByIdLobby,
  getPlayerById: getPlayerByIdLobby,
  addPlayer: addPlayerLobby,
  getPlayers: getPlayersLobby,
  addGameRequest: addGameRequestLobby,
  getGameRequestByPlayerId: getGameRequestByPlayerIdLobby,
  deleteGameRequestById: deleteGameRequestByIdLobby
} = require('./models/lobby')

const {
  getGameByPlayerId: getGameByPlayerIdMultiplayer,
  createGame: createGameMultiplayer,
  updateQuestionByPlayerId: updateQuestionByPlayerIdMultiplayer,
  answerQuestion: answerQuestionMultiplayer,
  removePlayerFromGame: removePlayerFromGameMultiplayer,
} = require('./models/multiplayer')

const { filterGame } = require('./models/utils')

const pubsub = new PubSub()

const resolvers = ({
  Query: {
    categories: () => {
      return [{ id: 'game-of-thrones', label: 'Game of Thrones' }]
    },
    gameSingleplayer: (_, __, context) => {
      const { currentUser: { playerId } } = context
      try {
        return getGameByPlayerIdSingleplayer(playerId)
      } catch (e) {
        if (e instanceof GameNotFoundError) {
          return null
        } else {
          throw e
        }
      }
    },
    lobby: (_, __, context) => {
      const { currentUser: { playerId } } = context
      const players = getPlayersLobby()
      const hasJoined = players.some(p => p.id === playerId)
      return {
        players,
        hasJoined
      }
    },
    gameRequest: (_, __, context) => {
      const { currentUser: { playerId } } = context
      const gameRequest = getGameRequestByPlayerIdLobby(playerId)
      return gameRequest
    },
    gameMultiplayer: (_, __, context) => {
      const { currentUser: { playerId } } = context
      try {
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
    createGameSingleplayer: (_, { playerId, category }) => {
      return createGameSingleplayer(playerId, category)
    },
    deleteGameSingleplayer: (_, { id }) => {
      const filteredGame = filterGame(deleteGameSingleplayer(id))
      return filteredGame
    },
    answerQuestionSingleplayer: (_, { answerId, questionId }, context) => {
      const { currentUser: { playerId } } = context

      const filteredGame = filterGame(answerQuestionSingleplayer(playerId, questionId, answerId))

      pubsub.publish(GAME_SINGLEPLAYER, {
        gameSingleplayer: {
          game: filteredGame,
          mutation: 'UPDATE'
        }
      })

      setTimeout(() => {
        const gameNewQuestion = updateQuestionByPlayerIdSingleplayer(playerId)
        pubsub.publish(GAME_SINGLEPLAYER, {
          gameSingleplayer: {
            mutation: 'UPDATE',
            game: gameNewQuestion
          }
        })
      }, 800)
      return filteredGame
    },
    addPlayer: (_, { id }) => {
      let player
      try {
        player = getPlayerByIdLobby(id)
      } catch {
        player = { id }
        addPlayerLobby(player)
      }
      return player
    },
    joinLobby: (_, { player: { id, category, name } }) => {
      const player = getPlayerByIdLobby(id)
      player.category = category
      player.name = name
      pubsub.publish(PLAYER_JOINED, {
        playerJoined: player
      })
      return player
    },
    requestGame: (_, { gameRequest: { playerRequestId, playerOfferedId, category } }) => {
      const gameRequested = addGameRequestLobby(pubsub, playerRequestId, playerOfferedId, category)

      return gameRequested
    },
    answerGameRequest: async (_, { id, accepted }, { currentUser: { playerId } }) => {
      const gameRequestAnswered = getGameRequestByIdLobby(id)
      if (!gameRequestAnswered.playerOfferedId === playerId) {
        return gameRequestAnswered
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
    answerQuestionMultiplayer: (_, { answerId, questionId }, context) => {
      const { currentUser: { playerId } } = context
      const filteredGame = filterGame(answerQuestionMultiplayer(playerId, questionId, answerId))

      pubsub.publish(GAME_MULTIPLAYER, {
        gameMultiplayer: {
          game: filteredGame,
          mutation: 'UPDATE'
        }
      })

      setTimeout(() => {
        const filteredGame = filterGame(updateQuestionByPlayerIdMultiplayer(playerId))

        pubsub.publish(GAME_MULTIPLAYER, {
          gameMultiplayer: {
            game: filteredGame,
            mutation: 'UPDATE'
          }
        })
      }, 800)

      return filteredGame
    },
    removePlayerFromGameMultiplayer: (_, { id }, { currentUser: { playerId } }) => {
      const filteredGame = filterGame(removePlayerFromGameMultiplayer(pubsub, playerId, id))

      return filteredGame
    },
    deleteGameRequest: (_, { id }, { currentUser: { playerId } }) => {
      const gameRequest = deleteGameRequestByIdLobby(pubsub, playerId, id)

      return gameRequest
    }
  },
  Subscription: {
    gameSingleplayer: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GAME_SINGLEPLAYER),
        (payload, _, context) => {
          const { currentUser: { playerId } } = context
          const { gameSingleplayer: { game } } = payload
          return playerId === game.playerId
        })
    },
    playerJoined: {
      subscribe: () => pubsub.asyncIterator(PLAYER_JOINED)
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
    gameMultiplayer: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(GAME_MULTIPLAYER),
        (payload, variables, context) => {
          const { currentUser: { playerId } } = context
          const { gameMultiplayer: { game: { players }, mutation } } = payload
          return players.some(p => p.id === playerId) &&
            (!variables.mutation || variables.mutation === mutation)
        })
    },
  }
})

module.exports = resolvers
