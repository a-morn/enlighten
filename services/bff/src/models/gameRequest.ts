import { Category } from "./category";

export type GameRequest = {
    id: string
    category: Category
    playerRequestId: string
    playerRequestName: string
    playerOfferedName: string
    playerOfferedId: string
    accepted: boolean | null
    date: Date
}