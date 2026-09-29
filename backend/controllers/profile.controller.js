import { successResponse, errorResponse } from "../src/utils/response.js";
import {
  getMyProfile as getProfile,
  updateMyProfile as updateProfile,
  uploadProfilePhoto as uploadPhoto,
} from "../services/profile.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.id);
    
    successResponse(res, "Profile fetched successfully", { user });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await updateProfile(req.user.id, req.body);
    successResponse(res, "Profile updated successfully", { user });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    const result = await uploadPhoto(req.user.id, req.file);
    successResponse(res, "Profile photo uploaded successfully", result, {}, 201);
  } catch (error) {
    next(error);
  }
};
