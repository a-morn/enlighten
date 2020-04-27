import { useMutation, useQuery } from '@apollo/react-hooks'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import { store } from '../../hooks/context/store.js'
import { CategoryPicker } from '../category-picker'
import { Lobby } from './lobby'
import {
  GAME_SUBSCRIPTION,
  GAME,
  JOIN_LOBBY,
  LOBBY,
  GAME_REQUEST_SUBSCRIPTION,
  DELETE_GAME_REQUEST,
  REQUEST_GAME,
  GAME_REQUEST,
  PING_LOBBY,
  ANSWER_GAME_REQUEST,
} from './graphql'

function LobbyContainerComponent({ history }) {
  const [categoryId, setCategoryId] = useState()
  const [inLobby, setInLobby] = useState(false)
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
  const [pingLobby] = useMutation(PING_LOBBY)

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

  useEffect(() => {
    setInLobby(
      R.pathOr([], ['lobby', 'players'], lobbyData).some(
        ({ id }) => id === playerId,
      ),
    )
  }, [lobbyData, playerId])

  const disabledCategories = []

  const memoSetCategoryId = useCallback(c => setCategoryId(c), [])

  const [requestGame] = useMutation(REQUEST_GAME, {
    refetchQueries: [
      {
        query: GAME_REQUEST,
      },
    ],
  })

  const [answerGameRequest] = useMutation(ANSWER_GAME_REQUEST, {
    refetchQueries: [
      {
        query: GAME_REQUEST,
      },
    ],
  })
  const [deleteGameRequest] = useMutation(DELETE_GAME_REQUEST)

  const {
    data: gameRequestData,
    subscribeToMore: gameRequestSubscribeToMore,
  } = useQuery(GAME_REQUEST)

  useEffect(() => {
    gameRequestSubscribeToMore({
      document: GAME_REQUEST_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const {
          data: {
            gameRequestSubscription: { gameRequest, mutation },
          },
        } = subscriptionData
        const updatedGameRequest = {
          gameRequest: mutation === 'DELETE' ? null : gameRequest,
        }
        return updatedGameRequest
      },
    })
  }, [gameRequestSubscribeToMore])

  const requestGameCallback = playerOfferedId => {
    requestGame({
      variables: {
        gameRequest: {
          categoryId,
          playerRequestId: playerId,
          playerOfferedId,
        },
      },
    })
  }

  const acceptGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        answer: {
          gameRequestId: gameRequestData.gameRequest.id,
          accepted: true,
        },
      },
    })
  }, [answerGameRequest, gameRequestData])

  const declineGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        answer: {
          gameRequestId: gameRequestData.gameRequest.id,
          accepted: false,
        },
      },
    })
  }, [answerGameRequest, gameRequestData])

  const deleteGameRequestCallback = useCallback(
    _ => {
      deleteGameRequest({
        variables: {
          gameRequest: {
            gameRequestId: gameRequestData.gameRequest.id,
          },
        },
      })
    },
    [deleteGameRequest, gameRequestData],
  )

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
        {inLobby && (
          <Lobby
            playerId={playerId}
            players={R.pathOr([], ['lobby', 'players'], lobbyData).filter(
              p => p.categoryId === categoryId,
            )}
            deleteGameRequest={deleteGameRequestCallback}
            offered={
              R.pathEq(['gameRequest', 'playerOfferedId'], playerId)(
                gameRequestData,
              ) && R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData)
            }
            playerRequestName={R.path(
              ['gameRequest', 'playerRequestName'],
              gameRequestData,
            )}
            pending={
              R.pathEq(['gameRequest', 'playerRequestId'], playerId)(
                gameRequestData,
              ) && R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData)
            }
            playerOfferedName={R.path(
              ['gameRequest', 'playerOfferedName'],
              gameRequestData,
            )}
            requestGame={requestGameCallback}
            declineGameRequest={declineGameRequest}
            acceptGameRequest={acceptGameRequest}
            pingLobby={pingLobby}
          />
        )}
      </div>
    </div>
  )
}

export default withRouter(LobbyContainerComponent)
