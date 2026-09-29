import prisma from "../config/prisma.js";

export const recordWebhookEvent = async (razorpayEventId, eventType, payload) => {
  return prisma.webhookEvent.upsert({
    where: { razorpayEventId },
    update: {},
    create: {
      razorpayEventId,
      eventType,
      payload,
      processed: false,
    },
  });
};

export const markWebhookProcessed = async (razorpayEventId) => {
  return prisma.webhookEvent.update({
    where: { razorpayEventId },
    data: { processed: true, processedAt: new Date() },
  });
};

export const getWebhookEvent = async (razorpayEventId) => {
  return prisma.webhookEvent.findUnique({ where: { razorpayEventId } });
};
