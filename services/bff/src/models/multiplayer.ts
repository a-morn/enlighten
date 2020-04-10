import { GameNotFoundError, PlayerNotFoundError, } from '../errors';
import { GAME_MULTIPLAYER } from '../triggers';
import shuffle from 'shuffle-array';
//import periodicTable from '../data/questions/periodic-table';
import got from '../data/questions/game-of-thrones';
import countries from '../data/questions/countries';
import { GameMultiplayer } from './game'
import { PubSub } from 'graphql-subscriptions';
import { PlayerLobby } from './player';
import { Category } from './category';
import { Question } from './question'
import { isUndefined } from 'util';
import moment from 'moment'
const allQuestions = {
  'game-of-thrones': got,
  //'periodic-table': periodicTable,
  countries
};

const backgrounds = {
  'game-of-thrones': `${process.env.ASSETS_URL}/game-of-thrones/got-tapestry.jpg`,
  countries: `${process.env.ASSETS_URL}/countries/world-map.jfif`,
};

import { filterGame } from './utils'
import { forEach } from 'ramda';

const games: GameMultiplayer[] = []

const getGameByPlayerId = (playerId: string) => {
  const game = games
    .find(spg => spg.players.some(({ id, hasLeft }) => !hasLeft && id === playerId))

  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${playerId}`);
  }
  return game
}

const getGameByGameId = (gameId: string) => {
  const game = games
    .find(spg => spg.id === gameId)
  if (!game) {
    throw new GameNotFoundError(`No game with playerId ${gameId}`);
  }
  return game
}

const createGame = (pubsub: PubSub, players: PlayerLobby[], category: Category) => {
  const id = '' + Math.random()
  const game = {
    players: players.map(p => ({ score: 0, won: false, hasLeft: false, timestamp: moment().add(5, 'seconds'), ...p })),
    category,
    categoryBackground: backgrounds[category],
    id,
    questions: shuffle(
      Object.values(allQuestions[category])
        .reduce((acc: Question[], { questions }) => (
          acc.concat(questions)
        ), [])
    ),
    questionIndex: 0
  }

  games.push(game as GameMultiplayer)

  setTimeout(() => {
    const g = getGameByGameId(game.id)
    g.currentQuestion = g.questions[0]
    pubsub.publish(GAME_MULTIPLAYER, {
      gameMultiplayerSubscription: {
        gameMultiplayer: filterGame(g),
        mutation: 'UPDATE'
      }
    })
  }, 4000)

  pubsub.publish(GAME_MULTIPLAYER, {
    gameMultiplayerSubscription: {
      gameMultiplayer: filterGame(game),
      mutation: 'CREATE'
    }
  })
}

const updateQuestionByPlayerId = (playerId: string) => {
  const game = getGameByPlayerId(playerId)
  game.lastQuestion = game.questions[game.questionIndex]
  game.questionIndex++
  game.currentQuestion = game.questions[game.questionIndex]
  return game;
}

const getLastAnswerByPlayerId = (playerId: string) => {
  const game = getGameByPlayerId(playerId)
  if (game.lastQuestion) {
    const question = game.lastQuestion
    return {
      id: question.answerId,
      questionId: question.id,
    }
  } else {
    return null
  }
}

const answerQuestion = (playerId: string, questionId: string, answerId: string) => {
  const game = getGameByPlayerId(playerId);
  const question = game.currentQuestion
  if (questionId === question?.id) {
    const player = getPlayersInGameById(game.id, playerId);
    if (isUndefined(player)) {
      throw new PlayerNotFoundError()
    }
    const correct = answerId === question.answerId;
    player.score = Math.max(0, player.score + (correct ? 1 : -1));
    if (player.score >= 20) {
      player.won = true;
    }
    question.answered = true
  } else {
    throw new Error(`Tried to answer invalid question`);
  }
  return game
};

const getPlayersInGameById = (gameId: string, playerId: string) => {
  return getGameByGameId(gameId)
    .players
    .find(p => p.id === playerId)
}

const removePlayerFromGame = (pubsub: PubSub, playerId: string, gameId: string) => {
  const game = getGameByGameId(gameId)
  const player = game.players
    .find(({ id }) => id === playerId);
  if (isUndefined(player)) {
    throw new PlayerNotFoundError()
  }

  player.hasLeft = true

  if (game.players.every(({ hasLeft }) => hasLeft)) {
    return deleteGameByGameId(pubsub, gameId)
  }

  pubsub.publish(GAME_MULTIPLAYER, {
    gameMultiplayerSubscription: {
      gameMultiplayer: filterGame(game),
      mutation: 'UPDATE'
    }
  })
  return game
}

const deleteGameByGameId = (pubsub: PubSub, gameId: string) => {
  const index = games.findIndex(g => g.id === gameId)
  if (index === -1) {
    throw new GameNotFoundError('Tried deleting non existent game')
  }
  const [game] = games.splice(index, 1)
  pubsub.publish(GAME_MULTIPLAYER, {
    gameMultiplayerSubscription: {
      gameMultiplayer: filterGame(game),
      mutation: 'DELETE'
    }
  })
  return null
}

const updateTimestampForPlayer = (playerId: string) => {
  const player = getGameByPlayerId(playerId)
    .players
    .find(({ id }) => id === playerId)
  if (!player) {
    throw new PlayerNotFoundError()
  }
  player.timestamp = new Date()
}

let interval: NodeJS.Timeout
const startFilterInactive = () => {
  if (!interval) {
    interval = setInterval(() => {
      games
        .forEach(game =>
          game
            .players
            .forEach(p => {
              const diff = moment().diff(p.timestamp, 'seconds');
              if (diff > 3) {
                p.hasLeft = true
              }
            })
        )
    }, 500)
  }
}
startFilterInactive()

export {
  getGameByPlayerId,
  createGame,
  getLastAnswerByPlayerId,
  answerQuestion,
  updateQuestionByPlayerId,
  removePlayerFromGame,
  updateTimestampForPlayer
};
