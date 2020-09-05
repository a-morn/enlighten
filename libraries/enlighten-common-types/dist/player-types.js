"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlayerLobby = exports.isPlayerGameId = exports.isPlayerMultiplayer = void 0;
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
        typeof x.categoryId === 'string' &&
        typeof x.timestamp === "string");
}
exports.isPlayerLobby = isPlayerLobby;
