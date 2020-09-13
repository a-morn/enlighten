/// <reference types="./types/mini-svg-data-uri" />
import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import { countries, Country, continents } from "countries-list";
import {
  Question,
  Alternative,
  QuestionEntityType,
  QuestionDirection,
} from "enlighten-common-types";
import lqip from "lqip";
import memoizee from "memoizee";
import { isDefined } from 'ts-is-present';
import { Level } from "enlighten-common-types";
import { isUndefined } from "util";

const COUNTRIES = Object.entries(countries).map(([key, value]) => ({
  ...value,
  flag: `/countries/country-flags/${key.toLocaleLowerCase()}.svg`,
}));

const isContinentAbbrevation = (key: string): key is keyof typeof continents  => {
  return Object.keys(continents).includes(key)
}

const levelByContinentAbbrevation = (abr: string, levels: Level[]) => {
  if (!isContinentAbbrevation(abr)) {
    throw new Error(`Continent abbrevation ${abr} not supported`)
  }
  const continent = continents[abr]
  switch (continent) {
    case 'Europe':
      return levels.find(({ name }) => name === 'Europe')
    case 'North America':
    case 'South America':
      return levels.find(({ name }) => name === 'The Americas')
    case 'Africa':
      return levels.find(({ name }) => name === 'Africa')
    case 'Asia':
    case 'Oceania':
    case 'Antarctica':
      return levels.find(({ name }) => name === 'Asia')
    default:
      throw new Error(`Continent ${continent} not supported`)
  }
}

interface ICountryWithFlag extends Country {
  flag: string
}  

const QUESTION_TYPE = {
  NAME: { id: "name", label: "name" },
  CAPITAL: { id: "capital", label: "capital" },
  FLAG: { id: "flag", label: "flag" },
} as const;

const config = {
  countries: COUNTRIES.map(({ name }) => name),
  fromTypes: Object.values(QUESTION_TYPE),
  toTypes: Object.values(QUESTION_TYPE),
  maxAlternatives: 3,
};

const dataUri = memoizee(async (path: string) => {
  const extension = path.split(".").pop();
  switch (extension) {
    case "png":
    case "jpeg":
    case "jpg": {
      return lqip(path);
    }
    case "svg": {
      return "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNc9R8AAlkBq1Ih+jkAAAAASUVORK5CYII=";
    }
    default:
      throw new Error(`Invalid extension for ${path}`);
  }
});

const getQuestion = async (
  fromType: QuestionEntityType<ICountryWithFlag> | QuestionEntityType<ICountryWithFlag>[],
  toType: QuestionEntityType<ICountryWithFlag>,
  el: ICountryWithFlag,
  answerIds: string[],
  alternatives: Alternative[],
  categoryId: string,
  levels: Level[]
): Promise<Question> => {
  if (Array.isArray(fromType)) {
    throw new Error(`Array fromType is not supported for this category`);
  }

  const level = levelByContinentAbbrevation(el.continent, levels)

  if (isUndefined(level)) {
    throw new Error('Level not found')
  }

  const base = {
    _id: uuid(),
    answerIds,
    hasMultipleCorrectAnswers: false,
    alternatives,
    categoryId,
    levelId: level._id,
    questionGroupName: el.name,
    types: [fromType.id, toType.id]
  }
  switch (fromType.id) {
    case "name":
    case "capital":
      return {
        ...base,
        type: "text",
        text: `What is the __${toType.label}__ of the country with the ${
          fromType.label
        } _${el[fromType.id]}_? `,
      };
    case "flag":
      return {
        ...base,
        type: "image",
        text: `What is the __${toType.label}__ of the country with the flag pictured?`,
        src: el[fromType.id],
        lqip: await dataUri(`../../assets/public${el[fromType.id]}`),
      };
      default:
        throw new Error(`Unhandled type ${fromType.id}`)
  }
};

const getAlternatives = async (
  toType: QuestionEntityType<ICountryWithFlag>,
  el: ICountryWithFlag
): Promise<Alternative> => {
  switch (toType.id) {
    case "name":
    case "capital":
      return { type: "text", text: el[toType.id], _id: uuid() };
    case "flag":
      return {
        type: "image",
        src: el[toType.id],
        lqip: await dataUri(`../../assets/public${el[toType.id]}`),
        _id: uuid(),
      };
    default:
      throw new Error('Unhandled type')
  }
};

export const getQuestions: (categoryId: string, levels: Level[]) => Promise<Question>[] = (categoryId: string, levels: Level[]) => config.fromTypes
  .reduce(
    (acc: QuestionDirection<ICountryWithFlag>[], fromType) =>
      acc.concat(
        config.toTypes
          .filter((toType) => toType !== fromType)
          .map((toType) => ({ fromType, toType }))
      ),
    []
  )
  .reduce(
    (acc, { fromType, toType }) =>
      acc.concat(
        config.countries
          .map((countryName) =>
            COUNTRIES.find(({ name }) => countryName === name)
          )
          .filter(isDefined)
          .map(async (el) => {
            const alternatives = await Promise.all(
              [el]
                .concat(
                  COUNTRIES
                    .filter(({ name, continent }) => name !== el.name && continent === el.continent)
                    .slice(
                      0,
                      config.maxAlternatives
                    )
                )
                .map(async (el) => await getAlternatives(toType, el))
            );
            const answerId = alternatives[0]._id;
            return await getQuestion(
              fromType,
              toType,
              el,
              [answerId],
              shuffle(alternatives),
              categoryId,
              levels
            );
          })
      ),
    [] as Promise<Question>[]
  );