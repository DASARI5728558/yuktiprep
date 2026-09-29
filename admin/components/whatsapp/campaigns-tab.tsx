"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWhatsAppCampaigns, useWhatsAppTemplates, useCreateCampaign, useSendCampaign } from "@/hooks/useWhatsApp";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  SENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function CampaignsTab() {
  const { data: campaigns = [], isLoading, refetch } = useWhatsAppCampaigns();
  const { data: templates = [] } = useWhatsAppTemplates();
  const createCampaign = useCreateCampaign();
  const sendCampaign = useSendCampaign();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", templateId: "", audienceFilter: "", scheduledAt: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isoScheduledAt = form.scheduledAt;
    if (isoScheduledAt) {
      isoScheduledAt = new Date(isoScheduledAt).toISOString();
    }
    await createCampaign.mutateAsync({
      ...form,
      scheduledAt: isoScheduledAt,
      audienceFilter: form.audienceFilter ? JSON.parse(form.audienceFilter) : {},
    });
    setIsOpen(false);
    setForm({ name: "", templateId: "", audienceFilter: "", scheduledAt: "" });
    refetch();
  };

  const handleSend = async (id: string) => {
    await sendCampaign.mutateAsync(id);
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsOpen(true)}>Create Campaign</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Manage broadcast campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Template</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Sent</th>
                    <th className="px-4 py-3 text-left font-medium">Targeted</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{campaign.name}</td>
                      <td className="px-4 py-3">{campaign.template?.name || campaign.templateId}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[campaign.status] || "bg-gray-100 text-gray-800"}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{campaign.totalSent}</td>
                      <td className="px-4 py-3">{campaign.totalTargeted}</td>
                      <td className="flex gap-2 px-4 py-3">
                        {campaign.status === "DRAFT" || campaign.status === "SCHEDULED" ? (
                          <Button size="sm" onClick={() => handleSend(campaign.id)}>Send</Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] max-w-[100vw] overflow-y-auto lg:min-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Set up a new WhatsApp broadcast campaign.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateId">Template</Label>
              <select id="templateId" value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })} className="w-full rounded-md border bg-background px-3 py-2">
                <option value="">Select template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audienceFilter">Audience Filter (JSON)</Label>
              <Textarea id="audienceFilter" value={form.audienceFilter} onChange={(e) => setForm({ ...form, audienceFilter: e.target.value })} placeholder='{"exams":["ssc","banking"]}' />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Schedule At (ISO datetime, optional)</Label>
              <Input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
