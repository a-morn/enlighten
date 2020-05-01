"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_types_1 = require("./category-types");
function isGame(x) {
    return (category_types_1.isCategoryId(x.categoryId) &&
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
        typeof x.questions === "object");
}
exports.isGameSingleplayer = isGameSingleplayer;
