import { isUndefined } from 'util'
import { UserInputError } from 'apollo-server'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Redis } from 'ioredis'
import shuffle from 'shuffle-array'
import { GAME_SINGLEPLAYER } from 'enlighten-common-graphql'
import { filterGame } from 'enlighten-common-utils'
import {
  GameSingeplayer,
  isGameSingleplayer,
  Question,
} from 'enlighten-common-types'
import { getCategory } from './category'
import { getQuestionById, getQuestionsByCategory } from './questions'
import { getLevels } from './levels'

const getGameByPlayerId = async (
  redisClient: Redis,
  playerId: string,
): Promise<GameSingeplayer | null> => {
  const key = `singleplayer:games:${playerId}`
  const gameString = await redisClient.get(key)
  redisClient.expire(key, 300)
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
  return redisClient.set(
    `singleplayer:games:${game.playerId}`,
    gameString,
    'EX',
    300,
  )
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

  if (isUndefined(game)) {
    throw new Error('Should never happen, just helping TSC out')
  }

  const lastQuestionId = game.lastQuestionId

  let currentQuestion

  if (game.levels) {
    const currentLevel = game.levels[game.currentLevelIndex || 0]; 
    currentQuestion = shuffle(
      game.questions
        .filter(({ _id, levelId }) => _id !== lastQuestionId && levelId === currentLevel._id),
    )[0]
    if (isUndefined(currentQuestion)) {
      throw new Error(`No question with level id ${currentLevel._id} that is not ${lastQuestionId}`)
    }
  } else {
    currentQuestion = shuffle(
      game.questions
        .filter(({ _id }) => _id !== lastQuestionId),
    )[0]
    if (isUndefined(currentQuestion)) {
      throw new Error(`No question that is not ${lastQuestionId}`)
    }
  }

  game.currentQuestionId = currentQuestion._id

  game.lastQuestionId = game.currentQuestionId
  game.currentQuestion = await getQuestionById(game.currentQuestionId)
  game.currentQuestion.alternatives = shuffle(game.currentQuestion.alternatives)
  game.currentQuestion.answered = false
  game.lastUpdated = new Date().toISOString()

  updateGame(redisClient, game)
  return game
}

const createGame = async (
  redisClient: Redis,
  playerId: string,
  categoryId: string,
): Promise<GameSingeplayer> => {
  const [category, questions, levels] = await Promise.all([
    getCategory(categoryId),
    getQuestionsByCategory(categoryId),
    getLevels(categoryId)
  ])

  if (isUndefined(category) || isUndefined(questions)) {
    throw new Error(`This can't happen, just helping tsc out`)
  }

  const game = {
    playerId,
    categoryId,
    categoryBackground: category.background,
    categoryBackgroundBase64: category.backgroundBase64,
    categoryName: category.label,
    questions: questions.map((q: Question) => ({
      ...q,
      record: 0,
      answered: false
    })),
    levels,
    currentLevelIndex: 0,
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

  const question = game.questions.find(
    ({ _id }) => _id === game.currentQuestionId,
  )

  if (isUndefined(question)) {
    throw new UserInputError('Current question did not exist')
  }
  question.record += answerId === question.answerId ? 1 : -1

  question.answered = true

  if (game.levels) {
    const currentLevel = game.levels[game.currentLevelIndex || 0];
    if(!game.questions.filter(({ levelId }) => levelId === currentLevel._id).some((question) => !question.answered || question.record < 1)) {
      game.currentLevelIndex = Math.min(game.currentLevelIndex || 0 + 1, game.levels.length - 1)
    }
  }

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
