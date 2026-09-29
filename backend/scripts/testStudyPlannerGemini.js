import { generateStudyPlan } from "../services/chatbotweb.service.js";

async function testGeminiService() {
  console.log("Testing generateStudyPlan with initial prompt...");
  const res1 = await generateStudyPlan("Create a 30-day UPSC Prelims study plan for Indian Polity");
  console.log("Initial generation success:", res1.success);
  console.log("Sample response preview:", res1.message?.substring(0, 180) + "...");

  if (res1.success) {
    console.log("\nTesting follow-up question with conversation history...");
    const history = [
      { role: "user", content: "Create a 30-day UPSC Prelims study plan for Indian Polity" },
      { role: "assistant", content: res1.message },
    ];
    const res2 = await generateStudyPlan("Can you make this plan 2 hours per day?", history);
    console.log("Follow-up success:", res2.success);
    console.log("Follow-up response preview:", res2.message?.substring(0, 180) + "...");
  }
}

testGeminiService();
