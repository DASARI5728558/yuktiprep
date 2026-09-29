"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { useWhatsAppConversations, useWhatsAppMessages, useHandoffConversation, useReleaseConversation, useSendConversationMessage } from "@/hooks/useWhatsApp";

export default function ConversationsTab() {
  const { data: conversations = [], isLoading, refetch } = useWhatsAppConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const sendMessage = useSendConversationMessage();
  const handoff = useHandoffConversation();
  const release = useReleaseConversation();

  const { data: messages = [] } = useWhatsAppMessages(selectedId || "");

  const selected = conversations.find((c) => c.id === selectedId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedId || !messageBody.trim()) return;
    await sendMessage.mutateAsync({ conversationId: selectedId, body: messageBody, type: "text" });
    setMessageBody("");
  };

  const handleHandoff = async () => {
    if (!selectedId) return;
    await handoff.mutateAsync(selectedId);
    refetch();
  };

  const handleRelease = async () => {
    if (!selectedId) return;
    await release.mutateAsync(selectedId);
    refetch();
  };

  const isSending = sendMessage.isPending || (sendMessage as any).isLoading;

  const handleExportCSV = () => {
    if (!conversations || conversations.length === 0) return;

    const data = conversations.map((c) => ({
      Phone: c.waId,
      Name: c.context?.contactName || "Unknown",
      Exam: c.context?.exam || "Not Provided",
      Year: c.context?.year || "Not Provided",
      Status: c.state,
      Date: new Date(c.createdAt).toLocaleDateString(),
    }));

    const headers = ["Phone", "Name", "Exam", "Year", "Status", "Date"];
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header as keyof typeof row] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whatsapp-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Conversations List - Hidden on mobile if a chat is selected */}
      <Card className={`md:col-span-1 ${selectedId ? "hidden md:block" : "block"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Conversations</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportCSV} title="Export CSV" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Export</span>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conversations found.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${selectedId === conv.id ? "border-teal-600 bg-teal-50" : "hover:bg-muted"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{conv.contactName || `+${conv.waId}`}</span>
                    {conv.humanHandoff && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Handoff</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{conv.state}</div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat View - Hidden on mobile if NO chat is selected */}
      <Card className={`md:col-span-2 flex flex-col ${!selectedId ? "hidden md:flex" : "flex"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            {selected && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setSelectedId(null)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
            )}
            <CardTitle className="text-lg md:text-xl">{selected ? `Chat: ${selected.contactName || "+" + selected.waId}` : "Select a conversation"}</CardTitle>
          </div>
          {selected && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleHandoff} disabled={selected.humanHandoff}>
                Handoff
              </Button>
              <Button size="sm" variant="outline" onClick={handleRelease} disabled={!selected.humanHandoff}>
                Release
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          {selected ? (
            <div className="flex h-[60vh] md:h-[500px] flex-col gap-4">
              <div className="flex-1 overflow-y-auto scroll-smooth rounded-lg border p-4 bg-[#efeae2]">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="rounded-md bg-white/60 px-4 py-1 text-xs text-muted-foreground shadow-sm">No messages yet.</p>
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-end gap-2">
                    {[...messages].reverse().map((msg) => (
                      <div key={msg.id} className={`flex ${msg.direction === "INBOUND" ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`relative max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm ${msg.direction === "INBOUND" ? "rounded-tl-none bg-white text-gray-800" : "rounded-tr-none bg-[#dcf8c6] text-gray-800"
                            }`}
                        >
                          <div className="mb-1 text-[11px] font-semibold text-gray-500">
                            {msg.direction === "INBOUND" ? (selected.contactName || `+${selected.waId}`) : "You (me)"}
                          </div>
                          <div className="break-words whitespace-pre-wrap">{msg.body || msg.type}</div>
                          <div className="mt-1 text-right text-[10px] text-gray-500">
                            {msg.status}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSending) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isSending || !messageBody.trim()}>
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-[60vh] md:h-[500px] items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">Select a conversation from the list to view messages.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
