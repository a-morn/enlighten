import { GameQuestion } from 'enlighten-common-types'
import { isCategoryId } from './category-types'
import { PlayerMultiplayer } from './player-types'

export type Game = {
  categoryId: string
  categoryBackground: string
  categoryBackgroundBase64: string
  lastQuestionId?: string
  currentQuestionId?: string
  currentQuestion?: GameQuestion
  lastQuestion?: GameQuestion
  lastUpdated?: string
}

export type GameSingeplayer = Game & {
  playerId: string
  questions: GameQuestion[]
}

export type GameMultiplayer = Game & {
  id: string
  players: PlayerMultiplayer[]
  questions: GameQuestion[]
  questionIndex: number
}

export type Levels = {
  [key: number]: GameQuestion[]
}

export function isGame(x: unknown): x is Game {
  return (
    isCategoryId((x as Game).categoryId) &&
    typeof (x as Game).categoryBackground === 'string'
  )
}

export function isGameMultiplayer(x: unknown): x is GameMultiplayer {
  return (
    isGame(x) &&
    Array.isArray((x as GameMultiplayer).questions) &&
    typeof (x as GameMultiplayer).questionIndex === 'number' &&
    typeof (x as GameMultiplayer).id === 'string'
  )
  // todo add players
}

export function isGameSingleplayer(x: unknown): x is GameSingeplayer {
  return (
    isGame(x) &&
    typeof (x as GameSingeplayer).playerId === 'string' &&
    typeof (x as GameSingeplayer).questions === 'object'
  )
}
