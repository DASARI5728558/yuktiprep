"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface TemplateBodyParameter {
  type: "text" | "currency" | "date_time";
  text?: string;
  currency?: { currencyCode?: string; amount?: string };
  dateTime?: string;
}

export interface TemplateFormValues {
  name: string;
  language: string;
  category: string;
  bodyText: string;
  parameters: TemplateBodyParameter[];
  headerType: string;
  mediaUrl: string;
  metaTemplateId: string;
  isActive: boolean;
}

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  submitLabel?: string;
  initialValues?: Partial<TemplateFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: TemplateFormValues) => void | Promise<void>;
}

const LANGUAGES = [
  { label: "en_US", value: "en_US" },
  { label: "en_IN", value: "en_IN" },
  { label: "hi_IN", value: "hi_IN" },
];

const CATEGORIES = [
  { label: "UTILITY", value: "UTILITY" },
  { label: "MARKETING", value: "MARKETING" },
  { label: "AUTHENTICATION", value: "AUTHENTICATION" },
];

const HEADER_TYPES = [
  { label: "None", value: "" },
  { label: "Text", value: "TEXT" },
  { label: "Image", value: "IMAGE" },
  { label: "Document", value: "DOCUMENT" },
  { label: "Video", value: "VIDEO" },
  { label: "Location", value: "LOCATION" },
];

const PARAMETER_TYPES = [
  { label: "Text", value: "text" },
  { label: "Currency", value: "currency" },
  { label: "Date/Time", value: "date_time" },
];

function buildBodyComponents(bodyText: string, parameters: TemplateBodyParameter[]) {
  const paramObjects = parameters.map((p, idx) => {
    if (p.type === "text") {
      return { type: "text", text: p.text || `{{${idx + 1}}}` };
    }
    if (p.type === "currency") {
      return {
        type: "currency",
        currency: {
          currencyCode: p.currency?.currencyCode || "INR",
          amount: p.currency?.amount || "1000",
        },
      };
    }
    if (p.type === "date_time") {
      return { type: "date_time", dateTime: p.dateTime || "FALLBACK" };
    }
    return { type: "text", text: p.text || `{{${idx + 1}}}` };
  });

  return [
    {
      type: "body",
      parameters: paramObjects,
    },
  ];
}

function previewBody(bodyText: string, parameters: TemplateBodyParameter[]) {
  let text = bodyText || "Your template body text here";
  parameters.forEach((p, idx) => {
    if (p.type === "text") {
      const placeholder = p.text || `{{${idx + 1}}}`;
      text = text.replace(`{{${idx + 1}}}`, placeholder);
    }
    if (p.type === "currency" && p.currency) {
      text = text.replace(`{{${idx + 1}}}`, `${p.currency.amount || "1000"} ${p.currency.currencyCode || "INR"}`);
    }
    if (p.type === "date_time") {
      text = text.replace(`{{${idx + 1}}}`, p.dateTime || "2025-01-01");
    }
  });
  return text;
}

