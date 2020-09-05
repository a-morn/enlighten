import { v4 as uuid } from "uuid";
import { getCategoryIdByLabel } from "./utils";
import { Category, Levels } from "enlighten-common-types";

export const getLevels: (categories: Category[]) => Levels[] = categories => [
    {
        levels: [{
                _id: uuid(),
                name: 'Europe'
            },
            {
                _id: uuid(),
                name: 'The Americas'
            },
            {
                _id: uuid(),
                name: 'Africa'
            },
            {
                _id: uuid(),
                name: 'Asia'
            }
        ],
        categoryId: getCategoryIdByLabel('Countries', categories)
    },
    // {
    //     levels: [],
    //     categoryId: getCategoryIdByLabel('Game of Thrones', categories)
    // },
    // {
    //     levels: [],
    //     categoryId: getCategoryIdByLabel('Music Theory', categories)
    // }
]