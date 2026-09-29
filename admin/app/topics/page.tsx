"use client";

import { useState } from "react";
import { useTopics, useCreateTopic, useUpdateTopic, useDeleteTopic } from "@/hooks/useTopics";
import { Topic } from "@/hooks/useTopics";
import { useSubjects } from "@/hooks/useSubjects";

export default function TopicsPage() {
  const { data: topics = [], isLoading, isError } = useTopics();
  const { data: subjects = [] } = useSubjects();
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    subjectId: "",
    name: "",
    description: "",
    isActive: true,
  });

  const openCreateModal = () => {
    setEditingTopic(null);
    setFormData({ subjectId: "", name: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      subjectId: topic.subjectId,
      name: topic.name,
      description: topic.description || "",
      isActive: topic.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTopic) {
      updateTopic.mutate({ id: editingTopic.id, data: formData });
    } else {
      createTopic.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this topic?")) {
      deleteTopic.mutate(id);
    }
  };

  if (isLoading) return <div className="p-6">Loading topics...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load topics.</div>;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200  p-2 md:p-10 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Topics</h1>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Create Topic
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Name</th>
                <th className="text-left py-2 px-4">Subject</th>
                <th className="text-left py-2 px-4">Status</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic.id} className="border-b">
                  <td className="py-2 px-4">{topic.name}</td>
                  <td className="py-2 px-4">{topic.subject?.name || "-"}</td>
                  <td className="py-2 px-4">{topic.isActive ? "Active" : "Inactive"}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(topic)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(topic.id)}
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
              <h2 className="text-xl font-bold mb-4">{editingTopic ? "Edit Topic" : "Create Topic"}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
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
                    {editingTopic ? "Update" : "Create"}
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
