"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_types_1 = require("./category-types");
function isGameRequest(x) {
    return (typeof x.id === 'string' &&
        category_types_1.isCategoryId(x.categoryId) &&
        typeof x.playerRequestId === 'string' &&
        typeof x.playerRequestName === 'string' &&
        typeof x.playerOfferedName === 'string' &&
        typeof x.playerOfferedId === 'string' &&
        ['boolean', 'object'].includes(typeof x.accepted) &&
        typeof x.created === 'string');
}
exports.isGameRequest = isGameRequest;
