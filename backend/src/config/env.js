import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  ADMIN_FRONTEND_URL: process.env.ADMIN_FRONTEND_URL || "http://localhost:5000",
  APP_FRONTEND_URL: process.env.APP_FRONTEND_URL || "http://localhost:5001",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  AI_PROVIDER: process.env.AI_PROVIDER || "openai",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  SMS_API_URL:
    process.env.SMS_API_URL || "https://sms-apidoc.appantech.com/api/sendSms",
  SMS_API_KEY: process.env.SMS_API_KEY || "",
  SMS_TEMPLATE_ID: process.env.SMS_TEMPLATE_ID || "TE7724YVU7",
  WHATSAPP_WEBHOOK_SECRET: process.env.WHATSAPP_WEBHOOK_SECRET || "",
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || "http://localhost:3000",
  WHATSAPP_INTERNAL_API_KEY: process.env.WHATSAPP_INTERNAL_API_KEY || "",
  WHATSAPP_DEFAULT_TEMPLATE_LANGUAGE:
    process.env.WHATSAPP_DEFAULT_TEMPLATE_LANGUAGE || "en_US",
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_GRAPH_VERSION: process.env.WHATSAPP_GRAPH_VERSION || "v23.0",
  WA_VERIFY_TOKEN: process.env.WA_VERIFY_TOKEN || "",
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN || "",
  META_APP_SECRET: process.env.META_APP_SECRET || "",
  META_PHONE_NUMBER_ID: process.env.META_PHONE_NUMBER_ID || "",
};
