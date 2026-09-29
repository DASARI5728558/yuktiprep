import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "1d",
  });
};

export const findAdminByEmail = async (email) => {
  return prisma.adminUser.findUnique({ where: { email } });
};

export const updateLastLogin = async (id) => {
  return prisma.adminUser.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
};

export const createAuditLog = async (data) => {
  return prisma.auditLog.create({ data });
};

export const updateAdminProfile = async (id, data) => {
  return prisma.adminUser.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
    },
  });
};

export const uploadAdminPhoto = async (id, file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const targetBucket = bucketName;
  if (!targetBucket) {
    throw new Error("Utho bucket is not configured");
  }

  const ext = path.extname(file.originalname);
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const filename = `admin-profiles/${id}/${uniqueId}${ext}`;

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

  const updatedAdmin = await prisma.adminUser.update({
    where: { id },
    data: { profilePic: fileUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      profilePic: true,
    },
  });

  return { url: fileUrl, admin: updatedAdmin };
};
