import prisma from "../config/prisma.js";
// import { sendOTP } from "../utils/email.js";
import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../src/utils/response.js";
import * as otpService from "../services/otp.service.js";
import { sendSms } from "../services/sms.service.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// OLD EMAIL OTP FLOW - PRESERVED FOR REFERENCE
/*
export const registerWithOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", [], 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, "User already exists with this email", [], 400);
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingOtp = await prisma.otpVerification.findFirst({
      where: { email },
    });
    if (existingOtp) {
      await prisma.otpVerification.update({
        where: { id: existingOtp.id },
        data: { otpCode: otp, expiresAt, verified: false },
      });
    } else {
      await prisma.otpVerification.create({
        data: { email, otpCode: otp, expiresAt },
      });
    }

    await sendOTP(email, otp);
    successResponse(res, "OTP sent successfully to email");
  } catch (error) {
    next(error);
  }
};
*/

// Phone-based registration
export const registerSendOtp = async (req, res, next) => {
  try {
    const {
      phone,
      name,
      email,
      targetExamId,
      attemptYear,
      studyHoursPerDay,
      preferredLanguage,
    } = req.body;

    console.log(email);

    if (!phone) {
      return errorResponse(res, "Phone number is required", [], 400);
    }

    if (!email) {
      return errorResponse(res, "Email is required", [], 400);
    }

    const normalizedPhone = otpService.normalizePhone(phone);

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });
    if (existingUser) {
      return errorResponse(res, "Phone number is already registered", [], 400);
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return errorResponse(res, "Email is already registered", [], 400);
    }

    const otp = generateOTP();
    const expiresAt = otpService.getOtpExpiry();
    const otpHash = otpService.hashOtp(otp);
    console.log("otp:", otp);

    const existingOtp = await prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone, purpose: "REGISTER", verified: false },
    });

    if (existingOtp) {
      await prisma.otpVerification.update({
        where: { id: existingOtp.id },
        data: { otpHash, expiresAt, attempts: 0 },
      });
    } else {
      await prisma.otpVerification.create({
        data: {
          phone: normalizedPhone,
          purpose: "REGISTER",
          otpHash,
          expiresAt,
        },
      });
    }

    try {
      await sendSms(phone, otp);
    } catch (smsError) {
      return errorResponse(
        res,
        "Failed to send OTP. Please try again later.",
        [],
        500,
      );
    }

    successResponse(res, "OTP sent successfully");
  } catch (error) {
    next(error);
  }
};

