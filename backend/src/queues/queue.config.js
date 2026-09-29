import Redis from "ioredis";

// BullMQ requires maxRetriesPerRequest: null
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const connectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Reusable connection for queues and workers
export const queueConnection = new Redis(redisUrl, connectionOptions);

queueConnection.on('error', (err) => {
  console.error('BullMQ Redis Connection Error:', err.message);
});
