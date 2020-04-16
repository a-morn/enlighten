import { categoriesQueryResolver } from './category'
import { singleplayerQueryResolvers, singleplayerMutationResolvers, singleplayerSubscriptionResolvers } from './singleplayer'
import { lobbyQueryResolvers, lobbyMutationResolvers, lobbySubscriptionResolvers } from './lobby'
import { multiplayerQueryResolvers, multiplayerMutationResolvers, multiplayerSubscriptionResolvers } from './multiplayer'

import { RedisPubSub } from 'graphql-redis-subscriptions';
import { isUndefined } from 'util';
import Redis from 'ioredis'

if (isUndefined(process.env.REDIS_PORT_NUMBER)) {
    throw new Error()
}

const options = {
    retryStrategy: (times: number) => {
        // reconnect after
        return Math.min(times * 50, 2000);
    }
};

const redisClient = new Redis(
    parseInt(process.env.REDIS_PORT_NUMBER, 10),
    process.env.REDIS_DOMAIN_NAME,
    options
)
const publisher = new Redis(
    parseInt(process.env.REDIS_PORT_NUMBER, 10),
    process.env.REDIS_DOMAIN_NAME,
    options
)

const subscriber = new Redis(
    parseInt(process.env.REDIS_PORT_NUMBER, 10),
    process.env.REDIS_DOMAIN_NAME,
    options
)

const pubSub = new RedisPubSub({
    publisher,
    subscriber
})

export default {
    Query: {
        ...categoriesQueryResolver(),
        ...singleplayerQueryResolvers(redisClient),
        ...lobbyQueryResolvers(redisClient),
        ...multiplayerQueryResolvers(redisClient)
    },
    Mutation: {
        ...singleplayerMutationResolvers(redisClient, pubSub),
        ...lobbyMutationResolvers(redisClient, pubSub),
        ...multiplayerMutationResolvers(redisClient, pubSub)
    },
    Subscription: {
        ...singleplayerSubscriptionResolvers(pubSub),
        ...lobbySubscriptionResolvers(pubSub),
        ...multiplayerSubscriptionResolvers(pubSub),
    }
}