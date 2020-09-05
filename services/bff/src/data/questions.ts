import { Question } from 'enlighten-common-types'
import { MongoClient } from 'mongodb'

export const COUNTRIES_LEVELS = {
  EUROPE: 'Europe',
  THE_AMERICAS: 'The Americas',
  AFRICA: 'Africa',
  ASIA: 'Asia',
}

export async function findQuestionsByCategory(
  client: MongoClient,
  categoryId: string,
): Promise<Question[]> {
  const cursor = client
    .db('enlighten')
    .collection('question')
    .find({
      categoryId,
    })

  const results = await cursor.toArray()

  return results
}

export async function findOneQuestion(
  client: MongoClient,
  _id: string,
): Promise<Question> {
  const result = await client
    .db('enlighten')
    .collection('question')
    .findOne({ _id })

  return result
}
