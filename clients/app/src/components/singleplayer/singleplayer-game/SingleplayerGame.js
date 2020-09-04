import React, { useState, useCallback, useEffect } from 'react'
import Question from 'components/question'
import { LevelCompletedScreen } from './level-completed-screen'
import { usePrevious } from 'hooks/use-previous'
import useWhyDidYouUpdate from 'hooks/debug/why-did-you-update'
import Bowser from 'bowser'
import correct from 'assets/correct.wav'

const browser = Bowser.getParser(window.navigator.userAgent)
const correctSound = new Audio(correct)
correctSound.volume = 0.05

function SingleplayerGame({
  currentQuestion,
  endGame,
  isLoading,
  selectedAnswerId,
  correctAnswerId,
  answer,
  level,
  categoryName,
  progression,
  levels,
  changeLevel
}) {

  const [endingGame, setEndingGame] = useState(false)
  const [showLevelCompletedScreen, setShowLevelCompletedScreen] = useState(false)
  const [previousLevel, setPreviousLevel] = useState()

  const previous = usePrevious(level)
  useEffect(() => {
    if (level && previous && level.name !== previous.name) {
      setPreviousLevel(previous)
    }
  }, [level, previousLevel])
  useEffect(() => {
    if (level &&
      previousLevel &&
      !previousLevel.completed &&
      !level.completed &&
      previousLevel.name !== level.name) {
      setShowLevelCompletedScreen(true)
    }
  }, [level, previous, setShowLevelCompletedScreen])
  useEffect(() => {
    if (correctAnswerId === selectedAnswerId) {
      if (browser.getBrowserName() !== 'Safari') {
        correctSound.play()
      }
    }
  }, [correctAnswerId, selectedAnswerId])
  
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
        levelName={level?.name} 
        categoryName={categoryName}
        selectedAnswerId={selectedAnswerId}
        correctAnswerId={correctAnswerId}
        onAlternativeSelected={answer}
        progression={progression}
        levels={levels}
        changeLevel={changeLevel}
      />
      { showLevelCompletedScreen && <LevelCompletedScreen
          data-testid="level-completed-screen"
          completedLevelName={previousLevel.name}
          nextLevelName={level.name}
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
