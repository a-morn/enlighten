import { isUndefined } from 'util'
import { UserInputError } from 'apollo-server'
import { GAME_SINGLEPLAYER } from 'enlighten-common-graphql'
import {
  GameSingeplayer,
  isGameSingleplayer,
  Question,
  QuestionGroup,
  GameQuestion,
} from 'enlighten-common-types'
import { filterGame } from 'enlighten-common-utils'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Redis } from 'ioredis'
import shuffle from 'shuffle-array'
import { getCategory } from './category'
import { getLevels } from './levels'
import { getQuestionById, getQuestionsByCategory } from './questions'

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
  game?: Omit<GameSingeplayer, 'currentQuestionGroupName'>,
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

  const lastQuestionGroupName = game.lastQuestion?.questionGroupName

  let currentQuestion: GameQuestion
  let currentQuestionGroup: QuestionGroup

  if (game.levels) {
    const currentLevel = game.levels.find(
      ({ _id }) => _id === game?.currentLevelId,
    )

    if (isUndefined(currentLevel)) {
      throw new Error(`Level with id ${currentLevel} not found`)
    }

    const questionGroupsInLevel = game.questionGroups.filter(
      ({ name, levelId }) =>
        name !== lastQuestionGroupName && levelId === currentLevel._id,
    )

    if (questionGroupsInLevel.length === 0) {
      // No question group in current level that is not previous question group
      const lastQuestionGroup = game.questionGroups.find(
        ({ name }) => name === lastQuestionGroupName,
      )
      if (isUndefined(lastQuestionGroup)) {
        throw new Error(
          `Question group with name ${lastQuestionGroupName} not found`,
        )
      }
      questionGroupsInLevel.push(lastQuestionGroup)
    }

    const lowestScore = (qg: QuestionGroup) =>
      Math.min(...qg.types.map(({ score }) => score))
    const questionGroupsSortedByTypeScore = questionGroupsInLevel.sort(
      (qga, qgb) => lowestScore(qga) - lowestScore(qgb),
    )

    const questionGroupsWithLowestTypeScore: QuestionGroup[] = []
    let lowestScoreCounter: number
    for (const qg of questionGroupsSortedByTypeScore) {
      if (
        questionGroupsWithLowestTypeScore.length < 2 ||
        lowestScore(qg) ===
          lowestScore(
            questionGroupsWithLowestTypeScore[0],
          )
      ) {
        lowestScoreCounter = lowestScore(qg)
        questionGroupsWithLowestTypeScore.push(qg)
      }
    }

    currentQuestionGroup = shuffle(questionGroupsWithLowestTypeScore)[0]

    const lowestScoreTypes = currentQuestionGroup.types
      .filter(type => type.score <= lowestScoreCounter)
      .map(({ type }) => type)

    currentQuestion = shuffle(
      currentQuestionGroup.questions.filter(q =>
        q.types.some(type => lowestScoreTypes.includes(type)),
      ),
    )[0]

    if (isUndefined(currentQuestion)) {
      throw new Error(
        `No question with level id ${currentLevel._id} that is not in question group ${lastQuestionGroupName}`,
      )
    }
  } else {
    const notLastQuestionGroupIfPossible = [
      ...shuffle(
        game.questionGroups.filter(
          ({ name }) => name !== lastQuestionGroupName,
        ),
      ),
      game.questionGroups.find(({ name }) => name == lastQuestionGroupName),
    ][0]
    if (isUndefined(notLastQuestionGroupIfPossible)) {
      throw new Error(`No question group found`)
    }

    currentQuestionGroup = notLastQuestionGroupIfPossible

    currentQuestion = shuffle(currentQuestionGroup.questions)[0]

    if (isUndefined(currentQuestion)) {
      throw new Error(`No question in question group ${lastQuestionGroupName}`)
    }
  }

  game.currentQuestionId = currentQuestion._id
  game.lastQuestion = game.currentQuestion
  game.currentQuestion = await getQuestionById(game.currentQuestionId)
  game.currentQuestion.alternatives = shuffle(game.currentQuestion.alternatives)
  game.currentQuestion.answered = false
  game.lastUpdated = new Date().toISOString()

  const updatedGame: GameSingeplayer = {
    ...game,
    currentQuestionGroupName: currentQuestionGroup.name,
  }

  updateGame(redisClient, updatedGame)
  return updatedGame
}

