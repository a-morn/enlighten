import { isUndefined } from 'util'
import { UserInputError } from 'apollo-server'
import {
  GameMultiplayer,
  GameQuestion,
  CategoryId,
  PlayerLobby,
  PlayerMultiplayer,
  isGameMultiplayer,
} from 'enlighten-common-types'
import { getClient } from '../data/client'
import { findOneUser } from '../data/users'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Redis } from 'ioredis'
import shuffle from 'shuffle-array'
import { v4 as uuid } from 'uuid'
import { getCategory } from './category'
import { getQuestionsByCategory } from './questions'
import { GAME_MULTIPLAYER, updateGame } from 'enlighten-common-graphql'
import { filterGame } from 'enlighten-common-utils'

const getGame = async (
  redisClient: Redis,
  gameId: string,
): Promise<GameMultiplayer | null> => {
  const key = `multiplayer:games:${gameId}`
  const gameString = await redisClient.get(key)
  redisClient.expire(key, 3600)
  if (!gameString) {
    return null
  }
  const game = JSON.parse(gameString)

  if (!isGameMultiplayer(game)) {
    throw new UserInputError(`That's no game... ${Object.keys(game)}`)
  }
  return game
}

const getGameIdByPlayerId = async (
  redisClient: Redis,
  playerId: string,
): Promise<string | null> => {
  const playerGameIdString = await redisClient.get(
    `multiplayer:player-game-id:${playerId}`,
  )
  if (!playerGameIdString) {
    return null
  }

  return playerGameIdString
}

const getGameByPlayerId = async (
  redisClient: Redis,
  playerId: string,
): Promise<GameMultiplayer | null> => {
  const gameId = await getGameIdByPlayerId(redisClient, playerId)
  if (gameId === null) {
    return null
  }
  return getGame(redisClient, gameId)
}

const setGameIdForPlayer = async (
  redisClient: Redis,
  playerId: string,
  gameId: string,
): Promise<unknown> => {
  return redisClient.set(
    `multiplayer:player-game-id:${playerId}`,
    gameId,
    'EX',
    3600,
  )
}

const removePlayer = async (
  redisClient: Redis,
  playerId: string,
): Promise<unknown> => {
  return redisClient.del(`multiplayer:player-game-id:${playerId}`)
}

const deleteGameByGameId = async (
  redisClient: Redis,
  pubsub: RedisPubSub,
  gameId: string,
): Promise<void> => {
  const game = await getGame(redisClient, gameId)
  await redisClient.del(`multiplayer:games:${gameId}`)
  pubsub.publish(GAME_MULTIPLAYER, {
    gameMultiplayerSubscription: {
      gameMultiplayer: filterGame(game),
      mutation: 'DELETE',
    },
  })
}

const createGame = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  players: PlayerLobby[],
  categoryId: CategoryId,
): Promise<GameMultiplayer> => {
  const [category, questions] = await Promise.all([
    getCategory(categoryId),
    getQuestionsByCategory(categoryId),
  ])

  const client = await getClient()
  const game = {
    categoryId,
    categoryBackground: category.background,
    categoryBackgroundBase64: category.backgroundBase64,
    id: uuid(),
    players: await Promise.all(
      players.map(async player => ({
        ...player,
        score: 0,
        won: false,
        hasLeft: false,
        timestamp: new Date().toISOString(),
        profilePictureUrl: (await findOneUser(client, player.id))
          ?.profilePictureUrl,
      })),
    ),
    questions: shuffle(questions).map(q => ({
      answered: false,
      record: 0,
      ...q,
    })),
    questionIndex: 0,
  }

  await updateGame(redisClient, pubSub, game, 'CREATE')
  await Promise.all(
    players.map(p => setGameIdForPlayer(redisClient, p.id, game.id)),
  )

  // Delay game start
  setTimeout(async () => {
    const futureGame = await getGame(redisClient, game.id)
    if (futureGame === null) {
      console.log(`Game ${game.id} was deleted before start`)
      return
    }
    futureGame.currentQuestion = futureGame.questions[0]
    await updateGame(redisClient, pubSub, futureGame, 'UPDATE')
  }, 4000)

  return game
}

const updateQuestionByPlayerId = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
): Promise<void> => {
  const game = await getGameByPlayerId(redisClient, playerId)
  if (game === null) {
    throw new UserInputError(`No game for player ${playerId}`)
  }
  game.lastQuestion = game.questions[game.questionIndex]
  game.questionIndex++
  game.currentQuestion = game.questions[game.questionIndex]
  return updateGame(redisClient, pubSub, game, 'UPDATE')
}

const answerQuestion = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
  questionId: string,
  answerId: string,
): Promise<GameQuestion> => {
  const game = await getGameByPlayerId(redisClient, playerId)
  if (game === null) {
    throw new UserInputError(`No game for player ${playerId}`)
  }

  if (game.currentQuestion?.answered) {
    return game.currentQuestion
  }
  const question = game.currentQuestion
  if (questionId === question?._id) {
    game.players
    const player = game.players.find(({ id }) => id === playerId)

    if (!player) {
      throw new UserInputError(
        `Player ${playerId} is not a part of game ${game.id}`,
      )
    }
    const correct = answerId === question.answerId
    player.score = Math.max(0, player.score + (correct ? 1 : -1))
    if (player.score >= 10) {
      player.won = true
    }
    question.answered = true
    await updateGame(redisClient, pubSub, game, 'UPDATE')
  } else {
    throw new UserInputError(`Tried to answer invalid question`)
  }

  setTimeout(async () => {
    await updateQuestionByPlayerId(redisClient, pubSub, playerId)
    const game = await getGameByPlayerId(redisClient, playerId)
    const filteredGameWithNewQuestion = filterGame(game)

    pubSub.publish(GAME_MULTIPLAYER, {
      gameMultiplayerSubscription: {
        gameMultiplayer: filteredGameWithNewQuestion,
        mutation: 'UPDATE',
      },
    })
  }, 800)

  return question
}

const removePlayerFromGame = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
  gameId: string,
): Promise<GameMultiplayer> => {
  const game = await getGame(redisClient, gameId)
  if (game === null) {
    throw new UserInputError(`No game ${gameId}`)
  }
  const player = game.players.find(({ id }) => id === playerId)
  if (isUndefined(player)) {
    throw new UserInputError(`No player ${playerId} in game ${gameId}`)
  }

  player.hasLeft = true

  await removePlayer(redisClient, playerId)

  if (game.players.every(({ hasLeft }) => hasLeft)) {
    await deleteGameByGameId(redisClient, pubSub, gameId)
  } else {
    await updateGame(redisClient, pubSub, game, 'UPDATE')
  }

  return game
}

const updateTimestampForPlayer = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
): Promise<PlayerMultiplayer | null> => {
  const game = await getGameByPlayerId(redisClient, playerId)
  if (game === null) {
    return null
  }
  const player = game.players.find(({ id }) => id === playerId)
  if (!player) {
    return null
  }
  player.timestamp = new Date().toISOString()
  await updateGame(redisClient, pubSub, game, 'UPDATE')
  return player
}

export {
  getGameByPlayerId,
  createGame,
  answerQuestion,
  updateQuestionByPlayerId,
  removePlayerFromGame,
  updateTimestampForPlayer,
}
