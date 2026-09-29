import crypto from "node:crypto";

const BACKEND_WEBHOOK_URL = process.env.BACKEND_WEBHOOK_URL || "";
const BACKEND_WEBHOOK_SECRET = process.env.BACKEND_WEBHOOK_SECRET || "";
const BACKEND_WEBHOOK_TIMEOUT_MS = Number(process.env.BACKEND_WEBHOOK_TIMEOUT_MS || 5000);
const BACKEND_WEBHOOK_MAX_RETRIES = Number(process.env.BACKEND_WEBHOOK_MAX_RETRIES || 3);

function sign(payload) {
  const body = JSON.stringify(payload);
  return crypto.createHmac("sha256", BACKEND_WEBHOOK_SECRET).update(body).digest("hex");
}

export async function pushToBackend(payload) {
  if (!BACKEND_WEBHOOK_URL || !BACKEND_WEBHOOK_SECRET) return;

  const body = JSON.stringify(payload);
  const signature = sign(payload);

  let lastError = null;
  for (let attempt = 1; attempt <= BACKEND_WEBHOOK_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), BACKEND_WEBHOOK_TIMEOUT_MS);

      const res = await fetch(BACKEND_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Backend-Signature-256": `sha256=${signature}`,
        },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) return;

      const text = await res.text();
      lastError = new Error(`Backend webhook responded ${res.status}: ${text}`);
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        break;
      }
    } catch (err) {
      lastError = err;
    }

    if (attempt < BACKEND_WEBHOOK_MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  console.error("[backend-webhook] push failed after retries:", lastError?.message || lastError);
}
