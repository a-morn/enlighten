import { useMutation, useQuery } from '@apollo/react-hooks'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { store } from '../../hooks/context/store.js'
import { CategoryPicker } from '../category-picker'
import SingleplayerGame from './singleplayer-game'
import Bowser from 'bowser'
import correct from '../../assets/correct.wav'
import {
  GAME,
  ANSWER,
  CREATE_GAME_SINGLEPLAYER,
  DELETE_SINGLEPLAYER_GAME,
  GAME_UPDATED,
} from './graphql'

const browser = Bowser.getParser(window.navigator.userAgent)
const correctSound = new Audio(correct)
correctSound.volume = 0.05

function Singleplayer() {
  const [isStartingGame, setIsStartingGame] = useState()
  const [categoryId, setCategoryId] = useState()
  const globalState = useContext(store)
  const { dispatch } = globalState
  const {
    state: { playerId },
  } = useContext(store)

  const { data: gameData, subscribeToMore: gameSubscribeToMore } = useQuery(
    GAME,
  )
  useEffect(() => {
    const url = R.pathOr(
      null,
      ['gameSingleplayer', 'categoryBackground'],
      gameData,
    )
    const base64 = R.pathOr(
      null,
      ['gameSingleplayer', 'categoryBackgroundBase64'],
      gameData,
    )
    dispatch({
      type: 'category-background-updated',
      background: { url, base64 },
    })
    return () =>
      dispatch({
        type: 'category-background-updated',
        background: { url: null, base64: null },
      })
  }, [gameData, dispatch])

  useEffect(() => {
    gameSubscribeToMore({
      document: GAME_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          switch (subscriptionData.data.gameSingleplayerSubscription.mutation) {
            case 'DELETE': {
              return {
                gameSingleplayer: null,
              }
            }
            default: {
              return {
                gameSingleplayer:
                  subscriptionData.data.gameSingleplayerSubscription
                    .gameSingleplayer,
              }
            }
          }
        }
      },
    })
  }, [gameSubscribeToMore])

  const [createGame] = useMutation(CREATE_GAME_SINGLEPLAYER, {
    refetchQueries: [
      {
        query: GAME,
      },
    ],
  })
  const [deleteGame] = useMutation(DELETE_SINGLEPLAYER_GAME, {
    refetchQueries: [
      {
        query: GAME,
      },
    ],
  })
  const [answer] = useMutation(ANSWER)

  const startGameRequest = useCallback(async () => {
    if (!isStartingGame) {
      setIsStartingGame(true)
      createGame({
        variables: {
          game: {
            playerId,
            categoryId,
          },
        },
      })
    }
  }, [categoryId, createGame, isStartingGame, playerId])

  const deleteGameCallback = useCallback(() => {
    if (!gameData) {
      return
    }
    const {
      gameSingleplayer: { id },
    } = gameData
    setIsStartingGame(false)

    return deleteGame({
      variables: {
        id,
      },
    })
  }, [deleteGame, gameData])

  const answerCallback = useCallback(
    answerId => {
      answer({
        variables: {
          answer: {
            answerId,
            questionId: gameData.gameSingleplayer.currentQuestion.id,
          },
        },
      })
      setSelectedAlternativeId(answerId)
    },
    [answer, gameData],
  )

  const [correctAnswerId, setCorrectAnswerId] = useState()
  const [selectedAnswerId, setSelectedAlternativeId] = useState()
  const [isLoading] = useState(false)

  useEffect(() => {
    const currentQuestionAnswerId = R.pathOr(
      null,
      ['gameSingleplayer', 'currentQuestion', 'answerId'],
      gameData,
    )
    setCorrectAnswerId(currentQuestionAnswerId)
    if (currentQuestionAnswerId === selectedAnswerId) {
      if (browser.getBrowserName() !== 'Safari') {
        correctSound.play()
      }
    }
  }, [gameData, selectedAnswerId])

  return (
    <div className="flex flex-col items-center justify-center">
      {!R.path(['gameSingleplayer', 'currentQuestion'], gameData) && (
        <CategoryPicker
          onClick={startGameRequest}
          setCategoryId={setCategoryId}
          categoryId={categoryId}
          buttonLabel="Start"
          className="p-10"
          disabled={isStartingGame}
        />
      )}
      {R.path(['gameSingleplayer', 'currentQuestion'], gameData) && (
        <SingleplayerGame
          currentQuestion={gameData.gameSingleplayer.currentQuestion}
          endGame={deleteGameCallback}
          answer={answerCallback}
          isLoading={isLoading}
          selectedAnswerId={selectedAnswerId}
          correctAnswerId={correctAnswerId}
        />
      )}
    </div>
  )
}

export default Singleplayer
