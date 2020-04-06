import React, { useState, useEffect, useCallback } from 'react'
//import LimitBreak from './limit-break'
import Question from '../../question'
import * as R from 'ramda'

function SingleplayerGame({ playerId, game, deleteGame, answer }) {
  const [correctAnswerId, setCorrectAnswerId] = useState()

  useEffect(() => {
    const currentQuestionAnswerId = R.pathOr(
      null,
      ['currentQuestion', 'answerId'],
      game,
    )
    setCorrectAnswerId(currentQuestionAnswerId)
  }, [game])

  const [selectedAnswerId, setSelectedAlternativeId] = useState()
  const [isLoading] = useState(false)
  /*
  const [limitBreakLevel, setLimitBreakLevel] = useState(0)
  const [limitBreakTimerActive, setLimitBreakTimerActive] = useState(false)
  const [limitBreakStatus, setLimitBreakStatus] = useState('inactive')
  const [limitBreakCharge, setLimitBreakCharge] = useState(0)
  const [
    limitBreakHasAchievedGodlike,
    setLimitBreakHasAchievedGodlike,
  ] = useState(false)
  const [
    limitBreakHasAchievedDominating,
    setLimitBreakHasAchievedDominating,
  ] = useState(false)
  const [
    limitBreakHasAchievedRampage,
    setLimitBreakHasAchievedRampage,
  ] = useState(false)

  useEffect(() => {
    if (limitBreakStatus === 'charged') {
      if (limitBreakLevel > 50 && !limitBreakHasAchievedGodlike) {
        setLimitBreakHasAchievedGodlike(true)
        const audio = new Audio('godlike.mp3')
        audio.volume = 0.005
        audio.play()
      } else if (limitBreakLevel > 75 && !limitBreakHasAchievedDominating) {
        setLimitBreakHasAchievedDominating(true)
        const audio = new Audio('dominating.mp3')
        audio.volume = 0.0075
        audio.play()
      } else if (limitBreakLevel >= 100 && !limitBreakHasAchievedRampage) {
        setLimitBreakHasAchievedRampage(true)
        const audio = new Audio('rampage.mp3')
        audio.volume = 0.01
        audio.play()
      }
    }
  }, [
    limitBreakLevel,
    limitBreakHasAchievedGodlike,
    limitBreakHasAchievedDominating,
    limitBreakHasAchievedRampage,
    limitBreakStatus,
  ])
*/

  const endGame = useCallback(() => {
    deleteGame()
  }, [deleteGame])

  const answerCallback = useCallback(
    id => {
      answer(id)
      setSelectedAlternativeId(id)
    },
    [answer],
  )
  return (
    <div>
      {/* <LimitBreak
        level={limitBreakLevel}
        charge={limitBreakCharge}
        status={limitBreakStatus}
        max={100}
      /> */}
      {game && (
        <Question
          className="pt-4"
          disabled={isLoading /*|| limitBreakStatus === 'decharge' */}
          question={game.currentQuestion}
          selectedAnswerId={selectedAnswerId}
          correctAnswerId={correctAnswerId}
          onAlternativeSelected={answerCallback}
        />
      )}
      <button
        className="bg-red-500 text-white rounded px-4 mt-10 shadow-lg p-4"
        onClick={endGame}
      >
        End game
      </button>
    </div>
  )
}

export default SingleplayerGame
