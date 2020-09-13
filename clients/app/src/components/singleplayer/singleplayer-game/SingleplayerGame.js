import correct from 'assets/correct.wav'
import Bowser from 'bowser'
import Question from 'components/question'
import { usePrevious } from 'hooks/use-previous'
import React, { useState, useCallback, useEffect } from 'react'
import { LevelCompletedScreen } from './level-completed-screen'

const browser = Bowser.getParser(window.navigator.userAgent)
const correctSound = new Audio(correct)
correctSound.volume = 0.05

function SingleplayerGame({
  currentQuestion,
  endGame,
  isLoading,
  selectedAnswerIds,
  correctAnswerIds,
  answer,
  level,
  categoryName,
  progression,
  levels,
  changeLevel,
  toggleSelectAlternative,
}) {
  const [endingGame, setEndingGame] = useState(false)
  const [showLevelCompletedScreen, setShowLevelCompletedScreen] = useState(
    false,
  )
  const [previousLevel, setPreviousLevel] = useState()

  const previous = usePrevious(level)
  useEffect(() => {
    if (level && previous && level.name !== previous.name) {
      setPreviousLevel(previous)
    }
  }, [level, previous, previousLevel])
  useEffect(() => {
    if (
      level &&
      previousLevel &&
      !previousLevel.completed &&
      !level.completed &&
      previousLevel.name !== level.name
    ) {
      setShowLevelCompletedScreen(true)
    }
  }, [level, previous, previousLevel, setShowLevelCompletedScreen])
  useEffect(() => {
    if (
      selectedAnswerIds &&
      correctAnswerIds &&
      correctAnswerIds.every(correct => selectedAnswerIds.includes(correct)) &&
      correctAnswerIds.length === selectedAnswerIds.length
    ) {
      if (browser.getBrowserName() !== 'Safari') {
        correctSound.play()
      }
    }
  }, [correctAnswerIds, selectedAnswerIds])

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
        selectedAnswerIds={selectedAnswerIds}
        correctAnswerIds={correctAnswerIds}
        answer={answer}
        progression={progression}
        levels={levels}
        changeLevel={changeLevel}
        toggleSelectAlternative={toggleSelectAlternative}
      />
      {showLevelCompletedScreen && (
        <LevelCompletedScreen
          data-testid="level-completed-screen"
          completedLevelName={previousLevel.name}
          nextLevelName={level.name}
          close={() => setShowLevelCompletedScreen(false)}
        />
      )}
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
