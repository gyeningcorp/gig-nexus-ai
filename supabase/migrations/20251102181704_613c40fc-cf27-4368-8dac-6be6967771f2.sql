-- Fix search_path security issue for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path security issue for update_worker_rating function
CREATE OR REPLACE FUNCTION public.update_worker_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_ratings = total_ratings + 1,
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.ratings
      WHERE worker_id = NEW.worker_id
    )
  WHERE user_id = NEW.worker_id;
  RETURN NEW;
END;
$$;