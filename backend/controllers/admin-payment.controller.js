import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";

export const adminGetPayments = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
          plan: true,
          subscription: true,
        },
      }),
      prisma.payment.count(),
    ]);

    successResponse(res, "Payments fetched successfully", payments, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};
