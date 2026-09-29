"use client";

import React from "react";
import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import StudyPlannerView from "@/components/study-planner/study-planner-view";

export default function StudyPlannerPage() {
  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-poppins h-screen overflow-hidden">
        <SidebarDemo>
          <main className="flex flex-col w-full h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-[#F4F6FA] p-4 shadow-sm md:p-6 lg:pt-8">
            <StudyPlannerView />
          </main>
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}
