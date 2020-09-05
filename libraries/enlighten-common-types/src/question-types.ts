export type QuestionEntityType<T> = {
  id: keyof T;
  label: string;
};

export type QuestionDirection<T> = {
  fromType: QuestionEntityType<T> | QuestionEntityType<T>[];
  toType: QuestionEntityType<T>;
};

export type QuestionType<T> = {
  [key: string]: QuestionEntityType<T>;
};

export type Question = {
  _id: string;
  alternatives: Alternative[];
  categoryId: string;
  answerId: string;
  text: string;
  types: string[];
  questionGroupName: string;
  levelId?: string;
} & (
  | {
      type: "text";
    }
  | {
      type: "image";
      src: string;
      lqip: string;
    }
  | {
      type: "tones";
      tones: string[];
    }
);

export type GameQuestion = Question & {
  record: number;
  answered: boolean;
};

export type TextAlternative = {
  _id: string;
  type: "text";
  text: string;
}

export type ImageAlternative = {
  _id: string;
  type: "image";
  src: string;
  lqip: string;
}

export type Alternative =
  TextAlternative |
  ImageAlternative

export type QuestionGroup = {
  levelId: string
  name: string
  questions: GameQuestion[]
  types: { type: string, score: number }[]
}