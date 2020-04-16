import uuidv1 from 'uuid/v4';
import shuffle from 'shuffle-array';
import { countries } from 'countries-list'
import { notUndefined } from '../src/models/utils';
import { Question, Alternative, QuestionEntityType, QuestionObject, QuestionDirection } from '../src/models/question'

const COUNTRIES = Object.entries(countries)
  .map(([key, value]) => ({ ...value, flag: `${process.env.ASSETS_URL}/countries/country-flags/${key.toLocaleLowerCase()}.svg` }))

type Country = {
  name: string
  capital: string
  flag: string
}

const QUESTION_TYPE = {
  NAME: { id: 'name', label: 'name' },
  CAPITAL: { id: 'capital', label: 'capital' },
  FLAG: { id: 'flag', label: 'flag' }
};

const config = {
  1: {
    countries: COUNTRIES.map(({ name }) => name),
    fromTypes: Object.values(QUESTION_TYPE),
    toTypes: Object.values(QUESTION_TYPE),
    maxAlternatives: 3
  }
};

const getQuestionProperties = (fromType: QuestionEntityType<Country> | QuestionEntityType<Country>[], toType: QuestionEntityType<Country>, el: Country) => {
  if (Array.isArray(fromType)) {
    throw new Error(`Array fromType is not supported for this category`)
  }
  switch (fromType.id) {
    case 'name':
    case 'capital':
      return {
        type: 'text',
        text: `What is the __${toType.label}__ of the country with the ${
          fromType.label
          } _${el[fromType.id]}_? `
      };
    case 'flag':
      return {
        type: 'image',
        text: `What is the __${toType.label}__ of the house with the flag pictured?`,
        src: el[fromType.id]
      };
  }
};

const bar = (toType: QuestionEntityType<Country>, el: Country) => {
  switch (toType.id) {
    case 'name':
    case 'capital':
      return { type: 'text', text: el[toType.id] };
    case 'flag':
      return {
        type: 'image',
        src: el[toType.id]
      };
  }
};

const questions: QuestionObject = Object.entries(config).reduce(
  (acc, [level, { fromTypes, toTypes, countries, maxAlternatives }]) => ({
    ...acc,
    [level]: {
      questions: fromTypes
        .reduce(
          (acc: QuestionDirection<Country>[], fromType) =>
            acc.concat(
              toTypes
                .filter(toType => toType !== fromType)
                .map(toType => ({ fromType, toType } as QuestionDirection<Country>))
            ),
          []
        )
        .reduce(
          (acc: Question[], { fromType, toType }) =>
            acc.concat(
              countries
                .map(countryName => COUNTRIES.find(({ name }) => countryName === name))
                .filter(notUndefined)
                .map(el => ({
                  id: uuidv1(),
                  ...getQuestionProperties(fromType, toType, el),
                  alternatives:
                    [el]
                      .concat(
                        COUNTRIES.filter(({ name }) => name !== el.name).slice(
                          0,
                          maxAlternatives
                        )
                      )
                      .map((el) => ({ ...bar(toType, el), id: uuidv1() })) as Alternative[]
                  ,
                  category: 'countries',
                } as Question))
                .map(({ alternatives, ...question }: Question) => ({
                  answerId: alternatives[0].id,
                  alternatives: shuffle(alternatives),
                  ...question,
                } as Question))
            ),
          []
        )
    }
  }),
  {}
);

export default questions;
