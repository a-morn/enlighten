type CategoryId = 'game-of-thrones' | 'countries' | 'music-theory'

export type Category = {
  id: CategoryId
  label: string
  background: string
  backgroundBase64: string
}
function isCategoryId(x: string | CategoryId): x is CategoryId {
  return x === 'game-of-thrones' || x === 'countries' || x === 'music-theory'
}

export { CategoryId, isCategoryId }
