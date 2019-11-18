import React, { useEffect, useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import MultiplayerGame from './multiplayer-game'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

const GAME_MULTIPLAYER = gql`
  query {
    gameMultiplayer {
      id
    }
  }
`

const DELETE_GAME = gql`
  mutation($id: ID!) {
    deleteGameMultiplayer(id: $id) {
      id
    }
  }
`

const GAME_SUBSCRIPTION = gql`
  subscription onGameUpdated($mutation: String!) {
    gameMultiplayer(mutation: $mutation) {
      game {
        id
      }
    }
  }
`

function Multiplayer({ history, playerId }) {
  const { data, subscribeToMore } = useQuery(GAME_MULTIPLAYER)
  const [deleteGame] = useMutation(DELETE_GAME, {
    refetchQueries: [
      {
        query: GAME_MULTIPLAYER,
      },
    ],
  })
  useEffect(() => {
    subscribeToMore({
      document: GAME_SUBSCRIPTION,
      variables: { mutation: 'DELETE' },
      updateQuery: () => {
        return { gameMultiplayer: null }
      },
    })
  }, [subscribeToMore])

  const gameDeleted = useCallback(() => {
    if (data && data.gameMultiplayer) {
      deleteGame({
        variables: {
          id: data.gameMultiplayer.id,
        },
      })
    }
    history.push('/lobby')
  }, [data, deleteGame, history])

  useEffect(() => {
    if (!data || !data.gameMultiplayer) {
      gameDeleted()
    }
  }, [data, gameDeleted])

  return (
    <>
      {data && data.gameMultiplayer && (
        <MultiplayerGame
          gameId={data.gameMultiplayer.id}
          playerId={playerId}
          gameDeleted={gameDeleted}
        />
      )}
    </>
  )
}

export default withRouter(Multiplayer)
