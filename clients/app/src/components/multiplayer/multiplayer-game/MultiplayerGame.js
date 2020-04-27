import React from 'react'
import FullscreenModal from '../../fullscreen-modal'
import Question from '../../question'
import { Scoreboard } from './scoreboard'
import { WinScreen } from './win-screen'

export function MultiplayerGame({
  leaveGame,
  players,
  currentQuestion,
  correctAnswerId,
  otherPlayerLeft,
  isLoading,
  alternativeSelected,
  selectedAnswerId,
  playerWon,
  otherPlayerWon,
  otherPlayerName,
}) {
  if (playerWon || otherPlayerWon) {
    return (
      <WinScreen
        data-testid="win-screen"
        playerWon={playerWon}
        winnerName={playerWon ? 'You' : otherPlayerName}
        leaveGame={leaveGame}
      />
    )
  } else if (otherPlayerLeft) {
    return (
      <FullscreenModal
        data-testid="opponent-left-modal"
        title={`${otherPlayerName} left!`}
        body={`${otherPlayerName} has left the game`}
        declineText="Ok"
        onDecline={leaveGame}
      />
    )
  } else {
    return (
      <>
        <Scoreboard players={players} />
        <Question
          disabled={isLoading}
          question={currentQuestion}
          selectedAnswerId={selectedAnswerId}
          correctAnswerId={correctAnswerId}
          onAlternativeSelected={alternativeSelected}
        />
        <button
          className="bg-red-500 text-white rounded px-4 mt-10 shadow-lg py-6 md:py-4"
          onClick={leaveGame}
        >
          Leave game
        </button>
      </>
    )
  }
}
