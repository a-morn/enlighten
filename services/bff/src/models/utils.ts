import R from 'ramda'
import { Game, GameSingeplayer, isGameSingleplayer, isGameMultiplayer, GameMultiplayer } from './game'
import { CategoryId } from './category'

const filterGame = (game: GameSingeplayer | GameMultiplayer | null) => {
    if (game === null) {
        return null
    } else if (isGameSingleplayer(game)) {
        return censorAnswerIfNotAnswered(game)
    } else if (isGameMultiplayer(game)) {
        const { questions: _, ...noQuestionsGame } = game
        return censorAnswerIfNotAnswered(noQuestionsGame)
    }
}

function censorAnswerIfNotAnswered(game: Game) {
    if (!R.pathEq(['currentQuestion', 'answered'], true)(game)) {
        const censoredGame = {
            ...game,
            currentQuestion: game.currentQuestion
                ? R.pickBy((_, k) => k !== 'answerId', game.currentQuestion)
                : null,
        }
        return censoredGame
    } else {
        return game
    }
}

function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
}

export function isString(x: unknown): x is string {
    return typeof x === 'string'
}

export {
    filterGame,
    notUndefined,
}
