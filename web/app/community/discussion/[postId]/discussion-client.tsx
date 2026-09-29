"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { DiscussionPage } from "@/components/discussion";

export default function DiscussionClient() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <DiscussionPage />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
