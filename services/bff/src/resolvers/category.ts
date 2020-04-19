import { categories } from '../models/category'

export const categoriesQueryResolver = () => ({
  categories: () => {
    return categories
  },
})
