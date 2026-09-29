"use client";

import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { TestTakingScreen } from "@/components/test-taking";

export default function TestTakingClient() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <TestTakingScreen />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
