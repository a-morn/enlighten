"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameRequest = void 0;
function isGameRequest(x) {
    return (typeof x.id === 'string' &&
        typeof x.categoryId === 'string' &&
        typeof x.playerRequestId === 'string' &&
        typeof x.playerRequestName === 'string' &&
        typeof x.playerOfferedName === 'string' &&
        typeof x.playerOfferedId === 'string' &&
        ['boolean', 'object'].includes(typeof x.accepted) &&
        typeof x.created === 'string');
}
exports.isGameRequest = isGameRequest;
