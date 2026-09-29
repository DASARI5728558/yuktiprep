import prisma from "../../config/prisma.js";
import { env } from "../../src/config/env.js";
import { successResponse, errorResponse } from "../../src/utils/response.js";
import crypto from "crypto";
import axios from "axios";

// Helper function to send WhatsApp text message
const sendWhatsAppMessage = async (to, text) => {
  try {
    const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to send WA message:",
      error?.response?.data || error.message,
    );
  }
};

const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (!signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return signature === expected;
};

export const whatsAppEventsWebhook = async (req, res, next) => {
  try {
    const signature =
      req.headers["x-backend-signature-256"] ||
      req.headers["x-webhook-signature"];
    const rawBody = req.body?.toString() || "";
    const secret = env.WHATSAPP_WEBHOOK_SECRET;

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return errorResponse(res, "Invalid webhook signature", [], 400);
    }

    const event = JSON.parse(rawBody);

    if (!event || !event.event) {
      return successResponse(res, "Webhook received");
    }

    const eventType = event.event;
    const waId = event.waId;
    const userId = event.userId;
    const contactId = event.contactId;

    if (!waId) {
      return successResponse(res, "Webhook received");
    }

    let conversation = await prisma.whatsAppConversation.findUnique({
      where: { waId },
    });

    const context = {
      ...(conversation?.context || {}),
      ...(contactId ? { contactId } : {}),
    };

    if (!conversation) {
      conversation = await prisma.whatsAppConversation.create({
        data: {
          waId,
          userId: userId || null,
          state: "NEW",
          humanHandoff: false,
          context,
        },
      });
    } else if (userId && conversation.userId !== userId) {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { userId, context },
      });
    } else if (contactId && conversation.context?.contactId !== contactId) {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { context },
      });
    }

    if (eventType === "message.inbound" || eventType === "message.outbound") {
      const message = event.message || {};
      let nextState = message.state || conversation.state;
      let nextContext = { ...context };

      // Save the original inbound/outbound message first
      await prisma.whatsAppMessage.create({
        data: {
          conversationId: conversation.id,
          userId: userId || null,
          providerMessageId: message.id || null,
          direction: eventType === "message.inbound" ? "INBOUND" : "OUTBOUND",
          type: message.type || "text",
          body: message.body || null,
          status: message.status || "SENT",
          payload: event,
        },
      });

      // Process inbound conversational logic for name capture
      if (
        eventType === "message.inbound" &&
        message.type === "text" &&
        message.body &&
        !conversation.humanHandoff
      ) {
        const text = message.body.trim();
        const lowerText = text.toLowerCase();

        if (nextState === "AWAITING_NAME") {
          // Capture the name
          const capturedName = text;
          nextContext.name = capturedName;
          nextState = "MAIN_MENU";

          // Upsert User in DB
          await prisma.user.upsert({
            where: { phoneNumber: waId },
            update: { name: capturedName },
            create: {
              phoneNumber: waId,
              name: capturedName,
              isVerified: false,
            },
          });

          // Send confirmation
          const replyText = `Thank you, ${capturedName}! How can we help you today?`;
          await sendWhatsAppMessage(waId, replyText);

          // Log our automated reply in DB
          await prisma.whatsAppMessage.create({
            data: {
              conversationId: conversation.id,
              direction: "OUTBOUND",
              type: "text",
              body: replyText,
              status: "SENT",
            },
          });
        } else if (
          !nextContext.name &&
          (nextState === "NEW" || lowerText === "hi" || lowerText === "hello")
        ) {
          // Ask for name
          nextState = "AWAITING_NAME";

          const replyText = "Welcome to YuktiPrep! May I know your name?";
          await sendWhatsAppMessage(waId, replyText);

          // Log our automated reply in DB
          await prisma.whatsAppMessage.create({
            data: {
              conversationId: conversation.id,
              direction: "OUTBOUND",
              type: "text",
              body: replyText,
              status: "SENT",
            },
          });
        }
      }

      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: {
          state: nextState,
          context: nextContext,
          lastInboundAt:
            eventType === "message.inbound"
              ? new Date()
              : conversation.lastInboundAt,
        },
      });
    } else if (eventType === "message.status") {
      const message = event.message || {};
      const messageId = message?.id;
      if (messageId) {
        await prisma.whatsAppMessage.updateMany({
          where: {
            providerMessageId: messageId,
            conversationId: conversation.id,
          },
          data: { status: event.status || "SENT" },
        });
      }
    } else if (eventType === "conversation.handoff") {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { humanHandoff: true, state: "HUMAN_HANDOFF" },
      });
    } else if (eventType === "conversation.release") {
      await prisma.whatsAppConversation.update({
        where: { id: conversation.id },
        data: { humanHandoff: false, state: "MAIN_MENU" },
      });
    }

    successResponse(res, "Webhook processed successfully");
  } catch (error) {
    console.error("WhatsApp webhook processing error:", error);
    next(error);
  }
};
