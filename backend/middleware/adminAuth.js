import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const adminAuth = async (req, res, next) => {
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
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    );

    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Admin user no longer exists" });
    }

    if (!admin.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Admin account is disabled" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }
};
