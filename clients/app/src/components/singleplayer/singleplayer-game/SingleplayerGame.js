import React, { useState, useCallback } from 'react'
import Question from '../../question'

function SingleplayerGame({
  currentQuestion,
  endGame,
  isLoading,
  selectedAnswerId,
  correctAnswerId,
  answer,
}) {
  const [endingGame, setEndingGame] = useState(false)
  const endGameCallback = useCallback(() => {
    setEndingGame(true)
    endGame()
  }, [endGame])
  return (
    <>
      <Question
        className="pt-4"
        disabled={isLoading}
        question={currentQuestion}
        selectedAnswerId={selectedAnswerId}
        correctAnswerId={correctAnswerId}
        onAlternativeSelected={answer}
      />
      <button
        data-testid="end-game-button"
        className={`bg-danger-dark hover:bg-danger text-white rounded px-4 mt-10 shadow-lg p-4 ${
          endingGame ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={endGameCallback}
        disabled={endingGame}
      >
        End game
      </button>
    </>
  )
}

export default SingleplayerGame
