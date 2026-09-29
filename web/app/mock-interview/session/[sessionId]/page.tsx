import MockInterviewSessionClient from "./MockInterviewSessionClient";

export function generateStaticParams() {
  return [{ sessionId: "default" }];
}

export default function Page() {
  return <MockInterviewSessionClient />;
}
