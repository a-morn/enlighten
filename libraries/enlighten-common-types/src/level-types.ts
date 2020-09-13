export type Level = {
    _id: string
    name: string
}

export type GameLevel = Level & {
    completed: boolean;
}

export type Levels = {
    levels: Level[],
    categoryId: string
}