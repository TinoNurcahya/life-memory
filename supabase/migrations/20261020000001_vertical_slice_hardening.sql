-- Additive hardening for an already-applied initial migration.
ALTER TABLE public.activity_details
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS review_reasons TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_activity_details_review
  ON public.activity_details (user_id, needs_review)
  WHERE needs_review = TRUE;
