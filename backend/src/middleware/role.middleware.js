import prisma from "../../config/prisma.js";

const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "CONTENT_MANAGER"];

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(req);
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.admin.role;
    if (!ALLOWED_ROLES.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: invalid role",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const rolePermissions = {
      SUPER_ADMIN: ["*"],
      ADMIN: [
        "manage_exams",
        "manage_subjects",
        "manage_topics",
        "manage_syllabus",
        "manage_pyqs",
        "manage_current_affairs",
        "manage_seo_pages",
      ],
      EDITOR: [
        "create_content",
        "edit_content",
        "review_content",
        "publish_content",
      ],
      CONTENT_MANAGER: [
        "manage_syllabus",
        "manage_pyqs",
        "manage_current_affairs",
      ],
    };

    const permissions = rolePermissions[req.admin.role] || [];
    const hasPermission =
      permissions.includes("*") || permissions.includes(permission);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

export const requiredUser = (...allowedRoles) => {
  const normalizedAllowed = new Set(
    allowedRoles.map((role) => role.toLowerCase()),
  );

  return (req, res, next) => {
    const role = req.admin?.role || req.user?.role;

    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!normalizedAllowed.has(role.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};
