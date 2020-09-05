import { Level } from 'enlighten-common-types'
import { MongoClient } from 'mongodb'

export async function findLevels(
  client: MongoClient,
  categoryId: string,
): Promise<Level[] | undefined> {
  const result = await client
    .db('enlighten')
    .collection('levels')
    .findOne({ categoryId })

  if (result) {
    return result.levels
  }
}
