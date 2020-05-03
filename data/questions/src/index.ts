/// <reference types="./types/lqip" />
import { resolve } from "path"; // eslint-disable-line import/order
const dotenv = require("dotenv-flow"); // eslint-disable-line import/order
dotenv.config({ path: resolve(__dirname, "..") });

import { getClient } from "./client";
import { MongoClient } from "mongodb";
import gotQuestions from "./game-of-thrones";
import countriesQuestions from "./countries";
import musicTheoryQuestions from "./music-theory";

async function clearQuestions(client: MongoClient) {
  await client.db("enlighten").collection("question").drop();

  console.log("Dropped collection question");
}

async function createMultipleQuestions(
  client: MongoClient,
  newQuestions: Array<object>
) {
  const result = await client
    .db("enlighten")
    .collection("question")
    .insertMany(newQuestions);

  console.log(`${result.insertedCount} new question(s) created`);
}

async function populate() {
  const client = await getClient();
  await clearQuestions(client);

  await Promise.all([
    createMultipleQuestions(client, await Promise.all(gotQuestions)),
    createMultipleQuestions(client, await Promise.all(countriesQuestions)),
    createMultipleQuestions(client, musicTheoryQuestions),
  ]);

  process.exit(0);
}

populate();
