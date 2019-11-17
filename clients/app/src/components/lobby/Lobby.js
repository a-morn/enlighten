import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import PlayerList from './player-list'
import GameRequestModal from './game-request-modal'
import CategoryPicker from '../category-picker'
import { withRouter, useParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'

function Lobby({ history, playerId, removePlayerId }) {
  const playerIdRef = useRef(null)
  playerIdRef.current = playerId

  const options = useMemo(
    () => ({
      share: true,
      queryParams: { type: 'lobby', playerId },
    }),
    [playerId],
  )
  const [sendMessage, lastMessage] = useWebSocket(
    process.env.REACT_APP_WS_URL,
    options,
  )
  const [category, setCategory] = useState()
  const [players, setPlayers] = useState([])
  const [gameRequest, setGameRequest] = useState()
  const [requestPending, setRequestPending] = useState(false)
  const { category: categoryFromParams } = useParams()

  const leave = useCallback(async () => {
    setPlayers(players => players.filter(p => p.playerId !== playerId))
  }, [playerId])

  useEffect(() => {
    return () => {
      leave()
    }
  }, [leave])

  if (!category && categoryFromParams) {
    setCategory(categoryFromParams)
  }

  useEffect(() => {
    let subscribed = true
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/multiplayer/players?category=${category}`,
      )
      if (!subscribed) {
        return
      }

      const result = await response.json()
      if (!subscribed) {
        return
      }
      setPlayers(result)
    }

    fetchData()

    return () => {
      subscribed = false
    }
  }, [category])

  const joinLobby = useCallback(
    name => {
      sendMessage(
        JSON.stringify({
          resource: 'players',
          method: 'PUT',
          payload: {
            playerId,
            category,
            name,
          },
        }),
      )
    },
    [category, playerId, sendMessage],
  )

  useEffect(() => {
    if (!lastMessage) {
      return
    }
    const { resource, method, payload } = JSON.parse(lastMessage.data)
    switch (resource) {
      case 'players':
        switch (method) {
          case 'POST':
            if (Array.isArray(payload)) {
              setPlayers(players =>
                players.concat(
                  payload
                    .filter(p => p.category === category)
                    .filter(
                      p => !players.some(p2 => p2.playerId === p.playerId),
                    ),
                ),
              )
            } else {
              throw Error(`Payload type not supported`)
            }
            break
          case 'DELETE': {
            if (payload === playerId) {
              removePlayerId()
            } else if (Array.isArray(payload)) {
              setPlayers(players =>
                players.filter(
                  p => !payload.some(p2 => p2.playerId === p.playerId),
                ),
              )
            }
            break
          }
          default: {
            throw Error(`Method ${method} mot supported for ${resource}`)
          }
        }
        break
      case 'game-requests': {
        switch (method) {
          case 'POST': {
            console.log(payload)
            setGameRequest(payload)
            break
          }
          case 'DELETE': {
            setRequestPending(false)
            break
          }
          default: {
            throw Error(`Method ${method} mot supported for ${resource}`)
          }
        }
        break
      }
      case 'games': {
        switch (method) {
          case 'POST': {
            const { gameId } = payload
            history.push(`/multiplayer/${gameId}/${playerId}`)
            break
          }
          default: {
            throw Error(`Method ${method} mot supported for ${resource}`)
          }
        }
        break
      }
      default:
        throw Error(`Unsuported resource: ${resource}`)
    }
  }, [category, history, leave, lastMessage, playerId, removePlayerId])

  const requestGame = useCallback(
    playerOfferedId => {
      sendMessage(
        JSON.stringify({
          resource: 'game-requests',
          method: 'POST',
          payload: {
            playerRequestId: playerId,
            playerOfferedId,
            category,
          },
        }),
      )
      setRequestPending(true)
    },
    [category, playerId, sendMessage],
  )

  const declineRequestGame = useCallback(() => {
    const { gameRequestId } = gameRequest
    sendMessage(
      JSON.stringify({
        resource: 'game-requests',
        method: 'DELETE',
        payload: {
          gameRequestId,
        },
      }),
    )
    setGameRequest(null)
  }, [gameRequest, sendMessage])

  const onAccept = useCallback(() => {
    const { gameRequestId } = gameRequest
    sendMessage(
      JSON.stringify({
        resource: 'game-requests',
        method: 'PUT',
        payload: {
          gameRequestId,
          accepted: true,
        },
      }),
    )
  }, [gameRequest, sendMessage])

  const joinedCurrentCategory = players.some(p => p.playerId === playerId)
  const disabledCategories = useMemo(
    () => (joinedCurrentCategory ? [category] : []),
    [joinedCurrentCategory, category],
  )

  let leaveLobbyButtonClassName =
    'hover:bg-red-600 bg-red-500 text-white rounded px-4 mt-4 disabled:opacity-50 shadow-lg p-6 md:p-4'

  if (!joinedCurrentCategory) {
    leaveLobbyButtonClassName += ' cursor-not-allowed opacity-50'
  }

  useEffect(() => {
    if (category) {
      history.push(`/lobby/${category}`)
    }
  }, [category, history])

  const memoSetCategory = useCallback(c => setCategory(c), [])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col">
        <CategoryPicker
          className=""
          onClick={joinLobby}
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
        <GameRequestModal
          show={gameRequest}
          onDecline={declineRequestGame}
          onAccept={onAccept}
          playerRequestName={gameRequest && gameRequest.playerRequestName}
        />
        {requestPending && (
          <p className="p-4">Waiting for player to accept challange...</p>
        )}
      </div>
      <div className="mt-4">
        <PlayerList
          players={players}
          onClick={requestGame}
          currentPlayerId={playerId}
        />
      </div>
    </div>
  )
}

export default withRouter(Lobby)
