import prisma from "../config/prisma.js";

/**
 * Get notifications for the logged-in user (newest first)
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.communityNotification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.communityNotification.count({ where: { userId } }),
    ]);

    const formatted = notifications.map((n) => ({
      id: n.id,
      postId: n.postId,
      commentId: n.commentId,
      actorName: n.actorName,
      postTitle: n.postTitle,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const count = await prisma.communityNotification.count({
      where: { userId, isRead: false },
    });

    return res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.communityNotification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await prisma.communityNotification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all notifications as read for the logged-in user
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.communityNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
}
