import { CategoryId } from "./category-types";
export declare type Player = {
    id: string;
    name: string;
    profilePictureUrl?: string;
};
export declare type PlayerLobby = Player & {
    categoryId: CategoryId;
    timestamp: string;
};
export declare type PlayerMultiplayer = Player & {
    hasLeft: boolean;
    score: number;
    won: boolean;
    timestamp: string;
};
export declare type PlayerGameId = {
    gameId: string;
};
export declare function isPlayerMultiplayer(x: unknown): x is PlayerMultiplayer;
export declare function isPlayerGameId(x: unknown): x is PlayerGameId;
export declare function isPlayerLobby(x: unknown): x is PlayerLobby;
