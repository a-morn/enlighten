import React, { useState, useEffect, useCallback } from 'react'
import Question from '../../question'
import FullscreenModal from '../../fullscreen-modal'
import gql from 'graphql-tag'
import * as R from 'ramda'
import { useMutation } from '@apollo/react-hooks'

export const ANSWER = gql`
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionMultiplayer(questionId: $questionId, answerId: $id) {
      id
    }
  }
`

export function MultiplayerGame({ playerId, game, leaveGame }) {
  const [selectedAnswerId, setSelectedAnswerId] = useState()
  const [isLoading] = useState(false)

  const [answer] = useMutation(ANSWER)

  const [correctAnswerId, setCorrectAnswerId] = useState()
  const [otherPlayerLeft, setOtherPlayerLeft] = useState()

  useEffect(() => {
    const answerQuestionId = R.pathOr(null, ['lastQuestion', 'id'], game)
    const currentQuestionId = R.pathOr(null, ['currentQuestion', 'id'], game)
    const answerId = R.pathOr(null, ['lastQuestion', 'answerId'], game)
    if (answerQuestionId === currentQuestionId) {
      setCorrectAnswerId(answerId)
    } else {
      setCorrectAnswerId(null)
    }

    const otherPlayer = game.players.find(({ id }) => id !== playerId)
    if (otherPlayer.hasLeft) {
      setOtherPlayerLeft(`${otherPlayer.name} has left the game`)
    }
  }, [game, playerId])

  const alternativeSelected = id => {
    answer({
      variables: {
        id,
        questionId: game.currentQuestion.id,
      },
    })
    setSelectedAnswerId(id)
  }
  const winner = game ? game.players.find(({ won }) => won) : null
  const leaveGameCallback = useCallback(() => leaveGame(), [leaveGame])

  return (
    <div className="flex flex-col">
      {game && (
        <>
          {winner && (
            <FullscreenModal
              data-testid="winner-modal"
              title={`${winner.name} won!`}
              declineText="Ok"
              onDecline={leaveGameCallback}
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
          <div className="flex justify-between text-lg">
            {game.players.map(({ name, score, id }) => (
              <div key={id}>
                <span className="font-bold">{`${name}:`}</span>
                <span className="m-8">{score || 0}</span>
              </div>
            ))}
          </div>
          <Question
            className="pt-4"
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
