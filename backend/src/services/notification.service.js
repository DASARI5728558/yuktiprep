import prisma from '../../config/prisma.js';
import { sendWhatsAppTicketAlert } from './whatsapp.service.js';
import { sendEmailTicketAlert, sendUserTicketConfirmation } from './email.service.js';

/**
 * Dispatch Notifications for Created Ticket
 */
export async function notifyTicketCreated(ticket) {
  try {
    // 1. Send confirmation to user via email if email provided
    if (ticket.email) {
      sendUserTicketConfirmation(ticket.email, ticket).catch((err) => {
        console.error(`[User Confirmation Failed] ${ticket.ticketNumber}:`, err);
      });
    }

    // 2. Fetch or default support team configuration for assigned team
    let team = await prisma.supportTeam.findUnique({
      where: { teamName: ticket.assignedTeam },
    });

    if (!team) {
      const defaultEmail = process.env.DEFAULT_SUPPORT_EMAIL || 'support@yuktiprep.com';
      const defaultWhatsApp = process.env.DEFAULT_SUPPORT_WHATSAPP || '+919535065757';
      team = {
        teamName: ticket.assignedTeam,
        email: defaultEmail,
        whatsappNumber: defaultWhatsApp,
        notificationChannel: 'BOTH',
      };
    }

    const channel = team.notificationChannel || 'BOTH';

    // 3. Send Email Alert if channel is EMAIL or BOTH
    if (channel === 'EMAIL' || channel === 'BOTH') {
      if (team.email) {
        const res = await sendEmailTicketAlert(team.email, ticket);
        await prisma.notificationLog.create({
          data: {
            ticketId: ticket.id,
            channel: 'EMAIL',
            recipient: team.email,
            status: res.success ? 'SENT' : 'FAILED',
            providerMessageId: res.messageId || null,
            errorMessage: res.error || null,
            sentAt: res.success ? new Date() : null,
          },
        }).catch((e) => console.error('Failed to write email notification log:', e));
      }
    }

    // 4. Send WhatsApp Alert if channel is WHATSAPP or BOTH
    if (channel === 'WHATSAPP' || channel === 'BOTH') {
      if (team.whatsappNumber) {
        const res = await sendWhatsAppTicketAlert(team.whatsappNumber, ticket);
        await prisma.notificationLog.create({
          data: {
            ticketId: ticket.id,
            channel: 'WHATSAPP',
            recipient: team.whatsappNumber,
            status: res.success ? 'SENT' : 'FAILED',
            providerMessageId: res.providerMessageId || null,
            errorMessage: res.error ? JSON.stringify(res.error) : null,
            sentAt: res.success ? new Date() : null,
          },
        }).catch((e) => console.error('Failed to write whatsapp notification log:', e));
      }
    }
  } catch (error) {
    console.error(`[Notification Service Error] for ticket ${ticket.ticketNumber}:`, error);
  }
}
