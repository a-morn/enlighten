import { MongoClient } from 'mongodb'

let client: MongoClient

async function initialize(): Promise<void> {
  const dbConnectionUrl = process.env.MONGO_DB_CONNECTION_STRING
  if (!dbConnectionUrl) {
    throw new Error('Missing MONGO_DB_CONNECTION_STRING')
  }
  client = new MongoClient(dbConnectionUrl)
  await client.connect()
}

export async function getClient(): Promise<MongoClient> {
  if (!client) {
    await initialize()
  }
  return client
}
