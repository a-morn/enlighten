type CategoryId = 'game-of-thrones' | 'countries'

export type Category = {
  id: CategoryId
  label: string
}
function isCategoryId(x: string | CategoryId): x is CategoryId {
  return x === 'game-of-thrones' || x === 'countries'
}

export { CategoryId, isCategoryId }
