import { v4 as uuid } from "uuid";
import shuffle from "shuffle-array";
import {
  Question,
  QuestionType,
  QuestionEntityType,
  QuestionDirection,
  Alternative,
  Level,
} from "enlighten-common-types";
import lqip from "lqip";

type GoTHouse = {
  name: string;
  seat: string;
  "coat-of-arms": string;
  region: string;
  words: string;
  "lord-asoiaf-start": string;
};

const QUESTION_TYPE: QuestionType<GoTHouse> = {
  NAME: { id: "name", label: "name" },
  SEAT: { id: "seat", label: "seat" },
  COAT_OF_ARMS: { id: "coat-of-arms", label: "coat of arms" },
  REGION: { id: "region", label: "region" },
  WORDS: { id: "words", label: "words" },
  LORD_ASOIAF_START: {
    id: "lord-asoiaf-start",
    label: "lord (298 AC, start of ASoIaF)",
  },
};

const HOUSES: GoTHouse[] = [
  {
    name: "Stark",
    seat: "Winterfell",
    "coat-of-arms": `/game-of-thrones/coat-of-arms/house-stark.png`,
    region: "The North",
    words: "Winter is Coming",
    "lord-asoiaf-start": "Eddard Stark",
  },
  {
    name: "Lanister",
    seat: "Casterly Rock",
    "coat-of-arms": `/game-of-thrones/coat-of-arms/house-lannister.png`,
    region: "Westerlands",
    words: "Hear Me Roar!",
    "lord-asoiaf-start": "Tywin Lannister",
  },
  {
    name: "Arryn",
    seat: "The Eyrie",
    "coat-of-arms": `/game-of-thrones/coat-of-arms/house-arryn.png`,
    region: "The Vale",
    words: "As High as Honor",
    "lord-asoiaf-start": "Robert Arryn",
  },
  {
    name: "Tully",
    seat: "Riverrun",
    "coat-of-arms": `/game-of-thrones/coat-of-arms/house-tully.png`,
    region: "Riverlands",
    words: "Family, Duty, Honor",
    "lord-asoiaf-start": "Hoster Tully",
  },
  {
    name: "Baratheon",
    seat: "Storms's end",
    "coat-of-arms": `/game-of-thrones/coat-of-arms/house-baratheon.png`,
    region: "Stormlands",
    words: "Ours is the fury",
    "lord-asoiaf-start": "Robert I Baratheon",
  },
];

const config = {
  houses: HOUSES.map(({ name }) => name),
  fromTypes: Object.values(QUESTION_TYPE),
  toTypes: Object.values(QUESTION_TYPE),
  maxAlternatives: 3,
};

const fiz = (toTypeId: string) => {
  switch (toTypeId) {
    case "name":
    case "seat":
    case "region":
    case "words":
    case "coat-of-arms":
      return "What is the";
    case "lord-asoiaf-start":
      return "Who is the";
  }
};

const getQuestion = async (
  fromType: QuestionEntityType<GoTHouse> | QuestionEntityType<GoTHouse>[],
  toType: QuestionEntityType<GoTHouse>,
  el: GoTHouse,
  answerId: string,
  alternatives: Alternative[],
  categoryId: string,
): Promise<Question> => {
  if (Array.isArray(fromType)) {
    throw new Error("No handling for array fromType for got");
  }

  const base = {
    _id: uuid(),
    alternatives,
    categoryId,
    answerId,
    types: [fromType.id, toType.id],
    questionGroupName: el.name
  }

  switch (fromType.id) {
    case "name":
    case "seat":
    case "region":
    case "words":
    case "lord-asoiaf-start":
      return {
        ...base,
        type: "text",
        text: `${fiz(toType.id)} __${toType.label}__ of the house with the ${
          fromType.label
        } _${el[fromType.id]}_? `,
      };
    case "coat-of-arms":
      return {
        ...base,
        type: "image",
        text: `What is the __${toType.label}__ of the house with the coat of arms pictured?`,
        src: el[fromType.id],
        lqip: await lqip.base64(`../../assets/public${el[fromType.id]}`),
      };
  }
};

const getAlternative = async (
  toType: QuestionEntityType<GoTHouse>,
  el: GoTHouse
): Promise<Alternative> => {
  switch (toType.id) {
    case "name":
    case "seat":
    case "region":
    case "words":
    case "lord-asoiaf-start":
      return {
        type: "text",
        text: el[toType.id],
        _id: uuid(),
      };
    case "coat-of-arms":
      return {
        type: "image",
        src: el["coat-of-arms"],
        _id: uuid(),
        lqip: await lqip.base64(`../../assets/public${el["coat-of-arms"]}`),
      };
  }
};

export const getQuestions: (categoryId: string, levels?: Level[]) => Promise<Question>[] = (categoryId: string, levels?: Level[]) => config.fromTypes
  .reduce(
    (acc: QuestionDirection<GoTHouse>[], fromType) =>
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
        config.houses
          .map((houseName) => HOUSES.find(({ name }) => houseName === name))
          .filter(function (x: GoTHouse | undefined): x is GoTHouse {
            return x !== undefined;
          })
          .map(async (el) => {
            const alternatives = await Promise.all(
              [el]
                .concat(
                  HOUSES.filter(({ name }) => name !== el.name).slice(
                    0,
                    config.maxAlternatives
                  )
                )
                .map(async (el) => await getAlternative(toType, el))
            );
            const answerId = alternatives[0]._id;
            return await getQuestion(fromType, toType, el, answerId, shuffle(alternatives), categoryId)
          })
      ),
    [] as Promise<Question>[]
  );
