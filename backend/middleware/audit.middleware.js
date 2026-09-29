import prisma from "../config/prisma.js";
import { createAuditLog } from "../services/auth.service.js";

export const audit = (entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const originalStatus = res.status.bind(res);

    let statusCode = 200;
    let responseData = null;

    res.status = function (code) {
      statusCode = code;
      return originalStatus.call(this, code);
    };

    res.json = function (data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.send = function (body) {
      responseData = body;
      return originalSend.call(this, body);
    };

    res.on("finish", async () => {
      if (statusCode >= 200 && statusCode < 300 && req.admin) {
        const actionMap = {
          POST: "CREATE",
          PATCH: "UPDATE",
          DELETE: "DELETE",
        };
        const action = actionMap[req.method] || req.method;

        await createAuditLog({
          adminUserId: req.admin.id,
          action,
          entityType,
          entityId: req.params.id || null,
          newData: responseData?.data || null,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get("user-agent"),
        }).catch(() => {});
      }
    });

    next();
  };
};
