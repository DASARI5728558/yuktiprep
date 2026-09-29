"use client";

import { useState } from "react";
import { useSeoPages, useCreateSeoPage, useUpdateSeoPage, useDeleteSeoPage } from "@/hooks/useSeoPages";
import { SeoPage } from "@/hooks/useSeoPages";

export default function SeoPagesPage() {
  const { data: pages = [], isLoading, isError } = useSeoPages();
  const createPage = useCreateSeoPage();
  const updatePage = useUpdateSeoPage();
  const deletePage = useDeleteSeoPage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);
  const [formData, setFormData] = useState({
    pageType: "",
    title: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    robotsIndex: true,
    robotsFollow: true,
    schemaType: "",
    status: "DRAFT" as SeoPage["status"],
  });

  const openCreateModal = () => {
    setEditingPage(null);
    setFormData({
      pageType: "",
      title: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      robotsIndex: true,
      robotsFollow: true,
      schemaType: "",
      status: "DRAFT",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (page: SeoPage) => {
    setEditingPage(page);
    setFormData({
      pageType: page.pageType,
      title: page.title,
      content: page.content || "",
      seoTitle: page.seoTitle || "",
      seoDescription: page.seoDescription || "",
      canonicalUrl: page.canonicalUrl || "",
      ogTitle: page.ogTitle || "",
      ogDescription: page.ogDescription || "",
      ogImage: page.ogImage || "",
      robotsIndex: page.robotsIndex,
      robotsFollow: page.robotsFollow,
      schemaType: page.schemaType || "",
      status: page.status as SeoPage["status"],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPage) {
      updatePage.mutate({ id: editingPage.id, data: formData });
    } else {
      createPage.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this SEO page?")) {
      deletePage.mutate(id);
    }
  };

  if (isLoading) return <div className="p-6">Loading SEO pages...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load SEO pages.</div>;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200  p-2 md:p-10 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">SEO Pages</h1>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create SEO Page
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Title</th>
                <th className="text-left py-2 px-4">Type</th>
                <th className="text-left py-2 px-4">Slug</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b">
                  <td className="py-2 px-4">{page.title}</td>
                  <td className="py-2 px-4">{page.pageType}</td>
                  <td className="py-2 px-4">{page.slug}</td>
                  <td className="py-2 px-4">{page.status}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(page)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">{editingPage ? "Edit SEO Page" : "Create SEO Page"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Page Type</label>
                  <input
                    type="text"
                    value={formData.pageType}
                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SeoPage["status"] })}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">Review</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-md border px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-black px-4 py-2 text-white"
                  >
                    {editingPage ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
