import { resolve } from 'path'
import dotenv from 'dotenv-flow'
dotenv.config({ path: resolve(__dirname, '..') })
import { argv } from 'yargs'

import { promises } from 'fs'

import gotQuestions from './game-of-thrones'
import countryQuestions from './countries'
import musicTheoryQuestions from './music-theory'

if (
  argv.categories === '*' ||
  argv.categories === 'game-of-thrones' ||
  (Array.isArray(argv.categories) &&
    argv.categories.includes('game-of-thrones'))
) {
  const gotQuestionsJson = JSON.stringify(gotQuestions)
  promises.writeFile(
    'src/generated-data/game-of-thrones.json',
    gotQuestionsJson,
    'utf8',
  )
}

if (
  argv.categories === '*' ||
  argv.categories === 'countries' ||
  (Array.isArray(argv.categories) && argv.categories.includes('countries'))
) {
  const countryQuestionsJson = JSON.stringify(countryQuestions)
  promises.writeFile(
    'src/generated-data/countries.json',
    countryQuestionsJson,
    'utf8',
  )
}

if (
  argv.categories === '*' ||
  argv.categories === 'music-theory' ||
  (Array.isArray(argv.categories) && argv.categories.includes('music-theory'))
) {
  const musicTheoryQuestionsJson = JSON.stringify(musicTheoryQuestions)
  promises.writeFile(
    'src/generated-data/music-theory.json',
    musicTheoryQuestionsJson,
    'utf8',
  )
}
