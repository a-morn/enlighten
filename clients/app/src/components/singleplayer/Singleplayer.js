import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { store } from '../../hooks/context/store.js'
import { CategoryPicker } from '../category-picker'
import SingleplayerGame from './singleplayer-game'

const ANSWER = gql`
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionSingleplayer(questionId: $questionId, answerId: $id) {
      id
    }
  }
`

const GAME = gql`
  query {
    gameSingleplayer {
      id
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

const GAME_UPDATED = gql`
  subscription {
    gameSingleplayerSubscription {
      mutation
      gameSingleplayer {
        id
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

const CREATE_SINGLEPLAYER_GAME = gql`
  mutation($playerId: ID!, $category: String!) {
    createGameSingleplayer(playerId: $playerId, category: $category) {
      id
      playerId
      category
    }
  }
`

const DELETE_SINGLEPLAYER_GAME = gql`
  mutation($id: ID!) {
    deleteGameSingleplayer(id: $id) {
      id
    }
  }
`

function Singleplayer({ playerId }) {
  const [isStartingGame, setIsStartingGame] = useState()
  const [category, setCategory] = useState()
  const globalState = useContext(store)
  const { dispatch } = globalState

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

  const [createGame] = useMutation(CREATE_SINGLEPLAYER_GAME, {
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
          playerId,
          category,
        },
      })
    }
  }, [category, createGame, isStartingGame, playerId])

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
    id => {
      answer({
        variables: {
          id,
          questionId: gameData.gameSingleplayer.currentQuestion.id,
        },
      })
    },
    [answer, gameData],
  )

  useEffect(() => console.log(gameData), [gameData])
  return (
    <div className="flex flex-col items-center justify-center">
      {!R.path(['gameSingleplayer', 'id'], gameData) && (
        <CategoryPicker
          onClick={startGameRequest}
          setCategory={setCategory}
          category={category}
          buttonLabel="Start"
          className="p-10"
        />
      )}
      {R.path(['gameSingleplayer', 'id'], gameData) && (
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
