import prisma from "../config/prisma.js";

export const listLanguages = async () => {
  return prisma.language.findMany({
    where: { isActive: true },
    orderBy: { englishName: "asc" },
  });
};

export const getUserLanguagePreference = async (userId) => {
  const preference = await prisma.userLanguagePreference.findUnique({
    where: { userId },
    include: { language: true },
  });

  return preference;
};

export const updateUserLanguagePreference = async (userId, languageId) => {
  const language = await prisma.language.findUnique({
    where: { id: languageId },
  });

  if (!language || !language.isActive) {
    throw new Error("Invalid language");
  }

  const preference = await prisma.userLanguagePreference.upsert({
    where: { userId },
    update: { languageId },
    create: { userId, languageId },
    include: { language: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { language: language.code },
  });

  return preference;
};
