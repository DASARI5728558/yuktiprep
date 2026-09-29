import express from "express";
import {
  userAuthMiddleware,
  optionalUserAuthMiddleware,
} from "../src/middleware/userAuth.middleware.js";
import {
  getCommunityPosts,
  getCommunityPostDetails,
  createCommunityPost,
  deleteCommunityPost,
  toggleLikePost,
  addCommunityComment,
} from "../controllers/community.controller.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Posts routes
router.get("/posts", optionalUserAuthMiddleware, getCommunityPosts);
router.post("/posts", optionalUserAuthMiddleware, createCommunityPost);
router.get("/posts/:id", optionalUserAuthMiddleware, getCommunityPostDetails);
router.delete("/posts/:id", userAuthMiddleware, deleteCommunityPost);

// Interaction routes
router.post("/posts/:id/like", optionalUserAuthMiddleware, toggleLikePost);
router.post(
  "/posts/:id/comments",
  optionalUserAuthMiddleware,
  addCommunityComment,
);

// Notification routes
router.get("/notifications", userAuthMiddleware, getNotifications);
router.get("/notifications/unread-count", userAuthMiddleware, getUnreadCount);
router.patch("/notifications/read-all", userAuthMiddleware, markAllAsRead);
router.patch("/notifications/:id/read", userAuthMiddleware, markAsRead);

export default router;
