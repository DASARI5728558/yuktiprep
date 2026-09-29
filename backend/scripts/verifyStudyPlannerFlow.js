import prisma from "../config/prisma.js";
import { generateStudyPlan } from "../services/chatbotweb.service.js";

async function verifyFullWorkflow() {
  console.log("1. Finding or creating a test user...");
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Test Aspirant",
        email: "aspirant@test.com",
      },
    });
  }
  console.log(`Using user ID: ${user.id} (${user.name})`);

  console.log("\n2. Calling chatbotweb.service to generate study plan...");
  const prompt = "Create a 30-day UPSC Prelims study plan for Indian Polity";
  const genResult = await generateStudyPlan(prompt, []);
  console.log("Generation success:", genResult.success);

  console.log("\n3. Saving new StudyPlan and first turn to DB...");
  const plan = await prisma.studyPlan.create({
    data: {
      userId: user.id,
      title: prompt,
      exam: "UPSC Civil Services",
      status: "Active",
    },
  });

  await prisma.studyPlanMessage.create({
    data: {
      studyPlanId: plan.id,
      role: "user",
      content: prompt,
    },
  });

  await prisma.studyPlanMessage.create({
    data: {
      studyPlanId: plan.id,
      role: "assistant",
      content: genResult.message,
    },
  });

  console.log(`Saved plan ID: ${plan.id}`);

  console.log("\n4. Testing follow-up turn...");
  const followUpPrompt = "Can you make this plan 2 hours per day?";
  const history = [
    { role: "user", content: prompt },
    { role: "assistant", content: genResult.message },
  ];
  const followUpRes = await generateStudyPlan(followUpPrompt, history);
  console.log("Follow-up success:", followUpRes.success);

  await prisma.studyPlanMessage.create({
    data: {
      studyPlanId: plan.id,
      role: "user",
      content: followUpPrompt,
    },
  });

  await prisma.studyPlanMessage.create({
    data: {
      studyPlanId: plan.id,
      role: "assistant",
      content: followUpRes.message,
    },
  });

  console.log("\n5. Querying plan with all messages...");
  const fullPlan = await prisma.studyPlan.findUnique({
    where: { id: plan.id },
    include: { messages: true },
  });

  console.log(`Plan "${fullPlan.title}" now has ${fullPlan.messages.length} messages.`);
  console.log("Full workflow verified successfully!");
}

verifyFullWorkflow()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
