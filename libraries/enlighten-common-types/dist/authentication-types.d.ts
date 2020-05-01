export declare type UserToken = {
    playerId: string;
    isTempUser: boolean;
    email?: string;
};
export declare function isUserToken(x: unknown): x is UserToken;
