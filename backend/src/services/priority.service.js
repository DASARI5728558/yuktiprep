/**
 * Priority Service
 * Determines the ticket priority (P1, P2, P3, P4) based on enquiry details
 */
export function determinePriority(data) {
  const category = (data.helpCategory || data.problemType || '').toLowerCase();
  const subject = (data.subject || '').toLowerCase();
  const description = (data.description || data.explanation || '').toLowerCase();
  const combined = `${category} ${subject} ${description}`;

  // P1 - Critical
  if (
    combined.includes('security incident') ||
    combined.includes('privacy breach') ||
    combined.includes('outage') ||
    combined.includes('charged multiple times') ||
    combined.includes('fraud')
  ) {
    return 'P1';
  }

  // P2 - High
  if (
    combined.includes('cannot access paid') ||
    combined.includes('subscription not active') ||
    combined.includes('otp fail') ||
    combined.includes('unable to login') ||
    combined.includes('payment failed') ||
    combined.includes('critical error')
  ) {
    return 'P2';
  }

  // P4 - Informational
  if (
    combined.includes('investor') ||
    combined.includes('partnership') ||
    combined.includes('media') ||
    combined.includes('feedback') ||
    combined.includes('suggestion')
  ) {
    return 'P4';
  }

  // P3 - Normal (Default)
  return 'P3';
}
