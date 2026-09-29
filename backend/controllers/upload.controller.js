import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { successResponse, errorResponse } from "../src/utils/response.js";
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

// Initialize the S3 Client for Utho
const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

export const uploadFile = async (req, res, next) => {
  try {
    const file = req.file;

    if (!file) {
      return errorResponse(res, "No file uploaded", [], 400);
    }

    const targetBucket = bucketName;
    if (!targetBucket) {
      return errorResponse(res, "Utho bucket is not configured", [], 500);
    }

    // Generate a unique file name
    const ext = path.extname(file.originalname);
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const filename = `uploads/${uniqueId}${ext}`;

    // Prepare S3 upload parameters
    const uploadParams = {
      Bucket: targetBucket,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      // This is the CRITICAL part for forcing the browser to download instead of preview
      ContentDisposition: `attachment; filename="${file.originalname}"`,
    };

    // Upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the public URL
    const cleanEndpoint = endpoint.replace(/\/$/, "");
    const fileUrl = `${cleanEndpoint}/${targetBucket}/${filename}`;

    successResponse(res, "File uploaded successfully", { url: fileUrl }, {}, 201);
  } catch (error) {
    console.error("AWS S3 Upload Error:", error);
    next(error);
  }
};

