/// <reference types="./types/mini-svg-data-uri" />
import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import { countries } from "countries-list";
import {
  Question,
  Alternative,
  QuestionEntityType,
  QuestionDirection,
} from "enlighten-common-types";
import lqip from "lqip";
import svgToMiniDataURI from "mini-svg-data-uri";
import { promises } from "fs";
import memoizee from "memoizee";

const COUNTRIES = Object.entries(countries).map(([key, value]) => ({
  ...value,
  flag: `/countries/country-flags/${key.toLocaleLowerCase()}.svg`,
}));

type Country = {
  name: string;
  capital: string;
  flag: string;
};

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
      //const content = await promises.readFile(path, "utf8");
      //return svgToMiniDataURI(content);
      return "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNc9R8AAlkBq1Ih+jkAAAAASUVORK5CYII=";
    }
    default:
      throw new Error(`Invalid extension for ${path}`);
  }
});

const getQuestionProperties = async (
  fromType: QuestionEntityType<Country> | QuestionEntityType<Country>[],
  toType: QuestionEntityType<Country>,
  el: Country
) => {
  if (Array.isArray(fromType)) {
    throw new Error(`Array fromType is not supported for this category`);
  }
  switch (fromType.id) {
    case "name":
    case "capital":
      return {
        type: "text",
        text: `What is the __${toType.label}__ of the country with the ${
          fromType.label
        } _${el[fromType.id]}_? `,
      } as const;
    case "flag":
      return {
        type: "image",
        text: `What is the __${toType.label}__ of the country with the flag pictured?`,
        src: el[fromType.id],
        lqip: await dataUri(`../../assets/public${el[fromType.id]}`),
      } as const;
  }
};

const getAlternatives = async (
  toType: QuestionEntityType<Country>,
  el: Country
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
  }
};

const questions: Promise<Question>[] = config.fromTypes
  .reduce(
    (acc: QuestionDirection<Country>[], fromType) =>
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
          .map((el) => el as Country | undefined)
          .filter(function (x: Country | undefined): x is Country {
            return x !== undefined;
          })
          .map(async (el) => {
            const alternatives = await Promise.all(
              [el]
                .concat(
                  COUNTRIES.filter(({ name }) => name !== el.name).slice(
                    0,
                    config.maxAlternatives
                  )
                )
                .map(async (el) => await getAlternatives(toType, el))
            );
            const answerId = alternatives[0]._id;
            return {
              _id: uuid(),
              ...(await getQuestionProperties(fromType, toType, el)),
              answerId,
              alternatives: shuffle(alternatives),
              category: "countries",
            };
          })
      ),
    [] as Promise<Question>[]
  );

export default questions;
