import { MongoClient } from 'mongodb'
import { Level } from 'enlighten-common-types'

export async function findLevels(
  client: MongoClient,
  categoryId: string
): Promise<Level[] | undefined> {
  const result = await client
    .db('enlighten')
    .collection('levels')
    .findOne({ categoryId })

  if (result) {
    return result.levels
  }
}
