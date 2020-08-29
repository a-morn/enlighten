import { Category } from 'enlighten-common-types'
import { getClient } from '../data/client'
import { findOneCategory, findCategories } from '../data/categories'

const getCategories = async (): Promise<Category[]> => {
  const client = await getClient()
  const categories = await findCategories(client)
  return categories
}

const getCategory = async (categoryId: string): Promise<Category> => {
  const client = await getClient()
  const category = await findOneCategory(client, categoryId)
  if (!category) {
    throw new Error(`No category with id ${categoryId}`)
  }

  return category
}

export { getCategories, getCategory }
