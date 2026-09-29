import crypto from "crypto";
import { env } from "../src/config/env.js";

export function validMetaSignature(rawBody, signature) {
  if (!signature || !env.WHATSAPP_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", env.WHATSAPP_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return signature === `sha256=${expected}`;
}
