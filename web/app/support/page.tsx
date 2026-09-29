// app/support/page.tsx

import { Suspense } from "react";
import SupportPage from "./support-client";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupportPage />
    </Suspense>
  );
}