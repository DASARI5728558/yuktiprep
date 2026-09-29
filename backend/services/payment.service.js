import prisma from "../config/prisma.js";

export const createPayment = async (data) => {
  return prisma.payment.create({ data });
};

export const updatePaymentStatus = async (razorpayPaymentId, status, method, rawResponse) => {
  return prisma.payment.update({
    where: { razorpayPaymentId },
    data: { status, method, rawResponse },
  });
};

export const getPaymentById = async (id) => {
  return prisma.payment.findUnique({
    where: { id },
    include: { plan: true, user: true, subscription: true },
  });
};
