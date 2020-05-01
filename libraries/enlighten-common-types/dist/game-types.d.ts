import { GameQuestion } from "./question-types";
import { PlayerMultiplayer } from "./player-types";
export declare type Game = {
    categoryId: string;
    categoryBackground: string;
    categoryBackgroundBase64: string;
    lastQuestionId?: string;
    currentQuestionId?: string;
    currentQuestion?: GameQuestion;
    lastQuestion?: GameQuestion;
    lastUpdated?: string;
};
export declare type GameSingeplayer = Game & {
    playerId: string;
    questions: GameQuestion[];
};
export declare type GameMultiplayer = Game & {
    id: string;
    players: PlayerMultiplayer[];
    questions: GameQuestion[];
    questionIndex: number;
};
export declare type Levels = {
    [key: number]: GameQuestion[];
};
export declare function isGame(x: unknown): x is Game;
export declare function isGameMultiplayer(x: unknown): x is GameMultiplayer;
export declare function isGameSingleplayer(x: unknown): x is GameSingeplayer;
