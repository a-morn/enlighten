import React from 'react'
import { withRouter, useParams } from 'react-router-dom'
import MultiplayerGame from './multiplayer-game'

function Multiplayer({ history }) {
  const { gameId, playerId } = useParams()

  const gameDeleted = () => {
		history.push('/lobby')
	}

  return (
    <div className="flex">
      <MultiplayerGame
        gameId={gameId}
        playerId={playerId}
        gameDeleted={gameDeleted}
      />
    </div>
  )
}

export default withRouter(Multiplayer)
