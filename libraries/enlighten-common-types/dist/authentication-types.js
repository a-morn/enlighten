"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isUserToken(x) {
    return typeof x.playerId === 'string';
}
exports.isUserToken = isUserToken;
