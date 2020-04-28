import { MongoClient } from 'mongodb'

let client: MongoClient

async function initialize(): Promise<void> {
  const dbConnectionUrl = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@enlighten-9ndgw.mongodb.net/test?retryWrites=true&w=majority`
  client = new MongoClient(dbConnectionUrl, { useUnifiedTopology: true })
  await client.connect()
}

export async function getClient(): Promise<MongoClient> {
  if (!client) {
    await initialize()
  }
  return client
}
