export type Player = {
    id: string
    name: string
}

export type PlayerLobby = Player & {
    category: string
}

export type PlayerMultiplayer = Player & {
    hasLeft: boolean
    score: number
    won: boolean
}