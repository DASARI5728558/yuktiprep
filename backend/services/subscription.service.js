import prisma from "../config/prisma.js";
import {
  createRazorpaySubscription,
  fetchRazorpaySubscription,
  cancelRazorpaySubscription,
  getRazorpay,
} from "./razorpay.service.js";
import { createRazorpayPlan } from "./razorpay.service.js";
export const createSubscription = async (userId, planId) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) {
    throw new Error("Invalid or inactive plan");
  }

  if (!plan.razorpayPlanId) {
    const razorpayPlan = await createRazorpayPlan({
      period: plan.billingInterval === "yearly" ? "yearly" : "monthly",
      interval: 1,
      item: {
        name: plan.name,
        amount: plan.price * 100,
        currency: plan.currency || "INR",
      },
    });

    await prisma.plan.update({
      where: { id: planId },
      data: { razorpayPlanId: razorpayPlan.id },
    });

    plan.razorpayPlanId = razorpayPlan.id;
  }

  let razorpaySubscription;
  try {
    razorpaySubscription = await createRazorpaySubscription({
      plan_id: plan.razorpayPlanId,
      customer_notify: 1,
      total_count: plan.billingInterval === "yearly" ? 1 : 12,
    });
  } catch (error) {
    if (error.statusCode === 400 && error.error?.code === "BAD_REQUEST_ERROR") {
      const razorpayPlan = await createRazorpayPlan({
        period: plan.billingInterval === "yearly" ? "yearly" : "monthly",
        interval: 1,
        item: {
          name: plan.name,
          amount: plan.price * 100,
          currency: plan.currency || "INR",
        },
      });

      await prisma.plan.update({
        where: { id: planId },
        data: { razorpayPlanId: razorpayPlan.id },
      });

      plan.razorpayPlanId = razorpayPlan.id;

      razorpaySubscription = await createRazorpaySubscription({
        plan_id: plan.razorpayPlanId,
        customer_notify: 1,
        total_count: plan.billingInterval === "yearly" ? 1 : 12,
      });
    } else {
      throw error;
    }
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayCustomerId: razorpaySubscription.customer_id,
      status: razorpaySubscription.status,
      currentStart: razorpaySubscription.current_start
        ? new Date(razorpaySubscription.current_start * 1000)
        : razorpaySubscription.start_at
          ? new Date(razorpaySubscription.start_at * 1000)
          : null,
      currentEnd: razorpaySubscription.current_end
        ? new Date(razorpaySubscription.current_end * 1000)
        : razorpaySubscription.end_at
          ? new Date(razorpaySubscription.end_at * 1000)
          : null,
    },
    include: {
      plan: true,
    },
  });

  return subscription;
};

export const getMySubscription = async (userId) => {
  return prisma.subscription.findFirst({
    where: { userId, status: { not: "cancelled" } },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
};

export const cancelSubscription = async (userId, subscriptionId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const razorpaySubscription = await cancelRazorpaySubscription(
    subscription.razorpaySubscriptionId,
    {
      cancel_at_cycle_end: 1,
    },
  );

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      cancelAtCycleEnd: true,
      status: razorpaySubscription.status,
      currentEnd: razorpaySubscription.end_at
        ? new Date(razorpaySubscription.end_at * 1000)
        : undefined,
    },
    include: { plan: true },
  });

  return updated;
};

export const updateSubscriptionFromWebhook = async (
  razorpaySubscriptionId,
  data,
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { razorpaySubscriptionId },
  });

  if (!subscription) {
    return null;
  }

  const updateData = {
    status: data.status || subscription.status,
    currentStart: data.current_start
      ? new Date(data.current_start * 1000)
      : subscription.currentStart,
    currentEnd: data.current_end
      ? new Date(data.current_end * 1000)
      : subscription.currentEnd,
    cancelAtCycleEnd: data.cancel_at_cycle_end ?? subscription.cancelAtCycleEnd,
  };

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: updateData,
    include: { plan: true },
  });
};
