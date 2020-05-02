import type { Redis } from "ioredis";
import type { RedisPubSub } from "graphql-redis-subscriptions";
import type { GameMultiplayer } from "enlighten-common-types";
import { filterGame } from "enlighten-common-utils";
import { GAME_MULTIPLAYER } from "./triggers";

export const updateGame = async (
  redisClient: Redis,
  pubSub: RedisPubSub,
  game: GameMultiplayer,
  mutation: "UPDATE" | "CREATE"
): Promise<void> => {
  const gameString = JSON.stringify(game);
  const setMode = mutation === "CREATE" ? "NX" : "XX";
  const key = `multiplayer:games:${game.id}`;
  await redisClient.set(key, gameString, setMode);
  await redisClient.expire(key, 300);
  pubSub.publish(GAME_MULTIPLAYER, {
    gameMultiplayerSubscription: {
      gameMultiplayer: filterGame(game),
      mutation,
    },
  });
};
