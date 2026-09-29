import prisma from "../config/prisma.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

const endpoint = process.env.UTHO_ENDPOINT || "https://innoida.utho.io";
const region = process.env.UTHO_ZONE || "ap-south-in-noida-1";
const accessKeyId =
  process.env.UTHO_KEY || process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey =
  process.env.UTHO_SECRET || process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName =
  process.env.UTHO_BUCKET || process.env.AWS_BUCKET_NAME || "yukit-prep";

const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

export const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      role: true,
      language: true,
      state: true,
      difficulty: true,
      timezone: true,
      deliveryHour: true,
      channels: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      profilePic: true,
      learnerProfile: {
        include: {
          targetExam: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      subscriptions: {
        where: {
          status: { not: "cancelled" }, // or "active" depending on how they want it
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateMyProfile = async (userId, data) => {
  const updateData = {
    name: data.name,
    email: data.email,
    phoneNumber: data.phoneNumber,
    language: data.language,
    state: data.state,
    difficulty: data.difficulty,
    timezone: data.timezone,
    deliveryHour: data.deliveryHour,
  };

  if (data.learnerProfile) {
    updateData.learnerProfile = {
      upsert: {
        create: {
          targetExamId: data.learnerProfile.targetExamId || null,
          attemptYear: data.learnerProfile.attemptYear ? parseInt(data.learnerProfile.attemptYear) : null,
          studyHoursPerDay: data.learnerProfile.studyHoursPerDay ? parseFloat(data.learnerProfile.studyHoursPerDay) : null,
        },
        update: {
          targetExamId: data.learnerProfile.targetExamId || null,
          attemptYear: data.learnerProfile.attemptYear ? parseInt(data.learnerProfile.attemptYear) : null,
          studyHoursPerDay: data.learnerProfile.studyHoursPerDay ? parseFloat(data.learnerProfile.studyHoursPerDay) : null,
        }
      }
    };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      role: true,
      language: true,
      state: true,
      difficulty: true,
      timezone: true,
      deliveryHour: true,
      channels: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      profilePic: true,
      learnerProfile: {
        include: {
          targetExam: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      subscriptions: {
        where: {
          status: { not: "cancelled" },
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  return updatedUser;
};

export const uploadProfilePhoto = async (userId, file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const targetBucket = bucketName;
  if (!targetBucket) {
    throw new Error("Utho bucket is not configured");
  }

  const ext = path.extname(file.originalname);
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const filename = `profiles/${userId}/${uniqueId}${ext}`;

  const uploadParams = {
    Bucket: targetBucket,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Construct Utho Path-Style URL
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const fileUrl = `${cleanEndpoint}/${targetBucket}/${filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profilePic: fileUrl },
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      role: true,
      language: true,
      state: true,
      difficulty: true,
      timezone: true,
      deliveryHour: true,
      channels: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      profilePic: true,
      learnerProfile: true,
      subscriptions: {
        where: {
          status: { not: "cancelled" },
        },
        include: {
          plan: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  return { url: fileUrl, user: updatedUser };
};
