"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TemplatesTab from "@/components/whatsapp/templates-tab";
import CampaignsTab from "@/components/whatsapp/campaigns-tab";
import ConversationsTab from "@/components/whatsapp/conversations-tab";
import BotRulesTab from "@/components/whatsapp/bot-rules-tab";
import AnalyticsTab from "@/components/whatsapp/analytics-tab";

type Tab = "templates" | "campaigns" | "conversations" | "rules" | "analytics";

const tabs: { key: Tab; label: string }[] = [
  { key: "templates", label: "Templates" },
  { key: "campaigns", label: "Campaigns" },
  { key: "conversations", label: "Conversations" },
  { key: "analytics", label: "Analytics" },
];

export default function WhatsAppBotPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 md:pt-0">
      <Card className="w-full shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">WhatsApp Bot</CardTitle>
            <CardDescription>Manage templates, campaigns, conversations, rules, and analytics.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-gray-200 bg-teal-50 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold capitalize transition ${activeTab === tab.key ? "bg-teal-600 text-white shadow-sm" : "text-muted-foreground hover:bg-teal-100"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "templates" && <TemplatesTab />}
          {activeTab === "campaigns" && <CampaignsTab />}
          {activeTab === "conversations" && <ConversationsTab />}
          {/* {activeTab === "rules" && <BotRulesTab />} */}
          {activeTab === "analytics" && <AnalyticsTab />}
        </CardContent>
      </Card>
    </div>
  );
}
