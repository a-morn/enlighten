import { Category } from '../types'
const categories = (): Promise<Category[]> =>
  Promise.resolve([
    { id: 'game-of-thrones', label: 'Game of Thrones' },
    { id: 'countries', label: 'Countries' },
  ])

export { categories }
