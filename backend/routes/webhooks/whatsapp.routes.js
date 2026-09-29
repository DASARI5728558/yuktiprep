import express from "express";
import { validMetaSignature } from "../../lib/validators.js";
import { env } from "../../src/config/env.js";
import prisma from "../../config/prisma.js";
import axios from "axios";

const router = express.Router();

router.get("/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    typeof token === "string" &&
    token === env.WA_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

router.post(
  "/whatsapp",
  express.raw({
    type: "application/json",
    limit: "1mb",
  }),
  async (req, res) => {
    const raw = req.body;
    const signature = req.headers["x-hub-signature-256"];

    // 1. Verify Meta signature
    if (
      !validMetaSignature(raw, signature) &&
      process.env.NODE_ENV !== "development"
    ) {
      return res.sendStatus(401);
    }

    // 2. Parse JSON
    let body;

    try {
      body = JSON.parse(raw.toString("utf8"));
    } catch (error) {
      console.error("Invalid WhatsApp webhook JSON:", error);
      return res.sendStatus(400);
    }

    // 3. Respond to Meta immediately
    res.sendStatus(200);

    // 4. Process the webhook separately
    try {
      await processWhatsAppWebhook(body);
    } catch (error) {
      console.error("WhatsApp webhook processing failed:", error);
    }
  },
);

async function processWhatsAppWebhook(body) {
  const entries = body.entry || [];

  for (const entry of entries) {
    for (const change of entry.changes || []) {
      if (!change.value) continue;

      const value = change.value;

      if (value.messages) {
        for (const msg of value.messages) {
          const waId = msg.from;

          const text = msg.text?.body || "";

          const contactName = value.contacts?.[0]?.profile?.name;

          let conversation = await prisma.whatsAppConversation.findUnique({
            where: {
              waId,
            },
          });

          if (!conversation) {
            conversation = await prisma.whatsAppConversation.create({
              data: {
                waId,
                userId: null,
                state: "NEW",
                humanHandoff: false,
                context: contactName ? { contactName } : {},
              },
            });
          }

          await prisma.whatsAppMessage.create({
            data: {
              conversationId: conversation.id,
              userId: null,
              providerMessageId: msg.id,
              direction: "INBOUND",
              type: msg.type || "text",
              body: text,
              status: "SENT",
              payload: msg,
            },
          });

          await prisma.whatsAppConversation.update({
            where: {
              id: conversation.id,
            },
            data: {
              lastInboundAt: new Date(),
            },
          });

          if (text) {
            await handleBotReply(waId, text, conversation);
          }
        }
      }

      if (value.statuses) {
        for (const status of value.statuses) {
          await prisma.whatsAppMessage.updateMany({
            where: {
              providerMessageId: status.id,
            },
            data: {
              status: String(status.status).toUpperCase(),
            },
          });
        }
      }
    }
  }
}

async function sendWhatsAppMessage(to, textBody, conversationId) {
  try {
    const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { preview_url: false, body: textBody },
      },
      {
        headers: {
          Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (conversationId) {
      await prisma.whatsAppMessage.create({
        data: {
          conversationId,
          userId: null,
          providerMessageId: response.data?.messages?.[0]?.id || null,
          direction: "OUTBOUND",
          type: "text",
          body: textBody,
          status: "SENT",
        },
      });
    }
  } catch (err) {
    console.error(
      "Failed to send WA message:",
      err?.response?.data || err.message,
    );
  }
}

async function sendWhatsAppInteractiveUrl(to, textBody, buttonText, buttonUrl, conversationId) {
  try {
    const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "interactive",
        interactive: {
          type: "cta_url",
          body: {
            text: textBody
          },
          action: {
            name: "cta_url",
            parameters: {
              display_text: buttonText,
              url: buttonUrl
            }
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (conversationId) {
      await prisma.whatsAppMessage.create({
        data: {
          conversationId,
          userId: null,
          providerMessageId: response.data?.messages?.[0]?.id || null,
          direction: "OUTBOUND",
          type: "interactive",
          body: textBody,
          status: "SENT",
        },
      });
    }
  } catch (err) {
    console.error(
      "Failed to send WA interactive message:",
      err?.response?.data || err.message,
    );
  }
}

async function handleBotReply(waId, text, conversation) {
  const cmd = text.trim().toUpperCase();

  // If conversation is marked for human handoff, skip bot logic
  if (conversation.humanHandoff) {
    if (cmd === "RESET") {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { humanHandoff: false, state: "MAIN_MENU" },
      });
      return sendWhatsAppMessage(
        waId,
        "Bot is back online. How can I help you today?",
        conversation.id,
      );
    }
    return;
  }

  if (["STOP", "PAUSE"].includes(cmd)) {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "OPTED_OUT" },
    });
    return sendWhatsAppMessage(
      waId,
      "Messages are paused. Reply START to resume.",
      conversation.id,
    );
  }

  if (["START", "HI", "HELLO", "MENU", "HEY"].includes(cmd)) {
    // If we don't have their confirmed name yet, ask for it
    if (!conversation.contactName) {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { state: "AWAITING_NAME" },
      });
      return sendWhatsAppMessage(
        waId,
        "Welcome to YuktiPrep! May I know your name?",
        conversation.id,
      );
    }

    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "MAIN_MENU" },
    });
    return sendWhatsAppMessage(
      waId,
      `Welcome back, ${conversation.contactName}! I'm your automated assistant. I can help with courses, mock tests, or demos.\n\nReply EXPLORE_COURSES to begin, or HUMAN to talk to a counselor.`,
      conversation.id,
    );
  }

  const state = conversation.state || "NEW";

  if (state === "AWAITING_NAME") {
    const capturedName = text.trim();

    // Upsert into WhatsAppLead instead of main User table
    await prisma.whatsAppLead.upsert({
      where: { phoneNumber: waId },
      update: { name: capturedName },
      create: { phoneNumber: waId, name: capturedName },
    });

    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        state: "MAIN_MENU",
        contactName: capturedName,
      },
    });

    return sendWhatsAppMessage(
      waId,
      `Thank you, ${capturedName}! I'm your automated assistant. I can help with courses, mock tests, or demos.\n\nReply EXPLORE_COURSES to begin, or HUMAN to talk to a counselor.`,
      conversation.id,
    );
  }

  if (["HUMAN", "AGENT", "COUNSELLOR", "TALK_TO_COUNSELLOR"].includes(cmd)) {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "HUMAN_HANDOFF", humanHandoff: true },
    });
    return sendWhatsAppMessage(
      waId,
      "I’m connecting you with a YuktiPrep counsellor. Expected response: within 30 minutes.\n\nThe bot is now paused while the agent handles your conversation.",
      conversation.id,
    );
  }

  if (cmd === "EXPLORE_COURSES") {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "PROFILE_EXAM" },
    });
    return sendWhatsAppMessage(
      waId,
      "Which examination are you preparing for? Example: UPSC, SSC, Banking, CTET or AP DSC.",
      conversation.id,
    );
  }

  if (state === "PROFILE_EXAM") {
    const context =
      typeof conversation.context === "object" ? conversation.context : {};
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "PROFILE_YEAR", context: { ...context, exam: text } },
    });
    return sendWhatsAppMessage(
      waId,
      "What is your target examination year? Example: 2027",
      conversation.id,
    );
  }

  if (state === "PROFILE_YEAR") {
    const context =
      typeof conversation.context === "object" ? conversation.context : {};
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: {
        state: "COURSE_RECOMMENDATION",
        context: { ...context, year: text },
      },
    });
    const exam = context.exam || "your chosen";
    return sendWhatsAppMessage(
      waId,
      `Based on your ${exam} ${text} goal, we recommend a YuktiPrep Foundation plan, guided practice, and mock-test series.\n\nReply DEMO for a free demo or HUMAN for counselling.`,
      conversation.id,
    );
  }

  if (["BOOK_DEMO", "DEMO"].includes(cmd)) {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "DEMO_BOOKING" },
    });
    return sendWhatsAppMessage(
      waId,
      "Your demo interest is recorded. Reply with a preferred date, time and language; a counsellor will confirm availability.",
      conversation.id,
    );
  }

  if (state === "DEMO_BOOKING") {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "HUMAN_HANDOFF", humanHandoff: true },
    });
    return sendWhatsAppInteractiveUrl(
      waId,
      `Thank you! We have noted your preference: "${text}".\n\nA counsellor will review this and contact you shortly to confirm. The bot is now paused while the agent handles your request.`,
      "Visit Website",
      "https://yuktiprep.com",
      conversation.id,
    );
  }

  if (["FREE_DIAGNOSTIC", "DIAGNOSTIC"].includes(cmd)) {
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "DIAGNOSTIC_ACTIVE" },
    });
    return sendWhatsAppMessage(
      waId,
      "Your free diagnostic is ready. Reply START TEST to begin.",
      conversation.id,
    );
  }

  // Fallback if not matching any flow
  if (state !== "NEW") {
    return sendWhatsAppMessage(
      waId,
      "I could not understand that. Please choose an option, rephrase, or reply HUMAN for a counsellor.",
      conversation.id,
    );
  } else {
    // Treat any random first message as a greeting
    await prisma.whatsAppConversation.update({
      where: { id: conversation.id },
      data: { state: "MAIN_MENU" },
    });
    return sendWhatsAppMessage(
      waId,
      "Welcome to YuktiPrep! I'm your automated preparation assistant.\n\nReply EXPLORE_COURSES to find courses, or HUMAN anytime to talk to a counselor.",
      conversation.id,
    );
  }
}

export default router;
