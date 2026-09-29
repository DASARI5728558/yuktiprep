import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_VALIDITY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const verifyOtpHash = (plainOtp, storedHash) => {
  return hashOtp(plainOtp) === storedHash;
};

export const normalizePhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return phone;
};

export const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_VALIDITY_MINUTES * 60 * 1000);
};

export const isOtpExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

export const canResendOtp = (createdAt) => {
  const cooldown = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000);
  return new Date(createdAt) < cooldown;
};

export const getOtpTtl = () => {
  return OTP_VALIDITY_MINUTES * 60;
};

export const getMaxAttempts = () => MAX_ATTEMPTS;
