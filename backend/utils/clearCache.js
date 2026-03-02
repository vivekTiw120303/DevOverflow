// backend/utils/clearCache.js
const redisClient = require('./redisClient');

/**
 * Deletes all Redis keys matching a specific pattern.
 * @param {string} pattern - The prefix to match (e.g., 'questions:*')
 */
const clearCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Cache cleared for pattern: ${pattern}`);
        }
    } catch (err) {
        console.error('Error clearing cache:', err);
    }
};

module.exports = clearCache;