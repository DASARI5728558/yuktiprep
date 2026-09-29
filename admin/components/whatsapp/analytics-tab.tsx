"use client";

import { useAnalyticsSummary, useAnalyticsDaily } from "@/hooks/useWhatsApp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsTab() {
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: daily = [], isLoading: dailyLoading } = useAnalyticsDaily(30);

  const metrics = [
    { label: "Total Messages", value: summary?.totalMessages ?? 0 },
    { label: "Inbound", value: summary?.inboundMessages ?? 0 },
    { label: "Outbound", value: summary?.outboundMessages ?? 0 },
    { label: "Delivered", value: summary?.deliveredMessages ?? 0 },
    { label: "Read", value: summary?.readMessages ?? 0 },
    { label: "Failed", value: summary?.failedMessages ?? 0 },
    { label: "Conversations", value: summary?.totalConversations ?? 0 },
    { label: "Handoffs", value: summary?.handoffConversations ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryLoading ? "..." : metric.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
