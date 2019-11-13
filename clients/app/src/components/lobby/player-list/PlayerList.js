import React, { memo } from 'react'

const PlayerList = memo(({ players, onClick, currentPlayerId, className }) => {
  return (
    <div className={className}>
			<h3 className="p-6 md:p-4 text-lg text-gray-600 border-b border-gray-400 border-solid">Player list</h3>
      <ul className="">
        {Boolean(players.length) &&
          players
            .map(p => ({
              ...p,
              isCurrentPlayer: currentPlayerId === p.playerId,
            }))
            .map(({ name, playerId, isCurrentPlayer, status }, i) => (
              <li key={i}>
                <button
                  onClick={_ => !isCurrentPlayer && onClick(playerId)}
                  className={`shadow hover:bg-gray-300 hover:text-blue-500  px-32 py-6 md:py-4 text-gray-600 border-b border-gray-400 block w-full ${
                    isCurrentPlayer ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {name} {isCurrentPlayer ? '*' : ''}{' '}
                  {status === 'IN_GAME' ? ' - in game' : ''}
                </button>
              </li>
            ))}
				{Boolean(!players.length) && <li
			
                  className="shadow  px-4 py-6 md:py-4 text-gray-600 border-b border-gray-400 block w-full"
				>No players online</li>}
      </ul>
    </div>
  )
})

export default PlayerList
