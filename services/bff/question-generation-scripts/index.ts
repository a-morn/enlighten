import { resolve } from 'path'
import dotenv from 'dotenv-flow'
dotenv.config({ path: resolve(__dirname, '..') })

import { promises } from 'fs'

import gotQuestions from './game-of-thrones'
import countryQuestions from './countries'

const gotQuestionsJson = JSON.stringify(gotQuestions)
const countryQuestionsJson = JSON.stringify(countryQuestions)

promises.writeFile(
  'src/generated-data/game-of-thrones.json',
  gotQuestionsJson,
  'utf8',
)
promises.writeFile(
  'src/generated-data/countries.json',
  countryQuestionsJson,
  'utf8',
)
