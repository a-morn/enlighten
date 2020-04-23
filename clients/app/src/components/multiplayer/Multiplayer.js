import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useCallback, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { store } from '../../hooks/context/store.js'
import { CountDown } from './count-down'
import { MultiplayerGame } from './multiplayer-game'

const GAME = gql`
  query {
    gameMultiplayer {
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
        answered
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

const REMOVE_PLAYER_FROM_GAME = gql`
  mutation($player: RemovePlayerFromGameMultiplayerInput!) {
    removePlayerFromGameMultiplayer(player: $player) {
      success
    }
  }
`

const PING_MULTIPLAYER = gql`
  mutation {
    pingMultiplayer {
      success
    }
  }
`

const GAME_UPDATED = gql`
  subscription {
    gameMultiplayerSubscription {
      mutation
      gameMultiplayer {
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
          answered
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

function Multiplayer({ history, playerId }) {
  const { data, startPolling, subscribeToMore } = useQuery(GAME)

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

  const globalState = useContext(store)
  const { dispatch } = globalState
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
    if (data && data.gameMultiplayer) {
      removePlayerFromGame({
        variables: {
          player: {
            id: data.gameMultiplayer.id,
          },
        },
      })
    }
  }, [data, removePlayerFromGame])

  useEffect(() => {
    if (data && !data.gameMultiplayer) {
      history.push('/lobby')
    }
  }, [data, history, removePlayerFromGame])

  useEffect(() => {
    const url =
      data && data.gameMultiplayer
        ? data.gameMultiplayer.categoryBackground
        : null
    dispatch({ type: 'category-background-updated', url })
    return () => dispatch({ type: 'category-background-updated', url: null })
  }, [data, dispatch])
  return (
    <>
      {data && data.gameMultiplayer && data.gameMultiplayer.currentQuestion && (
        <MultiplayerGame
          game={data.gameMultiplayer}
          playerId={playerId}
          leaveGame={removePlayerFromGameCallback}
        />
      )}
      {data &&
        data.gameMultiplayer &&
        !data.gameMultiplayer.currentQuestion && <CountDown duration={3} />}
    </>
  )
}

export default withRouter(Multiplayer)
