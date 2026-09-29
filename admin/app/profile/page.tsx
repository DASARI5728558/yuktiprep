"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminMe, useUpdateAdminProfile, useUploadAdminPhoto } from "@/hooks/useAdminAuth";
import { Camera, Loader2 } from "lucide-react";

export default function AdminProfilePage() {
  const { data: admin, isLoading } = useAdminMe();
  const updateProfile = useUpdateAdminProfile();
  const uploadPhoto = useUploadAdminPhoto();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
      });
      if (admin.profilePic) {
        setProfilePicPreview(admin.profilePic);
      }
    }
  }, [admin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload instantly
      try {
        await uploadPhoto.mutateAsync(file);
      } catch (err) {
        console.error("Failed to upload photo:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile picture.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Update your avatar that appears in the sidebar and dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-3xl font-bold text-blue-800 shadow-sm border border-gray-200">
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{admin?.name?.charAt(0)?.toUpperCase() || "A"}</span>
              )}

              {uploadPhoto.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Button
                  variant="outline"
                  type="button"
                  className="gap-2"
                  disabled={uploadPhoto.isPending}
                >
                  <Camera className="h-4 w-4" />
                  Upload Photo
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleFileChange}
                  disabled={uploadPhoto.isPending}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or WEBP. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@yuktiprep.com"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={updateProfile.isPending || !formData.name || !formData.email}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
