const Redis = require('ioredis')

let client = null
let initialized = false

const getClient = () => {
    if (initialized) return client
    initialized = true

    if (!process.env.REDIS_URL){
        console.warn('REDIS_URL is not set - caching is disabled, all requests will hit the database directly.')
        return null
    }

    client = new Redis(process.env.REDIS_URL,{
        maxRetriesPerRequest: 2,
        retryStrategy: (times) => Math.min(times * 200, 2000),
        lazyConnect: false
    })

    client.on('error', (err) => {
        console.error('Redis error:', err.message)
    })

    client.on('connect', () => {
        console.log('Redis connected - caching enabled.')
    })

    return client
}

const getCache = async (key) => {
    const redis = getClient()
    if (!redis) return null

    try {
        const raw = await redis.get(key)
        return raw ? JSON.parse(raw) : null
    } catch (err) {
        console.error(`Cache read failed for key "${key}":`, err.message)
        return null
    }
}

const setCache = async (key, value, ttlSeconds) => {
    const redis = getClient()
    if (!redis) return

    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch (err) {
        console.error(`Cache write failed for key "${key}":`, err.message)
    }
}

const deleteCacheByPattern = async (pattern) => {
    const redis = getClient()
    if (!redis) return

    try {
        const stream = redis.scanStream({ match: pattern, count: 100 })
        const keysToDelete = []

        for await (const keys of stream) {
            keysToDelete.push(...keys)
        }

        if (keysToDelete.length > 0) {
            await redis.del(...keysToDelete)
        }
    } catch (err) {
        console.error(`Cache invalidation failed for pattern "${pattern}":`, err.message)
    }
}

module.exports = { getClient, getCache, setCache, deleteCacheByPattern}