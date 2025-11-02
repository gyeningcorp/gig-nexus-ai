-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'customer')),
  rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
  availability JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  type TEXT NOT NULL CHECK (type IN ('rideshare', 'delivery', 'home_service', 'freelance', 'pet_care', 'errand')),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  sender_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'refund', 'deposit', 'withdrawal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view open jobs"
  ON public.jobs FOR SELECT
  USING (status = 'open' OR auth.uid() = customer_id OR auth.uid() = worker_id);

CREATE POLICY "Customers can create jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers and workers can update their jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() = worker_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Ratings policies
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Customers can create ratings for completed jobs"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update worker rating
CREATE OR REPLACE FUNCTION public.update_worker_rating()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to update rating when new rating is added
CREATE TRIGGER update_rating_on_insert
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_worker_rating();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();