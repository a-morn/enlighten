import { getCategories } from '../models/category'
import { Category } from '../types'

export const categoriesQueryResolver = (): {
  categories(): Promise<Category[]>
} => ({
  categories: (): Promise<Category[]> => {
    return getCategories()
  },
})
