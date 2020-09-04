export type Level = {
    _id: string
    name: string
    completed: boolean;
}

export type Levels = {
    levels: Level[],
    categoryId: string
}