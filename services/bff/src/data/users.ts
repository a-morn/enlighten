import { User, NewUser } from 'enlighten-common-types'
import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'

export async function findOneUser(
  client: MongoClient,
  _id: string,
): Promise<User> {
  const result = await client
    .db('enlighten')
    .collection('user')
    .findOne({ _id })

  return result
}

export async function findOneUserByEmail(
  client: MongoClient,
  email: string,
): Promise<User> {
  const result = await client
    .db('enlighten')
    .collection('user')
    .findOne({ email })

  return result
}

export async function createUser(
  client: MongoClient,
  newUser: NewUser,
): Promise<string> {
  const result = await client
    .db('enlighten')
    .collection('user')
    .insertOne({ ...newUser, _id: uuid() })

  console.log(`New user created`)
  return result.insertedId
}
