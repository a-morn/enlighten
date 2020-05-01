import { UserToken } from './authentication-types';
export declare type MutationResponse = {
    code: number;
    success: boolean;
    message: string;
};
export declare type Context = {
    currentUser: UserToken;
};
export declare type AnswerQuestionInput = {
    answer: {
        questionId: string;
        answerId: string;
    };
};
