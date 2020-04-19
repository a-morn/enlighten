type CategoryId = 'game-of-thrones' | 'countries'

type Category = {
  id: CategoryId
  label: string
}

const categories: Category[] = [
  { id: 'game-of-thrones', label: 'Game of Thrones' },
  { id: 'countries', label: 'Countries' },
]

function isCategoryId(x: string | CategoryId): x is CategoryId {
  return x === 'game-of-thrones' || x === 'countries'
}

export { CategoryId, categories, isCategoryId }
