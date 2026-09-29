"use client";

import { useState } from "react";
import { useSyllabus, useCreateSyllabus, useUpdateSyllabus, useDeleteSyllabus } from "@/hooks/useSyllabus";
import { Syllabus } from "@/hooks/useSyllabus";
import { useExams } from "@/hooks/useExams";
import { useSubjects } from "@/hooks/useSubjects";

export default function SyllabusPage() {
  const { data: syllabus = [], isLoading, isError } = useSyllabus();
  const { data: exams = [] } = useExams();
  const { data: subjects = [] } = useSubjects();
  const createSyllabus = useCreateSyllabus();
  const updateSyllabus = useUpdateSyllabus();
  const deleteSyllabus = useDeleteSyllabus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Syllabus | null>(null);
  const [formData, setFormData] = useState({
    examId: "",
    subjectId: "",
    title: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    status: "DRAFT" as Syllabus["status"],
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ examId: "", subjectId: "", title: "", content: "", seoTitle: "", seoDescription: "", canonicalUrl: "", status: "DRAFT" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Syllabus) => {
    setEditingItem(item);
    setFormData({
      examId: item.examId,
      subjectId: item.subjectId || "",
      title: item.title,
      content: item.content,
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
      canonicalUrl: item.canonicalUrl || "",
      status: item.status as Syllabus["status"],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateSyllabus.mutate({ id: editingItem.id, data: formData });
    } else {
      createSyllabus.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this syllabus?")) {
      deleteSyllabus.mutate(id);
    }
  };

  if (isLoading) return <div className="p-6">Loading syllabus...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load syllabus.</div>;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200  p-2 md:p-10 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Syllabus</h1>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create Syllabus
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Title</th>
                <th className="text-left py-2 px-4">Exam</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {syllabus.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-4">{item.title}</td>
                  <td className="py-2 px-4">{item.exam?.name || "-"}</td>
                  <td className="py-2 px-4">{item.status}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
              <h2 className="text-xl font-bold mb-4">{editingItem ? "Edit Syllabus" : "Create Syllabus"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Exam</label>
                  <select
                    value={formData.examId}
                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  >
                    <option value="">Select Exam</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>{exam.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Syllabus["status"] })}
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
                    {editingItem ? "Update" : "Create"}
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
