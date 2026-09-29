"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { TestResultPage } from "@/components/test-result";

export default function TestResult() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <TestResultPage />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
