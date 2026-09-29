import TestTakingClient from "./TestTakingClient";

export function generateStaticParams() {
  return [{ testId: "default" }];
}

export default function Page() {
  return <TestTakingClient />;
}
