const R = require('ramda')

const filterGame = game => {
    if (R.pathEq(['currentQuestion', 'answered'], false)(game)) {
        const censoredGame = {
            ...game,
            currentQuestion: R.pickBy((_, k) => k !== 'answerId', game.currentQuestion),
        }
        return censoredGame
    } else {  
        return game
    }
}

module.exports = {
    filterGame
}
