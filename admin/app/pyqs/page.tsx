"use client";

import { useState } from "react";
import { usePyqs, useCreatePyq, useUpdatePyq, useDeletePyq, useBulkCreatePyqs, useBulkDeletePyqs } from "@/hooks/usePyqs";
import { PYQ } from "@/hooks/usePyqs";
import { useExams } from "@/hooks/useExams";

export default function PyqsPage() {
  const { data: pyqs = [], isLoading, isError } = usePyqs();
  const { data: exams = [] } = useExams();
  const createPyq = useCreatePyq();
  const updatePyq = useUpdatePyq();
  const deletePyq = useDeletePyq();
  const bulkCreatePyqs = useBulkCreatePyqs();
  const bulkDeletePyqs = useBulkDeletePyqs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPyq, setEditingPyq] = useState<PYQ | null>(null);
  const [formData, setFormData] = useState({
    examId: "",
    subjectId: "",
    topicId: "",
    question: "",
    questionType: "MCQ",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    year: undefined as number | undefined,
    paper: "",
    difficulty: "",
    source: "",
    isPublished: false,
  });
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const openCreateModal = () => {
    setEditingPyq(null);
    setFormData({
      examId: "",
      subjectId: "",
      topicId: "",
      question: "",
      questionType: "MCQ",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      year: undefined,
      paper: "",
      difficulty: "",
      source: "",
      isPublished: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pyq: PYQ) => {
    setEditingPyq(pyq);
    setFormData({
      examId: pyq.examId,
      subjectId: pyq.subjectId || "",
      topicId: pyq.topicId || "",
      question: pyq.question,
      questionType: pyq.questionType || "MCQ",
      options: Array.isArray(pyq.options) ? (pyq.options as string[]) : ["", "", "", ""],
      correctAnswer: pyq.correctAnswer || "",
      explanation: pyq.explanation || "",
      year: pyq.year,
      paper: pyq.paper || "",
      difficulty: pyq.difficulty || "",
      source: pyq.source || "",
      isPublished: pyq.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPyq) {
      updatePyq.mutate({ id: editingPyq.id, data: formData });
    } else {
      createPyq.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this PYQ?")) {
      deletePyq.mutate(id);
    }
  };

  const handleBulkCreate = () => {
    const lines = bulkText.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return;
    const examId = prompt("Enter Exam ID for bulk PYQs:");
    if (!examId) return;
    const pyqs = lines.map((line) => ({
      examId,
      question: line,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "",
      year: new Date().getFullYear(),
      isPublished: false,
    }));
    bulkCreatePyqs.mutate({ examId, pyqs });
    setBulkModalOpen(false);
    setBulkText("");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected PYQs?`)) {
      bulkDeletePyqs.mutate(selectedIds);
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  if (isLoading) return <div className="p-6">Loading PYQs...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load PYQs.</div>;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200  p-2 md:p-10 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">PYQs</h1>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => setBulkModalOpen(true)}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Bulk Create
            </button>
            <button
              onClick={openCreateModal}
              className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Create PYQ
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(pyqs.map((p) => p.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="text-left py-2 px-4">Question</th>
                <th className="text-left py-2 px-4">Year</th>
                <th className="text-left py-2 px-4">Difficulty</th>
                <th className="text-left py-2 px-4">Published</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pyqs.map((pyq) => (
                <tr key={pyq.id} className="border-b">
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(pyq.id)}
                      onChange={() => toggleSelect(pyq.id)}
                    />
                  </td>
                  <td className="py-2 px-4 max-w-xs truncate">{pyq.question}</td>
                  <td className="py-2 px-4">{pyq.year || "-"}</td>
                  <td className="py-2 px-4">{pyq.difficulty || "-"}</td>
                  <td className="py-2 px-4">{pyq.isPublished ? "Yes" : "No"}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(pyq)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pyq.id)}
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
              <h2 className="text-xl font-bold mb-4">{editingPyq ? "Edit PYQ" : "Create PYQ"}</h2>
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
                  <label className="block text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Options (one per line)</label>
                  <textarea
                    value={formData.options.join("\n")}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value.split("\n") })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Correct Answer</label>
                  <input
                    type="text"
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year || ""}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <input
                    type="text"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
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
                    {editingPyq ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Bulk Create PYQs</h2>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Enter one question per line..."
                className="w-full rounded-md border px-3 py-2 h-64"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setBulkModalOpen(false)}
                  className="rounded-md border px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkCreate}
                  className="rounded-md bg-black px-4 py-2 text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
