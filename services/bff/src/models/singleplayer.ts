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
  QuestionGroup,
  GameQuestion,
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

  const lastQuestionGroup = game.lastQuestion?.questionGroup

  let currentQuestion: GameQuestion
  let currentQuestionGroup: QuestionGroup

  if (game.levels) {
    const currentLevel = game.levels[game.currentLevelIndex || 0]; 

    currentQuestionGroup = shuffle(
      game.questionGroups
        .filter(({ name, levelId }) => name !== lastQuestionGroup && levelId === currentLevel._id)
        .filter(({ types }) => types.some(type => type.score < 1))
    )[0]

    const unansweredTypes = currentQuestionGroup.types
      .filter(type => type.score < 1)
      .map(({ type }) => type)

    currentQuestion = shuffle(currentQuestionGroup
      .questions
      .filter(q => q.types.some(type => unansweredTypes.includes(type))))[0]

    if (isUndefined(currentQuestion)) {
      throw new Error(`No question with level id ${currentLevel._id} that is not in question group ${lastQuestionGroup}`)
    }
  } else {
    currentQuestionGroup = shuffle(
      game.questionGroups
        .filter(({ name }) => name !== lastQuestionGroup),
    )[0]
    if (isUndefined(currentQuestionGroup)) {
      throw new Error(`No question group that is not ${lastQuestionGroup}`)
    }

    currentQuestion = shuffle(currentQuestionGroup.questions)[0]

    if (isUndefined(currentQuestion)) {
      throw new Error(`No question in question group ${lastQuestionGroup}`)
    }
  }

  game.currentQuestionGroup = currentQuestionGroup.name
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

  const questionGroups =
    Object.values(
      questions
        .map((q: Question) => ({
          ...q,
          record: 0,
          answered: false
        }))
        .reduce((questionGroups, gameQuestion) => {
          let group: QuestionGroup;

          if (questionGroups[gameQuestion.questionGroup] === undefined) {
            group = {
              questions: [gameQuestion],
              types: gameQuestion.types.map(type => ({ type, score: 0 })),
              levelId: gameQuestion.levelId,
              name: gameQuestion.questionGroup
            }
          } else {
            group = questionGroups[gameQuestion.questionGroup]
            group.questions.push(gameQuestion)
            const newTypes = gameQuestion.types
            .filter(type => !group.types.some(groupType =>  groupType.type === type))
            group.types = [...group.types, ...newTypes.map(type => ({ type, score: 0 }))]
          }

          return {
            ...questionGroups,
            [gameQuestion.questionGroup]: group
          }
        }, {} as { [key: string]: QuestionGroup })
    )

  const game = {
    playerId,
    categoryId,
    categoryBackground: category.background,
    categoryBackgroundBase64: category.backgroundBase64,
    categoryName: category.label,
    progression: 0,
    questionGroups,
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

  const questionGroup = game.questionGroups
    .find(({ name }) => name === game.currentQuestionGroup)
    
  if (isUndefined(questionGroup)) {
    throw new UserInputError('Current question group did not exist')
  }

  const question = questionGroup.questions
    .find(({ _id }) => _id === game.currentQuestionId)

  if (isUndefined(question)) {
    throw new UserInputError('Current question did not exist')
  }

  if (answerId === question.answerId) {
    question.types
      .forEach(type => {
        questionGroup.types
          .filter(qgType => qgType.type === type)
          .forEach(qgType => qgType.score = 1)
      })
    question.record += 1
  } else {
    question.types
      .forEach(type => {
        questionGroup.types
          .filter(qgType => qgType.type === type)
          .forEach(qgType => qgType.score = -1)
      })
    question.record -= 1
  }

  question.answered = true

  if (game.levels) {
    const currentLevel = game.levels[game.currentLevelIndex || 0];
    const questionGroupTypeScore = game.questionGroups
      .filter(({ levelId }) => levelId === currentLevel._id)
      .reduce((allScore: number[], { types }) => [...allScore, ...types.map(({ score }) => score)], [])
    const unansweredQuestionGroupTypeScore = questionGroupTypeScore.filter((score) => score < 1)
    game.progression = (questionGroupTypeScore.length - unansweredQuestionGroupTypeScore.length) / questionGroupTypeScore.length

    if (!unansweredQuestionGroupTypeScore.some(q => q)) {
      game.currentLevelIndex = Math.min(game.currentLevelIndex || 0 + 1, game.levels.length - 1)
      game.progression = 0
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
