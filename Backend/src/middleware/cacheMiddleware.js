const { getCache, setCache } = require('../config/redis')

const cacheMiddleware = (keyBuilder, ttlSeconds = 60) => {
    return async (req, res, next) => {
        const key = keyBuilder(req)

        const cached = await getCache(key)
        if (cached) {
            res.set('X-cache', 'HIT')
            return res.json(cached)
        }

        const originalJson = res.json.bind(res)
        res.json = (body) => {
            res.set('X-Cache', 'MISS')
            setCache(key, body, ttlSeconds)
            return originalJson(body)
        },
            next()
    }
}

module.exports = cacheMiddleware