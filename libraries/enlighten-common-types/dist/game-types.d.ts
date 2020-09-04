import { GameQuestion, QuestionGroup } from "./question-types";
import { PlayerMultiplayer } from "./player-types";
import { Level } from ".";
export declare type Game = {
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
export declare type GameSingeplayer = Game & {
    playerId: string;
    questionGroups: QuestionGroup[];
    currentLevelIndex?: number;
    levels?: Level[];
    progression: number;
    isWon: boolean;
    currentQuestionGroupName: string;
};
export declare type GameMultiplayer = Game & {
    id: string;
    players: PlayerMultiplayer[];
    questions: GameQuestion[];
    questionIndex: number;
};
export declare function isGame(x: unknown): x is Game;
export declare function isGameMultiplayer(x: unknown): x is GameMultiplayer;
export declare function isGameSingleplayer(x: unknown): x is GameSingeplayer;