export const registerVerifyOtp = async (req, res, next) => {
  try {
    const {
      phone,
      otp,
      email,
      name,
      targetExamId,
      attemptYear,
      studyHoursPerDay,
      preferredLanguage,
    } = req.body;

    if (!phone || !otp || !email || !name) {
      return errorResponse(
        res,
        "Phone number, email, name, and OTP are required",
        [],
        400,
      );
    }

    const normalizedPhone = otpService.normalizePhone(phone);

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone, purpose: "REGISTER", verified: false },
    });

    if (!otpRecord) {
      return errorResponse(res, "Invalid OTP", [], 400);
    }

    if (otpRecord.attempts >= otpService.getMaxAttempts()) {
      return errorResponse(
        res,
        "Too many failed attempts. Please request a new OTP.",
        [],
        400,
      );
    }

    if (otpService.isOtpExpired(otpRecord.expiresAt)) {
      return errorResponse(res, "OTP has expired", [], 400);
    }

    if (!otpService.verifyOtpHash(otp, otpRecord.otpHash)) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return errorResponse(res, "Invalid OTP", [], 400);
    }

    const isEmailAlready = await prisma.user.findFirst({
      where: { email },
    });

    if (isEmailAlready) {
      return errorResponse(res, "Email is Already Registered...", [], 400);
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true, verifiedAt: new Date() },
    });

    const user = await prisma.user.create({
      data: {
        phoneNumber: normalizedPhone,
        email,
        name,
        isVerified: true,
        learnerProfile: {
          create: {
            targetExamId,
            attemptYear: attemptYear ? parseInt(attemptYear) : undefined,
            studyHoursPerDay: studyHoursPerDay
              ? parseFloat(studyHoursPerDay)
              : undefined,
            preferredLanguage: preferredLanguage || "en",
          },
        },
      },
      include: {
        learnerProfile: true,
        subscriptions: {
          where: { status: { not: "cancelled" } },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    const token = authService.generateToken({
      id: user.id,
      phone: user.phoneNumber,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain =
      process.env.COOKIE_DOMAIN ||
      (isProduction ? ".yuktiprep.com" : undefined);

    res.cookie("token", token, {
      httpOnly: false, // allow client-side cookie reading across *.yuktiprep.com
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(
      res,
      "User registered successfully",
      { token, user },
      {},
      201,
    );
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("phoneNumber")) {
      return errorResponse(res, "Phone number is already registered", [], 400);
    }
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return errorResponse(res, "Email is already registered", [], 400);
    }
    next(error);
  }
};

// OLD EMAIL OTP FLOW - PRESERVED FOR REFERENCE
/*
export const loginWithOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, "Email is required", [], 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(
        res,
        "User not found. Please register first.",
        [],
        404,
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const existingOtp = await prisma.otpVerification.findFirst({
      where: { email },
    });
    if (existingOtp) {
      await prisma.otpVerification.update({
        where: { id: existingOtp.id },
        data: { otpCode: otp, expiresAt, verified: false },
      });
    } else {
      await prisma.otpVerification.create({
        data: { email, otpCode: otp, expiresAt },
      });
    }

    await sendOTP(email, otp);
    successResponse(res, "Login OTP sent to your email");
  } catch (error) {
    next(error);
  }
};
*/

// Phone-based login
export const loginSendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return errorResponse(res, "Phone number is required", [], 400);
    }

    const normalizedPhone = otpService.normalizePhone(phone);
    console.log(normalizedPhone);
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
    });
    if (!user) {
      return errorResponse(
        res,
        "User not found. Please register first.",
        [],
        404,
      );
    }

    const otp = generateOTP();
    const expiresAt = otpService.getOtpExpiry();
    const otpHash = otpService.hashOtp(otp);

    const existingOtp = await prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone, purpose: "LOGIN", verified: false },
    });

    if (existingOtp) {
      await prisma.otpVerification.update({
        where: { id: existingOtp.id },
        data: { otpHash, expiresAt, attempts: 0 },
      });
    } else {
      await prisma.otpVerification.create({
        data: { phone: normalizedPhone, purpose: "LOGIN", otpHash, expiresAt },
      });
    }
    console.log(otp);
    try {
      await sendSms(phone, otp);
    } catch (smsError) {
      return errorResponse(
        res,
        "Failed to send OTP. Please try again later.",
        [],
        500,
      );
    }

    successResponse(res, "Login OTP sent successfully");
  } catch (error) {
    next(error);
  }
};

