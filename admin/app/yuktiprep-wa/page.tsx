"use client";

import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { ExternalLink, RotateCw, Loader2, MessageSquare, ShieldCheck } from "lucide-react";

export default function YuktiPrepWaPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [frameKey, setFrameKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const WA_PORTAL_URL = "https://whatsapp.appantech.com/app/projects/84802c62-d700-40c2-b918-c674b117a513/dashboard";

  const handleRefresh = () => {
    setIsLoading(true);
    setFrameKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(WA_PORTAL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-1 flex-col h-full w-full space-y-4">
      {/* Header bar with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-xs">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                YuktiPrep WhatsApp CRM
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> AppanTech
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Official WhatsApp Marketing & Customer Support Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs font-medium border-gray-300 hover:bg-gray-100"
            title="Reload Frame"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-600" : "text-gray-600"}`} />
            Reload
          </Button>
          <Button
            size="sm"
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in New Window
          </Button>
        </div>
      </div>

      {/* Cookie & Security notice
      <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        <span>
          💡 <strong>Login Tip:</strong> Modern browsers block third-party cookies inside embedded frames. If login fails or refreshes without signing in, click <strong>Open in New Window</strong> to log in directly. Once logged in, reload this tab.
        </span>
        <button
          onClick={handleOpenExternal}
          className="shrink-0 font-semibold underline hover:text-amber-950"
        >
          Launch Portal →
        </button>
      </div> */}

      {/* Frame Container */}
      <div className="relative flex-1 w-full min-h-[750px] rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
            <p className="mt-3 text-sm font-medium text-gray-600">
              Connecting to AppanTech WhatsApp Platform...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              If it doesn't load or is blocked by browser policies, click{" "}
              <button
                onClick={handleOpenExternal}
                className="text-emerald-600 underline hover:text-emerald-700 font-medium"
              >
                Open in New Tab
              </button>
            </p>
          </div>
        )}

        <iframe
          key={frameKey}
          ref={iframeRef}
          src={WA_PORTAL_URL}
          title="YuktiPrep WhatsApp Portal"
          className="w-full flex-1 border-0 h-full min-h-[750px]"
          allow="camera; microphone; clipboard-read; clipboard-write; notifications; storage-access *"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
