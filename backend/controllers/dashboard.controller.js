import { successResponse } from "../src/utils/response.js";
import prisma from "../config/prisma.js";

export const getWelcomeData = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        learnerProfile: {
          select: {
            targetExamId: true,
            attemptYear: true,
            studyHoursPerDay: true,
            preferredLanguage: true,
            targetExam: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return successResponse(res, "User not found", null, {}, 404);
    }

    const hour = new Date().getHours();
    let greeting = "Good Morning!";
    if (hour >= 12 && hour < 17) greeting = "Good Afternoon!";
    if (hour >= 17) greeting = "Good Evening!";

    const firstName = user.name?.split(" ")[0] || "Student";
    const targetExam = user.learnerProfile?.targetExam?.name || "UPSC Prelims 2025";

    successResponse(res, "Welcome data fetched successfully", {
      greeting,
      firstName,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      targetExam,
    });
  } catch (error) {
    console.error("Error fetching welcome data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch welcome data",
    });
  }
};
