"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Loader2, Save, Clock, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [syncTime, setSyncTime] = useState("16:00");
  const [broadcastTime, setBroadcastTime] = useState("06:00");
  const [translationLanguages, setTranslationLanguages] = useState("ta, hi, kn");
  
  interface Language {
    id: string;
    code: string;
    englishName: string;
    nativeName: string;
    isActive: boolean;
  }
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchLanguages();
  }, []);

  // Convert "0 16 * * *" to "16:00"
  function parseCronToTime(cronStr: string, defaultTime: string) {
    try {
      const parts = cronStr.split(" ");
      if (parts.length >= 2) {
        const minute = parts[0].padStart(2, "0");
        const hour = parts[1].padStart(2, "0");
        return `${hour}:${minute}`;
      }
    } catch (e) {
      // ignore
    }
    return defaultTime;
  }

  // Convert "16:00" to "0 16 * * *"
  function parseTimeToCron(timeStr: string) {
    const [hour, minute] = timeStr.split(":");
    return `${parseInt(minute)} ${parseInt(hour)} * * *`;
  }

  const fetchLanguages = async () => {
    try {
      const res = await api.get("/api/v1/admin/languages");
      if (res.data.data) {
        setAvailableLanguages(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch languages", error);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/admin/settings");
      const data = res.data.data;
      if (data) {
        if (data.SYNC_SOURCES_CRON) setSyncTime(parseCronToTime(data.SYNC_SOURCES_CRON, "16:00"));
        if (data.WHATSAPP_BROADCAST_CRON) setBroadcastTime(parseCronToTime(data.WHATSAPP_BROADCAST_CRON, "06:00"));
        if (data.TRANSLATION_LANGUAGES) setTranslationLanguages(data.TRANSLATION_LANGUAGES);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    await api.put("/api/v1/admin/settings", { key, value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg("");
      await saveSetting("SYNC_SOURCES_CRON", parseTimeToCron(syncTime));
      await saveSetting("WHATSAPP_BROADCAST_CRON", parseTimeToCron(broadcastTime));
      await saveSetting("TRANSLATION_LANGUAGES", translationLanguages);

      setSuccessMsg("Settings saved successfully! Cron jobs have been updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState("automations");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/30">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 px-4 py-8 font-[family-name:var(--font-poppins)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              System Settings
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage automated background tasks and application configurations.
            </p>
          </div>
        </div>

        <div className="mb-6 flex space-x-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("automations")}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === "automations"
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Automations
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === "general"
              ? "border-b-2 border-teal-600 text-teal-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            General
          </button>
        </div>

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-4 text-sm text-teal-800 border border-teal-100">
            <CheckCircle className="h-5 w-5 text-teal-500" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {activeTab === "automations" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Automated Cron Jobs
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Set the time of day when these background tasks should run automatically.
              </p>
            </div>

            <div className="px-6 py-6 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Daily Source Sync
                  </label>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Scrapes the latest current affairs and passes them through AI for formatting.
                  </p>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="time"
                      className="block w-full rounded-lg border-gray-300 py-3 px-4 focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-gray-50 border transition-colors"
                      value={syncTime}
                      onChange={(e) => setSyncTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    WhatsApp Broadcast
                  </label>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Sends the top 3 latest current affairs to all active users on WhatsApp.
                  </p>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="time"
                      className="block w-full rounded-lg border-gray-300 py-3 px-4 focus:border-teal-500 focus:ring-teal-500 sm:text-sm bg-gray-50 border transition-colors"
                      value={broadcastTime}
                      onChange={(e) => setBroadcastTime(e.target.value)}
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 transition-all"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "general" && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2">
                General Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure global application settings and features.
              </p>
            </div>

            <div className="px-6 py-6 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Translation Languages
                  </label>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    Click to select/deselect which languages should be translated by AI.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableLanguages.length === 0 && (
                      <span className="text-xs text-gray-400">Loading languages...</span>
                    )}
                    {availableLanguages.map((lang) => {
                      const selectedLangs = translationLanguages.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
                      const isSelected = selectedLangs.includes(lang.code.toLowerCase());
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setTranslationLanguages(selectedLangs.filter((c) => c !== lang.code.toLowerCase()).join(","));
                            } else {
                              setTranslationLanguages([...selectedLangs, lang.code.toLowerCase()].join(","));
                            }
                          }}
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors border ${
                            isSelected
                              ? "bg-teal-50 text-teal-700 border-teal-200 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {lang.englishName} ({lang.code})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 transition-all"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
