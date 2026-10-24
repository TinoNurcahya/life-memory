const normalize = (value) => value.normalize("NFKD").toLowerCase().trim().replace(/\s+/g, " ");
const sameSet = (actual, expected) => {
  const values = [...new Set(actual.map(normalize))];
  return values.length === expected.length && expected.every((entry) =>
    (Array.isArray(entry) ? entry : [entry]).some((alias) => values.includes(normalize(alias))));
};

export function evaluateExtraction(testCase, activities) {
  const reasons = [];
  if (activities.length !== testCase.expected.length) {
    reasons.push(`activity count: expected ${testCase.expected.length}, got ${activities.length}`);
  }
  const remaining = new Set(activities.map((_, index) => index));
  for (const [index, expected] of testCase.expected.entries()) {
    const mismatches = (actual) => {
      const errors = [];
      for (const field of ["category", "event_status", "day_offset", "time_of_day", "is_first_time"]) {
        if (actual[field] !== expected[field]) errors.push(`${field}: expected ${expected[field]}, got ${actual[field]}`);
      }
      for (const field of ["people", "places", "topics"]) {
        if (!sameSet(actual[field], expected[field])) errors.push(`${field}: expected ${JSON.stringify(expected[field])}, got ${JSON.stringify(actual[field])}`);
      }
      if (!actual.source_text || !testCase.sourceText.includes(actual.source_text)) errors.push("source_text is not verbatim");
      // A correct record must point at its own clause, not another activity.
      if (!expected.source_text.includes(actual.source_text) && !actual.source_text.includes(expected.source_text)) errors.push("source_text points to a different clause");
      return errors;
    };
    const choices = [...remaining].map((id) => ({ id, errors: mismatches(activities[id]) }))
      .sort((a, b) => a.errors.length - b.errors.length || a.id - b.id);
    const best = choices[0];
    if (!best) { reasons.push(`activity ${index + 1}: missing`); continue; }
    remaining.delete(best.id);
    reasons.push(...best.errors.map((reason) => `activity ${index + 1}: ${reason}`));
  }
  return { status: reasons.length ? "failed" : "passed", reasons };
}

export function summarizeRegression(results) {
  const counts = { passed: 0, failed: 0, quota_blocked: 0, invalid_response: 0 };
  for (const result of results) counts[result.status]++;
  const benchmark = results.filter((result) => result.id.startsWith("TC-"));
  const benchmarkPassed = benchmark.filter((result) => result.status === "passed").length;
  const score = counts.passed / 50;
  return {
    ...counts, score, threshold: 0.9, benchmarkPassed, benchmarkTotal: 12,
    thresholdMet: results.length === 50 && counts.quota_blocked === 0 && score >= 0.9 && benchmarkPassed >= 11,
  };
}
