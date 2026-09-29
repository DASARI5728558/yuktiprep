import { successResponse, errorResponse } from "../src/utils/response.js";
import prisma from "../config/prisma.js";
import { listLanguages, getUserLanguagePreference, updateUserLanguagePreference } from "../services/language.service.js";
import { translateTexts } from "../services/azureTranslator.service.js";

export const getLanguages = async (req, res, next) => {
  try {
    const languages = await listLanguages();
    successResponse(res, "Languages fetched successfully", { languages });
  } catch (error) {
    next(error);
  }
};

export const getUserLanguage = async (req, res, next) => {
  try {
    const preference = await getUserLanguagePreference(req.user.id);
    successResponse(res, "Language preference fetched successfully", { preference });
  } catch (error) {
    next(error);
  }
};

export const updateUserLanguage = async (req, res, next) => {
  try {
    const { languageCode } = req.body;

    if (!languageCode) {
      return errorResponse(res, "Language code is required", [], 400);
    }

    const language = await prisma.language.findUnique({
      where: { code: languageCode },
    });

    if (!language || !language.isActive) {
      return errorResponse(res, "Invalid language", [], 400);
    }

    const preference = await updateUserLanguagePreference(req.user.id, language.id);
    successResponse(res, "Language updated successfully", { preference });
  } catch (error) {
    next(error);
  }
};

export const translateTextsController = async (req, res, next) => {
  try {
    const { texts, targetLanguageCode } = req.body;

    if (!texts || !Array.isArray(texts) || !targetLanguageCode) {
      return errorResponse(res, "texts array and targetLanguageCode are required", [], 400);
    }

    const translatedTexts = await translateTexts(texts, targetLanguageCode);
    successResponse(res, "Texts translated successfully", { translatedTexts });
  } catch (error) {
    next(error);
  }
};
