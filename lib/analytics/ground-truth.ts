import fixture from "../../scripts/fixtures/analytics-50.json" with { type: "json" };
import type { AnalyticsActivity } from "./types.ts";

// Frozen evaluation data; deliberately independent from the relative-date demo.
export const GROUND_TRUTH_ACTIVITIES = fixture as AnalyticsActivity[];
