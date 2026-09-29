import MockInterviewResultClient from "./MockInterviewResultClient";

export function generateStaticParams() {
  return [{ sessionId: "default" }];
}

export default function Page() {
  return <MockInterviewResultClient />;
}
