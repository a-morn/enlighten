import { Category } from 'enlighten-common-types'
import { MongoClient } from 'mongodb'

export async function findCategories(client: MongoClient): Promise<Category[]> {
  const cursor = client
    .db('enlighten')
    .collection('category')
    .find()

  const results = await cursor.toArray()

  return results
}

export async function findOneCategory(
  client: MongoClient,
  _id: string,
): Promise<Category> {
  const result = await client
    .db('enlighten')
    .collection('category')
    .findOne({ _id })

  return result
}
