import { CategoryId, isCategoryId } from "./category";

export type GameRequest = {
    id: string
    categoryId: CategoryId
    playerRequestId: string
    playerRequestName: string
    playerOfferedName: string
    playerOfferedId: string
    accepted: boolean | null
    created: string
}

export function isGameRequest(x: unknown): x is GameRequest {
    return typeof (x as GameRequest).id === 'string'
        && isCategoryId((x as GameRequest).categoryId)
        && typeof (x as GameRequest).playerRequestId === 'string'
        && typeof (x as GameRequest).playerRequestName === 'string'
        && typeof (x as GameRequest).playerOfferedName === 'string'
        && typeof (x as GameRequest).playerOfferedId === 'string'
        && ['boolean', 'object'].includes(typeof (x as GameRequest).accepted)
        && typeof (x as GameRequest).created === 'string'
}