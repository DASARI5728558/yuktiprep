"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { getSocket } from "./socket";

export interface Post {
  id: string;
  userId?: string | null;
  author: string;
  avatarLetter: string;
  topic: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  userId?: string | null;
  author: string;
  avatarLetter: string;
  content: string;
  time: string;
}

interface CommunityContextValue {
  posts: Post[];
  loading: boolean;
  addPost: (post: Omit<Post, "id" | "time" | "likes" | "comments">) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  getPost: (id: string) => Post | undefined;
  addComment: (postId: string, comment: Omit<Comment, "id">) => Promise<void>;
  getComments: (postId: string) => Comment[];
  fetchPostDetails: (id: string) => Promise<Post | undefined>;
}

const CommunityContext = createContext<CommunityContextValue | undefined>(
  undefined
);

export const CommunityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // 1. Initial REST Fetch for Posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${backendUrl}/api/v1/community/posts`, {
        headers,
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPosts(json.data);
      }
    } catch (err) {
      console.warn("[Community] Could not fetch posts from backend", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 2. Real-time Socket.IO Listeners
  useEffect(() => {
    const socket = getSocket();

    // Live New Post Event
    const handlePostCreated = (newPost: Post) => {
      setPosts((prev) => {
        // Prevent duplicate if already in state
        if (prev.some((p) => p.id === newPost.id)) return prev;
        return [newPost, ...prev];
      });
    };

    // Live Post Deleted Event
    const handlePostDeleted = (deletedPostId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
      setComments((prev) => {
        const next = { ...prev };
        delete next[deletedPostId];
        return next;
      });
    };

    // Live Post Liked Event
    const handlePostLiked = (data: { postId: string; likes: number }) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === data.postId ? { ...p, likes: data.likes } : p
        )
      );
    };

    // Live Comment Created Event
    const handleCommentCreated = (data: {
      postId: string;
      comment: Comment;
    }) => {
      setComments((prev) => {
        const existing = prev[data.postId] || [];
        if (existing.some((c) => c.id === data.comment.id)) return prev;
        return { ...prev, [data.postId]: [...existing, data.comment] };
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === data.postId ? { ...p, comments: p.comments + 1 } : p
        )
      );
    };

    socket.on("community:post:created", handlePostCreated);
    socket.on("community:post:deleted", handlePostDeleted);
    socket.on("community:post:liked", handlePostLiked);
    socket.on("community:comment:created", handleCommentCreated);

    return () => {
      socket.off("community:post:created", handlePostCreated);
      socket.off("community:post:deleted", handlePostDeleted);
      socket.off("community:post:liked", handlePostLiked);
      socket.off("community:comment:created", handleCommentCreated);
    };
  }, []);

  // 3. Actions
  const addPost = useCallback(
    async (postData: Omit<Post, "id" | "time" | "likes" | "comments">) => {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${backendUrl}/api/v1/community/posts`, {
          method: "POST",
          headers,
          body: JSON.stringify(postData),
        });

        const json = await res.json();
        if (json.success && json.data) {
          // Socket event will automatically sync across tabs, but also update local optimistically
          setPosts((prev) => {
            if (prev.some((p) => p.id === json.data.id)) return prev;
            return [json.data, ...prev];
          });
        }
      } catch (err) {
        console.error("Failed to create post on server", err);
        // Local fallback
        const localPost: Post = {
          ...postData,
          id: `local-${Date.now()}`,
          time: "Just now",
          likes: 0,
          comments: 0,
        };
        setPosts((prev) => [localPost, ...prev]);
      }
    },
    [backendUrl]
  );

  const deletePost = useCallback(
    async (id: string) => {
      // Optimistic update
      setPosts((prev) => prev.filter((p) => p.id !== id));
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        await fetch(`${backendUrl}/api/v1/community/posts/${id}`, {
          method: "DELETE",
          headers,
        });
      } catch (err) {
        console.error("Failed to delete post on server", err);
      }
    },
    [backendUrl]
  );

  const toggleLike = useCallback(
    async (id: string) => {
      // Optimistic local toggle
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            const nextLiked = !p.isLiked;
            return {
              ...p,
              isLiked: nextLiked,
              likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            };
          }
          return p;
        })
      );

      try {
        const token = getAuthToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${backendUrl}/api/v1/community/posts/${id}/like`, {
          method: "POST",
          headers,
        });
        const json = await res.json();
        if (json.success && json.data) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, likes: json.data.likes, isLiked: json.data.isLiked }
                : p
            )
          );
        }
      } catch (err) {
        console.error("Failed to toggle like", err);
      }
    },
    [backendUrl]
  );

  const getPost = useCallback(
    (id: string) => posts.find((post) => post.id === id),
    [posts]
  );

  const fetchPostDetails = useCallback(
    async (id: string): Promise<Post | undefined> => {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${backendUrl}/api/v1/community/posts/${id}`, {
          headers,
        });
        const json = await res.json();
        if (json.success && json.data) {
          const fetchedPost: Post = {
            id: json.data.id,
            userId: json.data.userId,
            author: json.data.author,
            avatarLetter: json.data.avatarLetter,
            topic: json.data.topic,
            time: json.data.time,
            title: json.data.title,
            content: json.data.content,
            likes: json.data.likes,
            comments: json.data.comments,
            isLiked: json.data.isLiked,
          };

          if (Array.isArray(json.data.commentList)) {
            setComments((prev) => ({
              ...prev,
              [id]: json.data.commentList,
            }));
          }

          setPosts((prev) => {
            const exists = prev.some((p) => p.id === id);
            return exists
              ? prev.map((p) => (p.id === id ? fetchedPost : p))
              : [fetchedPost, ...prev];
          });

          return fetchedPost;
        }
      } catch (err) {
        console.warn("Could not load post details from backend", err);
      }
      return undefined;
    },
    [backendUrl]
  );

  const addComment = useCallback(
    async (postId: string, commentData: Omit<Comment, "id">) => {
      try {
        const res = await fetch(
          `${backendUrl}/api/v1/community/posts/${postId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(getAuthToken()
                ? { Authorization: `Bearer ${getAuthToken()}` }
                : {}),
            },
            body: JSON.stringify(commentData),
          }
        );

        const json = await res.json();
        if (json.success && json.data) {
          setComments((prev) => {
            const existing = prev[postId] || [];
            if (existing.some((c) => c.id === json.data.id)) return prev;
            return { ...prev, [postId]: [...existing, json.data] };
          });
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? { ...post, comments: json.commentsCount || post.comments + 1 }
                : post
            )
          );
        }
      } catch (err) {
        console.error("Failed to add comment to server", err);
        const fallbackComment: Comment = {
          ...commentData,
          id: `comment-${Date.now()}`,
        };
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), fallbackComment],
        }));
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, comments: post.comments + 1 }
              : post
          )
        );
      }
    },
    [backendUrl]
  );

  const getComments = useCallback(
    (postId: string) => comments[postId] || [],
    [comments]
  );

  const value = useMemo(
    () => ({
      posts,
      loading,
      addPost,
      deletePost,
      toggleLike,
      getPost,
      addComment,
      getComments,
      fetchPostDetails,
    }),
    [
      posts,
      loading,
      addPost,
      deletePost,
      toggleLike,
      getPost,
      addComment,
      getComments,
      fetchPostDetails,
    ]
  );

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
};
