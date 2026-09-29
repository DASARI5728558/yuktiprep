"use client";

import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { AITutorChatView } from "@/components/ai-tutor-chat-view";

export default function AITutorChatPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <AITutorChatView />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