export default function TemplateForm({
  open,
  onOpenChange,
  title = "Create Template",
  description,
  submitLabel = "Save",
  initialValues,
  isSubmitting = false,
  onSubmit,
}: TemplateFormProps) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en_US");
  const [category, setCategory] = useState("UTILITY");
  const [bodyText, setBodyText] = useState("");
  const [parameters, setParameters] = useState<TemplateBodyParameter[]>([]);
  const [headerType, setHeaderType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [metaTemplateId, setMetaTemplateId] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setName(initialValues.name || "");
        setLanguage(initialValues.language || "en_US");
        setCategory(initialValues.category || "UTILITY");
        setBodyText(initialValues.bodyText || "");
        setParameters(initialValues.parameters || []);
        setHeaderType(initialValues.headerType || "");
        setMediaUrl(initialValues.mediaUrl || "");
        setMetaTemplateId(initialValues.metaTemplateId || "");
        setIsActive(initialValues.isActive ?? true);
      } else {
        setName("");
        setLanguage("en_US");
        setCategory("UTILITY");
        setBodyText("");
        setParameters([]);
        setHeaderType("");
        setMediaUrl("");
        setMetaTemplateId("");
        setIsActive(true);
      }
    }
  }, [open, initialValues]);

  const addParameter = () => {
    setParameters([...parameters, { type: "text", text: "" }]);
  };

  const updateParameter = (index: number, updates: Partial<TemplateBodyParameter>) => {
    setParameters(parameters.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      language,
      category,
      bodyText,
      parameters,
      headerType,
      mediaUrl,
      metaTemplateId,
      isActive,
    });
  };

  const bodyComponents = buildBodyComponents(bodyText, parameters);
  const preview = previewBody(bodyText, parameters);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. welcome_message" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyText">Body Text</Label>
        <Textarea
          id="bodyText"
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Hello {{1}}, your appointment on {{2}} is confirmed."
          required
        />
        <p className="text-xs text-muted-foreground">
          Use <code className="rounded bg-muted px-1 py-0.5">{`{{1}}`}</code>, <code className="rounded bg-muted px-1 py-0.5">{`{{2}}`}</code> etc. for variables.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Body Parameters</Label>
          <Button type="button" size="sm" variant="outline" onClick={addParameter}>
            Add Parameter
          </Button>
        </div>

        {parameters.length === 0 && (
          <p className="text-xs text-muted-foreground">No parameters defined. Click "Add Parameter" to create variables like {'{{1}}'}, {'{{2}}'}.</p>
        )}

        <div className="space-y-3">
          {parameters.map((param, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Parameter {index + 1}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeParameter(index)}>
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, { type: e.target.value as TemplateBodyParameter["type"] })}
                    className="w-full rounded-md border bg-background px-3 py-2"
                  >
                    {PARAMETER_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {param.type === "text" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Text / Placeholder</Label>
                    <Input
                      className="h-8"
                      value={param.text || ""}
                      onChange={(e) => updateParameter(index, { text: e.target.value })}
                      placeholder={`{{${index + 1}}}`}
                    />
                  </div>
                )}

                {param.type === "currency" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs">Currency Code</Label>
                      <Input
                        className="h-8"
                        value={param.currency?.currencyCode || "INR"}
                        onChange={(e) =>
                          updateParameter(index, {
                            currency: { ...(param.currency || {}), currencyCode: e.target.value },
                          })
                        }
                        placeholder="INR"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        className="h-8"
                        value={param.currency?.amount || ""}
                        onChange={(e) =>
                          updateParameter(index, {
                            currency: { ...(param.currency || {}), amount: e.target.value },
                          })
                        }
                        placeholder="1000"
                      />
                    </div>
                  </>
                )}

                {param.type === "date_time" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Fallback</Label>
                    <Input
                      className="h-8"
                      value={param.dateTime || ""}
                      onChange={(e) => updateParameter(index, { dateTime: e.target.value })}
                      placeholder="FALLBACK"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headerType">Header Type</Label>
        <select id="headerType" value={headerType} onChange={(e) => setHeaderType(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2">
          {HEADER_TYPES.map((ht) => (
            <option key={ht.value} value={ht.value}>
              {ht.label}
            </option>
          ))}
        </select>
      </div>

      {headerType === "IMAGE" && (
        <div className="space-y-2">
          <Label htmlFor="mediaUrl">Media URL</Label>
          <Input id="mediaUrl" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="metaTemplateId">Meta Template ID</Label>
        <Input id="metaTemplateId" value={metaTemplateId} onChange={(e) => setMetaTemplateId(e.target.value)} placeholder="e.g. yuktiprep_welcome_123" />
      </div>

      <div className="flex items-center gap-2">
        <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <Label htmlFor="isActive" className="text-sm font-normal">Active</Label>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
        <Label className="text-xs font-medium">Preview</Label>
        <p className="text-sm text-muted-foreground">{preview}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-muted-foreground">bodyComponents JSON</summary>
          <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(bodyComponents, null, 2)}
          </pre>
        </details>
      </div>
    </form>
  );
}
