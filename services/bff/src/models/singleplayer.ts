import shuffle from 'shuffle-array';

import got from '../data/questions/game-of-thrones';
import countries from '../data/questions/countries'
import { GameSingeplayer } from './game'
import { QuestionObject } from './question';
import { isUndefined } from 'util';
import { Category } from './category'

const allQuestions: {
  [key in Category]: QuestionObject
} = {
  'game-of-thrones': got,
  countries,
};

const backgrounds: { [key: string]: string } = {
  'game-of-thrones': `${process.env.ASSETS_URL}/game-of-thrones/got-tapestry.jpg`,
  countries: `${process.env.ASSETS_URL}/countries/world-map.jfif`,
};

import {
  GameNotFoundError,
} from '../errors';
import { getQuestionById } from './questions';

const games: GameSingeplayer[] = []

const getGameByPlayerIdInternal = (playerId: string) => {
  const game = games
    .find(spg => spg.playerId === playerId)
  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${playerId}`);
  }
  return game
}

const createGame = (playerId: string, category: Category) => {
  const id = '' + Math.random()
  const game = {
    playerId,
    category,
    categoryBackground: backgrounds[category],
    id,
    levels: Object.entries(allQuestions[category]).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.questions.map(({ id: questionId }) => ({
          id: questionId,
          record: 0
        }))
      }),
      {}
    ),
    userLevel: 1
  }
  games.push(game as GameSingeplayer)
  const updatedGame = updateQuestionByPlayerId(playerId)
  return updatedGame
}

const getLastAnswerByPlayerId = (playerId: string) => {
  const game = getGameByPlayerIdInternal(playerId)
  if (game.lastQuestionId) {
    const question = getQuestionById(game.lastQuestionId)
    return {
      id: question.answerId,
      questionId: game.lastQuestionId,
      playerId
    }
  } else {
    return null
  }
}

const updateQuestionByPlayerId = (playerId: string) => {
  const game = getGameByPlayerIdInternal(playerId);
  game.currentQuestionId = shuffle(
    game.levels[game.userLevel].filter(
      ({ id, record }) => id !== game.lastQuestionId && record < 2
    )
  )[0].id;

  game.lastQuestionId = game.currentQuestionId
  game.currentQuestion = getQuestionById(game.currentQuestionId)
  game.currentQuestion.alternatives = shuffle(game.currentQuestion.alternatives)
  game.currentQuestion.answered = false;
  return game
};

const answerQuestion = (playerId: string, questionId: string, answerId: string) => {
  const game = getGameByPlayerIdInternal(playerId)
  if (questionId !== game.currentQuestionId) {
    throw new Error("Tried answering the wrong question")
  }

  if (isUndefined(game.currentQuestionId)) {
    throw new Error("No question to be answered")
  }

  const currentQuestionId = game.currentQuestionId;
  const currentQuestion = game
    .levels[game.userLevel]
    .find(({ id }) => id === currentQuestionId);

  if (isUndefined(currentQuestion)) {
    throw new Error('Current question did not exist')
  }
  currentQuestion.record +=
    answerId === currentQuestion.answerId ? 1 : -1;

  if (game.levels[game.userLevel].every(q => q.record >= 2)) {
    game.userLevel++;
  } else if (game.levels[game.userLevel].every(q => q.record < 0)) {
    game.userLevel--;
  }

  getQuestionById(game.currentQuestionId).answered = true;

  return game;
};

const deleteGame = (gameId: string) => {
  const index = games.findIndex(g => g.id === gameId)
  const [game] = games.splice(index, 1)
  return game
}

const getGameByPlayerId = (playerId: string) => {
  return getGameByPlayerIdInternal(playerId)
}

export {
  getGameByPlayerId,
  createGame,
  answerQuestion,
  getLastAnswerByPlayerId,
  updateQuestionByPlayerId,
  deleteGame
};
