"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_types_1 = require("./category-types");
function isPlayer(x) {
    return (typeof x.id === "string" &&
        typeof x.name === "string");
}
function isPlayerMultiplayer(x) {
    return (isPlayer(x) &&
        typeof x.hasLeft === "boolean" &&
        typeof x.score === "number" &&
        typeof x.won === "boolean" &&
        typeof x.name === "string" &&
        typeof x.timestamp === "object");
}
exports.isPlayerMultiplayer = isPlayerMultiplayer;
function isPlayerGameId(x) {
    return typeof x.gameId === "string";
}
exports.isPlayerGameId = isPlayerGameId;
function isPlayerLobby(x) {
    return (isPlayer(x) &&
        category_types_1.isCategoryId(x.categoryId) &&
        typeof x.timestamp === "string");
}
exports.isPlayerLobby = isPlayerLobby;
