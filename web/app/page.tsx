import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";

export default function Home() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 items-center justify-center font-sans">
        <SidebarDemo/>
      </div>
    </AuthGuard>
  );
}
