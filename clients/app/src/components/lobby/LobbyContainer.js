import { useMutation, useQuery } from '@apollo/react-hooks'
import { CategoryPicker } from 'components/category-picker'
import { store } from 'hooks/context/store.js'
import * as R from 'ramda'
import React, { useCallback, useEffect, useState, useContext } from 'react'
import { useParams, withRouter } from 'react-router-dom'
import {
  GAME_SUBSCRIPTION,
  LOBBY_SUBSCRIPTION,
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
import { Lobby } from './lobby'

function LobbyContainerComponent({ history }) {
  const [categoryId, setCategoryId] = useState()
  const [inLobby, setInLobby] = useState(false)
  const { categoryId: categoryFromParams } = useParams()
  const {
    state: { playerId },
  } = useContext(store)

  const [joinLobby] = useMutation(JOIN_LOBBY, {
    refetchQueries: [
      {
        query: LOBBY,
      },
    ],
  })

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

  const {
    data: lobbyData,
    subscribeToMore: lobbySubscribeToMore,
    startPolling,
  } = useQuery(LOBBY)

  useEffect(() => {
    startPolling(10000)
  }, [startPolling])

  useEffect(() => {
    lobbySubscribeToMore({
      document: LOBBY_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const {
          mutation,
          lobbyPlayer,
        } = subscriptionData.data.lobbyPlayerMutated
        switch (mutation) {
          case 'DELETE': {
            return {
              ...prev,
              lobby: {
                ...prev.lobby,
                players: prev.players.filter(({ id }) => id !== lobbyPlayer.id),
              },
            }
          }
          case 'CREATE': {
            if (prev.lobby.players.some(({ id }) => id === lobbyPlayer.id)) {
              return prev
            }
            return {
              ...prev,
              lobby: {
                ...prev.lobby,
                players: [...prev.lobby.players, lobbyPlayer],
              },
            }
          }
          default: {
            // todo: log
            return prev
          }
        }
      },
    })
  }, [gameSubscribeToMore, lobbySubscribeToMore])

  const [pingLobby] = useMutation(PING_LOBBY)

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
    if (!categoryId && categoryFromParams) {
      setCategoryId(categoryFromParams)
    } else if (categoryId) {
      history.push(`/lobby/${categoryId}`)
    }
  }, [categoryId, categoryFromParams, history])

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
              R.pathEq(
                ['gameRequest', 'playerOfferedId'],
                playerId,
              )(gameRequestData) &&
              R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData)
            }
            playerRequestName={R.path(
              ['gameRequest', 'playerRequestName'],
              gameRequestData,
            )}
            pending={
              R.pathEq(
                ['gameRequest', 'playerRequestId'],
                playerId,
              )(gameRequestData) &&
              R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData)
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
