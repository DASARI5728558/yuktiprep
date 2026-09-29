import { api } from "./api";

export type LoginPayload = {
  phone: string;
};

export type VerifyLoginPayload = {
  phone: string;
  otp: string;
};

export type RegisterPayload = {
  phone: string;
  name: string;
  email: string;
};

export type VerifyRegisterPayload = {
  phone: string;
  otp: string;
  email: string;
  name: string;
  targetExamId?: string;
  attemptYear?: number;
  studyHoursPerDay?: number;
  preferredLanguage?: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      phoneNumber: string;
      name?: string;
      isVerified: boolean;
      role?: string;
      language?: string;
      state?: string;
      difficulty?: string;
      timezone?: string;
      deliveryHour?: number;
      channels?: string[];
      active?: boolean;
      createdAt?: string;
      updatedAt?: string;
      learnerProfile?: {
        id: string;
        userId: string;
        targetExamId?: string;
        attemptYear?: number;
        studyHoursPerDay?: number;
        preferredLanguage?: string;
        createdAt?: string;
        updatedAt?: string;
      };
    };
  };
};

export const authApi = {
  requestLoginOTP: (payload: LoginPayload) =>
    api.post("/api/v1/auth/login/send-otp", payload),

  verifyLoginOTP: (payload: VerifyLoginPayload) =>
    api.post("/api/v1/auth/login/verify-otp", payload),

  requestRegisterOTP: (payload: RegisterPayload) =>
    api.post("/api/v1/auth/register/send-otp", payload),

  verifyRegisterOTP: (payload: VerifyRegisterPayload) =>
    api.post("/api/v1/auth/register/verify-otp", payload),
};
