import { Suspense } from "react";
import CurrentAffairsClient from "./current-affairs-client";

export default function CurrentAffairsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CurrentAffairsClient />
    </Suspense>
  );
}