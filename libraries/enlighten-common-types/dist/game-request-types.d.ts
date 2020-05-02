import { CategoryId } from './category-types';
export declare type GameRequest = {
    id: string;
    categoryId: CategoryId;
    playerRequestId: string;
    playerRequestName: string;
    playerOfferedName: string;
    playerOfferedId: string;
    accepted: boolean | null;
    created: string;
};
export declare function isGameRequest(x: unknown): x is GameRequest;
