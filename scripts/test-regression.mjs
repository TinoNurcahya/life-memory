import { mkdir, writeFile } from "node:fs/promises";
import { extractActivities, ExtractionError } from "../lib/ai/gemini-extractor.ts";
import { REGRESSION_CASES } from "./regression-fixture.mjs";
import { evaluateExtraction, summarizeRegression } from "./regression-evaluator.mjs";

const report = { generatedAt: new Date().toISOString(), fixtureVersion: 2, mode: "production-extractor", productionExtractorTested: false, results: [] };
let quotaBlocked = false;
await mkdir("reports", { recursive: true });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

for (let i = 0; i < REGRESSION_CASES.length; i++) {
  const testCase = REGRESSION_CASES[i];
  let result;
  const started = Date.now();
  if (quotaBlocked) {
    result = { status: "quota_blocked", reasons: ["Not attempted after API quota limit; rerun when quota is available."] };
  } else if (!process.env.GEMINI_API_KEY) {
    result = { status: "failed", reasons: ["Missing GEMINI_API_KEY; production extractor not called."] };
  } else {
    // Pacing delay between calls to prevent free-tier burst limit
    if (i > 0) await delay(1500);

    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      try {
        report.productionExtractorTested = true;
        const extraction = await extractActivities(testCase.sourceText, testCase.referenceDate);
        result = { ...evaluateExtraction(testCase, extraction.activities), modelUsed: extraction.modelUsed, actual: extraction.activities };
        break;
      } catch (error) {
        const status = error instanceof ExtractionError ? error.code : "failed";
        const message = error instanceof Error ? error.message : "Unexpected extractor error";
        if (status === "quota_blocked" && attempts === 1) {
          // Retry once after backoff if rate limited
          await delay(3000);
          continue;
        }
        result = { status, reasons: [message] };
        quotaBlocked = status === "quota_blocked";
        break;
      }
    }
  }
  report.results.push({ id: testCase.id, ...result, durationMs: Date.now() - started });
  console.log(`${testCase.id}: ${result.status}`);
  // Persist after every case so interruption cannot look like a completed run.
  await writeFile("reports/regression-latest.json", JSON.stringify({ ...report, ...summarizeRegression(report.results), complete: report.results.length === 50 }, null, 2));
}
const summary = summarizeRegression(report.results);
console.log(JSON.stringify({ ...summary, mode: report.mode, productionExtractorTested: report.productionExtractorTested, report: "reports/regression-latest.json" }, null, 2));
process.exitCode = summary.quota_blocked ? 2 : summary.thresholdMet ? 0 : 1;
