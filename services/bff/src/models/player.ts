export type Player = {
    id: string
    name: string
}

export type PlayerLobby = Player & {
    category: string
    timestamp: Date
}

export type PlayerMultiplayer = Player & {
    hasLeft: boolean
    score: number
    won: boolean
    timestamp: Date
}