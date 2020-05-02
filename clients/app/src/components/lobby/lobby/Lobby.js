import React, { useEffect } from 'react'
import FullscreenModal from 'components/fullscreen-modal'
import PlayerList from './player-list'

export function Lobby({
  playerId,
  players,
  requestGame,
  deleteGameRequest,
  declineGameRequest,
  acceptGameRequest,
  offered,
  playerRequestName,
  pending,
  playerOfferedName,
  pingLobby,
}) {
  useEffect(() => {
    const interval = setInterval(() => {
      pingLobby()
    }, 5000)

    return () => clearInterval(interval)
  }, [pingLobby])

  return (
    <div className="flex flex-col my-auto">
      <div className="flex flex-col">
        {offered && (
          <FullscreenModal
            title="Challenge!"
            body={`${playerRequestName} is challenging you`}
            acceptText="Let's go!"
            declineText="Rather not"
            onDecline={declineGameRequest}
            onAccept={acceptGameRequest}
          />
        )}
        {pending && (
          <FullscreenModal
            data-testid="game-request-pending-modal"
            title="Challenge pending..."
            body={`Waiting for ${playerOfferedName} to accept challenge`}
            declineText="Cancel challenge"
            onDecline={deleteGameRequest}
          />
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
