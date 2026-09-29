import DiscussionClient from "./discussion-client";

export function generateStaticParams() {
  return [{ postId: "default" }];
}

export default function DiscussionPage() {
  return <DiscussionClient />;
}
