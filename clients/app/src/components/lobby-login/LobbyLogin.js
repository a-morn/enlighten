import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import { store } from '../../hooks/context/store.js'
import { CategoryPicker } from '../category-picker'
import { LobbyComponent } from '../lobby'

export const LOBBY = gql`
  query {
    lobby {
      players {
        name
        id
        categoryId
      }
    }
  }
`
const JOIN_LOBBY = gql`
  mutation($player: JoinLobbyInput!) {
    joinLobby(player: $player) {
      success
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

export function LobbyLogin({ history }) {
  const [categoryId, setCategoryId] = useState()
  const { categoryId: categoryFromParams } = useParams()
  const {
    state: { playerId },
  } = useContext(store)

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

  if (!categoryId && categoryFromParams) {
    setCategoryId(categoryFromParams)
  }

  const joinLobbyCallback = useCallback(
    name => {
      joinLobby({ variables: { player: { id: playerId, categoryId, name } } })
    },
    [categoryId, playerId, joinLobby],
  )

  useEffect(() => {
    if (R.path(['gameMultiplayer', 'id'], gameData)) {
      history.push(`/multiplayer/${gameData.gameMultiplayer.id}/${playerId}`)
    }
  }, [gameData, history, playerId])

  useEffect(() => {
    if (categoryId) {
      history.push(`/lobby/${categoryId}`)
    }
  }, [categoryId, history])
  const disabledCategories = []
  const joinedCurrentCategory = false

  const memoSetCategoryId = useCallback(c => setCategoryId(c), [])

  const leave = useCallback(async () => {
    //setPlayers(players => players.filter(p => p.playerId !== playerId))
  }, [])

  let leaveLobbyButtonClassName =
    'hover:bg-red-600 bg-red-500 text-white rounded px-4 mt-4 disabled:opacity-50 shadow-lg p-6 md:p-4'

  if (false) {
    leaveLobbyButtonClassName += ' cursor-not-allowed opacity-50'
  }

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col">
        <CategoryPicker
          className=""
          onClick={joinLobbyCallback}
          buttonLabel={'Join lobby'}
          disabledCategories={disabledCategories}
          categoryId={categoryId}
          setCategoryId={memoSetCategoryId}
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
            categoryId={categoryId}
            players={R.pathOr([], ['lobby', 'players'], lobbyData).filter(
              p => p.categoryId === categoryId,
            )}
          />
        )}
      </div>
    </div>
  )
}

export const LobbyLoginComponent = withRouter(LobbyLogin)
