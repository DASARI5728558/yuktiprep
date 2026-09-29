"use client";

import { useState } from "react";
import { useSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from "@/hooks/useSubjects";
import { Subject } from "@/hooks/useSubjects";
import { useExams } from "@/hooks/useExams";

export default function SubjectsPage() {
  const { data: subjects = [], isLoading, isError } = useSubjects();
  const { data: exams = [] } = useExams();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    examId: "",
    name: "",
    description: "",
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormData({ examId: "", name: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      examId: subject.examId,
      name: subject.name,
      description: subject.description || "",
      isActive: subject.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject.mutate({ id: editingSubject.id, data: formData });
    } else {
      createSubject.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteSubject.mutate(id);
    }
  };

  if (isLoading) return <div className="p-6">Loading subjects...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load subjects.</div>;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 p-2 md:p-10 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Subjects</h1>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create Subject
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-left py-2 px-4">Exam</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} className="border-b">
                  <td className="py-2 px-4">{subject.name}</td>
                  <td className="py-2 px-4">{subject.exam?.name || "-"}</td>
                  <td className="py-2 px-4">{subject.isActive ? "Active" : "Inactive"}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(subject)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
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
              <h2 className="text-xl font-bold mb-4">{editingSubject ? "Edit Subject" : "Create Subject"}</h2>
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
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                  />
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
                    {editingSubject ? "Update" : "Create"}
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
