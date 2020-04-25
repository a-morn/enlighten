import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import correct from '../../../assets/correct.wav'
import { store } from '../../../hooks/context/store.js'
import FullscreenModal from '../../fullscreen-modal'
import Question from '../../question'
import { Scoreboard } from './scoreboard'
import { WinScreen } from './win-screen'

export const ANSWER = gql`
  mutation($answer: AnswerQuestionMultiplayerInput!) {
    answerQuestionMultiplayer(answer: $answer) {
      success
    }
  }
`

export function MultiplayerGame({ game, leaveGame }) {
  const {
    state: { playerId },
  } = useContext(store)
  const [selectedAnswerId, setSelectedAnswerId] = useState()
  const [isLoading] = useState(false)

  const [answer] = useMutation(ANSWER)

  const [correctAnswerId, setCorrectAnswerId] = useState()
  const [otherPlayerLeft, setOtherPlayerLeft] = useState()

  useEffect(() => {
    const currentQuestionAnswerId = R.pathOr(
      null,
      ['currentQuestion', 'answerId'],
      game,
    )

    if (currentQuestionAnswerId && !correctAnswerId) {
      setCorrectAnswerId(currentQuestionAnswerId)
      if (currentQuestionAnswerId === correctAnswerId) {
        new Audio(correct).play()
      }
    } else if (currentQuestionAnswerId === null && correctAnswerId !== null) {
      setCorrectAnswerId(null)
    }

    const otherPlayer = game.players.find(({ id }) => id !== playerId)
    if (otherPlayer.hasLeft) {
      setOtherPlayerLeft(`${otherPlayer.name} has left the game`)
    }
  }, [correctAnswerId, game, playerId])

  const alternativeSelected = useCallback(
    answerId => {
      const currentQuestionAnswered = R.pathOr(
        null,
        ['currentQuestion', 'answered'],
        game,
      )

      console.log(currentQuestionAnswered)

      if (!currentQuestionAnswered) {
        answer({
          variables: {
            answer: {
              answerId,
              questionId: game.currentQuestion.id,
            },
          },
        })
        setSelectedAnswerId(answerId)
      }
    },
    [answer, game],
  )
  const winner = game ? game.players.find(({ won }) => won) : null
  const leaveGameCallback = useCallback(() => leaveGame(), [leaveGame])
  return (
    <div className="flex flex-col my-auto">
      {game && (
        <>
          {winner && (
            <WinScreen
              playerWon={winner.id === playerId}
              winnerName={winner.name}
              leaveGameCallback={leaveGameCallback}
            />
          )}
          {!winner && otherPlayerLeft && (
            <FullscreenModal
              data-testid="opponent-left-modal"
              title="Opponent left!"
              body={otherPlayerLeft}
              declineText="Ok"
              onDecline={leaveGameCallback}
            />
          )}
          <Scoreboard players={game.players} />
          <Question
            className=""
            disabled={isLoading || winner}
            question={game.currentQuestion}
            selectedAnswerId={selectedAnswerId}
            correctAnswerId={correctAnswerId}
            onAlternativeSelected={alternativeSelected}
          />
          <button
            className="bg-red-500 text-white rounded px-4 mt-10 shadow-lg py-6 md:py-4"
            onClick={leaveGameCallback}
          >
            Leave game
          </button>
        </>
      )}
    </div>
  )
}
