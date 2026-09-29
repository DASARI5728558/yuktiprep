import axios from "axios";
import { env } from "../config/env.js";
import prisma from "../../config/prisma.js";

export async function broadcastCurrentAffairsToWhatsApp() {
  console.log("Starting WhatsApp broadcast of top current affairs...");
  
  // 1. Fetch top 3 latest current affairs
  const topItems = await prisma.item.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  if (topItems.length === 0) {
    console.log("No current affairs found to broadcast.");
    return { status: "error", detail: "No current affairs found to send." };
  }

  // 2. Format the message
  let messageText = "🌟 *Top 3 Current Affairs* 🌟\n\n";
  topItems.forEach((item, index) => {
    const summary = item.summary ? item.summary.slice(0, 150) + "..." : "";
    messageText += `${index + 1}️⃣ *${item.title}*\n${summary}\n\n`;
  });
  messageText += "Click for more current affairs like this: https://app.yuktiprep.com/current-affairs";

  // 3. Fetch logged in / active users with phone numbers
  const targetUsers = await prisma.user.findMany({
    where: {
      phoneNumber: { not: null },
      active: true,
    },
    select: { phoneNumber: true, id: true },
  });

  let successCount = 0;
  let failCount = 0;
  const url = `https://graph.facebook.com/v17.0/${env.META_PHONE_NUMBER_ID}/messages`;

  // 4. Send messages
  for (const user of targetUsers) {
    if (!user.phoneNumber) continue;

    let cleanPhone = user.phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    try {
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: { preview_url: true, body: messageText },
        },
        {
          headers: {
            Authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      successCount++;
      console.log(`Successfully sent broadcast to ${cleanPhone}`);
    } catch (err) {
      console.error(
        `Failed to send to ${cleanPhone}:`,
        err?.response?.data || err.message
      );
      failCount++;
    }

    // Small delay to avoid rate limit
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const result = {
    status: "success",
    targetedCount: targetUsers.length,
    successCount,
    failCount,
  };
  
  console.log("WhatsApp broadcast completed:", result);
  return result;
}
