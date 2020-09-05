"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserToken = void 0;
function isUserToken(x) {
    return typeof x.playerId === 'string';
}
exports.isUserToken = isUserToken;
