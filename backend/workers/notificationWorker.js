const { Worker } = require('bullmq');

const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
};

// Initialize the Worker to listen to 'notificationQueue'
const notificationWorker = new Worker('notificationQueue', async (job) => {
    console.log(`[Worker] Starting job ${job.id} of type: ${job.name}`);

    if (job.name === 'sendNewAnswerNotification') {
        const { questionId, answerContent, userId } = job.data;
        
        // SIMULATE A HEAVY OPERATION (e.g., querying DB for subscribers, connecting to SendGrid/AWS SES)
        await new Promise((resolve) => setTimeout(resolve, 3000)); 
        
        console.log(`[Worker] Successfully processed email notifications for Question: ${questionId}`);
    }
}, { connection });

// Optional: Event listeners for observability
notificationWorker.on('completed', job => {
    console.log(`[Worker] Job ${job.id} has completed!`);
});

notificationWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job.id} has failed with error ${err.message}`);
});

module.exports = notificationWorker;