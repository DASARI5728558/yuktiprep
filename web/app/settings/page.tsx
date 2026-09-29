"use client";

import SidebarDemo from "@/components/sidebar-demo";
import AuthGuard from "@/components/auth-guard";
import { useLanguage } from "@/lib/language-context";

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <AuthGuard>
      <div className="flex flex-col flex-1 font-sans">
        <SidebarDemo>
          <main className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto rounded-tl-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("settings")}</h1>
            <p className="text-neutral-600">
              {t("settingsDescription")}
            </p>
            {/* Add more settings content here later */}
          </main>
        </SidebarDemo>
      </div>
    </AuthGuard>
  );
}