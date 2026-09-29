import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

/**
 * Utho Cloud Object Storage Client (S3-compatible API)
 *
 * Configured according to Utho specification:
 * endpoint: "https://innoida.utho.io"
 * region: "ap-south-in-noida-1"
 * forcePathStyle: true
 */
const endpoint = process.env.UTHO_ENDPOINT || "https://innoida.utho.io";
const region = process.env.UTHO_ZONE || "ap-south-in-noida-1";
const accessKeyId = process.env.UTHO_KEY || process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey =
  process.env.UTHO_SECRET || process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName =
  process.env.UTHO_BUCKET || process.env.AWS_BUCKET_NAME || "yukit-prep";

export const s3Client = new S3Client({
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Upload support ticket attachment buffer directly to Utho Object Storage
 *
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @param {string} folder
 * @returns {Promise<{ storageKey: string, fileUrl: string }>}
 */
export async function uploadToStorage(
  buffer,
  originalName,
  mimeType = "application/pdf",
  folder = "support-tickets",
) {
  const ext = path.extname(originalName) || ".pdf";
  const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}`;
  const key = `${folder}/${uniqueId}${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: `attachment; filename="${originalName}"`,
    }),
  );

  // With forcePathStyle: true, URL format is: https://innoida.utho.io/<bucket>/<key>
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  const fileUrl = `${cleanEndpoint}/${bucketName}/${key}`;

  return {
    storageKey: fileUrl,
    fileUrl,
  };
}
