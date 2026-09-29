import nodemailer from "nodemailer";

let transporter = null;

export function getTransporter() {
  if (!transporter) {
    const isSecure =
      process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465";
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtpout.secureserver.net",
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Generic sendEmail utility used by cron and notification jobs
 */
export async function sendEmail({ to, subject, html, text }) {
  const fromEmail = process.env.EMAIL_FROM || "support@yuktiprep.com";

  if (!process.env.SMTP_USER) {
    console.log(
      `[Email Mock] Would send email to: ${to} | Subject: ${subject}`,
    );
    return { success: true, mock: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: fromEmail.includes("<")
        ? fromEmail
        : `"YuktiPrep Support" <${fromEmail}>`,
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Error]:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Support Team Email Alert
 */
export async function sendEmailTicketAlert(receiverEmail, ticket) {
  const fromEmail = process.env.EMAIL_FROM || "support@yuktiprep.com";
  const logoUrl = "https://yuktiprep.com/yuktiprep.png";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #ffffff; padding: 24px; text-align: center; border-bottom: 2px solid #0e4587;">
        <img src="${logoUrl}" alt="YuktiPrep" style="max-height: 48px; width: auto;" />
      </div>
      <div style="padding: 24px;">
        <h2 style="color: #0e4587; margin-top: 0;">New Support Ticket Received</h2>
        <p><strong>Ticket ID:</strong> <span style="font-family: monospace; font-size: 16px; background: #eef6f9; padding: 2px 6px; border-radius: 4px;">${ticket.ticketNumber}</span></p>
        <p><strong>Assigned Team:</strong> ${ticket.assignedTeam}</p>
        <p><strong>Priority:</strong> <span style="color: #d97706; font-weight: bold; text-transform: uppercase;">${ticket.priority}</span></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <p><strong>User:</strong> ${ticket.fullName} (<a href="mailto:${ticket.email}">${ticket.email}</a>, ${ticket.mobileNumber})</p>
        <p><strong>Category:</strong> ${ticket.helpCategory || ticket.problemType}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Description:</strong></p>
        <blockquote style="background: #f8fafc; padding: 14px; border-left: 4px solid #0e4587; border-radius: 4px; color: #334155; margin: 8px 0;">
          ${ticket.description || ticket.explanation || "N/A"}
        </blockquote>
      </div>
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 12px; color: #64748b;">
        <p style="margin: 0 0 10px 0;">YuktiPrep Internal Notification System</p>
        <div style="margin: 8px 0;">
          <a href="https://www.facebook.com/yuktiprep/" style="margin: 0 8px; text-decoration: none; color: #0e4587; font-weight: 600;">Facebook</a> |
          <a href="https://www.instagram.com/yuktiprep/" style="margin: 0 8px; text-decoration: none; color: #0e4587; font-weight: 600;">Instagram</a> |
          <a href="https://yuktiprep.com" style="margin: 0 8px; text-decoration: none; color: #0e4587; font-weight: 600;">yuktiprep.com</a>
        </div>
      </div>
    </div>
  `;

  if (!process.env.SMTP_USER) {
    console.log(
      `[Email Alert Mock] Would send email to ${receiverEmail} for ticket ${ticket.ticketNumber}`,
    );
    return { success: true, mock: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"YuktiPrep Support" <${fromEmail}>`,
      to: receiverEmail,
      subject: `[${ticket.priority}] New Ticket: ${ticket.ticketNumber} - ${ticket.subject}`,
      html: html,
    });
    console.log(
      `[Email Alert Success] Sent team alert email for ${ticket.ticketNumber} to ${receiverEmail} (Message ID: ${info.messageId})`,
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Alert Error]:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send User Confirmation Email
 */
export async function sendUserTicketConfirmation(userEmail, ticket) {
  const fromEmail = process.env.EMAIL_FROM || "support@yuktiprep.com";
  const logoUrl = "https://yuktiprep.com/yuktiprep.png";

  const html = `
        <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
        .logo-header { background: #ffffff; padding: 24px 28px; text-align: center; border-bottom: 1px solid #f1f5f9; }
        .logo-img { max-height: 70px; width: auto; display: inline-block; }
        .hero-banner { background: linear-gradient(135deg, #0e4587 0%, #122951 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
        .hero-banner h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .hero-banner p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .ticket-box { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
        .ticket-label { font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; color: #0e4587; margin-bottom: 4px; }
        .ticket-id { font-size: 26px; font-weight: 800; letter-spacing: 0.05em; color: #0f172a; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .summary-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
        .summary-table td.label { font-weight: 600; color: #64748b; width: 35%; }
        .summary-table td.val { color: #1e293b; font-weight: 500; }
        .note { font-size: 13px; line-height: 1.6; color: #64748b; margin-top: 16px; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; }
        .social-row { margin: 12px 0 16px 0; }
        .social-link { display: inline-block; margin: 0 8px; text-decoration: none; color: #0e4587; font-weight: 600; font-size: 12px; }
        .social-icon { width: 22px; height: 22px; vertical-align: middle; margin-right: 4px; }
        .copyright { font-size: 11px; color: #94a3b8; margin: 4px 0 0 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo-header">
          <img src="${logoUrl}" alt="YuktiPrep" class="logo-img" />
        </div>
        <div class="hero-banner">
          <h1>Request Received Successfully</h1>
          <p>Our academic support team has registered your request.</p>
        </div>
        <div class="body">
          <p class="greeting">Hello ${ticket.fullName || "Aspirant"},</p>
          <p class="intro">
            Thank you for reaching out to YuktiPrep. Your request has been registered in our support desk. Below are your request details:
          </p>

          <div class="ticket-box">
            <div class="ticket-label">Your Reference Ticket ID</div>
            <div class="ticket-id">${ticket.ticketNumber}</div>
          </div>

          <table class="summary-table">
            <tr>
              <td class="label">Category</td>
              <td class="val">${ticket.helpCategory || ticket.problemType || "General Enquiry"}</td>
            </tr>
            <tr>
              <td class="label">Subject</td>
              <td class="val">${ticket.subject || "N/A"}</td>
            </tr>
            <tr>
              <td class="label">Assigned Team</td>
              <td class="val">${ticket.assignedTeam || "Support Operations"}</td>
            </tr>
            <tr>
              <td class="label">Status</td>
              <td class="val">Received / In Queue</td>
            </tr>
          </table>

          <p class="note">
            Please keep your <strong>Reference Ticket ID</strong> for future communication. Our support team will review and get back to you shortly.
          </p>
        </div>
        <div class="footer">
          <div class="social-row">
            <a href="https://www.facebook.com/yuktiprep/" target="_blank" class="social-link">
              <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" class="social-icon" /> Facebook
            </a>
            <a href="https://www.instagram.com/yuktiprep/" target="_blank" class="social-link">
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" class="social-icon" /> Instagram
            </a>
            <a href="https://yuktiprep.com" target="_blank" class="social-link">
              <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Website" class="social-icon" /> Website
            </a>
          </div>
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b;">YuktiPrep - Intelligence for Every Ambition</p>
          <p class="copyright">ASPERION DIGITAL TECHNOLOGIES (OPC) PRIVATE LIMITED · All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!process.env.SMTP_USER) {
    console.log(
      `[User Confirmation Email Mock] Sent to ${userEmail} for ${ticket.ticketNumber}`,
    );
    return { success: true, mock: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: fromEmail.includes("<")
        ? fromEmail
        : `"YuktiPrep Support" <${fromEmail}>`,
      to: userEmail,
      subject: `Thank you for submitting: Your YuktiPrep Request [${ticket.ticketNumber}]`,
      html: html,
    });
    console.log(
      `[User Confirmation Email] Successfully sent to ${userEmail} (ID: ${info.messageId})`,
    );
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[User Confirmation Email Error]:", error.message);
    return { success: false, error: error.message };
  }
}
