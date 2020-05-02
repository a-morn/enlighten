"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = __importDefault(require("ramda"));
const enlighten_common_types_1 = require("enlighten-common-types");
function censorAnswerIfNotAnswered(game) {
    if (!ramda_1.default.pathEq(["currentQuestion", "answered"], true)(game)) {
        const censoredGame = Object.assign(Object.assign({}, game), { currentQuestion: game.currentQuestion
                ? ramda_1.default.pickBy((_, k) => k !== "answerId", game.currentQuestion)
                : null });
        return censoredGame;
    }
    else {
        return game;
    }
}
function filterGame(game) {
    if (game === null) {
        return null;
    }
    else if (enlighten_common_types_1.isGameMultiplayer(game)) {
        game.questions = [];
    }
    return censorAnswerIfNotAnswered(game);
}
exports.filterGame = filterGame;
