import type { ActivityCategory, EventStatus, Person, Place, Topic } from "@/types/database";
export type { ActivityCategory } from "@/types/database";

export interface AnalyticsActivity {
  id: string;
  occurredAt: string;
  category: ActivityCategory | null;
  eventStatus: EventStatus | null;
  summary: string;
  people?: Pick<Person, "id" | "name">[];
  places?: Pick<Place, "id" | "name">[];
  topics?: Pick<Topic, "id" | "name">[];
  isFirstTime?: boolean;
}

export interface EvidenceReference {
  activityDetailId: string;
  occurredAt: string;
  snippet: string;
}

export type PatternEntityKind = "topic" | "category" | "person" | "place";

export interface FirstTimePattern {
  kind: PatternEntityKind;
  key: string;
  label: string;
  activityDetailId: string;
  occurredAt: string;
  evidence: EvidenceReference;
}

export interface RecurrencePattern {
  kind: PatternEntityKind;
  key: string;
  label: string;
  count: number;
  month: string;
  evidence: EvidenceReference[];
}

export interface ChangePattern {
  key: string;
  label: string;
  previousMonth: string;
  currentMonth: string;
  previousCount: number;
  currentCount: number;
  absoluteDelta: number;
  ratio: number | null;
  direction: "up" | "down";
  evidence: EvidenceReference[];
}

export interface MonthlyStats {
  month: string;
  total: number;
  byCategory: Record<ActivityCategory, number>;
  firstTimes: number;
  people: number;
  places: number;
  topics: number;
}

export function completedActivities(activities: AnalyticsActivity[]) {
  return activities.filter((activity) => activity.eventStatus === "completed");
}

export function monthKey(value: string) {
  return value.slice(0, 7);
}

export function evidenceFor(activity: AnalyticsActivity): EvidenceReference {
  return { activityDetailId: activity.id, occurredAt: activity.occurredAt, snippet: activity.summary };
}
