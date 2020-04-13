import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import { CategoryPicker } from '../category-picker'
import { LobbyComponent } from '../lobby'

export const LOBBY = gql`
  query {
    lobby {
      players {
        name
        id
        category
      }
    }
  }
`
const JOIN_LOBBY = gql`
  mutation($player: PlayerInput!) {
    joinLobby(player: $player) {
      name
      id
      category
    }
  }
`

export const GAME = gql`
  query {
    gameMultiplayer {
      id
    }
  }
`

export const GAME_SUBSCRIPTION = gql`
  subscription {
    gameMultiplayerSubscription {
      mutation
      gameMultiplayer {
        id
      }
    }
  }
`

export function LobbyLogin({ history, playerId }) {
  const [category, setCategory] = useState()
  const { category: categoryFromParams } = useParams()

  const [joinLobby] = useMutation(JOIN_LOBBY)

  const { data: gameData, subscribeToMore: gameSubscribeToMore } = useQuery(
    GAME,
  )

  useEffect(() => {
    gameSubscribeToMore({
      document: GAME_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        switch (subscriptionData.data.gameMultiplayerSubscription.mutation) {
          case 'DELETE': {
            return {
              ...prev,
              gameMultiplayer: null,
            }
          }
          default:
            return {
              gameMultiplayer:
                subscriptionData.data.gameMultiplayerSubscription
                  .gameMultiplayer,
            }
        }
      },
    })
  }, [gameSubscribeToMore])

  const { data: lobbyData, startPolling } = useQuery(LOBBY)

  useEffect(() => {
    startPolling(1000)
  }, [startPolling])

  if (!category && categoryFromParams) {
    setCategory(categoryFromParams)
  }

  const joinLobbyCallback = useCallback(
    name => {
      joinLobby({ variables: { player: { id: playerId, category, name } } })
    },
    [category, playerId, joinLobby],
  )

  useEffect(() => {
    if (R.path(['gameMultiplayer', 'id'], gameData)) {
      history.push(`/multiplayer/${gameData.gameMultiplayer.id}/${playerId}`)
    }
  }, [gameData, history, playerId])

  useEffect(() => {
    if (category) {
      history.push(`/lobby/${category}`)
    }
  }, [category, history])
  const disabledCategories = []
  const joinedCurrentCategory = false

  const memoSetCategory = useCallback(c => setCategory(c), [])

  const leave = useCallback(async () => {
    //setPlayers(players => players.filter(p => p.playerId !== playerId))
  }, [])

  let leaveLobbyButtonClassName =
    'hover:bg-red-600 bg-red-500 text-white rounded px-4 mt-4 disabled:opacity-50 shadow-lg p-6 md:p-4'

  if (false) {
    leaveLobbyButtonClassName += ' cursor-not-allowed opacity-50'
  }

  return (
    <div className="flex flex-col my-auto">
      <div className="flex flex-col">
        <CategoryPicker
          className=""
          onClick={joinLobbyCallback}
          buttonLabel={'Join lobby'}
          disabledCategories={disabledCategories}
          category={category}
          setCategory={memoSetCategory}
          isNameUsed={true}
          autoPick
        />
        {joinedCurrentCategory && (
          <button className={leaveLobbyButtonClassName} onClick={leave}>
            Leave lobby
          </button>
        )}
        {R.pathOr([], ['lobby', 'players'], lobbyData).some(
          ({ id }) => id === playerId,
        ) && (
          <LobbyComponent
            playerId={playerId}
            category={category}
            players={R.pathOr([], ['lobby', 'players'], lobbyData).filter(
              p => p.category === category,
            )}
          />
        )}
      </div>
    </div>
  )
}

export const LobbyLoginComponent = withRouter(LobbyLogin)
