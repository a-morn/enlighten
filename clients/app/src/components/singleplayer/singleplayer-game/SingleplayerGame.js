import React from 'react'
import Question from '../../question'

function SingleplayerGame({
  currentQuestion,
  endGame,
  isLoading,
  selectedAnswerId,
  correctAnswerId,
  answer,
}) {
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
        className="bg-danger-dark hover:bg-danger text-white rounded px-4 mt-10 shadow-lg p-4"
        onClick={endGame}
      >
        End game
      </button>
    </>
  )
}

export default SingleplayerGame
