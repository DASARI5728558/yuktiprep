import axios from 'axios';

/**
 * WhatsApp Service
 * Dispatches ticket alerts to support receiver teams via WhatsApp API
 */
export async function sendWhatsAppTicketAlert(receiverPhone, ticket) {
  const apiUrl = process.env.WHATSAPP_API_URL || 'https://api.wa.appantech.com';
  const projectId = process.env.WHATSAPP_PROJECT_ID || '84802c62-d700-40c2-b918-c674b117a513';
  const token = process.env.WHATSAPP_API_TOKEN;

  const endpoint = `${apiUrl}/whatsapp/api/public/v1/projects/${projectId}/messages/send/text`;

  const content = `📌 New YuktiPrep Ticket [${ticket.ticketNumber}]
Team: ${ticket.assignedTeam}
Priority: ${ticket.priority}
User: ${ticket.fullName} (${ticket.mobileNumber})
Category: ${ticket.helpCategory || ticket.problemType || 'General'}
Subject: ${ticket.subject}

Please review in the YuktiPrep Support Portal.`;

  console.log(`[WhatsApp Alert] Sending ticket notification for ${ticket.ticketNumber} to ${receiverPhone}`);

  if (!token) {
    console.warn('[WhatsApp Alert] WHATSAPP_API_TOKEN is not configured. Logged alert message only.');
    return { success: false, message: 'WHATSAPP_API_TOKEN not configured' };
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        phone_number: receiverPhone,
        content: content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`[WhatsApp Alert Success] Sent ticket notification for ${ticket.ticketNumber} to ${receiverPhone} (Message ID: ${response.data?.id || response.data?.message_id || 'OK'})`);

    return {
      success: true,
      data: response.data,
      providerMessageId: response.data?.id || response.data?.message_id,
    };
  } catch (error) {
    console.error('[WhatsApp Alert Error]:', error?.response?.data || error.message);
    return {
      success: false,
      error: error?.response?.data || error.message,
    };
  }
}
