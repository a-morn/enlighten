import { MongoClient } from 'mongodb'
import { CategoryId } from 'src/types'
import { Question } from 'enlighten-common-types'

export async function findQuestions(
  client: MongoClient,
  category: CategoryId,
): Promise<Question[]> {
  const cursor = client
    .db('enlighten')
    .collection('question')
    .find({
      category,
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
