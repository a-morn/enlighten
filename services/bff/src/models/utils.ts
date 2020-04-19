import R, { filter } from 'ramda'
import {
  Game,
  GameSingeplayer,
  isGameSingleplayer,
  isGameMultiplayer,
  GameMultiplayer,
} from './game'

function filterGame(game: null): null
function filterGame(game: GameSingeplayer): GameSingeplayer
function filterGame(game: GameMultiplayer): GameMultiplayer
function filterGame(
  game: GameSingeplayer | GameMultiplayer | null,
): GameSingeplayer | GameMultiplayer | null {
  if (game === null) {
    return null
  } else if (isGameMultiplayer(game)) {
    game.questions = []
  }
  return censorAnswerIfNotAnswered(game)
}

function censorAnswerIfNotAnswered<T extends Game>(game: T): T {
  if (!R.pathEq(['currentQuestion', 'answered'], true)(game)) {
    const censoredGame = {
      ...game,
      currentQuestion: game.currentQuestion
        ? R.pickBy((_, k) => k !== 'answerId', game.currentQuestion)
        : null,
    } as T
    return censoredGame
  } else {
    return game
  }
}

function notUndefined<T>(x: T | undefined): x is T {
  return x !== undefined
}

function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export { filterGame, notUndefined, isString }
