import { env } from "../src/config/env.js";

export const sendSms = async (phone, otp) => {
  const encodedBody = encodeURIComponent(
    `Your YuktiPrep login OTP is ${otp}. Valid for 10 minutes. Do not share it.\nASPERION DIGITAL TECHNOLOGIES (OPC) PRIVATE LIMITED.`
  );
  const url = `https://sms-apidoc.appantech.com/api/sendSms?key=${encodeURIComponent(env.SMS_API_KEY)}&to=${encodeURIComponent(phone)}&templateid=${encodeURIComponent(env.SMS_TEMPLATE_ID || "TE7724YVU7")}&body=${encodedBody}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const text = await response.text();
    console.log(`SMS provider response for ${phone}: ${text}`);
    if (!response.ok) {
      throw new Error(`SMS provider error: ${response.status} ${text}`);
    }
    return true;
  } catch (error) {
    console.error("SMS send failed:", error.message);
    throw new Error("Failed to send OTP SMS");
  }
};
