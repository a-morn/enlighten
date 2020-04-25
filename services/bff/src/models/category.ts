import { Category, CategoryId } from '../types'
const getCategories = (): Promise<Category[]> =>
  Promise.resolve([
    {
      id: 'game-of-thrones',
      label: 'Game of Thrones',
      background: `${process.env.ASSETS_URL}/game-of-thrones/got-tapestry.jpg`,
    },
    {
      id: 'countries',
      label: 'Countries',
      background: `${process.env.ASSETS_URL}/countries/world-map.jfif`,
    },
    {
      id: 'music-theory',
      label: 'Music Theory',
      background: `${process.env.ASSETS_URL}/music-theory/abandoned-art-school.jpg`,
    },
  ])

const getCategory = async (categoryId: CategoryId): Promise<Category> => {
  const category = (await getCategories()).find(({ id }) => categoryId === id)
  if (!category) {
    throw new Error(`No category with id ${categoryId}`)
  }

  return category
}

export { getCategories, getCategory }
