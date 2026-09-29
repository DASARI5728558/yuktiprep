"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

type Plan = {
  id: string;
  key: string;
  name: string;
  subtitle?: string;
  price: number;
  currency: string;
  billingInterval: string;
  badgeText?: string;
  badgeType?: string;
  theme?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  features?: { text: string; sortOrder: number }[];
};

type PlanFormData = {
  name: string;
  key: string;
  subtitle: string;
  price: string;
  currency: string;
  billingInterval: string;
  badgeText: string;
  badgeType: string;
  theme: string;
  sortOrder: string;
  isActive: boolean;
  features: { text: string; sortOrder: number }[];
};

const emptyPlan: PlanFormData = {
  name: "",
  key: "",
  subtitle: "",
  price: "",
  currency: "INR",
  billingInterval: "monthly",
  badgeText: "",
  badgeType: "",
  theme: "",
  sortOrder: "0",
  isActive: true,
  features: [],
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(emptyPlan);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const response = await api.get("/api/v1/admin/plans");
      const plansData = Array.isArray(response.data?.data) ? response.data.data : [];
      setPlans(plansData);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(emptyPlan);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      key: plan.key,
      subtitle: plan.subtitle || "",
      price: String(plan.price),
      currency: plan.currency,
      billingInterval: plan.billingInterval,
      badgeText: plan.badgeText || "",
      badgeType: plan.badgeType || "",
      theme: plan.theme || "",
      sortOrder: String(plan.sortOrder),
      isActive: plan.isActive,
      features: (plan.features || []).map((f) => ({
        text: f.text,
        sortOrder: f.sortOrder ?? 0,
      })),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price, 10),
        sortOrder: parseInt(formData.sortOrder, 10) || 0,
        features: formData.features,
      };

      if (editingPlan) {
        await api.put(`/api/v1/admin/plans/${editingPlan.id}`, payload);
      } else {
        await api.post("/api/v1/admin/plans", payload);
      }

      setIsModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      alert(err.message || "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      await api.patch(`/api/v1/admin/plans/${plan.id}/status`, { isActive: !plan.isActive });
      fetchPlans();
    } catch (err: any) {
      alert(err.message || "Failed to update plan status");
    }
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { text: "", sortOrder: formData.features.length }],
    });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, field: "text" | "sortOrder", value: string | number) => {
    setFormData({
      ...formData,
      features: formData.features.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    });
  };

  if (loading) {
    return <div className="p-6">Loading plans...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Plans</h1>
          <p className="text-sm text-gray-500">Manage subscription plans and pricing.</p>
        </div>
        <Button onClick={openCreateModal}>Create Plan</Button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Key</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Badge</th>
              <th className="px-4 py-3 text-left font-medium">Sort</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  No plans found.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.key}</td>
                  <td className="px-4 py-3 text-gray-600">₹{plan.price}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.badgeText || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={plan.isActive ? "text-green-600" : "text-red-600"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="flex justify-end gap-2 px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(plan)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(plan)}
                    >
                      {plan.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-[100vw] overflow-y-auto lg:min-w-[90vw]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
            <DialogDescription>
              {editingPlan ? "Update the plan details." : "Fill out the details to create a new plan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Key</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Price (INR)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Billing Interval</label>
                <select
                  value={formData.billingInterval}
                  onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Theme</label>
                <select
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="">None</option>
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                  <option value="basic">Basic</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Badge Text</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Badge Type</label>
                <select
                  value={formData.badgeType}
                  onChange={(e) => setFormData({ ...formData, badgeType: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="">None</option>
                  <option value="popular">Popular</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">Features</label>
                <Button type="button" size="sm" onClick={addFeature}>
                  Add Feature
                </Button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature.text}
                    onChange={(e) => updateFeature(index, "text", e.target.value)}
                    className="flex-1 rounded-md border bg-background px-3 py-2"
                    placeholder="Feature text"
                  />
                  <input
                    type="number"
                    value={feature.sortOrder}
                    onChange={(e) => updateFeature(index, "sortOrder", parseInt(e.target.value, 10) || 0)}
                    className="w-20 rounded-md border bg-background px-3 py-2"
                    placeholder="Order"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {formData.features.length === 0 && (
                <p className="text-sm text-gray-500">No features added yet.</p>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingPlan ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
