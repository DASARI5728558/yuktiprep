"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { UploadCloud, Loader2 } from "lucide-react";

import {
  useExams,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
  Exam,
} from "@/hooks/useExams";

import RichTextEditor from "@/components/rich-text-editor";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function ExamsPage() {
  const { data: exams = [], isLoading, isError } = useExams();

  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingExam, setEditingExam] = useState<Exam | null>(
    null
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [examToDelete, setExamToDelete] = useState<string | null>(
    null
  );

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await api.post("/api/v1/admin/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success && response.data?.data?.url) {
        setFormData((prev) => ({
          ...prev,
          logoUrl: response.data.data.url,
        }));
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Make sure AWS is configured.");
    } finally {
      setIsUploadingLogo(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    logoUrl: "",
    isActive: true,
    isPublished: false,
    sortOrder: 0,
  });

  const openCreateModal = () => {
    setEditingExam(null);

    setFormData({
      name: "",
      shortDescription: "",
      description: "",
      logoUrl: "",
      isActive: true,
      isPublished: false,
      sortOrder: 0,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);

    setFormData({
      name: exam.name,
      shortDescription: exam.shortDescription || "",
      description: exam.description || "",
      logoUrl: exam.logoUrl || "",
      isActive: exam.isActive,
      isPublished: exam.isPublished,
      sortOrder: exam.sortOrder,
    });

    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingExam) {
      updateExam.mutate({
        id: editingExam.id,
        data: formData,
      });
    } else {
      createExam.mutate(formData);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setExamToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (examToDelete) {
      deleteExam.mutate(examToDelete);

      setIsDeleteModalOpen(false);
      setExamToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExamToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        Loading exams...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600">
        Failed to load exams.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <Card className="w-full shadow-sm">
        {/* CARD HEADER */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl">
              Exams
            </CardTitle>

            <CardDescription>
              Manage your exams and their details.
            </CardDescription>
          </div>

          <Button onClick={openCreateModal}>
            Create Exam
          </Button>
        </CardHeader>

        {/* CARD CONTENT */}
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">
                    Name
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Slug
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Published
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No exams found.
                    </td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {exam.name}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {exam.slug}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            exam.isActive
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {exam.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {exam.isPublished
                          ? "Yes"
                          : "No"}
                      </td>

                      <td className="flex gap-2 px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEditModal(exam)
                          }
                        >
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDelete(exam.id)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <DialogContent className="max-h-[90vh] max-w-[100vw] overflow-y-auto lg:min-w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              {editingExam
                ? "Edit Exam"
                : "Create Exam"}
            </DialogTitle>

            <DialogDescription>
              {editingExam
                ? "Update the details for this exam."
                : "Fill out the details to create a new exam."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="mt-2 space-y-4"
          >
            {/* NAME */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Name
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2"
                required
              />
            </div>

            {/* SHORT DESCRIPTION */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Short Description
              </label>

              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shortDescription: e.target.value,
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>

              <RichTextEditor
                value={formData.description || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    description: value,
                  })
                }
              />
            </div>

            {/* LOGO URL */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Logo URL
              </label>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      logoUrl: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 flex-1"
                  placeholder="https://..."
                />

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="px-4"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadCloud className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                />

                Active
              </label>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isPublished: e.target.checked,
                    })
                  }
                />

                Published
              </label>
            </div>

            {/* FOOTER */}
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                Cancel
              </Button>

              <Button type="submit">
                {editingExam
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Confirm Deletion
            </DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this exam?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={cancelDelete}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}