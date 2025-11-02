-- Add location tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_location JSONB;

-- Add location coordinates to jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS location_coordinates JSONB;

-- Create index for faster location queries
CREATE INDEX IF NOT EXISTS idx_profiles_current_location ON public.profiles USING GIN (current_location);
CREATE INDEX IF NOT EXISTS idx_jobs_location_coordinates ON public.jobs USING GIN (location_coordinates);

-- Enable realtime for location updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;