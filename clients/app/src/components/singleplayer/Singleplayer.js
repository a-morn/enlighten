import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'
import { CategoryPicker } from '../category-picker'
import SingleplayerGame from './singleplayer-game'

const ANSWER = gql`
  mutation($questionId: ID!, $id: ID!) {
    answerQuestionSingleplayer(questionId: $questionId, answerId: $id) {
      id
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

const GAME = gql`
  query {
    gameSingleplayer {
      id
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
    gameSingleplayer {
      game {
        id
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

  const { data: gameData, subscribeToMore: gameSubscribeToMore } = useQuery(
    GAME,
  )
  useEffect(() => {
    gameSubscribeToMore({
      document: GAME_UPDATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        } else {
          switch (subscriptionData.data.gameSingleplayer.mutation) {
            case 'DELETE': {
              return {
                gameSingleplayer: null,
              }
            }
            default: {
              return {
                gameSingleplayer: subscriptionData.data.gameSingleplayer.game,
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
