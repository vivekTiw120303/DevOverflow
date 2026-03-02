const { Queue } = require('bullmq');

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
};

// Instantiate the Queue
const notificationQueue = new Queue('notificationQueue', { connection });

module.exports = notificationQueue;