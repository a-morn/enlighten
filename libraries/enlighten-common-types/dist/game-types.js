"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameSingleplayer = exports.isGameMultiplayer = exports.isGame = void 0;
function isGame(x) {
    return (typeof x.categoryId === 'string' &&
        typeof x.categoryBackground === "string");
}
exports.isGame = isGame;
function isGameMultiplayer(x) {
    return (isGame(x) &&
        Array.isArray(x.questions) &&
        typeof x.questionIndex === "number" &&
        typeof x.id === "string");
    // todo add players
}
exports.isGameMultiplayer = isGameMultiplayer;
function isGameSingleplayer(x) {
    return (isGame(x) &&
        typeof x.playerId === "string" &&
        typeof x.questionGroups === "object");
}
exports.isGameSingleplayer = isGameSingleplayer;
