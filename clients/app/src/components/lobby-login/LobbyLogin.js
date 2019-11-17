import React, { useEffect, useState, useCallback } from 'react'
import Lobby from '../lobby'

function LobbyLogin() {
  const [playerId, setPlayerId] = useState()

  useEffect(() => {
    let subscribed = true
    async function fetchData() {
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/multiplayer/players`,
        { method: 'POST', headers: { Accept: 'application/json' } },
      )
      const { playerId } = await response.json()
      if (subscribed) {
        setPlayerId(playerId)
      }
    }

    if (!playerId) {
      fetchData()
    }
    return () => {
      subscribed = false
    }
  }, [playerId])

  const removePlayerId = useCallback(() => setPlayerId(() => null), [])

  if (!playerId) {
    return null
  }

  return <Lobby playerId={playerId} removePlayerId={removePlayerId} />
}

export default LobbyLogin