const createGame = async (
  redisClient: Redis,
  playerId: string,
  categoryId: string,
): Promise<GameSingeplayer> => {
  const [category, questions, levels] = await Promise.all([
    getCategory(categoryId),
    getQuestionsByCategory(categoryId),
    getLevels(categoryId),
  ])

  if (isUndefined(questions) || isUndefined(category)) {
    throw new Error(
      `This can't happen as there's a null check earlier on. Just helping tsc out`,
    )
  }

  const questionGroups = Object.values(
    questions
      .map((q: Question) => ({
        ...q,
        record: 0,
        answered: false,
      }))
      .reduce((questionGroups, gameQuestion) => {
        let group: QuestionGroup
        if (questionGroups[gameQuestion.questionGroupName] === undefined) {
          group = {
            questions: [gameQuestion],
            types: gameQuestion.types.map(type => ({ type, score: 0 })),
            levelId: gameQuestion.levelId || '',
            name: gameQuestion.questionGroupName,
          }
        } else {
          group = questionGroups[gameQuestion.questionGroupName]
          group.questions.push(gameQuestion)
          const newTypes = gameQuestion.types.filter(
            type => !group.types.some(groupType => groupType.type === type),
          )
          group.types = [
            ...group.types,
            ...newTypes.map(type => ({ type, score: 0 })),
          ]
        }

        return {
          ...questionGroups,
          [gameQuestion.questionGroupName]: group,
        }
      }, {} as { [key: string]: QuestionGroup }),
  )

  const game: Omit<GameSingeplayer, 'currentQuestionGroupName'> = {
    playerId,
    categoryId,
    categoryBackground: category.background,
    categoryBackgroundBase64: category.backgroundBase64,
    categoryName: category.label,
    progression: 0,
    questionGroups,
    levels: levels?.map(level => ({ ...level, completed: false })),
    currentLevelId: levels ? levels[0]._id : undefined,
    isWon: false,
  }

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
  answerIds: string[],
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

  const questionGroup = game.questionGroups.find(
    ({ name }) => name === game.currentQuestionGroupName,
  )

  if (isUndefined(questionGroup)) {
    throw new UserInputError('Current question group did not exist')
  }

  const question = questionGroup.questions.find(
    ({ _id }) => _id === game.currentQuestionId,
  )

  if (isUndefined(question)) {
    throw new UserInputError('Current question did not exist')
  }

  if (answerIds.length === question.answerIds.length && question.answerIds.every(correctId => answerIds.includes(correctId))) {
    question.types.forEach(type => {
      questionGroup.types
        .filter(qgType => qgType.type === type)
        .forEach(qgType => (qgType.score = 1))
    })
    question.record += 1
  } else {
    question.types.forEach(type => {
      questionGroup.types
        .filter(qgType => qgType.type === type)
        .forEach(qgType => (qgType.score = -1))
    })
    question.record -= 1
  }

  question.answered = true

  // TODO: solve better
  const oldLevels = game.levels ? game.levels.map(level => ({ ...level })) : []

  if (game.levels) {
    const currentLevel = game.levels.find(
      ({ _id }) => _id === game.currentLevelId,
    )
    if (isUndefined(currentLevel)) {
      throw new Error(`Level with id ${currentLevel} not found`)
    }
    const questionGroupTypeScore = game.questionGroups
      .filter(({ levelId }) => levelId === currentLevel._id)
      .reduce(
        (allScore: number[], { types }) => [
          ...allScore,
          ...types.map(({ score }) => score),
        ],
        [],
      )
    const unansweredQuestionGroupTypeScore = questionGroupTypeScore.filter(
      score => score < 1,
    )
    game.progression =
      (questionGroupTypeScore.length -
        unansweredQuestionGroupTypeScore.length) /
      questionGroupTypeScore.length

    if (
      unansweredQuestionGroupTypeScore.length === 0 ||
      process.env.IMMEDIATE_LEVEL_CHANGE === 'true'
    ) {
      if (game.currentLevelId === game.levels[game.levels.length - 1]._id) {
        game.isWon = true
      } else if (
        !game.levels.find(({ _id }) => _id === game.currentLevelId)?.completed
      ) {
        const currentIndex = game.levels.findIndex(
          ({ _id }) => _id === game.currentLevelId,
        )
        game.levels[currentIndex].completed = true
        game.currentLevelId = game.levels[currentIndex + 1]._id
        game.progression = 0
      }
    }
  }

  const gameWithoutLevelsUpdate = { ...game, levels: oldLevels }
  updateGame(redisClient, game)

  pubSub.publish(GAME_SINGLEPLAYER, {
    gameSingleplayerSubscription: {
      gameSingleplayer: gameWithoutLevelsUpdate,
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

const changeLevel = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  playerId: string,
  levelId: string,
): Promise<GameSingeplayer> => {
  const game = await getGameByPlayerId(redisClient, playerId)
  if (!game) {
    throw new UserInputError(`Player ${playerId} is not in a game`)
  }

  const level = game.levels?.find(({ _id }) => _id === levelId)

  if (isUndefined(level)) {
    throw new UserInputError(`No level with id ${levelId}`)
  }

  game.currentLevelId = levelId
  game.progression = 0

  const updatedGame = await updateQuestionByPlayerId(
    redisClient,
    playerId,
    game,
  )

  updateGame(redisClient, updatedGame)

  pubSub.publish(GAME_SINGLEPLAYER, {
    gameSingleplayerSubscription: {
      gameSingleplayer: filterGame(updatedGame),
      mutation: 'UPDATE',
    },
  })

  return game
}

export {
  getGameByPlayerId,
  createGame,
  answerQuestion,
  updateQuestionByPlayerId,
  deleteGameByPlayerId,
  changeLevel,
}
