const uuidv1 = require('uuid/v4');
const shuffle = require('shuffle-array');
const { countries, getEmojiFlag } = require('countries-list')
const COUNTRIES = Object.entries(countries)
  .map(([key, value]) => ({ ...value, flag: `${process.env.ASSETS_URL}/countries/country-flags/${key.toLocaleLowerCase()}.svg` }))

console.log(COUNTRIES[0].flag)

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

const foo = (fromType, toType, el) => {
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

const bar = (toType, el) => {
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

const questions = Object.entries(config).reduce(
  (acc, [level, { fromTypes, toTypes, countries, maxAlternatives }]) => ({
    ...acc,
    [level]: {
      questions: fromTypes
        .reduce(
          (acc, fromType) =>
            acc.concat(
              toTypes
                .filter(toType => toType !== fromType)
                .map(toType => ({ fromType, toType }))
            ),
          []
        )
        .reduce(
          (acc, { fromType, toType }) =>
            acc.concat(
              countries
                .map(countryName => COUNTRIES.find(({ name }) => countryName === name))
                .map(el => ({
                  id: uuidv1(),
                  ...foo(fromType, toType, el),
                  alternatives:
                    [el]
                      .concat(
                        COUNTRIES.filter(({ name }) => name !== el.name).slice(
                          0,
                          maxAlternatives
                        )
                      )
                      .map((el) => ({ ...bar(toType, el), id: uuidv1() }))
                  ,
                  category: 'countries'
                }))
                .map(({ alternatives, ...question }) => ({
                  answerId: alternatives[0].id,
                  alternatives: shuffle(alternatives),
                  ...question,
                }))
            ),
          []
        )
    }
  }),
  {}
);

module.exports = { ...questions };
