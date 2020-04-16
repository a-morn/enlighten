import { Redis } from 'ioredis'
import { isString } from 'util';

export async function getAllByPattern(redisClient: Redis, pattern: string): Promise<string[]> {
    let cursor = '0';
    const result: string[] = []
    do {
        const [newCursor, [...match]] = await redisClient.scan(cursor, 'MATCH', pattern);
        match.forEach(m => result.push(m))
        cursor = newCursor
    } while (cursor !== '0')
    return result.length
        ? redisClient.mget(...result)
            .then(values => values
                .filter(isString))
        : Promise.resolve([])
}