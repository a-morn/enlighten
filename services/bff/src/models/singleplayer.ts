import shuffle from 'shuffle-array'
import { Redis } from 'ioredis'

import got from '../generated-data/game-of-thrones.json'
import countries from '../generated-data/countries.json'
import { GameSingeplayer, isGameSingleplayer } from './game'
import { QuestionObject } from './question'
import { isUndefined } from 'util'
import { CategoryId } from './category'
import { filterGame } from './utils'

import { GAME_SINGLEPLAYER } from '../triggers'

const allQuestions: {
  [key in CategoryId]: QuestionObject
} = {
  'game-of-thrones': got as QuestionObject,
  countries: countries as QuestionObject,
}

const backgrounds: { [key: string]: string } = {
  'game-of-thrones': `${process.env.ASSETS_URL}/game-of-thrones/got-tapestry.jpg`,
  countries: `${process.env.ASSETS_URL}/countries/world-map.jfif`,
}

import { getQuestionById } from './questions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { UserInputError } from 'apollo-server'

const getGameByPlayerIdInternal = async (
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

const updateGameByPlayerId = async (
  redisClient: Redis,
  playerId: string,
  game: GameSingeplayer,
): Promise<string> => {
  const gameString = JSON.stringify(game)
  return redisClient.set(`singleplayer:games:${playerId}`, gameString)
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

const createGame = async (
  redisClient: Redis,
  playerId: string,
  categoryId: CategoryId,
) => {
  const id = '' + Math.random()
  const game = {
    playerId,
    categoryId,
    categoryBackground: backgrounds[categoryId],
    id,
    levels: Object.entries(allQuestions[categoryId]).reduce(
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

const getLastAnswerByPlayerId = async (
  redisClient: Redis,
  playerId: string,
) => {
  const game = await getGameByPlayerIdInternal(redisClient, playerId)
  if (!game) {
    throw new UserInputError(`Player ${playerId} is not in a game`)
  }
  if (game.lastQuestionId) {
    const question = getQuestionById(game.lastQuestionId)
    return {
      id: question.answerId,
      questionId: game.lastQuestionId,
      playerId,
    }
  } else {
    return null
  }
}

const updateQuestionByPlayerId = async (
  redisClient: Redis,
  playerId: string,
  game?: GameSingeplayer,
) => {
  if (isUndefined(game)) {
    const fetchedGame = await getGameByPlayerIdInternal(redisClient, playerId)
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

  updateGameByPlayerId(redisClient, playerId, game)
  return game
}

const answerQuestion = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
  questionId: string,
  answerId: string,
) => {
  const game = await getGameByPlayerIdInternal(redisClient, playerId)
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
  updateGameByPlayerId(redisClient, playerId, game)

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

const getGameByPlayerId = (redisClient: Redis, playerId: string) => {
  return getGameByPlayerIdInternal(redisClient, playerId)
}

export {
  getGameByPlayerId,
  createGame,
  answerQuestion,
  getLastAnswerByPlayerId,
  updateQuestionByPlayerId,
  deleteGameByPlayerId,
}
