import { db } from "./lib.js";
import { config } from "./config.js";

export function registerConversationControlRoutes(app) {
  const internal = (q, r, n) => {
    const v = q.header("authorization")?.replace(/^Bearer /, "") || "";
    if (!config.INTERNAL_API_KEY || v !== config.INTERNAL_API_KEY) {
      return r.sendStatus(401);
    }
    n();
  };

  app.post(
    "/v1/conversations/:contactId/handoff",
    internal,
    async (q, r) => {
      await db.conversation.update({
        where: { contactId: q.params.contactId },
        data: { humanHandoff: true, state: "HUMAN_HANDOFF" },
      });
      r.sendStatus(204);
    }
  );

  app.post(
    "/v1/conversations/:contactId/release",
    internal,
    async (q, r) => {
      await db.conversation.update({
        where: { contactId: q.params.contactId },
        data: { humanHandoff: false, state: "MAIN_MENU" },
      });
      r.sendStatus(204);
    }
  );
}
