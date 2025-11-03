-- Drop the existing update policy
DROP POLICY IF EXISTS "Customers and workers can update their jobs" ON public.jobs;

-- Create new update policy that allows:
-- 1. Customers to update their own jobs
-- 2. Workers to accept open jobs (where worker_id is null)
-- 3. Workers to update jobs they've already accepted
CREATE POLICY "Customers and workers can update jobs"
ON public.jobs
FOR UPDATE
USING (
  auth.uid() = customer_id OR 
  auth.uid() = worker_id OR
  (status = 'open' AND worker_id IS NULL)
)
WITH CHECK (
  auth.uid() = customer_id OR 
  auth.uid() = worker_id
);