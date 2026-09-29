import { Server } from "socket.io";

let ioInstance = null;

/**
 * Initialize Socket.IO with the HTTP server
 * @param {import('http').Server} httpServer
 */
export function initializeSocket(httpServer) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5001",
    "http://localhost:5000",
    "http://localhost:3000",
    "http://127.0.0.1:5001",
    "http://127.0.0.1:3000",
    "http://localhost",
    "https://localhost",
    "capacitor://localhost",
  ];

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Dev permissive
      },
      methods: ["GET", "POST", "DELETE"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join personal notification room
    socket.on("user:join", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join discussion room for a specific post
    socket.on("community:join_post", (postId) => {
      if (postId) {
        socket.join(`post_${postId}`);
      }
    });

    socket.on("community:leave_post", (postId) => {
      if (postId) {
        socket.leave(`post_${postId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

/**
 * Get the active Socket.IO server instance
 */
export function getIO() {
  return ioInstance;
}

/**
 * Broadcast event helpers
 */
export const emitCommunityEvent = {
  postCreated: (post) => {
    if (ioInstance) {
      ioInstance.emit("community:post:created", post);
    }
  },
  postDeleted: (postId) => {
    if (ioInstance) {
      ioInstance.emit("community:post:deleted", postId);
    }
  },
  postLiked: (payload) => {
    if (ioInstance) {
      ioInstance.emit("community:post:liked", payload);
    }
  },
  commentCreated: (postId, comment) => {
    if (ioInstance) {
      // Send to both global (for comment count bump) and room (for discussion thread)
      ioInstance.emit("community:comment:created", { postId, comment });
      ioInstance.to(`post_${postId}`).emit("community:room:comment_created", comment);
    }
  },
  notificationCreated: (userId, notification) => {
    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit("notification:created", notification);
    }
  },
};
