export type ActivityCategory =
  | 'career'
  | 'social'
  | 'health'
  | 'learning'
  | 'leisure'
  | 'routine'
  | 'other';

export type ActivityStatus = 'PENDING' | 'RESOLVED' | 'FAILED';

export type EventStatus = 'completed' | 'planned' | 'cancelled';

export type TimeOfDay =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'exact'
  | 'unknown';

export type InsightType =
  | 'first_time'
  | 'recurring'
  | 'change'
  | 'forgotten'
  | 'reflection';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  raw_text: string;
  client_entry_date: string; // YYYY-MM-DD
  status: ActivityStatus;
  ai_raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityDetail {
  id: string;
  activity_id: string;
  user_id: string;
  summary: string;
  source_text: string;
  category: ActivityCategory;
  occurred_at: string; // YYYY-MM-DD
  day_offset: number;
  time_of_day: TimeOfDay | null;
  time_hint: string | null;
  event_status: EventStatus;
  is_first_time: boolean;
  needs_review: boolean;
  review_reasons: string[];
  image_urls?: string[];
  created_at: string;
  people?: Person[];
  places?: Place[];
  topics?: Topic[];
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  normalized_name: string;
  aliases: string[];
  interaction_count?: number; // Derived from v_people_with_stats
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  user_id: string;
  name: string;
  normalized_name: string;
  aliases: string[];
  visit_count?: number; // Derived from v_places_with_stats
  first_visit_at?: string | null;
  last_visit_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  user_id: string;
  name: string;
  normalized_name: string;
  activity_count?: number; // Derived from v_topics_with_stats
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsightEvidence {
  activity_detail_id: string;
  occurred_at: string;
  snippet: string;
}

export interface Insight {
  id: string;
  user_id: string;
  type: InsightType;
  title: string;
  description: string;
  category: ActivityCategory | null;
  evidence: InsightEvidence[];
  is_read: boolean;
  is_suppressed: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id?: string | null;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Server Action standardized return contract
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

