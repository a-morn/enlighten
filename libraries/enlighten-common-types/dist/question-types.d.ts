export declare type QuestionEntityType<T> = {
    id: keyof T;
    label: string;
};
export declare type QuestionDirection<T> = {
    fromType: QuestionEntityType<T> | QuestionEntityType<T>[];
    toType: QuestionEntityType<T>;
};
export declare type QuestionType<T> = {
    [key: string]: QuestionEntityType<T>;
};
export declare type Question = {
    _id: string;
    alternatives: Alternative[];
    categoryId: string;
    text: string;
    types: string[];
    questionGroupName: string;
    hasMultipleCorrectAnswers: boolean;
    answerIds: string[];
    levelId?: string;
} & ({
    type: "text";
} | {
    type: "image";
    src: string;
    lqip: string;
} | {
    type: "tones";
    tones: string[];
});
export declare type GameQuestion = Question & {
    record: number;
    answered: boolean;
};
export declare type TextAlternative = {
    _id: string;
    type: "text";
    text: string;
};
export declare type ImageAlternative = {
    _id: string;
    type: "image";
    src: string;
    lqip: string;
};
export declare type Alternative = TextAlternative | ImageAlternative;
export declare type QuestionGroup = {
    levelId: string;
    name: string;
    questions: GameQuestion[];
    types: {
        type: string;
        score: number;
    }[];
};
