"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useWhatsAppBotRules, useCreateBotRule, useUpdateBotRule, useDeleteBotRule, useToggleBotRule, WhatsAppBotRule } from "@/hooks/useWhatsApp";

export default function BotRulesTab() {
  const { data: rules = [], isLoading, refetch } = useWhatsAppBotRules();
  const createRule = useCreateBotRule();
  const updateRule = useUpdateBotRule();
  const deleteRule = useDeleteBotRule();
  const toggleRule = useToggleBotRule();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<WhatsAppBotRule | null>(null);
  const [form, setForm] = useState({ trigger: "", category: "COMMAND", actionType: "SEND_MESSAGE", actionPayload: "", priority: 0, isActive: true });

  const openCreate = () => {
    setEditing(null);
    setForm({ trigger: "", category: "COMMAND", actionType: "SEND_MESSAGE", actionPayload: "", priority: 0, isActive: true });
    setIsOpen(true);
  };

  const openEdit = (rule: WhatsAppBotRule) => {
    setEditing(rule);
    setForm({
      trigger: rule.trigger,
      category: rule.category,
      actionType: rule.actionType,
      actionPayload: typeof rule.actionPayload === "string" ? rule.actionPayload : JSON.stringify(rule.actionPayload || {}, null, 2),
      priority: rule.priority,
      isActive: rule.isActive,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      actionPayload: form.actionPayload ? JSON.parse(form.actionPayload) : {},
    };
    if (editing) {
      await updateRule.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createRule.mutateAsync(payload);
    }
    setIsOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteRule.mutateAsync(id);
    refetch();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await toggleRule.mutateAsync({ id, isActive: !current });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Create Rule</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Bot Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading rules...</p>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rules found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Trigger</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                    <th className="px-4 py-3 text-left font-medium">Priority</th>
                    <th className="px-4 py-3 text-left font-medium">Active</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{rule.trigger}</td>
                      <td className="px-4 py-3">{rule.category}</td>
                      <td className="px-4 py-3">{rule.actionType}</td>
                      <td className="px-4 py-3">{rule.priority}</td>
                      <td className="px-4 py-3">{rule.isActive ? "Yes" : "No"}</td>
                      <td className="flex gap-2 px-4 py-3">
                        <Button variant="outline" size="sm" onClick={() => openEdit(rule)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggle(rule.id, rule.isActive)}>
                          {rule.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(rule.id)}>Delete</Button>
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
            <DialogTitle>{editing ? "Edit Bot Rule" : "Create Bot Rule"}</DialogTitle>
            <DialogDescription>Configure bot flow rule.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger</Label>
              <Input id="trigger" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border bg-background px-3 py-2">
                <option value="COMMAND">COMMAND</option>
                <option value="STATE_TRANSITION">STATE_TRANSITION</option>
                <option value="ESCALATION">ESCALATION</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <select id="actionType" value={form.actionType} onChange={(e) => setForm({ ...form, actionType: e.target.value })} className="w-full rounded-md border bg-background px-3 py-2">
                <option value="SEND_MESSAGE">SEND_MESSAGE</option>
                <option value="UPDATE_STATE">UPDATE_STATE</option>
                <option value="HANDOFF">HANDOFF</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actionPayload">Action Payload (JSON)</Label>
              <Textarea id="actionPayload" value={form.actionPayload} onChange={(e) => setForm({ ...form, actionPayload: e.target.value })} placeholder='{"message":"Hello"}' />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input id="priority" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2">
              <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
