"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { TestsPage } from "@/components/tests";

export default function Tests() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <TestsPage />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
