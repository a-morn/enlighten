import React, { memo } from 'react'

const PlayerList = memo(({ players, onClick, currentPlayerId, className }) => {
  return (
    <div className={className}>
      <ul className={``}>
        {players &&
          players
            .map(p => ({
              ...p,
              isCurrentPlayer: currentPlayerId === p.playerId,
            }))
            .map(({ name, playerId, isCurrentPlayer, status }, i) => (
              <li key={i}>
                <button
                  onClick={_ => !isCurrentPlayer && onClick(playerId)}
                  className={`hover:bg-gray-100 hover:text-blue-600  px-32 py-2 text-gray-500 border-b border-gray-200 block ${
                    isCurrentPlayer ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {name} {isCurrentPlayer ? '*' : ''}{' '}
                  {status === 'IN_GAME' ? ' - in game' : ''}
                </button>
              </li>
            ))}
      </ul>
    </div>
  )
})

export default PlayerList
