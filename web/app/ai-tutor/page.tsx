"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { AITutorPage } from "@/components/ai-tutor";

export default function AITutor() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <AITutorPage />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
