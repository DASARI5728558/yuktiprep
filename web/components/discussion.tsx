"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCommunity } from "@/lib/community-context";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Send,
} from "lucide-react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const Avatar = ({ letter, className }: { letter: string; className?: string }) => (
  <div
    className={cn(
      "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF4E3] text-lg font-semibold text-[#C78A2C]",
      className
    )}
  >
    {letter}
  </div>
);

const CommentCard = ({
  author,
  avatarLetter,
  content,
  time,
}: {
  author: string;
  avatarLetter: string;
  content: string;
  time: string;
}) => (
  <article
    className="rounded-[18px] border border-[#E1E5EA] bg-white p-5 shadow-[0_3px_12px_rgba(20,35,60,0.03)]"
    style={{ marginBottom: "14px" }}
  >
    <div className="flex items-center gap-3">
      <Avatar letter={avatarLetter} className="!h-12 !w-12" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-[#1D3155]">{author}</h4>
          <span className="text-xs text-[#9AA1AC]">{time}</span>
        </div>
      </div>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-[#354052]">{content}</p>
  </article>
);

export const DiscussionPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { getPost, getComments, addComment, toggleLike, fetchPostDetails } = useCommunity();
  const [commentText, setCommentText] = useState("");
  const [fetching, setFetching] = useState(false);

  const postId = useMemo(() => Array.isArray(params?.postId) ? params.postId[0] : (params?.postId as string | undefined), [params]);
  const post = useMemo(() => (postId ? getPost(postId) : undefined), [postId, getPost]);
  const comments = useMemo(() => (postId ? getComments(postId) : []), [postId, getComments]);

  const fetchedPostIdRef = React.useRef<string | null>(null);

  // Load post details from backend and join Socket.IO room for live comments
  React.useEffect(() => {
    if (!postId) return;

    if (fetchedPostIdRef.current !== postId) {
      fetchedPostIdRef.current = postId;
      setFetching(true);
      fetchPostDetails(postId).finally(() => setFetching(false));
    }

    // Join room
    import("@/lib/socket").then(({ getSocket }) => {
      const socket = getSocket();
      socket.emit("community:join_post", postId);
    });

    return () => {
      import("@/lib/socket").then(({ getSocket }) => {
        const socket = getSocket();
        socket.emit("community:leave_post", postId);
      });
    };
  }, [postId, fetchPostDetails]);

  if (!post && fetching) {
    return (
      <main className={`${poppins.variable} flex flex-1 flex-col items-center justify-center p-10 font-poppins`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#087E8B] border-t-transparent" />
      </main>
    );
  }

  if (!post) {
    return (
      <main
        className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
      >
        <div className="mx-auto w-full max-w-[900px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-[#1D3155] transition hover:text-[#087E8B]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E1E5EA] bg-white p-10 text-center">
            <p className="text-sm text-[#687384]">Post not found.</p>
          </div>
        </div>
      </main>
    );
  }

  const handleSendComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    addComment(post.id, {
      author: user?.name || "You",
      avatarLetter: (user?.name?.charAt(0) || "Y").toUpperCase(),
      content: trimmed,
      time: "Just now",
    });
    setCommentText("");
  };

  return (
    <main
      className={`${poppins.variable} flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-5 shadow-sm md:p-8 lg:p-10 font-poppins`}
    >
      <div className="mx-auto w-full max-w-[900px]">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-[#1D3155] transition hover:text-[#087E8B]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-base font-semibold">Discussion</span>
        </button>

        <article
          className="rounded-[20px] border border-[#E1E5EA] bg-white p-5 shadow-[0_4px_18px_rgba(20,35,60,0.04)]"
        >
          <div className="flex items-start gap-4">
            <Avatar letter={post.avatarLetter} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1D3155]">
                    {post.author}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-[12px] bg-[#F0EEFF] px-2.5 py-0.5 text-xs font-medium text-[#5E5B9B]">
                      {post.topic}
                    </span>
                    <span className="text-xs text-[#8A919D]">{post.time}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-base font-medium text-[#1D3155]">{post.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-[#354052]">
                  {post.content}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition",
                    post.isLiked
                      ? "text-[#E63946] font-semibold"
                      : "text-[#627080] hover:text-[#087E8B]"
                  )}
                  aria-label={`${post.likes} likes`}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-transform active:scale-125",
                      post.isLiked && "fill-[#E63946] text-[#E63946]"
                    )}
                  />
                  <span>{post.likes}</span>
                </button>
                <div
                  className="flex items-center gap-1.5 text-xs text-[#627080]"
                  aria-label={`${post.comments} comments`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section className="mt-6">
          <h2 className="text-[24px] font-semibold text-[#1D3155]">Comments</h2>
          <div className="mt-4">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#E1E5EA] bg-white p-10 text-center">
                <p className="text-sm text-[#687384]">No comments yet. Be the first to join the discussion!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  author={comment.author}
                  avatarLetter={comment.avatarLetter}
                  content={comment.content}
                  time={comment.time}
                />
              ))
            )}
          </div>
        </section>

        <div className="h-24" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E1E5EA] bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(20,35,60,0.04)] md:left-[68px]">
        <div className="mx-auto flex max-w-[900px] items-center gap-3">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="Write a comment..."
            className="min-w-0 flex-1 rounded-[20px] border border-[#E5E8ED] bg-[#F8F9FB] px-4 py-3 font-poppins text-base text-[#1D3155] outline-none transition-colors placeholder:text-[#687384] focus:border-[#087E8B]"
          />
          <button
            type="button"
            onClick={handleSendComment}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#087E8B] transition hover:bg-[#E2F4F4]"
            aria-label="Send comment"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default DiscussionPage;
