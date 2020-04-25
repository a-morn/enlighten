import { isUndefined } from 'util'
import { UserInputError } from 'apollo-server'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Redis } from 'ioredis'
import shuffle from 'shuffle-array'
import { GAME_SINGLEPLAYER } from '../triggers'
import { CategoryId, GameSingeplayer, isGameSingleplayer } from '../types'
import { getQuestionById, getQuestionsByCategory } from './questions'
import { filterGame } from './utils'
import { getCategory } from './category'

const getGameByPlayerId = async (
  redisClient: Redis,
  playerId: string,
): Promise<GameSingeplayer | null> => {
  const gameString = await redisClient.get(`singleplayer:games:${playerId}`)
  if (!gameString) {
    return null
  }
  const game = JSON.parse(gameString)

  if (!isGameSingleplayer(game)) {
    throw new Error(`That's no game... ${Object.keys(game)}`)
  }
  return game
}

const updateGame = async (
  redisClient: Redis,
  game: GameSingeplayer,
): Promise<string> => {
  const gameString = JSON.stringify(game)
  return redisClient.set(`singleplayer:games:${game.playerId}`, gameString)
}

const deleteGameByPlayerId = async (
  redisClient: Redis,
  playerId: string,
): Promise<GameSingeplayer> => {
  const game = await getGameByPlayerId(redisClient, playerId)

  if (!game) {
    throw new UserInputError(`User ${playerId} has no game to delete`)
  }

  return redisClient.del(`singleplayer:games:${playerId}`).then(() => game)
}

const updateQuestionByPlayerId = async (
  redisClient: Redis,
  playerId: string,
  game?: GameSingeplayer,
): Promise<GameSingeplayer> => {
  if (isUndefined(game)) {
    const fetchedGame = await getGameByPlayerId(redisClient, playerId)
    if (!fetchedGame) {
      throw new UserInputError(`Player ${playerId} is not in a game`)
    }
    game = fetchedGame
  }

  const lastQuestionId = game.lastQuestionId
  game.currentQuestionId = shuffle(
    game.levels[game.userLevel].filter(
      ({ id, record }) => id !== lastQuestionId && record < 2,
    ),
  )[0].id

  game.lastQuestionId = game.currentQuestionId
  game.currentQuestion = getQuestionById(game.currentQuestionId)
  game.currentQuestion.alternatives = shuffle(game.currentQuestion.alternatives)
  game.currentQuestion.answered = false
  game.lastUpdated = new Date().toISOString()

  updateGame(redisClient, game)
  return game
}

const createGame = async (
  redisClient: Redis,
  playerId: string,
  categoryId: CategoryId,
): Promise<GameSingeplayer> => {
  const category = await getCategory(categoryId)
  const game = {
    playerId,
    categoryId,
    categoryBackground: category.background,
    levels: Object.entries(getQuestionsByCategory(category.id)).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.questions.map(({ id: questionId }) => ({
          id: questionId,
          record: 0,
        })),
      }),
      {},
    ),
    userLevel: 1,
  } as GameSingeplayer
  const updatedGame = await updateQuestionByPlayerId(
    redisClient,
    playerId,
    game,
  )
  return updatedGame
}

const answerQuestion = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
  questionId: string,
  answerId: string,
): Promise<GameSingeplayer> => {
  const game = await getGameByPlayerId(redisClient, playerId)
  if (!game) {
    throw new UserInputError(`Player ${playerId} is not in a game`)
  }
  if (questionId !== game.currentQuestionId) {
    throw new UserInputError('Tried answering the wrong question')
  }

  if (isUndefined(game.currentQuestionId)) {
    throw new UserInputError('No question to be answered')
  }

  const currentQuestion = game.levels[game.userLevel].find(
    ({ id }) => id === game.currentQuestionId,
  )

  if (isUndefined(currentQuestion)) {
    throw new UserInputError('Current question did not exist')
  }
  currentQuestion.record += answerId === currentQuestion.answerId ? 1 : -1

  if (game.levels[game.userLevel].every(q => q.record >= 2)) {
    game.userLevel++
  } else if (game.levels[game.userLevel].every(q => q.record < 0)) {
    game.userLevel--
  }

  getQuestionById(game.currentQuestionId).answered = true
  updateGame(redisClient, game)

  pubSub.publish(GAME_SINGLEPLAYER, {
    gameSingleplayerSubscription: {
      gameSingleplayer: game,
      mutation: 'UPDATE',
    },
  })

  setTimeout(async () => {
    const gameFiltered = filterGame(
      await updateQuestionByPlayerId(redisClient, playerId),
    )
    pubSub.publish(GAME_SINGLEPLAYER, {
      gameSingleplayerSubscription: {
        gameSingleplayer: gameFiltered,
        mutation: 'UPDATE',
      },
    })
  }, 800)

  return game
}

export {
  getGameByPlayerId,
  createGame,
  answerQuestion,
  updateQuestionByPlayerId,
  deleteGameByPlayerId,
}
