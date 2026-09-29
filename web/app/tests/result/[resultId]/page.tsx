import TestResultClient from "./TestResultClient";

export function generateStaticParams() {
  return [{ resultId: "default" }];
}

export default function Page() {
  return <TestResultClient />;
}
