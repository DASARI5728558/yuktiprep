import { createContactTicket, createProblemReportTicket } from '../services/support.service.js';

/**
 * POST /api/v1/support/tickets
 * Handle Contact Enquiry Submission
 */
export async function handleContactSubmission(req, res, next) {
  try {
    const { fullName, email, mobileNumber, helpCategory, subject, description, consent } = req.body;

    if (!fullName || !email || !mobileNumber || !helpCategory || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email, mobile number, help category, subject, and description are required.',
      });
    }

    if (description.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Description exceeds maximum allowed limit of 2,000 characters.',
      });
    }

    if (consent !== 'true' && consent !== true) {
      return res.status(400).json({
        success: false,
        error: 'Consent to Terms of Use and Privacy Policy is required.',
      });
    }

    if (req.file) {
      const allowedMime = 'application/pdf';
      const isPdf = req.file.mimetype === allowedMime || req.file.originalname.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        return res.status(400).json({
          success: false,
          error: 'Only PDF format is supported. Other file formats are not allowed.',
        });
      }

      const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
      if (req.file.size > maxSizeBytes) {
        return res.status(400).json({
          success: false,
          error: 'Uploaded file exceeds the maximum allowed limit of 5 MB.',
        });
      }
    }

    const ticket = await createContactTicket(req.body, req.file);

    return res.status(201).json({
      success: true,
      message: "Thank You — We've Received Your Request",
      data: {
        ticketId: ticket.id,
        referenceId: ticket.ticketNumber,
        assignedTeam: ticket.assignedTeam,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error('Contact Submission Controller Error:', error);
    return next(error);
  }
}

/**
 * POST /api/v1/support/problem-reports
 * Handle Report Problem Submission
 */
export async function handleProblemReportSubmission(req, res, next) {
  try {
    const { problemType, fullName, email, mobileNumber, explanation } = req.body;

    if (!problemType) {
      return res.status(400).json({
        success: false,
        error: 'Problem type is required.',
      });
    }

    if (!fullName || !email || !mobileNumber) {
      return res.status(400).json({
        success: false,
        error: 'Full name, email address, and mobile number are required.',
      });
    }

    if (!explanation) {
      return res.status(400).json({
        success: false,
        error: 'Explanation of the issue is required.',
      });
    }

    const ticket = await createProblemReportTicket(req.body, req.file);

    return res.status(201).json({
      success: true,
      message: 'Problem report submitted successfully.',
      data: {
        ticketId: ticket.id,
        referenceId: ticket.ticketNumber,
        assignedTeam: ticket.assignedTeam,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    console.error('Problem Report Controller Error:', error);
    return next(error);
  }
}
