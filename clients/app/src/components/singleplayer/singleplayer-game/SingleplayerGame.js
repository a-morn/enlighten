import React, { useState, useCallback, useEffect } from 'react'
import Question from 'components/question'
import { LevelCompletedScreen } from './level-completed-screen'
import { usePrevious } from 'hooks/use-previous'
import useWhyDidYouUpdate from 'hooks/debug/why-did-you-update'

function SingleplayerGame({
  currentQuestion,
  endGame,
  isLoading,
  selectedAnswerId,
  correctAnswerId,
  answer,
  levelName,
  categoryName,
  progression
}) {
  useWhyDidYouUpdate('sp', {
    currentQuestion,
    endGame,
    isLoading,
    selectedAnswerId,
    correctAnswerId,
    answer,
    levelName,
    categoryName,
    progression
  })
  const [endingGame, setEndingGame] = useState(false)
  const [previousLevelName, setPreviousLevelName] = useState()
  console.log(levelName, previousLevelName)
  const [showLevelCompletedScreen, setShowLevelCompletedScreen] = useState(false)
  useEffect(() => {
    if (levelName && previousLevelName && levelName !== previousLevelName) {
      setShowLevelCompletedScreen(true)
    }
  }, [levelName, previousLevelName, setShowLevelCompletedScreen])
  const previous = usePrevious(levelName)
  useEffect(() => {
    if (previous !== levelName) {
      setPreviousLevelName(previous)
    }
  }, [previous, levelName, setPreviousLevelName])
  
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
        levelName={levelName}
        categoryName={categoryName}
        selectedAnswerId={selectedAnswerId}
        correctAnswerId={correctAnswerId}
        onAlternativeSelected={answer}
        progression={progression}
      />
      { showLevelCompletedScreen && <LevelCompletedScreen
          data-testid="level-completed-screen"
          completedLevel={previousLevelName}
          nextLevel={levelName}
          close={() => setShowLevelCompletedScreen(false)}
        />
      }
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
