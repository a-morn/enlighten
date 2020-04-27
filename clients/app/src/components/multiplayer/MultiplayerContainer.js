import { useMutation, useQuery } from '@apollo/react-hooks'
import React, { useCallback, useEffect, useContext, useState } from 'react'
import { withRouter } from 'react-router-dom'
import { store } from '../../hooks/context/store.js'
import { CountDown } from './count-down'
import { MultiplayerGame } from './multiplayer-game'
import * as R from 'ramda'
import correct from '../../assets/correct.wav'
import {
  ANSWER,
  GAME_UPDATED,
  PING_MULTIPLAYER,
  REMOVE_PLAYER_FROM_GAME,
  GAME,
} from './graphql'

function Multiplayer({ history }) {
  const {
    state: { playerId },
    dispatch,
  } = useContext(store)
  const { data, startPolling, subscribeToMore } = useQuery(GAME)

  const [answer] = useMutation(ANSWER)

  const [isLoading, setIsLoading] = useState(false)
  const [playerWon, setPlayerWon] = useState(false)
  const [otherPlayerWon, setOtherPlayerWon] = useState(false)
  const [otherPlayerName, setOtherPlayerName] = useState()

  useEffect(() => {
    startPolling(2000)
  }, [startPolling])

  const [pingMultipalyer] = useMutation(PING_MULTIPLAYER)

  useEffect(() => {
    const interval = setInterval(() => {
      pingMultipalyer()
    }, 1000)

    return () => clearInterval(interval)
  }, [pingMultipalyer])

  const [removePlayerFromGame] = useMutation(REMOVE_PLAYER_FROM_GAME, {
    refetchQueries: [
      {
        query: GAME,
      },
    ],
  })
  useEffect(() => {
    subscribeToMore({
      document: GAME_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          switch (subscriptionData.data.gameMultiplayerSubscription.mutation) {
            case 'DELETE': {
              return {
                ...prev,
                // for some reason I couldn't remove gameMultiplayer from the cache here
                // works anyway since it will be removed on removePlayerFromGame
                // gameMultiplayer: null
              }
            }
            default: {
              return {
                gameMultiplayer:
                  subscriptionData.data.gameMultiplayerSubscription
                    .gameMultiplayer,
              }
            }
          }
        }
      },
    })
  }, [subscribeToMore])

  const removePlayerFromGameCallback = useCallback(() => {
    if (R.path(['gameMultiplayer', 'id'], data)) {
      removePlayerFromGame({
        variables: {
          player: {
            id: data.gameMultiplayer.id,
          },
        },
      })
    }
  }, [data, removePlayerFromGame])

  const answerCallback = useCallback(async () => {
    setIsLoading(true)
    await answer()
    setIsLoading(false)
  }, [answer])

  useEffect(() => {
    if (!R.path(['gameMultiplayer'], data)) {
      history.push('/lobby')
    }
  }, [data, history, removePlayerFromGame])

  useEffect(() => {
    const url = R.pathOr(null, ['gameMultiplayer', 'categoryBackground'], data)
    dispatch({ type: 'category-background-updated', url })
    return () => dispatch({ type: 'category-background-updated', url: null })
  }, [data, dispatch])

  const [correctAnswerId, setCorrectAnswerId] = useState()
  const [otherPlayerLeft, setOtherPlayerLeft] = useState()

  useEffect(() => {
    const currentQuestionAnswerId = R.pathOr(
      null,
      ['gameMultiplayer', 'currentQuestion', 'answerId'],
      data,
    )

    if (currentQuestionAnswerId && !correctAnswerId) {
      setCorrectAnswerId(currentQuestionAnswerId)
      if (currentQuestionAnswerId === correctAnswerId) {
        new Audio(correct).play()
      }
    } else if (currentQuestionAnswerId === null && correctAnswerId !== null) {
      setCorrectAnswerId(null)
    }
  }, [correctAnswerId, data, playerId])

  useEffect(() => {
    if (R.path(['gameMultiplayer'], data)) {
      const otherPlayer = data.gameMultiplayer.players.find(
        ({ id }) => id !== playerId,
      )
      setOtherPlayerLeft(otherPlayer.hasLeft)
      const winner = R.path(['gameMultiplayer'], data)
        ? data.gameMultiplayer.players.find(({ won }) => won)
        : null
      setPlayerWon(winner && winner.id === playerId)
      setOtherPlayerWon(winner && winner.id !== playerId)
      setOtherPlayerName(
        data.gameMultiplayer.players.find(({ id }) => id !== playerId).name,
      )
    }
  }, [data, playerId])

  const [selectedAnswerId, setSelectedAnswerId] = useState()

  const alternativeSelected = useCallback(
    answerId => {
      const currentQuestionAnswered = R.pathOr(
        null,
        ['currentQuestion', 'answered'],
        data.gameMultiplayer,
      )

      if (!currentQuestionAnswered) {
        answer({
          variables: {
            answer: {
              answerId,
              questionId: data.gameMultiplayer.currentQuestion.id,
            },
          },
        })
        setSelectedAnswerId(answerId)
      }
    },
    [answer, data],
  )

  return (
    <>
      {R.path(['gameMultiplayer', 'currentQuestion'], data) && (
        <div className="flex flex-col my-auto">
          <MultiplayerGame
            leaveGame={removePlayerFromGameCallback}
            answer={answerCallback}
            correctAnswerId={correctAnswerId}
            otherPlayerLeft={otherPlayerLeft}
            isLoading={isLoading}
            selectedAnswerId={selectedAnswerId}
            alternativeSelected={alternativeSelected}
            playerWon={playerWon}
            otherPlayerWon={otherPlayerWon}
            otherPlayerName={otherPlayerName}
            players={data.gameMultiplayer.players}
            currentQuestion={data.gameMultiplayer.currentQuestion}
          />
        </div>
      )}
      {data &&
        data.gameMultiplayer &&
        !data.gameMultiplayer.currentQuestion && <CountDown duration={3} />}
    </>
  )
}

export default withRouter(Multiplayer)
