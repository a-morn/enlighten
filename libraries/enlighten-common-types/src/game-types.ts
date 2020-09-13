import { GameQuestion, QuestionGroup } from "./question-types";
import { PlayerMultiplayer } from "./player-types";
import { GameLevel } from ".";

export type Game = {
  categoryId: string;
  categoryName: string;
  categoryBackground: string;
  categoryBackgroundBase64: string;
  lastQuestionId?: string;
  currentQuestionId?: string;
  currentQuestion?: GameQuestion;
  lastQuestion?: GameQuestion;
  lastUpdated?: string;
};

export type GameSingeplayer = Game & {
  playerId: string;
  questionGroups: QuestionGroup[];
  currentLevelId?: string;
  levels?: GameLevel[];
  progression: number;
  isWon: boolean;
  currentQuestionGroupName: string;
};

export type GameMultiplayer = Game & {
  id: string;
  players: PlayerMultiplayer[];
  questions: GameQuestion[];
  questionIndex: number;
};

export function isGame(x: unknown): x is Game {
  return (
    typeof (x as Game).categoryId === 'string' &&
    typeof (x as Game).categoryBackground === "string"
  );
}

export function isGameMultiplayer(x: unknown): x is GameMultiplayer {
  return (
    isGame(x) &&
    Array.isArray((x as GameMultiplayer).questions) &&
    typeof (x as GameMultiplayer).questionIndex === "number" &&
    typeof (x as GameMultiplayer).id === "string"
  );
  // todo add players
}

export function isGameSingleplayer(x: unknown): x is GameSingeplayer {
  return (
    isGame(x) &&
    typeof (x as GameSingeplayer).playerId === "string" &&
    typeof (x as GameSingeplayer).questionGroups === "object"
  );
}
