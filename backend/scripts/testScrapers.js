import { runAllEnabledScrapers } from "../services/competitiveExamScraper.service.js";

runAllEnabledScrapers()
  .then((summary) => {
    console.log("Finished test run:", JSON.stringify(summary, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test run error:", err);
    process.exit(1);
  });
