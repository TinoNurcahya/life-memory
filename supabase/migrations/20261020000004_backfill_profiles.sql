-- ============================================================================
-- Migration: 20261020000004_backfill_profiles.sql
-- Description: Backfill existing users from auth.users into public.profiles
-- Fixes foreign key constraint violation on activities_user_id_fkey
-- ============================================================================

INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
    u.id, 
    COALESCE(u.email, ''), 
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
    COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
    u.created_at,
    NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
    updated_at = NOW();
