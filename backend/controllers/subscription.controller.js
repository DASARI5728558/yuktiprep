import prisma from "../config/prisma.js";
import * as subscriptionService from "../services/subscription.service.js";
import * as paymentService from "../services/payment.service.js";
import { getRazorpay } from "../services/razorpay.service.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { subscriptionCreateSchema, subscriptionVerifySchema, subscriptionCancelSchema } from "../src/validators/plan.validator.js";
import crypto from "crypto";

export const createSubscription = async (req, res, next) => {
  try {
    const validated = subscriptionCreateSchema.parse(req.body);
    const userId = req.user?.id || req.admin?.id;
    console.log(userId)
    if (!userId) {
      return errorResponse(res, "Authentication required", [], 401);
    }
    console.log(validated.planId)
    const subscription = await subscriptionService.createSubscription(userId, validated.planId);
    console.log(subscription)
    successResponse(res, "Subscription created successfully", subscription, {}, 201);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    console.log(error)
    next(error);
  }
};

export const verifySubscription = async (req, res, next) => {
  try {
    const validated = subscriptionVerifySchema.parse(req.body);
    const userId = req.user?.id || req.admin?.id;

    if (!userId) {
      return errorResponse(res, "Authentication required", [], 401);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return errorResponse(res, "Payment verification failed", [], 400);
    }

    const body = `${validated.razorpayPaymentId}|${validated.razorpaySubscriptionId}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    console.log("expected",expectedSignature)
    console.log("validated",validated.razorpaySignature)
    if (validated.razorpaySignature !== expectedSignature) {
      return errorResponse(res, "Invalid payment signature", [], 400);
    }

    const subscription = await prisma.subscription.findFirst({
      where: { razorpaySubscriptionId: validated.razorpaySubscriptionId, userId },
      include: { plan: true },
    });

    if (!subscription) {
      return errorResponse(res, "Subscription not found", [], 404);
    }

    const payment = await paymentService.createPayment({
      userId,
      subscriptionId: subscription.id,
      planId: subscription.planId,
      razorpayPaymentId: validated.razorpayPaymentId,
      amount: subscription.plan.price,
      currency: subscription.plan.currency,
      status: "captured",
      rawResponse: validated,
    });

    const razorpaySubscription = await getRazorpay().subscriptions.fetch(validated.razorpaySubscriptionId);
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        status: "active",
        currentStart: razorpaySubscription.current_start ? new Date(razorpaySubscription.current_start * 1000) : new Date(),
        currentEnd: razorpaySubscription.current_end ? new Date(razorpaySubscription.current_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // fallback to 30 days
      },
    });

    successResponse(res, "Payment verified successfully", { subscription, payment });
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "Authentication required", [], 401);
    }

    const subscription = await subscriptionService.getMySubscription(userId);
    successResponse(res, "Subscription fetched successfully", subscription);
  } catch (error) {
    next(error);
  }
};

export const cancelMySubscription = async (req, res, next) => {
  try {
    const validated = subscriptionCancelSchema.parse(req.params);
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, "Authentication required", [], 401);
    }

    const subscription = await subscriptionService.cancelSubscription(userId, validated.subscriptionId);
    successResponse(res, "Subscription cancelled successfully", subscription);
  } catch (error) {
    if (error.name === "ZodError") {
      return errorResponse(res, "Validation failed", error.errors, 400);
    }
    next(error);
  }
};
