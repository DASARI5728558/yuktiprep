import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import dotenv from "dotenv";

dotenv.config();

export const userAuthMiddleware = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Not authorized to access this route",
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        languagePreference: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!user) {
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.id },
      });
      if (!admin) {
        return res
          .status(401)
          .json({ success: false, message: "User no longer exists" });
      }
      req.admin = admin;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
};

export const optionalUserAuthMiddleware = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        languagePreference: {
          include: {
            language: true,
          },
        },
      },
    });

    if (!user) {
      const admin = await prisma.adminUser.findUnique({
        where: { id: decoded.id },
      });
      if (admin) {
        req.admin = admin;
      }
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    // If token invalid, proceed as guest without error
    next();
  }
};

