-- ============================================================================
-- LIFE MEMORY — PRODUCTION DATABASE MIGRATION SCRIPT
-- 10 Tables, 3 Reactive Security-Invoker Views, Indexes, Triggers, & RLS
-- Target: Supabase PostgreSQL 15+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. BASE TABLES
-- ============================================================================

-- 1. TABLE: profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 2. TABLE: activities (Raw user activity logs & pipeline status)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    client_entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RESOLVED', 'FAILED')),
    ai_raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABLE: activity_details (Atomic structured items extracted by AI)
CREATE TABLE IF NOT EXISTS public.activity_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    source_text TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'career', 'social', 'health', 'learning', 'leisure', 'routine', 'other'
    )),
    occurred_at DATE NOT NULL,
    day_offset INTEGER NOT NULL DEFAULT 0,
    time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night', 'exact', 'unknown')),
    time_hint TEXT,
    event_status TEXT NOT NULL DEFAULT 'completed' CHECK (event_status IN (
        'completed', 'planned', 'cancelled'
    )),
    is_first_time BOOLEAN NOT NULL DEFAULT FALSE,
    needs_review BOOLEAN NOT NULL DEFAULT FALSE,
    review_reasons TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABLE: people (Detected individual contacts / friends)
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    aliases TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_user_person UNIQUE (user_id, normalized_name)
);

-- 5. TABLE: places (Detected locations / venues)
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    aliases TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_user_place UNIQUE (user_id, normalized_name)
);

-- 6. TABLE: topics (Detected subjects, skills, technologies, projects)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_user_topic UNIQUE (user_id, normalized_name)
);

-- 7. TABLE: activity_people (Junction: activity_details <-> people)
CREATE TABLE IF NOT EXISTS public.activity_people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_detail_id UUID NOT NULL REFERENCES public.activity_details(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_activity_person UNIQUE (activity_detail_id, person_id)
);

-- 8. TABLE: activity_places (Junction: activity_details <-> places)
CREATE TABLE IF NOT EXISTS public.activity_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_detail_id UUID NOT NULL REFERENCES public.activity_details(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_activity_place UNIQUE (activity_detail_id, place_id)
);

-- 9. TABLE: activity_topics (Junction: activity_details <-> topics)
CREATE TABLE IF NOT EXISTS public.activity_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_detail_id UUID NOT NULL REFERENCES public.activity_details(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_activity_topic UNIQUE (activity_detail_id, topic_id)
);

-- 10. TABLE: insights (Generated patterns, reflections, and notifications)
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'first_time', 'recurring', 'change', 'forgotten', 'reflection'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_suppressed BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 2. REACTIVE VIEWS (SECURITY INVOKER)
-- ============================================================================

-- 1. View: People with derived counts & boundaries
CREATE OR REPLACE VIEW public.v_people_with_stats
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.user_id,
    p.name,
    p.normalized_name,
    p.aliases,
    COALESCE(COUNT(ad.id) FILTER (WHERE ad.event_status = 'completed'), 0)::INT AS interaction_count,
    MIN(ad.occurred_at) FILTER (WHERE ad.event_status = 'completed') AS first_seen_at,
    MAX(ad.occurred_at) FILTER (WHERE ad.event_status = 'completed') AS last_seen_at,
    p.created_at,
    p.updated_at
FROM public.people p
LEFT JOIN public.activity_people ap ON ap.person_id = p.id
LEFT JOIN public.activity_details ad ON ad.id = ap.activity_detail_id
GROUP BY p.id;

-- 2. View: Places with derived counts & boundaries
CREATE OR REPLACE VIEW public.v_places_with_stats
WITH (security_invoker = true) AS
SELECT
    pl.id,
    pl.user_id,
    pl.name,
    pl.normalized_name,
    pl.aliases,
    COALESCE(COUNT(ad.id) FILTER (WHERE ad.event_status = 'completed'), 0)::INT AS visit_count,
    MIN(ad.occurred_at) FILTER (WHERE ad.event_status = 'completed') AS first_visit_at,
    MAX(ad.occurred_at) FILTER (WHERE ad.event_status = 'completed') AS last_visit_at,
    pl.created_at,
    pl.updated_at
