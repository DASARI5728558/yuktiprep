import { env } from "../config/env.js";

/**
 * SMS Service
 * Dispatches mobile OTP text messages via AppanTech SMS Gateway
 * (Used for user mobile verification; separate from WhatsApp team alerts)
 */
export const sendSmsOtp = async (phone, otp) => {
  const apiKey = env.SMS_API_KEY || process.env.SMS_API_KEY;
  const templateId = env.SMS_TEMPLATE_ID || process.env.SMS_TEMPLATE_ID || "TE7724YVU7";

  if (!apiKey) {
    console.log(`[SMS Gateway Mock] No SMS_API_KEY set. Sent OTP ${otp} to ${phone}`);
    return { success: true, mock: true };
  }

  const encodedBody = encodeURIComponent(
    `Your YuktiPrep login OTP is ${otp}. Valid for 10 minutes. Do not share it.\nASPERION DIGITAL TECHNOLOGIES (OPC) PRIVATE LIMITED.`
  );
  const url = `https://sms-apidoc.appantech.com/api/sendSms?key=${encodeURIComponent(apiKey)}&to=${encodeURIComponent(phone)}&templateid=${encodeURIComponent(templateId)}&body=${encodedBody}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const text = await response.text();
    console.log(`SMS provider response for ${phone}: ${text}`);
    if (!response.ok) {
      throw new Error(`SMS provider error: ${response.status} ${text}`);
    }
    return { success: true, response: text };
  } catch (error) {
    console.error("SMS send failed:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendSms = sendSmsOtp;

