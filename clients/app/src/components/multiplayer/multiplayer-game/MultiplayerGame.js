import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import FullscreenModal from '../../fullscreen-modal'
import Question from '../../question'

export const ANSWER = gql`
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionMultiplayer(questionId: $questionId, answerId: $id) {
      id
    }
  }
`

const width = window.innerWidth
const height = window.innerHeight

export function MultiplayerGame({ playerId, game, leaveGame }) {
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

    if (currentQuestionAnswerId) {
      setCorrectAnswerId(currentQuestionAnswerId)
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
  const winner = { id: playerId } // game ? game.players.find(({ won }) => won) : null
  const leaveGameCallback = useCallback(() => leaveGame(), [leaveGame])
  return (
    <div className="flex flex-col">
      {game && (
        <>
          {winner && (
            <>
              {winner.id === playerId && (
                <Confetti
                  style={{ zIndex: 100 }}
                  width={width}
                  height={height}
                />
              )}
              <FullscreenModal
                data-testid="winner-modal"
                title={`${winner.id === playerId ? 'You' : winner.name} won! ${
                  winner.id === playerId ? '😃' : '😢'
                }`}
                declineText="Ok"
                onDecline={leaveGameCallback}
              />
            </>
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
