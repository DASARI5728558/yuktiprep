import pkg from "razorpay";
import prisma from "../config/prisma.js";
import { env } from "../src/config/env.js";
import * as subscriptionService from "../services/subscription.service.js";
import * as paymentService from "../services/payment.service.js";
import * as webhookService from "../services/webhook.service.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import crypto from "crypto";

const verifyWebhookSignature = (rawBody, signature, secret) => {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signature === expected;
};

export const razorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = JSON.stringify(req.body);
    const secret = env.RAZORPAY_WEBHOOK_SECRET;

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return errorResponse(res, "Invalid webhook signature", [], 400);
    }

    const event = req.body;
    const eventId = event.payload?.subscription?.entity?.id || event.payload?.payment?.entity?.id || event.event;
    const eventType = event.event;

    const existing = await webhookService.getWebhookEvent(String(eventId));
    if (existing) {
      if (existing.processed) {
        return successResponse(res, "Webhook already processed");
      }
    } else {
      await webhookService.recordWebhookEvent(String(eventId), eventType, req.body);
    }

    if (event.event === "subscription.activated" || event.event === "subscription.cancelled") {
      const subscriptionEntity = event.payload.subscription.entity;
      const subscription = await subscriptionService.updateSubscriptionFromWebhook(subscriptionEntity.id, subscriptionEntity);
      if (subscription) {
        await webhookService.markWebhookProcessed(String(eventId));
      }
    } else if (event.event === "subscription.charged") {
      const subscriptionEntity = event.payload.subscription.entity;
      const subscription = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: subscriptionEntity.id },
      });

      if (subscription) {
        const paymentEntity = event.payload.payment.entity;
        await paymentService.createPayment({
          userId: subscription.userId,
          subscriptionId: subscription.id,
          planId: subscription.planId,
          razorpayPaymentId: paymentEntity.id,
          amount: paymentEntity.amount,
          currency: paymentEntity.currency,
          status: paymentEntity.status,
          method: paymentEntity.method,
          rawResponse: paymentEntity,
        });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: subscriptionEntity.status,
            currentStart: new Date(subscriptionEntity.start_at * 1000),
            currentEnd: new Date(subscriptionEntity.end_at * 1000),
          },
        });

        await webhookService.markWebhookProcessed(String(eventId));
      }
    } else if (event.event === "payment.failed") {
      const paymentEntity = event.payload.payment.entity;
      const existingPayment = await prisma.payment.findUnique({
        where: { razorpayPaymentId: paymentEntity.id },
      });

      if (existingPayment) {
        await paymentService.updatePaymentStatus(paymentEntity.id, paymentEntity.status, paymentEntity.method, paymentEntity);
        await webhookService.markWebhookProcessed(String(eventId));
      }
    } else {
      await webhookService.markWebhookProcessed(String(eventId));
    }

    successResponse(res, "Webhook processed successfully");
  } catch (error) {
    console.error("Webhook processing error:", error);
    next(error);
  }
};
