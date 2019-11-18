const db = {
	players: []
}

const findPlayerById = (playerId) => {
	db.players.find(player => player.playerId === player)
}

export { findPlayerById }
