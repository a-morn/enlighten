"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const enlighten_common_utils_1 = require("enlighten-common-utils");
const triggers_1 = require("./triggers");
exports.updateGame = (redisClient, pubSub, game, mutation) => __awaiter(void 0, void 0, void 0, function* () {
    const gameString = JSON.stringify(game);
    const setMode = mutation === "CREATE" ? "NX" : "XX";
    const key = `multiplayer:games:${game.id}`;
    yield redisClient.set(key, gameString, setMode);
    yield redisClient.expire(key, 300);
    pubSub.publish(triggers_1.GAME_MULTIPLAYER, {
        gameMultiplayerSubscription: {
            gameMultiplayer: enlighten_common_utils_1.filterGame(game),
            mutation,
        },
    });
});
