import { Player } from './models/player'

const db: {
	players: Player[]
} = {
	players: []
}

const findPlayerById = (playerId: string) => {
	db.players.find(({ id }) => id === playerId)
}

export { findPlayerById }
