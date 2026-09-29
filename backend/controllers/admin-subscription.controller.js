import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { getPagination, buildPaginationMeta } from "../src/utils/pagination.js";

export const adminGetSubscriptions = async (req, res, next) => {
  try {
    const { page, limit, skip, sort, order } = getPagination(req.query);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          user: { select: { id: true, name: true, email: true, phoneNumber: true } },
          plan: true,
        },
      }),
      prisma.subscription.count(),
    ]);

    successResponse(res, "Subscriptions fetched successfully", subscriptions, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
};
