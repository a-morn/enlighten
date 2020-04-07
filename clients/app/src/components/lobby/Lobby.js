import React, { useState, useEffect, useCallback, useRef } from 'react'
import * as R from 'ramda'
import PlayerList from './player-list'
import GameRequestModal from './game-request-modal'
import { CategoryPicker } from '../category-picker'
import { withRouter, useParams } from 'react-router-dom'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'

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

const GAME_REQUEST = gql`
  query {
    gameRequest {
      id
      category
      playerRequestId
      playerOfferedId
      playerRequestName
      playerOfferedName
      accepted
    }
  }
`

export const PLAYER_JOINED = gql`
  subscription {
    playerJoined {
      name
      id
      category
    }
  }
`

const JOIN_LOBBY = gql`
  mutation($player: PlayerInput!) {
    joinLobby(player: $player) {
      id
      name
      category
    }
  }
`

const REQUEST_GAME = gql`
  mutation($gameRequest: GameRequestInput!) {
    requestGame(gameRequest: $gameRequest) {
      playerOfferedId
      playerRequestId
      category
      playerRequestName
      id
    }
  }
`
const ANSWER_GAME_REQUEST = gql`
  mutation($gameRequestId: ID!, $accepted: Boolean!) {
    answerGameRequest(id: $gameRequestId, accepted: $accepted) {
      id
      accepted
    }
  }
`

const DELETE_GAME_REQUEST = gql`
  mutation($gameRequestId: ID!) {
    deleteGameRequest(id: $gameRequestId) {
      id
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
  subscription onGameUpdated($mutation: String) {
    gameMultiplayer(mutation: $mutation) {
      game {
        id
      }
    }
  }
`

export const GAME_REQUEST_SUBSCRIPTION = gql`
  subscription {
    gameRequestSubscription {
      gameRequest {
        id
        playerRequestName
        playerOfferedName
        playerRequestId
        playerOfferedId
        category
        accepted
      }
      mutation
    }
  }
`

export function Lobby({ history, playerId }) {
  const [category, setCategory] = useState()
  const { category: categoryFromParams } = useParams()

  const [joinLobby] = useMutation(JOIN_LOBBY)
  const [requestGame] = useMutation(REQUEST_GAME, {
    refetchQueries: [
      {
        query: GAME_REQUEST,
      },
    ],
  })
  const [answerGameRequest] = useMutation(ANSWER_GAME_REQUEST)
  const [deleteGameRequest] = useMutation(DELETE_GAME_REQUEST)

  const { data: lobbyData, subscribeToMore: lobbySubscribeToMore } = useQuery(
    LOBBY,
  )
  const {
    data: gameRequestData,
    subscribeToMore: gameRequestSubscribeToMore,
  } = useQuery(GAME_REQUEST)

  const { data: gameData, subscribeToMore: gameSubscribeToMore } = useQuery(
    GAME,
  )

  useEffect(() => {
    lobbySubscribeToMore({
      document: PLAYER_JOINED,
      updateQuery: (prev, { subscriptionData }) => {
        if (
          !subscriptionData.data ||
          (prev &&
            prev.lobby.players.some(
              p => p.id === subscriptionData.data.playerJoined.id,
            ))
        ) {
          return prev
        }

        return R.mergeDeepLeft(
          {
            lobby: {
              players: [
                ...prev.lobby.players,
                subscriptionData.data.playerJoined,
              ],
            },
          },
          prev,
        )
      },
    })
  }, [lobbySubscribeToMore])

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

  useEffect(() => {
    gameSubscribeToMore({
      document: GAME_SUBSCRIPTION,
      variables: { mutation: 'CREATE' },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        return {
          gameMultiplayer: subscriptionData.data.gameMultiplayer.game,
        }
      },
    })
  }, [gameSubscribeToMore])

  const playerIdRef = useRef(null)
  playerIdRef.current = playerId

  const leave = useCallback(async () => {
    //setPlayers(players => players.filter(p => p.playerId !== playerId))
  }, [])

  useEffect(() => {
    return () => {
      leave()
    }
  }, [leave])

  if (!category && categoryFromParams) {
    setCategory(categoryFromParams)
  }

  const joinLobbyCallback = useCallback(
    name => {
      joinLobby({ variables: { player: { id: playerId, category, name } } })
    },
    [category, playerId, joinLobby],
  )

  const requestGameCallback = useCallback(
    playerOfferedId => {
      requestGame({
        variables: {
          gameRequest: {
            category,
            playerRequestId: playerId,
            playerOfferedId,
          },
        },
      })
    },
    [category, playerId, requestGame],
  )

  useEffect(() => {
    if (R.path(['gameMultiplayer', 'id'], gameData)) {
      history.push(`/multiplayer/${gameData.gameMultiplayer.id}/${playerId}`)
    }
  }, [gameData, history, playerId])

  const acceptGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        gameRequestId: gameRequestData.gameRequest.id,
        accepted: true,
      },
    })
  }, [answerGameRequest, gameRequestData])
  const declineGameRequest = useCallback(() => {
    answerGameRequest({
      variables: {
        gameRequestId: gameRequestData.gameRequest.id,
        accepted: false,
      },
    })
  }, [answerGameRequest, gameRequestData])

  let leaveLobbyButtonClassName =
    'hover:bg-red-600 bg-red-500 text-white rounded px-4 mt-4 disabled:opacity-50 shadow-lg p-6 md:p-4'

  if (false) {
    leaveLobbyButtonClassName += ' cursor-not-allowed opacity-50'
  }

  useEffect(() => {
    if (category) {
      history.push(`/lobby/${category}`)
    }
  }, [category, history])
  const disabledCategories = []
  const joinedCurrentCategory = false

  const memoSetCategory = useCallback(c => setCategory(c), [])

  const deleteGameRequestCallback = useCallback(
    _ => {
      deleteGameRequest({
        variables: {
          gameRequestId: gameRequestData.gameRequest.id,
        },
      })
    },
    [deleteGameRequest, gameRequestData],
  )

  return (
    <div className="flex flex-col">
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
        {R.pathEq(['gameRequest', 'playerOfferedId'], playerId)(
          gameRequestData,
        ) &&
          R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData) && (
            <GameRequestModal
              data-testid="game-request-challenged-modal"
              title="Challenge!"
              body={`${gameRequestData.gameRequest.playerRequestName} is challenging you`}
              acceptText="Let's go!"
              declineText="Rather not"
              onDecline={declineGameRequest}
              onAccept={acceptGameRequest}
            />
          )}
        {R.pathEq(['gameRequest', 'playerRequestId'], playerId)(
          gameRequestData,
        ) &&
          R.pathEq(['gameRequest', 'accepted'], null)(gameRequestData) && (
            <GameRequestModal
              data-testid="game-request-pending-modal"
              title="Challenge pending..."
              body={`Waiting for ${gameRequestData.gameRequest.playerOfferedName} to accept challenge`}
              declineText="Cancel challenge"
              onDecline={deleteGameRequestCallback}
            />
          )}
      </div>
      <div className="mt-4">
        <PlayerList
          players={
            lobbyData
              ? lobbyData.lobby.players.filter(p => p.category === category)
              : []
          }
          onClick={requestGameCallback}
          currentPlayerId={playerId}
        />
      </div>
    </div>
  )
}

export const LobbyComponent = withRouter(Lobby)
