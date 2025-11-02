-- Enable realtime for jobs table so workers get instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Enable full row tracking for realtime updates
ALTER TABLE public.jobs REPLICA IDENTITY FULL;