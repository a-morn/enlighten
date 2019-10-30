import React, { useState, useCallback } from 'react'
import CategoryPicker from '../category-picker'
import SingleplayerGame from './singleplayer-game'

function Board() {
  const [isStartingSingleplayerGame, setIsStartingSingleplayerGame] = useState()
  const [gameId, setGameId] = useState()
  const [playerId, setPlayerId] = useState()
  const [category, setCategory] = useState()

  const startSingleplayerGameRequest = useCallback(async () => {
    if (!isStartingSingleplayerGame) {
      setIsStartingSingleplayerGame(true)
      const response = await fetch(
        `${process.env.REACT_APP_BFF_PROTOCOL}${process.env.REACT_APP_BFF_URL}/singleplayer/games`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ category }),
        },
      )
      const { gameId: newGameId, playerId: newPlayerId } = await response.json()
      setGameId(newGameId)
      setPlayerId(newPlayerId)
    }
  }, [category, isStartingSingleplayerGame])

  const deleteGame = useCallback(() => {
    setGameId(() => null)
  }, [])

  return (
    <div className="flex flex-col items-center">
      {!gameId && (
        <CategoryPicker
          onClick={startSingleplayerGameRequest}
          setCategory={setCategory}
          category={category}
          buttonLabel="Start"
          className="p-10"
        />
      )}
      {gameId && (
        <SingleplayerGame
          playerId={playerId}
          gameId={gameId}
          deleteGame={deleteGame}
        />
      )}
    </div>
  )
}

export default Board
