import { Router } from "express";
import { env } from "../../src/config/env.js";

const router = Router();

const internal = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!env.WHATSAPP_INTERNAL_API_KEY || token !== env.WHATSAPP_INTERNAL_API_KEY) {
    return res.sendStatus(401);
  }
  next();
};

router.post("/conversations/:contactId/handoff", internal, async (req, res) => {
  res.sendStatus(204);
});

router.post("/conversations/:contactId/release", internal, async (req, res) => {
  res.sendStatus(204);
});

export default router;
