const Redis = require("ioredis");
const dotenv = require("dotenv-flow");
const moment = require("moment");
const { RedisPubSub } = require("graphql-redis-subscriptions");
const { updateGame } = require("enlighten-common-graphql");

dotenv.config();

const publisher = new Redis(
  parseInt(process.env.REDIS_PORT_NUMBER, 10),
  process.env.REDIS_DOMAIN_NAME
);

const pubSub = new RedisPubSub({
  publisher,
});

const redisClient = new Redis(
  parseInt(process.env.REDIS_PORT_NUMBER, 10),
  process.env.REDIS_DOMAIN_NAME
);

async function* scanAll(pattern) {
  let cursor = "0";
  while (true) {
    const [newCursor, [...match]] = await redisClient.scan(
      cursor,
      "MATCH",
      pattern
    );
    yield match;

    if (newCursor === "0") {
      return;
    }
    cursor = newCursor;
  }
}

setInterval(async () => {
  for await (let keys of scanAll("multiplayer:games:*")) {
    if (!keys.length) {
      return;
    }
    const gameStrings = await redisClient.mget(...keys);
    gameStrings
      .filter((gS) => gS !== null)
      .map((gS) => JSON.parse(gS))
      .forEach((game) => {
        const playerIdsToUpdate = game.players
          .filter(({ hasLeft }) => !hasLeft)
          .filter((player) => moment().diff(player.timestamp, "seconds") > 10)
          .map(({ id }) => id);
        const key = `multiplayer:games:${game.id}`;

        if (playerIdsToUpdate.length) {
          game.players
            .filter(({ id }) => playerIdsToUpdate.includes(id))
            .forEach((player) => {
              player.hasLeft = true;
              redisClient.del(`multiplayer:player-game-id:${player.id}`);
              pubSub;
            });
          console.log("setting: ", key);
          updateGame(redisClient, pubSub, game, "UPDATE");
        }
      });
  }
}, 1000);
