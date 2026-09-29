import prisma from "../config/prisma.js";

const templates = [
  {
    name: "welcome_message",
    language: "en_US",
    category: "UTILITY",
    status: "DRAFT",
    bodyComponents: {
      type: "body",
      parameters: [
        { type: "text", text: "Student" },
        { type: "text", text: "UPSC" },
      ],
    },
    headerType: null,
    mediaUrl: null,
    metaTemplateId: "welcome_message",
    isActive: true,
  },
  {
    name: "demo_reminder",
    language: "en_IN",
    category: "MARKETING",
    status: "DRAFT",
    bodyComponents: {
      type: "body",
      parameters: [
        { type: "text", text: "Rahul" },
        { type: "text", text: "tomorrow 6 PM" },
      ],
    },
    headerType: null,
    mediaUrl: null,
    metaTemplateId: "demo_reminder",
    isActive: true,
  },
  {
    name: "payment_confirmation",
    language: "en_US",
    category: "UTILITY",
    status: "DRAFT",
    bodyComponents: {
      type: "body",
      parameters: [
        {
          type: "currency",
          currency: { currencyCode: "INR", amount: "499" },
        },
      ],
    },
    headerType: null,
    mediaUrl: null,
    metaTemplateId: "payment_confirmation",
    isActive: true,
  },
  {
    name: "course_recommendation",
    language: "en_US",
    category: "MARKETING",
    status: "DRAFT",
    bodyComponents: {
      type: "body",
      parameters: [
        { type: "text", text: "SSC" },
        { type: "text", text: "2027" },
      ],
    },
    headerType: null,
    mediaUrl: null,
    metaTemplateId: "course_recommendation",
    isActive: true,
  },
  {
    name: "diagnostic_ready",
    language: "en_US",
    category: "UTILITY",
    status: "DRAFT",
    bodyComponents: {
      type: "body",
      parameters: [
        { type: "text", text: "START TEST" },
      ],
    },
    headerType: null,
    mediaUrl: null,
    metaTemplateId: "diagnostic_ready",
    isActive: true,
  },
  {
    name: "handoff_counsellor",
    language: "en_US",
    category: "UTILITY",
    status: "DRAFT",
    bodyComponents: {
      type: "body",
      parameters: [
        { type: "text", text: "YP-SUP-1234567" },
        { type: "text", text: "Counselling request" },
        { type: "text", text: "30 minutes" },
      ],
    },
    headerType: null,
    mediaUrl: null,
    metaTemplateId: "handoff_counsellor",
    isActive: true,
  },
];

async function main() {
  for (const t of templates) {
    const created = await prisma.whatsAppTemplate.create({ data: t });
    console.log("Seeded template:", created.id, created.name);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
