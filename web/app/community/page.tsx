"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { CommunityPage } from "@/components/community";

export default function Community() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <CommunityPage />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