FROM public.places pl
LEFT JOIN public.activity_places apl ON apl.place_id = pl.id
LEFT JOIN public.activity_details ad ON ad.id = apl.activity_detail_id
GROUP BY pl.id;

-- 3. View: Topics with derived counts & boundaries
CREATE OR REPLACE VIEW public.v_topics_with_stats
WITH (security_invoker = true) AS
SELECT
    t.id,
    t.user_id,
    t.name,
    t.normalized_name,
    COALESCE(COUNT(ad.id) FILTER (WHERE ad.event_status = 'completed'), 0)::INT AS activity_count,
    MIN(ad.occurred_at) FILTER (WHERE ad.event_status = 'completed') AS first_seen_at,
    MAX(ad.occurred_at) FILTER (WHERE ad.event_status = 'completed') AS last_seen_at,
    t.created_at,
    t.updated_at
FROM public.topics t
LEFT JOIN public.activity_topics atp ON atp.topic_id = t.id
LEFT JOIN public.activity_details ad ON ad.id = atp.activity_detail_id
GROUP BY t.id;

-- ============================================================================
-- 3. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_activities_user_entry ON public.activities (user_id, client_entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_status ON public.activities (user_id, status);
CREATE INDEX IF NOT EXISTS idx_activity_details_occurred ON public.activity_details (user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_details_cat_occurred ON public.activity_details (user_id, category, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_details_status ON public.activity_details (user_id, event_status);
CREATE INDEX IF NOT EXISTS idx_activity_details_act_id ON public.activity_details (activity_id);
CREATE INDEX IF NOT EXISTS idx_people_user_norm ON public.people (user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_people_aliases ON public.people USING GIN (aliases);
CREATE INDEX IF NOT EXISTS idx_places_user_norm ON public.places (user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_places_aliases ON public.places USING GIN (aliases);
CREATE INDEX IF NOT EXISTS idx_topics_user_norm ON public.topics (user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_activity_people_lookup ON public.activity_people (person_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_places_lookup ON public.activity_places (place_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_topics_lookup ON public.activity_topics (topic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_type_created ON public.insights (user_id, type, created_at DESC);

-- ============================================================================
-- 4. AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Auto update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_people_updated_at ON public.people;
CREATE TRIGGER trg_people_updated_at
    BEFORE UPDATE ON public.people
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_places_updated_at ON public.places;
CREATE TRIGGER trg_places_updated_at
    BEFORE UPDATE ON public.places
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_topics_updated_at ON public.topics;
CREATE TRIGGER trg_topics_updated_at
    BEFORE UPDATE ON public.topics
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function: Automatically create public profile on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 1. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 2. Activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own activities" ON public.activities;
CREATE POLICY "Users can manage own activities" ON public.activities
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 3. Activity Details
ALTER TABLE public.activity_details ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own activity details" ON public.activity_details;
CREATE POLICY "Users can manage own activity details" ON public.activity_details
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. People
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own people entities" ON public.people;
CREATE POLICY "Users can manage own people entities" ON public.people
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 5. Places
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own places entities" ON public.places;
CREATE POLICY "Users can manage own places entities" ON public.places
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 6. Topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own topics" ON public.topics;
CREATE POLICY "Users can manage own topics" ON public.topics
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 7. Activity People Junction
ALTER TABLE public.activity_people ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own activity_people" ON public.activity_people;
CREATE POLICY "Users can manage own activity_people" ON public.activity_people
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 8. Activity Places Junction
ALTER TABLE public.activity_places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own activity_places" ON public.activity_places;
CREATE POLICY "Users can manage own activity_places" ON public.activity_places
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 9. Activity Topics Junction
ALTER TABLE public.activity_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own activity_topics" ON public.activity_topics;
CREATE POLICY "Users can manage own activity_topics" ON public.activity_topics
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

-- 10. Insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own insights" ON public.insights;
CREATE POLICY "Users can manage own insights" ON public.insights
    FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
