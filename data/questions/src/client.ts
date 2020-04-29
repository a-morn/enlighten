import { MongoClient } from "mongodb";

let client: MongoClient;

async function initialize(): Promise<unknown> {
  const dbConnectionUrl = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_URL}`;
  client = new MongoClient(dbConnectionUrl, { useUnifiedTopology: true });
  return await client.connect();
}

export async function getClient(): Promise<MongoClient> {
  if (!client) {
    await initialize();
  }
  return client;
}
