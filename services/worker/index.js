const Redis = require('ioredis');
const promisify = require('util').promisify;
const dotenv = require('dotenv-flow')
const moment = require('moment')

dotenv.config();

const redisClient = new Redis(
	parseInt(process.env.REDIS_PORT_NUMBER, 10),
	process.env.REDIS_DOMAIN_NAME,
)

async function* scanAll(pattern) {
	let cursor = '0';
	while (true) {
		const [newCursor, [...match]] = await redisClient.scan(cursor, 'MATCH', pattern);
		yield match

		if (newCursor === '0') {
			return
		}
		cursor = newCursor
	}
}

setInterval(async () => {
	for await (let keys of scanAll('multiplayer:games:*')) {
		if (!keys.length) {
			return
		}
		const gameStrings = await redisClient.mget(...keys)
		gameStrings
			.filter(gS => gS !== null)
			.map(gS => JSON.parse(gS))
			.forEach(game => {
				let shouldSave
				game
					.players
					.forEach(player => {
						const diff = moment().diff(player.timestamp, 'seconds');
						if (diff > 5) {
							player.hasLeft = true
							shouldSave = true
						}
					})
				if (shouldSave) {
					const key = `multiplayer:games:${game.id}`
					console.log('setting: ', key)
					redisClient.set(key, JSON.stringify(game))
				}
			})
	}
}, 1000)

setInterval(async () => {
	for await (let keys of scanAll('lobby:players:*')) {
		if (!keys.length) {
			return
		}
		const playerStrings = await redisClient.mget(...keys)
		playerStrings
			.filter(pS => pS !== null)
			.map(pS => JSON.parse(pS))
			.forEach(async ({ timestamp, id }) => {
				const diff = moment().diff(timestamp, 'seconds');
				if (diff > 5) {
					const key = `lobby:players:${id}`
					console.log('deleting: ', key)
					await redisClient.del(key)
				}
			})
	}
}, 1000)