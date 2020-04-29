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
    category: string;
    answerId: string;
    text: string;
} & ({
    type: "text";
} | {
    type: "image";
    src: string;
} | {
    type: "tones";
    tones: string[];
});
export declare type GameQuestion = Question & {
    record: number;
    answered: boolean;
};
export declare type Alternative = {
    _id: string;
} & ({
    type: "image";
    src: string;
} | {
    type: "text";
    text: string;
});
