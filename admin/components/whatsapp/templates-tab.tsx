"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TemplateForm, { TemplateFormValues } from "@/components/whatsapp/template-form";
import { useWhatsAppTemplates, useCreateTemplate, useUpdateTemplate, useToggleTemplate, WhatsAppTemplate } from "@/hooks/useWhatsApp";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function parseBodyComponents(bodyComponents: unknown): Pick<TemplateFormValues, "bodyText" | "parameters"> {
  if (!bodyComponents || typeof bodyComponents !== "object") {
    return { bodyText: "", parameters: [] };
  }

  const arr = Array.isArray(bodyComponents) ? bodyComponents : [bodyComponents];
  const bodyComponent = arr.find((c) => c && typeof c === "object" && c.type === "body");

  if (!bodyComponent || !Array.isArray(bodyComponent.parameters)) {
    return { bodyText: "", parameters: [] };
  }

  const parameters = (bodyComponent.parameters as Array<{ type?: string; text?: string; currency?: { currencyCode?: string; amount?: string }; dateTime?: string }>).map((p) => ({
    type: (p.type || "text") as TemplateFormValues["parameters"][number]["type"],
    text: p.text || "",
    currency: p.currency,
    dateTime: p.dateTime,
  }));

  const bodyText = parameters.map((p, idx) => {
    if (p.type === "text") return p.text || `{{${idx + 1}}}`;
    if (p.type === "currency") return `{{${idx + 1}}}`;
    if (p.type === "date_time") return `{{${idx + 1}}}`;
    return `{{${idx + 1}}}`;
  }).join(" ");

  return { bodyText, parameters };
}

export default function TemplatesTab() {
  const { data: templates = [], isLoading, refetch } = useWhatsAppTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const toggleTemplate = useToggleTemplate();

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<WhatsAppTemplate | null>(null);

  const openCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const openEdit = (template: WhatsAppTemplate) => {
    setEditing(template);
    setIsOpen(true);
  };

  const handleSubmit = async (values: TemplateFormValues) => {
    const bodyComponents = values.parameters.length > 0 ? {
      type: "body",
      parameters: values.parameters.map((p, idx) => {
        if (p.type === "text") return { type: "text", text: p.text || `{{${idx + 1}}}` };
        if (p.type === "currency") return { type: "currency", currency: { currencyCode: p.currency?.currencyCode || "INR", amount: p.currency?.amount || "1000" } };
        if (p.type === "date_time") return { type: "date_time", dateTime: p.dateTime || "FALLBACK" };
        return { type: "text", text: p.text || `{{${idx + 1}}}` };
      }),
    } : undefined;

    const payload = {
      name: values.name,
      language: values.language,
      category: values.category,
      bodyComponents,
      headerType: values.headerType || undefined,
      mediaUrl: values.mediaUrl || undefined,
      metaTemplateId: values.metaTemplateId || undefined,
      isActive: values.isActive,
    };

    if (editing) {
      await updateTemplate.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createTemplate.mutateAsync(payload);
    }
    setIsOpen(false);
    refetch();
  };

  const initialValues = editing ? {
    ...parseBodyComponents(editing.bodyComponents),
    name: editing.name,
    language: editing.language,
    category: editing.category,
    headerType: editing.headerType || "",
    mediaUrl: editing.mediaUrl || "",
    metaTemplateId: editing.metaTemplateId || "",
    isActive: editing.isActive,
  } : undefined;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Create Template</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading templates...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Language</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Active</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{template.name}</td>
                      <td className="px-4 py-3">{template.language}</td>
                      <td className="px-4 py-3">{template.category}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[template.status] || "bg-gray-100 text-gray-800"}`}>
                          {template.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{template.isActive ? "Yes" : "No"}</td>
                      <td className="flex gap-2 px-4 py-3">
                        <Button variant="outline" size="sm" onClick={() => openEdit(template)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => toggleTemplate.mutateAsync({ id: template.id, isActive: !template.isActive }).then(() => refetch())}>
                          {template.isActive ? "Disable" : "Enable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TemplateForm
        open={isOpen}
        onOpenChange={setIsOpen}
        title={editing ? "Edit Template" : "Create Template"}
        description="Build WhatsApp message template body and metadata."
        submitLabel={editing ? "Update" : "Create"}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
