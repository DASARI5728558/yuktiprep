/**
 * Ticket ID Generator Utility
 * Generates unique Ticket IDs in format: YP-YYYYMMDD-XXXXXX
 * Example: YP-20260925-A8K3P2
 */
export function generateTicketId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `YP-${dateStr}-${randomStr}`;
}
