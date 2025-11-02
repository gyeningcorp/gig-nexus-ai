-- Add pending_confirmation status to jobs for customer verification before payment
-- This allows workers to mark jobs complete, but requires customer confirmation before payment release

-- First check if the status column allows pending_confirmation
-- The status column should be TEXT type which allows any value
-- No schema change needed if it's already TEXT

-- Add a comment to document the new status
COMMENT ON COLUMN public.jobs.status IS 'Job status: open, in_progress, pending_confirmation, completed, cancelled';