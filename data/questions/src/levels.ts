import { v4 as uuid } from "uuid";
import { getCategoryIdByLabel } from "./utils";
import { Category, Levels } from "enlighten-common-types";

export const getLevels: (categories: Category[]) => Levels[] = categories => [
    {
        levels: [
            {
                _id: uuid(),
                name: 'Europe',
                completed: false
            },
            {
                _id: uuid(),
                name: 'The Americas',
                completed: false
            },
            {
                _id: uuid(),
                name: 'Africa',
                completed: false
            },
            {
                _id: uuid(),
                name: 'Asia',
                completed: false
            }
        ],
        categoryId: getCategoryIdByLabel('Countries', categories)
    },
    {
        levels: [
            {
                _id: uuid(),
                name: 'Data Structures',
                completed: false
            },
            {
                _id: uuid(),
                name: 'Algorithms',
                completed: false
            },
        ],
        categoryId: getCategoryIdByLabel('Computer Science', categories)
    },
]