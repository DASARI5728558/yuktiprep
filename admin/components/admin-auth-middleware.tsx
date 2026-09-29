"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminMe } from "../hooks/useAdminAuth";
import SidebarDemo from "./sidebar-demo";

export default function AdminAuthMiddleware({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: admin, isLoading, isError } = useAdminMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (isError || !admin) {
        // If not logged in and not already on the login page, redirect
        if (pathname !== "/login") {
          router.push("/login");
        }
      }
    }
  }, [admin, isLoading, isError, router, pathname]);

  // Show nothing or a loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-muted-foreground">Loading admin session...</p>
      </div>
    );
  }

  // If we are on the login page, just render children (login form)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If there's an error or no admin and we are not on login page, 
  // the useEffect will redirect. Return null to avoid flash of content.
  if (isError || !admin) {
    return null;
  }

  // Admin is authenticated, render the protected content wrapped in Sidebar
  return <SidebarDemo>{children}</SidebarDemo>;
}

