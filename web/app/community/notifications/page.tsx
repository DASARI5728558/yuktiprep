import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import NotificationsPage from "@/components/notifications";

export default function NotificationsRoute() {
  return (
    <AuthGuard>
      <SidebarDemo>
        <NotificationsPage />
      </SidebarDemo>
    </AuthGuard>
  );
}
