/**
 * Routing Service
 * Determines the assigned support team based on enquiry category or problem type
 */
export function determineAssignedTeam(categoryOrProblemType) {
  const normalized = (categoryOrProblemType || '').toLowerCase().trim();

  if (
    normalized.includes('subscription') ||
    normalized.includes('pricing') ||
    normalized.includes('demo') ||
    normalized.includes('trial')
  ) {
    return 'Sales / Customer Success';
  }

  if (
    normalized.includes('account') ||
    normalized.includes('login') ||
    normalized.includes('otp') ||
    normalized.includes('verification')
  ) {
    return 'Identity & Account Support';
  }

  if (
    normalized.includes('technical issue') ||
    normalized.includes('accessibility') ||
    normalized.includes('report technical')
  ) {
    return 'Technical Support';
  }

  if (
    normalized.includes('incorrect content') ||
    normalized.includes('question / answer error') ||
    normalized.includes('incorrect question')
  ) {
    return 'Academic Quality Team';
  }

  if (normalized.includes('out-of-syllabus')) {
    return 'Syllabus Intelligence Team';
  }

  if (
    normalized.includes('payment') ||
    normalized.includes('billing') ||
    normalized.includes('refund') ||
    normalized.includes('cancellation')
  ) {
    return 'Billing & Finance Support';
  }

  if (
    normalized.includes('preparation guidance') ||
    normalized.includes('mock tests') ||
    normalized.includes('mains answer') ||
    normalized.includes('mock interview') ||
    normalized.includes('previous year questions') ||
    normalized.includes('study materials')
  ) {
    return 'Academic Mentorship Team';
  }

  if (
    normalized.includes('institutional partnership') ||
    normalized.includes('coaching') ||
    normalized.includes('content partnership') ||
    normalized.includes('corporate')
  ) {
    return 'Partnerships & BD';
  }

  if (normalized.includes('technology') || normalized.includes('api integration')) {
    return 'Engineering & API Team';
  }

  if (normalized.includes('investor')) {
    return 'Executive Management';
  }

  if (normalized.includes('privacy') || normalized.includes('data protection')) {
    return 'Privacy & Compliance';
  }

  if (normalized.includes('grievance') || normalized.includes('complaint')) {
    return 'Grievance Officer';
  }

  return 'Customer Support';
}
