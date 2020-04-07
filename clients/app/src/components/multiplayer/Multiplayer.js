import React, { useEffect, useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import { MultiplayerGame } from './multiplayer-game'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

const GAME = gql`
  query {
    gameMultiplayer {
      id
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

const GAME_UPDATED = gql`
  subscription onGameUpdated($mutation: String) {
    gameMultiplayer(mutation: $mutation) {
      game {
        id
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
  }
`

const REMOVE_PLAYER_FROM_GAME = gql`
  mutation($id: ID!) {
    removePlayerFromGameMultiplayer(id: $id) {
      id
    }
  }
`

function Multiplayer({ history, playerId }) {
  const { data, subscribeToMore } = useQuery(GAME)
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
          switch (subscriptionData.data.gameMultiplayer.mutation) {
            case 'DELETE': {
              return { gameMultiplayer: null }
            }
            default: {
              return {
                gameMultiplayer: subscriptionData.data.gameMultiplayer.game,
              }
            }
          }
        }
      },
    })
  }, [subscribeToMore])

  const removePlayerFromGameCallback = useCallback(() => {
    if (data && data.gameMultiplayer) {
      removePlayerFromGame({
        variables: {
          id: data.gameMultiplayer.id,
        },
      })
    }
  }, [data, removePlayerFromGame])

  useEffect(() => {
    if (!data || !data.gameMultiplayer) {
      history.push('/lobby')
    }
  }, [data, history, removePlayerFromGame])

  return (
    <>
      {data && data.gameMultiplayer && (
        <MultiplayerGame
          game={data.gameMultiplayer}
          playerId={playerId}
          leaveGame={removePlayerFromGameCallback}
        />
      )}
    </>
  )
}

export default withRouter(Multiplayer)
