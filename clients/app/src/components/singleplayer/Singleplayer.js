import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { store } from '../../hooks/context/store.js'
import { CategoryPicker } from '../category-picker'
import SingleplayerGame from './singleplayer-game'

const GAME = gql`
  query {
    gameSingleplayer {
      categoryBackground
      lastQuestion {
        id
        answerId
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
    }
  }
`

const ANSWER = gql`
  mutation($answer: AnswerQuestionSingleplayerInput!) {
    answerQuestionSingleplayer(answer: $answer) {
      success
    }
  }
`

const CREATE_GAME_SINGLEPLAYER = gql`
  mutation($game: CreateGameSingleplayerInput!) {
    createGameSingleplayer(game: $game) {
      success
    }
  }
`

const DELETE_SINGLEPLAYER_GAME = gql`
  mutation {
    deleteGameSingleplayer {
      success
    }
  }
`

const GAME_UPDATED = gql`
  subscription {
    gameSingleplayerSubscription {
      mutation
      gameSingleplayer {
        categoryBackground
        lastQuestion {
          id
          answerId
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
      }
    }
  }
`

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
    const url =
      gameData && gameData.gameSingleplayer
        ? gameData.gameSingleplayer.categoryBackground
        : null
    dispatch({ type: 'category-background-updated', url })
    return () => dispatch({ type: 'category-background-updated', url: null })
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
    deleteGame({
      variables: {
        id,
      },
    })
    setIsStartingGame(false)
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
    },
    [answer, gameData],
  )

  return (
    <div className="flex flex-col items-center justify-center">
      {!R.path(['gameSingleplayer', 'currentQuestion'], gameData) && (
        <CategoryPicker
          onClick={startGameRequest}
          setCategoryId={setCategoryId}
          categoryId={categoryId}
          buttonLabel="Start"
          className="p-10"
        />
      )}
      {R.path(['gameSingleplayer', 'currentQuestion'], gameData) && (
        <SingleplayerGame
          playerId={playerId}
          game={gameData.gameSingleplayer}
          deleteGame={deleteGameCallback}
          answer={answerCallback}
        />
      )}
    </div>
  )
}

export default Singleplayer