export const loginVerifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return errorResponse(res, "Phone number and OTP are required", [], 400);
    }

    const normalizedPhone = otpService.normalizePhone(phone);

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { phone: normalizedPhone, purpose: "LOGIN", verified: false },
    });

    if (!otpRecord) {
      return errorResponse(res, "Invalid OTP", [], 400);
    }

    if (otpRecord.attempts >= otpService.getMaxAttempts()) {
      return errorResponse(
        res,
        "Too many failed attempts. Please request a new OTP.",
        [],
        400,
      );
    }

    if (otpService.isOtpExpired(otpRecord.expiresAt)) {
      return errorResponse(res, "OTP has expired", [], 400);
    }

    if (!otpService.verifyOtpHash(otp, otpRecord.otpHash)) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return errorResponse(res, "Invalid OTP", [], 400);
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhone },
      include: {
        learnerProfile: true,
        subscriptions: {
          where: { status: { not: "cancelled" } },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return errorResponse(res, "User not found", [], 404);
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true, verifiedAt: new Date() },
    });

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    const token = authService.generateToken({
      id: user.id,
      phone: user.phoneNumber,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain =
      process.env.COOKIE_DOMAIN ||
      (isProduction ? ".yuktiprep.com" : undefined);

    res.cookie("token", token, {
      httpOnly: false, // allow client-side cookie reading across *.yuktiprep.com
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, "Logged in successfully", { token, user });
  } catch (error) {
    next(error);
  }
};

// OLD EMAIL OTP FLOW - PRESERVED FOR REFERENCE
/*
export const verifyOTP = async (req, res, next) => {
  try {
    const {
      email,
      otp,
      phoneNumber,
      name,
      targetExamId,
      attemptYear,
      studyHoursPerDay,
      preferredLanguage,
    } = req.body;

    if (!email || !otp) {
      return errorResponse(res, "Email and OTP are required", [], 400);
    }

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email, otpCode: otp },
    });
    if (!otpRecord) {
      return errorResponse(res, "Invalid OTP", [], 400);
    }

    if (new Date() > otpRecord.expiresAt) {
      return errorResponse(res, "OTP has expired", [], 400);
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    const user = await prisma.user.create({
      data: {
        email,
        phoneNumber,
        name,
        isVerified: true,
        learnerProfile: {
          create: {
            targetExamId,
            attemptYear,
            studyHoursPerDay,
            preferredLanguage,
          },
        },
      },
      include: { learnerProfile: true, subscriptions: { where: { status: { not: "cancelled" } }, include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    });

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    const token = authService.generateToken({ id: user.id, email: user.email });

    successResponse(
      res,
      "User registered successfully",
      { token, user },
      {},
      201,
    );
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("phoneNumber")) {
      return errorResponse(res, "Phone number is already registered", [], 400);
    }
    next(error);
  }
};
*/

// OLD EMAIL OTP FLOW - PRESERVED FOR REFERENCE
/*
export const verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return errorResponse(res, "Email and OTP are required", [], 400);
    }

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email, otpCode: otp },
    });
    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return errorResponse(res, "Invalid or expired OTP", [], 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { learnerProfile: true, subscriptions: { where: { status: { not: "cancelled" } }, include: { plan: true }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!user) {
      return errorResponse(res, "User not found", [], 404);
    }

    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

    const token = authService.generateToken({ id: user.id, email: user.email });
    successResponse(res, "Logged in successfully", { token, user });
  } catch (error) {
    next(error);
  }
};
*/

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required", [], 400);
    }

    const admin = await authService.findAdminByEmail(email);
    if (!admin) {
      return errorResponse(res, "Invalid credentials", [], 401);
    }

    if (!admin.isActive) {
      return errorResponse(res, "Account is disabled", [], 403);
    }

    const isMatch = await authService.comparePassword(
      password,
      admin.passwordHash,
    );
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", [], 401);
    }

    await authService.updateLastLogin(admin.id);

    const token = authService.generateToken({ id: admin.id, role: admin.role });

    const isProduction = process.env.NODE_ENV === "production";
    const cookieDomain =
      process.env.COOKIE_DOMAIN ||
      (isProduction ? ".yuktiprep.com" : undefined);

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      ...(cookieDomain && { domain: cookieDomain }),
      maxAge: 24 * 60 * 60 * 1000,
    });

    successResponse(res, "Admin logged in successfully", {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieDomain =
    process.env.COOKIE_DOMAIN || (isProduction ? ".yuktiprep.com" : undefined);

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    ...(cookieDomain && { domain: cookieDomain }),
  });
  successResponse(res, "Admin logged out successfully");
};

export const getAdminMe = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return errorResponse(res, "Not authenticated", [], 401);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePic: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      return errorResponse(res, "Admin not found", [], 404);
    }

    successResponse(res, "Admin fetched successfully", { admin });
  } catch (error) {
    next(error);
  }
};

export const updateAdminMe = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return errorResponse(res, "Not authenticated", [], 401);
    }
    const admin = await authService.updateAdminProfile(adminId, req.body);
    successResponse(res, "Profile updated successfully", { admin });
  } catch (error) {
    next(error);
  }
};

export const uploadAdminPhoto = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return errorResponse(res, "Not authenticated", [], 401);
    }
    const result = await authService.uploadAdminPhoto(adminId, req.file);
    successResponse(
      res,
      "Profile photo uploaded successfully",
      result,
      {},
      201,
    );
  } catch (error) {
    next(error);
  }
};
