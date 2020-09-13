import { v4 as uuid } from "uuid";
import { getCategoryIdByLabel } from "./utils";
import { Category, Levels } from "enlighten-common-types";

export const getLevels: (categories: Category[]) => Levels[] = categories => [
    {
        levels: [
            {
                _id: uuid(),
                name: 'Europe',
            },
            {
                _id: uuid(),
                name: 'The Americas',
            },
            {
                _id: uuid(),
                name: 'Africa',
            },
            {
                _id: uuid(),
                name: 'Asia',
            }
        ],
        categoryId: getCategoryIdByLabel('Countries', categories)
    },
    {
        levels: [
            {
                _id: uuid(),
                name: 'Data Structures',
            },
            {
                _id: uuid(),
                name: 'Algorithms',
            },
        ],
        categoryId: getCategoryIdByLabel('Computer Science', categories)
    },
    {
        levels: [
            {
                _id: uuid(),
                name: 'Number bases',
            },
            {
                _id: uuid(),
                name: 'Trigonometry',
            },
            {
                _id: uuid(),
                name: 'Functions',
            },
            {
                _id: uuid(),
                name: 'Kinematics',
            },
            {
                _id: uuid(),
                name: 'Linear algebra',
            }
        ],
        categoryId: getCategoryIdByLabel('Mathematics', categories)
    },
]