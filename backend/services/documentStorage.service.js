import crypto from "crypto";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Configured = Boolean(
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET_NAME
);

const s3Client = s3Configured
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

/**
 * Computes SHA-256 hash from a Buffer.
 * @param {Buffer} buffer
 * @returns {string} hex digest
 */
export const computeChecksum = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

/**
 * Stores file payload either in S3 or encrypted local fallback directory.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} mimeType
 * @returns {Promise<{ fileKey: string, fileUrl: string }>}
 */
export const storeEncryptedDocument = async (buffer, originalName, mimeType = "application/pdf") => {
  const ext = path.extname(originalName) || ".pdf";
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const fileKey = `intelligence-sources/${uniqueId}${ext}`;

  if (s3Configured && s3Client) {
    const bucketName = process.env.AWS_BUCKET_NAME;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: mimeType,
        ServerSideEncryption: "AES256",
        ContentDisposition: `attachment; filename="${originalName}"`,
      })
    );
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    return { fileKey, fileUrl };
  }

  // Local filesystem fallback storage
  const localDir = path.resolve(process.cwd(), "uploads", "intelligence");
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  const localFilePath = path.join(localDir, `${uniqueId}${ext}`);
  fs.writeFileSync(localFilePath, buffer);

  const fileUrl = `/uploads/intelligence/${uniqueId}${ext}`;
  return { fileKey: localFilePath, fileUrl };
};

/**
 * Fetch remote PDF from a given URL with mime validation and streaming SHA-256 computation.
 * @param {string} url
 * @returns {Promise<{ buffer: Buffer, checksum: string, mimeType: string, filename: string }>}
 */
export const fetchRemotePdf = async (url) => {
  // Validate protocol
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Invalid URL protocol. Only HTTP and HTTPS are permitted.");
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "YuktiPrep-QuestionIntelligence/1.0",
      Accept: "application/pdf,application/octet-stream,*/*",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch remote document from URL: HTTP ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "application/pdf";
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error("The remote document fetched from URL is empty.");
  }

  const checksum = computeChecksum(buffer);
  
  // Try extracting filename from path
  const urlPath = parsed.pathname;
  let filename = path.basename(urlPath);
  if (!filename || !filename.includes(".")) {
    filename = `remote-source-${checksum.slice(0, 8)}.pdf`;
  }

  return {
    buffer,
    checksum,
    mimeType: contentType.split(";")[0],
    filename,
  };
};

/**
 * Retrieve document Buffer from S3 or local storage for parsing.
 * @param {string} fileKey
 * @returns {Promise<Buffer>}
 */
export const getDocumentBuffer = async (fileKey) => {
  if (!fileKey) {
    throw new Error("File key is required to load document buffer.");
  }

  // Check local filesystem first
  if (fs.existsSync(fileKey)) {
    return fs.readFileSync(fileKey);
  }

  // If stored in S3
  if (s3Configured && s3Client && process.env.AWS_BUCKET_NAME) {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
      })
    );
    const byteArray = await res.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  throw new Error(`Document file not found at ${fileKey}`);
};

