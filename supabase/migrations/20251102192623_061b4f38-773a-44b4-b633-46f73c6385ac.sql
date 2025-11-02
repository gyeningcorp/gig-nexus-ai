-- Add push_token column to profiles table for mobile push notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT;