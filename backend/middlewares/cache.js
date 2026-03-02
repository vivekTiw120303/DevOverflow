// backend/middlewares/cache.js
const redisClient = require('../utils/redisClient');

const cache = (keyPrefix, ttlSeconds = 300) => {
    return async (req, res, next) => {
        // Create a unique key based on the route and query parameters (e.g., page number)
        const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;
        
        try {
            const cachedData = await redisClient.get(cacheKey);
            
            if (cachedData) {
                // Cache Hit: Return data immediately
                return res.status(200).json(JSON.parse(cachedData));
            }
            
            // Cache Miss: Override res.json to intercept the response before it goes to the user
            // We save the original res.json, then replace it with our own function
            const originalJson = res.json.bind(res);
            
            res.json = (body) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(body));
                }
                // Call the original res.json to actually send the data to the client
                originalJson(body);
            };
            
            next();
        } catch (err) {
            console.error('Redis Cache Error:', err);
            next(); // If Redis fails, gracefully fallback to the database
        }
    };
};

module.exports = cache;