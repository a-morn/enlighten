/// <reference types="./types/lqip" />
import { resolve } from "path"; // eslint-disable-line import/order
const dotenv = require("dotenv-flow"); // eslint-disable-line import/order
dotenv.config({ path: resolve(__dirname, "..") });

import { getClient } from "./client";
import { MongoClient } from "mongodb";
import { getQuestions as gotGetQuestions } from "./game-of-thrones";
import { getQuestions as countriesGetQuestions } from "./countries";
import { getQuestions as musicTheoryGetQuestions } from "./music-theory";
import { getQuestions as csGetQuestions } from "./computer-science"
import categories from './categories'
import { getLevels } from './levels'
import { getCategoryIdByLabel } from "./utils";
import { Levels, Level } from "enlighten-common-types";

async function clearCollection(client: MongoClient, collection: string) {
  try {
    await client.db("enlighten").collection(collection).drop();
    console.log(`Dropped collection ${collection}`);
  } catch (e) {
    if(e.codeName === 'NamespaceNotFound') {
      console.log(`Collection ${collection} does't exist`);
      return
    }
    throw e
  }
}

async function createCategories(
  client: MongoClient,
  newCategories: object[]
) {
  const result = await client
    .db('enlighten')
    .collection('category')
    .insertMany(newCategories)

  console.log(`${result.insertedCount} new category created`);
}

async function createLevels(
  client: MongoClient,
  newLevels: Levels[]
) {
  const result = await client
    .db('enlighten')
    .collection('levels')
    .insertMany(newLevels)

  console.log(`${result.insertedCount} new category created`);
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

function getLevelsByLabel(label: string, levels: Levels[]): Level[] {
  const categoryId = getCategoryIdByLabel(label, categories)
  const result = levels.find(level => level.categoryId === categoryId)
  if (result === undefined) {
    throw new Error(`Couldn't find levels for category ${label}`)
  }

  return result.levels
}

async function populate() {
  const client = await getClient();
  await Promise.all([
    clearCollection(client, 'question'),
    clearCollection(client, 'category'),
    clearCollection(client, 'levels'),
  ]);

  const levels = getLevels(categories)
  await Promise.all([
    createMultipleQuestions(client, await Promise.all(gotGetQuestions(getCategoryIdByLabel('Game of Thrones', categories)))),
    createMultipleQuestions(client, await Promise.all(countriesGetQuestions(getCategoryIdByLabel('Countries', categories), getLevelsByLabel('Countries', levels)))),
    createMultipleQuestions(client, musicTheoryGetQuestions(getCategoryIdByLabel('Music Theory', categories))),
    createMultipleQuestions(client, await csGetQuestions(getCategoryIdByLabel('Computer Science', categories), getLevelsByLabel('Computer Science', levels))),
    createCategories(client, categories),
    createLevels(client, levels)
  ]);

  process.exit(0);
}

populate();
