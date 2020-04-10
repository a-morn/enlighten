import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import correct from '../../../assets/correct.wav'
import FullscreenModal from '../../fullscreen-modal'
import Question from '../../question'
import styles from './MultiplayerGame.module.scss'

export const ANSWER = gql`
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionMultiplayer(questionId: $questionId, answerId: $id) {
      id
      categoryBackground
      players {
        id
        score
        name
        won
        hasLeft
      }
      currentQuestion {
        id
        type
        text
        src
        answerId
        alternatives {
          id
          type
          text
          src
        }
      }
      lastQuestion {
        id
        answerId
      }
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
    <div className="flex flex-col my-auto">
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
          <div
            className={`flex justify-between text-lg bg-gray-lighter p-4 rounded ${
              styles['multiplayer__scoreboard']
              }`}
          >
            {game.players.map(({ name, score, id }) => (
              <div key={id} className="flex items-center text-brand-dark">
                <span
                  className={`font-bold mr-4 ${
                    styles['multiplayer__scoreboard__name']
                    }`}
                >{`${name}:`}</span>
                <div
                  className={styles['multiplayer__scoreboard__score-wrapper']}
                >
                  <span
                    className={`${
                      styles['multiplayer__scoreboard__score-wrapper__score']
                      }`}
                    style={{
                      top: `${(-2 * ((score - (score % 10)) % 100)) / 10 ||
                        0}em`,
                      hidden: score < 10,
                    }}
                  >
                    0 1 2 3 4 5 6 7 8 9
                  </span>
                  <span
                    className={`${
                      styles['multiplayer__scoreboard__score-wrapper__score']
                      }`}
                    style={{ top: `${-2 * (score % 10) || 0}em` }}
                  >
                    0 1 2 3 4 5 6 7 8 9
                  </span>
                </div>
              </div>
            ))}
          </div>
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
