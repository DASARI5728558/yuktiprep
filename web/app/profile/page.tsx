"use client";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { ProfilePage } from "@/components/profile";

export default function Profile() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins">
        <SidebarDemo>
          <ProfilePage />
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
