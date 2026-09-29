import crypto from "crypto";

/**
 * Generates a stable deterministic hash identifier for an exam record.
 * This guarantees idempotent upserts and avoids duplicate records.
 */
export function generateSourceExamId(organization, examName, year = "") {
  const normOrg = (organization || "").trim().toLowerCase();
  const normName = (examName || "").trim().toLowerCase().replace(/\s+/g, " ");
  const normYear = String(year || "").trim();

  const rawKey = `${normOrg}:${normName}:${normYear}`;
  return crypto.createHash("sha256").update(rawKey).digest("hex").substring(0, 32);
}
