import R from 'ramda'
import { Game, GameSingeplayer } from './game'
import { Category } from './category'

const filterGame = (game: Game | GameSingeplayer) => {
    const { questions: _, ...noQuestionsGame } = game
    if (!R.pathEq(['currentQuestion', 'answered'], true)(game)) {
        const censoredGame = {
            ...noQuestionsGame,
            currentQuestion: game.currentQuestion
                ? R.pickBy((_, k) => k !== 'answerId', game.currentQuestion)
                : null,
        }
        return censoredGame
    } else {
        return noQuestionsGame
    }
}

function notUndefined<T>(x: T | undefined): x is T {
    return x !== undefined;
}

function isCategory(x: string | Category): x is Category {
    return x === 'game-of-thrones' || x === 'countries';
}

export {
    filterGame,
    notUndefined,
    isCategory,
}
