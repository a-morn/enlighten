import { getCategories } from '../models/category'
import { Category } from 'enlighten-common-types'

export const categoriesQueryResolver = (): {
  categories(): Promise<Category[]>
} => ({
  categories: (): Promise<Category[]> => {
    return getCategories()
  },
})
