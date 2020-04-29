import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import { countries } from "countries-list";
import {
  Question,
  Alternative,
  QuestionEntityType,
  QuestionDirection,
} from "enlighten-common-types";

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
};

const config = {
  countries: COUNTRIES.map(({ name }) => name),
  fromTypes: Object.values(QUESTION_TYPE),
  toTypes: Object.values(QUESTION_TYPE),
  maxAlternatives: 3,
};

const getQuestionProperties = (
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
      };
    case "flag":
      return {
        type: "image",
        text: `What is the __${toType.label}__ of the country with the flag pictured?`,
        src: el[fromType.id],
      };
  }
};

const bar = (toType: QuestionEntityType<Country>, el: Country) => {
  switch (toType.id) {
    case "name":
    case "capital":
      return { type: "text", text: el[toType.id] };
    case "flag":
      return {
        type: "image",
        src: el[toType.id],
      };
  }
};

const questions: Question[] = config.fromTypes
  .reduce(
    (acc: QuestionDirection<Country>[], fromType) =>
      acc.concat(
        config.toTypes
          .filter((toType) => toType !== fromType)
          .map((toType) => ({ fromType, toType } as QuestionDirection<Country>))
      ),
    []
  )
  .reduce(
    (acc: Question[], { fromType, toType }) =>
      acc.concat(
        config.countries
          .map((countryName) =>
            COUNTRIES.find(({ name }) => countryName === name)
          )
          .map((el) => el as Country | undefined)
          .filter(function (x: Country | undefined): x is Country {
            return x !== undefined;
          })
          .map(
            (el) =>
              ({
                _id: uuid(),
                ...getQuestionProperties(fromType, toType, el),
                alternatives: [el]
                  .concat(
                    COUNTRIES.filter(({ name }) => name !== el.name).slice(
                      0,
                      config.maxAlternatives
                    )
                  )
                  .map((el) => ({
                    ...bar(toType, el),
                    _id: uuid(),
                  })) as Alternative[],
                category: "countries",
              } as Question)
          )
          .map(
            ({ alternatives, ...question }: Question) =>
              ({
                answerId: alternatives[0]._id,
                alternatives: shuffle(alternatives),
                ...question,
              } as Question)
          )
      ),
    []
  );

export default questions;
