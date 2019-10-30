import React, { useState, useEffect, useCallback, useMemo } from 'react'
import PlayerList from './player-list'
import GameRequestModal from './game-request-modal'
import CategoryPicker from '../category-picker'
import { withRouter, useParams } from 'react-router-dom'

let socket

function Lobby({ history }) {
  const [category, setCategory] = useState()
  const [playerId, setPlayerId] = useState()
  const [players, setPlayers] = useState([])
  const [gameRequest, setGameRequest] = useState()
  const [requestPending, setRequestPending] = useState(false)
  const { category: categoryFromParams } = useParams()

  const leave = useCallback(async () => {
    socket.send(
      JSON.stringify({
        method: 'PUT',
        resource: 'players',
        payload: { playerId },
      }),
    )
    setPlayers(players => players.filter(p => p.playerId !== playerId))
  }, [playerId])

  if (!category && categoryFromParams) {
    setCategory(categoryFromParams)
  }

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/multiplayer/players`,
        { method: 'POST', headers: { Accept: 'application/json' } },
      )
      const { playerId } = await response.json()
      setPlayerId(playerId)
    }

    if (!playerId) {
      fetchData()
    }
  }, [playerId])

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/multiplayer/players?category=${category}`,
      )
      const result = await response.json()
      setPlayers(result)
    }

    fetchData()
  }, [category])

  const joinLobby = useCallback(
    name => {
      socket.send(
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
    [category, playerId],
  )

  useEffect(() => {
    if (!playerId) return
    socket = new WebSocket(
      `ws://${process.env.REACT_APP_BFF_URL}/ws?type=lobby&playerId=${playerId}`,
    )
    socket.onmessage = ({ data }) => {
      const { resource, method, payload } = JSON.parse(data)
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
              setPlayers(players =>
                players.filter(
                  p =>
                    !payload
                      .filter(p => p.category === category)
                      .some(p2 => p2.playerId === p.playerId),
                ),
              )
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
    }
    return () => {
      leave()
      socket.close()
    }
  }, [playerId, category, history, leave])

  const requestGame = useCallback(
    playerOfferedId => {
      socket.send(
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
    [category, playerId],
  )

  const declineRequestGame = useCallback(() => {
    const { gameRequestId } = gameRequest
    socket.send(
      JSON.stringify({
        resource: 'game-requests',
        method: 'DELETE',
        payload: {
          gameRequestId,
        },
      }),
    )
    setGameRequest(null)
  }, [gameRequest])

  const onAccept = useCallback(() => {
    const { gameRequestId } = gameRequest
    socket.send(
      JSON.stringify({
        resource: 'game-requests',
        method: 'PUT',
        payload: {
          gameRequestId,
          accepted: true,
        },
      }),
    )
  }, [gameRequest])

  const joinedCurrentCategory = players.some(p => p.playerId === playerId)
  const disabledCategories = useMemo(
    () => (joinedCurrentCategory ? [category] : []),
    [joinedCurrentCategory, category],
  )

  let leaveLobbyButtonClassName =
    'bg-red-500 text-white rounded px-4 mt-10 disabled:opacity-50'

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
    <div className="flex">
      <div className="w-64">
        <CategoryPicker
          onClick={joinLobby}
          buttonLabel={'Join lobby'}
          disabledCategories={disabledCategories}
          category={category}
          setCategory={memoSetCategory}
          isNameUsed={true}
          autoPick
        />
        <button
          className={leaveLobbyButtonClassName}
          onClick={leave}
          disabled={!joinedCurrentCategory}
        >
          Leave lobby
        </button>
        <GameRequestModal
          show={gameRequest}
          onDecline={declineRequestGame}
          onAccept={onAccept}
        />
        {requestPending && <p>Waiting for player to accept challange</p>}
      </div>
      <PlayerList
        className="w-2/3"
        players={players}
        onClick={requestGame}
        currentPlayerId={playerId}
      />
    </div>
  )
}

export default withRouter(Lobby)
