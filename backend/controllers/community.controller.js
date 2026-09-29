import prisma from "../config/prisma.js";
import { emitCommunityEvent } from "../src/socket.js";

/**
 * Helper to calculate human readable relative time (e.g. "Just now", "5m ago", "2d ago")
 */
function getRelativeTime(date) {
  const now = new Date();
  const diffSec = Math.floor((now - new Date(date)) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get community posts list with filtering (trending, latest, my-posts, topic)
 */
export async function getCommunityPosts(req, res, next) {
  try {
    const { tab = "trending", topic, search } = req.query;
    const userId = req.user?.id || null;

    const where = {};
    if (topic && topic !== "All") {
      where.topic = topic;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tab === "my-posts" && userId) {
      where.userId = userId;
    }

    let orderBy = { createdAt: "desc" };
    if (tab === "trending") {
      // Order by likes + comments
      orderBy = [{ likesCount: "desc" }, { createdAt: "desc" }];
    } else {
      orderBy = { createdAt: "desc" };
    }

    // Auto-seed initial posts if database table is completely empty
    const count = await prisma.communityPost.count();
    if (count === 0) {
      await seedDefaultCommunityPosts();
    }

    const posts = await prisma.communityPost.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        likes: userId ? { where: { userId } } : false,
      },
    });

    const formatted = posts.map((p) => ({
      id: p.id,
      userId: p.userId,
      author: p.author,
      avatarLetter:
        p.avatarLetter || (p.author ? p.author.charAt(0).toUpperCase() : "Y"),
      topic: p.topic,
      time: getRelativeTime(p.createdAt),
      title: p.title,
      content: p.content,
      likes: p.likesCount,
      comments: p.commentsCount,
      isLiked: Boolean(p.likes && p.likes.length > 0),
      createdAt: p.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single post details with its comments
 */
export async function getCommunityPostDetails(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
        },
        likes: userId ? { where: { userId } } : false,
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: post.id,
        userId: post.userId,
        author: post.author,
        avatarLetter: post.avatarLetter || post.author.charAt(0).toUpperCase(),
        topic: post.topic,
        time: getRelativeTime(post.createdAt),
        title: post.title,
        content: post.content,
        likes: post.likesCount,
        comments: post.commentsCount,
        isLiked: Boolean(post.likes && post.likes.length > 0),
        createdAt: post.createdAt,
        commentList: post.comments.map((c) => ({
          id: c.id,
          userId: c.userId,
          author: c.author,
          avatarLetter: c.avatarLetter || c.author.charAt(0).toUpperCase(),
          content: c.content,
          time: getRelativeTime(c.createdAt),
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new community post & broadcast via Socket.IO
 */
export async function createCommunityPost(req, res, next) {
  try {
    const {
      title,
      content,
      topic = "General",
      author: customAuthor,
      avatarLetter: customLetter,
    } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title and content are required" });
    }

    const authorName = req.user?.name || customAuthor || "Aspirant";
    const avatar = customLetter || authorName.charAt(0).toUpperCase() || "A";

    const newPost = await prisma.communityPost.create({
      data: {
        userId: req.user?.id || null,
        author: authorName,
        avatarLetter: avatar,
        topic: topic || "General",
        title: title.trim(),
        content: content.trim(),
        likesCount: 0,
        commentsCount: 0,
      },
    });

    const formatted = {
      id: newPost.id,
      userId: newPost.userId,
      author: newPost.author,
      avatarLetter: newPost.avatarLetter,
      topic: newPost.topic,
      time: "Just now",
      title: newPost.title,
      content: newPost.content,
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: newPost.createdAt,
    };

    // Real-time broadcast to all connected web clients
    emitCommunityEvent.postCreated(formatted);

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a post & broadcast deletion via Socket.IO
 */
export async function deleteCommunityPost(req, res, next) {
  try {
    const { id } = req.params;

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const userId = req.user?.id;
    const isAdmin = Boolean(
      req.admin ||
      req.user?.role === "ADMIN" ||
      req.user?.role === "SUPERADMIN",
    );

    if (post.userId !== userId && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    await prisma.communityPost.delete({ where: { id } });

    // Real-time broadcast
    emitCommunityEvent.postDeleted(id);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: { id },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Toggle like for a post & broadcast updated like count via Socket.IO
 */
export async function toggleLikePost(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const ip = req.ip || req.headers["x-forwarded-for"] || "anon";

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    let isLiked = false;
    let newLikesCount = post.likesCount;

    if (userId) {
      const existingLike = await prisma.communityLike.findUnique({
        where: { postId_userId: { postId: id, userId } },
      });

      if (existingLike) {
        // Unlike
        await prisma.communityLike.delete({ where: { id: existingLike.id } });
        newLikesCount = Math.max(0, post.likesCount - 1);
        isLiked = false;
      } else {
        // Like
        await prisma.communityLike.create({
          data: { postId: id, userId },
        });
        newLikesCount = post.likesCount + 1;
        isLiked = true;
      }
    } else {
      // Anonymous like toggle based on ip
      const existingLike = await prisma.communityLike.findFirst({
        where: { postId: id, ipHash: ip },
      });

      if (existingLike) {
        await prisma.communityLike.delete({ where: { id: existingLike.id } });
        newLikesCount = Math.max(0, post.likesCount - 1);
        isLiked = false;
      } else {
        await prisma.communityLike.create({
          data: { postId: id, ipHash: ip },
        });
        newLikesCount = post.likesCount + 1;
        isLiked = true;
      }
    }

    await prisma.communityPost.update({
      where: { id },
      data: { likesCount: newLikesCount },
    });

    // Real-time broadcast
    emitCommunityEvent.postLiked({ postId: id, likes: newLikesCount });

    return res.status(200).json({
      success: true,
      data: { postId: id, likes: newLikesCount, isLiked },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add comment to a post & broadcast via Socket.IO
 */
export async function addCommunityComment(req, res, next) {
  try {
    const { id } = req.params;
    const {
      content,
      author: customAuthor,
      avatarLetter: customLetter,
    } = req.body;

    if (!content?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Comment content is required" });
    }

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const authorName = req.user?.name || customAuthor || "Aspirant";
    const avatar = customLetter || authorName.charAt(0).toUpperCase() || "A";

    const newComment = await prisma.communityComment.create({
      data: {
        postId: id,
        userId: req.user?.id || null,
        author: authorName,
        avatarLetter: avatar,
        content: content.trim(),
      },
    });

    const updatedCommentsCount = post.commentsCount + 1;
    await prisma.communityPost.update({
      where: { id },
      data: { commentsCount: updatedCommentsCount },
    });

    const formattedComment = {
      id: newComment.id,
      postId: id,
      author: newComment.author,
      avatarLetter: newComment.avatarLetter,
      content: newComment.content,
      time: "Just now",
      createdAt: newComment.createdAt,
    };

    // Real-time broadcast
    emitCommunityEvent.commentCreated(id, formattedComment);

    // Create notification for the post owner (if not self-commenting)
    const commenterId = req.user?.id || null;
    if (post.userId && commenterId !== post.userId) {
      try {
        const notification = await prisma.communityNotification.create({
          data: {
            userId: post.userId,
            postId: id,
            commentId: newComment.id,
            actorName: authorName,
            postTitle: post.title,
          },
        });

        // Real-time push to the post owner
        emitCommunityEvent.notificationCreated(post.userId, {
          id: notification.id,
          postId: id,
          commentId: newComment.id,
          actorName: authorName,
          postTitle: post.title,
          isRead: false,
          createdAt: notification.createdAt,
        });
      } catch (notifErr) {
        // Don't fail the comment creation if notification fails
        console.error("[Community] Notification creation failed:", notifErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: formattedComment,
      commentsCount: updatedCommentsCount,
    });
  } catch (error) {
    next(error);
  }
}
