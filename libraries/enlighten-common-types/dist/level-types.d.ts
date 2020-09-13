export declare type Level = {
    _id: string;
    name: string;
};
export declare type GameLevel = Level & {
    completed: boolean;
};
export declare type Levels = {
    levels: Level[];
    categoryId: string;
};
