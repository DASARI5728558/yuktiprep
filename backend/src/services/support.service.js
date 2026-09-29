import prisma from "../../config/prisma.js";
import { generateTicketId } from "../utils/ticketId.js";
import { determineAssignedTeam } from "./routing.service.js";
import { determinePriority } from "./priority.service.js";
import { notifyTicketCreated } from "./notification.service.js";
import { uploadToStorage } from "./storage.service.js";

/**
 * Create Contact Support Ticket
 */
export async function createContactTicket(data, file) {
  const ticketNumber = generateTicketId();
  const assignedTeam = determineAssignedTeam(data.helpCategory);
  const priority = determinePriority(data);

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      fullName: data.fullName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      persona: data.persona || null,
      examCategory: data.examCategory || null,
      state: data.state || null,
      specificExam: data.specificExam || null,
      helpCategory: data.helpCategory,
      subject: data.subject,
      description: data.description,
      preferredLanguage: data.preferredLanguage || null,
      preferredContactMethod: data.preferredContactMethod || null,
      bestTimeToContact: data.bestTimeToContact || null,
      consent: data.consent === "true" || data.consent === true,
      marketingConsent:
        data.marketingConsent === "true" || data.marketingConsent === true,
      assignedTeam,
      priority,
      source: "CONTACT_FORM",
      status: "OPEN",
    },
  });

  // Handle File Attachment if present - upload directly to Utho / Object Storage
  if (file) {
    let storageKey = file.path || file.filename || `support/${ticketNumber}-${file.originalname}`;
    if (file.buffer) {
      try {
        const uploadResult = await uploadToStorage(
          file.buffer,
          file.originalname,
          file.mimetype || "application/pdf",
          "support-tickets"
        );
        storageKey = uploadResult.fileUrl || uploadResult.storageKey;
      } catch (uploadErr) {
        console.error("[Utho Storage Upload Error]:", uploadErr);
      }
    }

    await prisma.ticketAttachment.create({
      data: {
        ticketId: ticket.id,
        filename: file.originalname || "attachment.pdf",
        storageKey: String(storageKey),
        mimeType: file.mimetype || "application/pdf",
        fileSize: file.size || 0,
      },
    });
  }

  // Create initial Ticket Event
  await prisma.ticketEvent.create({
    data: {
      ticketId: ticket.id,
      eventType: "TICKET_CREATED",
      newValue: "OPEN",
      message: `Contact enquiry ticket ${ticketNumber} submitted via web form.`,
    },
  });

  // Trigger Notifications asynchronously
  notifyTicketCreated(ticket);

  return ticket;
}

/**
 * Create Problem Report Ticket
 */
export async function createProblemReportTicket(data, file) {
  const ticketNumber = generateTicketId();

  // Content complaints auto-route to Academic Quality or Syllabus team
  const isEducationalContent = [
    "Report Incorrect Question or Answer",
    "Report Out-of-Syllabus Content",
    "Report Outdated Information",
  ].includes(data.problemType);

  const assignedTeam = isEducationalContent
    ? data.problemType === "Report Out-of-Syllabus Content"
      ? "Syllabus Intelligence Team"
      : "Academic Quality Team"
    : determineAssignedTeam(data.problemType);

  const priority = determinePriority({
    problemType: data.problemType,
    subject: data.subject || data.problemType,
    explanation: data.explanation || "",
  });

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      fullName: data.fullName || "Anonymous / Reporter",
      email: data.email || "support@yuktiprep.com",
      mobileNumber: data.mobileNumber || "+910000000000",
      helpCategory: data.problemType || "Report Problem",
      subject: `[Problem Report] ${data.problemType} - ${data.examination || data.subject || "General"}`,
      description:
        data.explanation || data.description || "Problem Report Submitted",
      problemType: data.problemType,
      examination: data.examination || null,
      examSubject: data.subject || null,
      chapter: data.chapter || null,
      topic: data.topic || null,
      questionId: data.questionId || null,
      explanation: data.explanation || null,
      assignedTeam,
      priority,
      source: "PROBLEM_REPORT",
      status: "OPEN",
    },
  });

  // Handle Evidence / Screenshot Upload if present - upload directly to Utho / Object Storage
  if (file) {
    let storageKey = file.path || file.filename || `evidence/${ticketNumber}-${file.originalname}`;
    if (file.buffer) {
      try {
        const uploadResult = await uploadToStorage(
          file.buffer,
          file.originalname,
          file.mimetype || "application/pdf",
          "problem-evidence"
        );
        storageKey = uploadResult.fileUrl || uploadResult.storageKey;
      } catch (uploadErr) {
        console.error("[Utho Storage Upload Error]:", uploadErr);
      }
    }

    await prisma.ticketAttachment.create({
      data: {
        ticketId: ticket.id,
        filename: file.originalname || "evidence.pdf",
        storageKey: String(storageKey),
        mimeType: file.mimetype || "application/pdf",
        fileSize: file.size || 0,
      },
    });
  }

  // Create initial Ticket Event
  await prisma.ticketEvent.create({
    data: {
      ticketId: ticket.id,
      eventType: "PROBLEM_REPORTED",
      newValue: "OPEN",
      message: `Problem report ticket ${ticketNumber} created for category ${data.problemType}.`,
    },
  });

  // Trigger Notifications asynchronously
  notifyTicketCreated(ticket);

  return ticket;
}
