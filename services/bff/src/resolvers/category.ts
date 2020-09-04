import { Category } from 'enlighten-common-types'
import { getCategories } from '../models/category'

export const categoriesQueryResolver = (): {
  categories(): Promise<Category[]>
} => ({
  categories: (): Promise<Category[]> => {
    return getCategories()
  },
})
