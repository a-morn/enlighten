import React from 'react'
import { withRouter, useParams } from 'react-router-dom'
import MultiplayerGame from './multiplayer-game'

function Multiplayer({ history }) {
  const { gameId, playerId } = useParams()

  const deleteGame = () => null

  return (
    <div className="flex">
      <MultiplayerGame
        gameId={gameId}
        playerId={playerId}
        deleteGame={deleteGame}
      />
    </div>
  )
}

export default withRouter(Multiplayer)
