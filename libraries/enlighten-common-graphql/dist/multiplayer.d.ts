import type { Redis } from "ioredis";
import type { RedisPubSub } from "graphql-redis-subscriptions";
import type { GameMultiplayer } from "enlighten-common-types";
export declare const updateGame: (redisClient: Redis, pubSub: RedisPubSub, game: GameMultiplayer, mutation: "UPDATE" | "CREATE") => Promise<void>;
