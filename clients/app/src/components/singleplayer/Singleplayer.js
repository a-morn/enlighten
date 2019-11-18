import React, { useState, useCallback } from 'react'
import CategoryPicker from '../category-picker'
import SingleplayerGame from './singleplayer-game'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import * as R from 'ramda'

const GET_SINGLEPLAYER_GAME = gql`
  query {
    gameSingleplayer {
      id
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

  const { data: gameData } = useQuery(GET_SINGLEPLAYER_GAME)
  const [createGame] = useMutation(CREATE_SINGLEPLAYER_GAME, {
    refetchQueries: [
      {
        query: GET_SINGLEPLAYER_GAME,
      },
    ],
  })
  const [deleteGame] = useMutation(DELETE_SINGLEPLAYER_GAME, {
    refetchQueries: [
      {
        query: GET_SINGLEPLAYER_GAME,
      },
    ],
  })

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

  return (
    <div className="flex flex-col items-center">
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
          gameId={gameData.gameSingleplayer.gameId}
          deleteGame={deleteGameCallback}
        />
      )}
    </div>
  )
}

export default Singleplayer
