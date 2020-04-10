import { Question } from './question'
import { PlayerMultiplayer } from './player'

export type Game = {
    category: string;
    categoryBackground: string
    id: string;
    lastQuestionId?: string
    currentQuestionId?: string
    questions: Question[]
    currentQuestion?: Question
    lastQuestion?: Question
    questionIndex: number
}

export type GameSingeplayer = Game & {
    playerId: string
    userLevel: keyof Levels;
    levels: Levels
}

export type GameMultiplayer = Game & {
    players: PlayerMultiplayer[]
}

export type Levels = {
    [key: number]: Question[]
}