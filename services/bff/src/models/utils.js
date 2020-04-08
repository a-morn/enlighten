const R = require('ramda')

const filterGame = game => {
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

module.exports = {
    filterGame
}
