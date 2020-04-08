const uuidv1 = require('uuid/v4');
const shuffle = require('shuffle-array');

const QUESTION_TYPE = {
  NAME: { id: 'name', label: 'name' },
  SEAT: { id: 'seat', label: 'seat' },
  COAT_OF_ARMS: { id: 'coat-of-arms', label: 'coat of arms' },
  REGION: { id: 'region', label: 'region' },
  WORDS: { id: 'words', label: 'words' },
  LORD_ASOIAF_START: { id: 'lord-asoiaf-start', label: 'lord (298 AC, start of ASoIaF)' }
};

const HOUSES = [
  {
    name: 'Stark',
    seat: 'Winterfell',
    coatOfArms: `${process.env.ASSETS_URL}/house-stark.png`,
    region: 'The North',
    words: 'Winter is Coming',
    "lord-asoiaf-start": "Eddard Stark"
  },
  {
    name: 'Lanister',
    seat: 'Casterly Rock',
    coatOfArms: `${process.env.ASSETS_URL}/house-lannister.png`,
    region: 'Westerlands',
    words: 'Hear Me Roar!',
    "lord-asoiaf-start": 'Tywin Lannister'
  },
  {
    name: 'Arryn',
    seat: 'The Eyrie',
    coatOfArms: `${process.env.ASSETS_URL}/house-arryn.png`,
    region: 'The Vale',
    words: 'As High as Honor',
    "lord-asoiaf-start": 'Robert Arryn'
  },
  {
    name: 'Tully',
    seat: 'Riverrun',
    coatOfArms: `${process.env.ASSETS_URL}/house-tully.png`,
    region: 'Riverlands',
    words: 'Family, Duty, Honor',
    "lord-asoiaf-start": 'Hoster Tully'
  },
  {
    name: 'Baratheon',
    seat: 'Storms\'s end',
    coatOfArms: `${process.env.ASSETS_URL}/house-baratheon.png`,
    region: 'Stormlands',
    words: 'Ours is the fury',
    "lord-asoiaf-start": 'Robert I Baratheon'
  }
];

const config = {
  1: {
    houses: HOUSES.map(({ name }) => name),
    fromTypes: Object.values(QUESTION_TYPE),
    toTypes: Object.values(QUESTION_TYPE),
    maxAlternatives: 3
  }
};

const fiz = toType => {
  switch (toType) {
    case 'name':
    case 'seat':
    case 'region':
    case 'words':
    case 'coat-of-arms':
      return 'What is the'
    case 'lord-asoiaf-start':
      return 'Who is the'
  }
}

const foo = (fromType, toType, el) => {
  switch (fromType.id) {
    case 'name':
    case 'seat':
    case 'region':
    case 'words':
    case 'lord-asoiaf-start':
      return {
        type: 'text',
        text: `${fiz(toType.id)} __${toType.label}__ of the house with the ${
          fromType.label
          } _${el[fromType.id]}_? `
      };
    case 'coat-of-arms':
      return {
        type: 'image',
        text: `What is the __${toType.label}__ of the house with the coat of arms pictured?`,
        src: el.coatOfArms
      };
  }
};

const bar = (toType, el) => {
  switch (toType.id) {
    case 'name':
    case 'seat':
    case 'region':
    case 'words':
    case 'lord-asoiaf-start':
      return { type: 'text', text: el[toType.id] };
    case 'coat-of-arms':
      return {
        type: 'image',
        src: el.coatOfArms
      };
  }
};

const questions = Object.entries(config).reduce(
  (acc, [level, { fromTypes, toTypes, houses, maxAlternatives }]) => ({
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
              houses
                .map(houseName => HOUSES.find(({ name }) => houseName === name))
                .map(el => ({
                  id: uuidv1(),
                  ...foo(fromType, toType, el),
                  alternatives:
                    [el]
                      .concat(
                        HOUSES.filter(({ name }) => name !== el.name).slice(
                          0,
                          maxAlternatives
                        )
                      )
                      .map((el) => ({ ...bar(toType, el), id: uuidv1() }))
                  ,
                  category: 'game-of-thrones'
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
