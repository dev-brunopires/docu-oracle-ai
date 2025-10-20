-- Drop existing policies that depend on profiles.role column
DROP POLICY IF EXISTS "Apenas admins podem criar categorias" ON public.categories;
DROP POLICY IF EXISTS "Todos podem ver procedimentos ativos" ON public.procedures;
DROP POLICY IF EXISTS "Apenas admins podem criar procedimentos" ON public.procedures;
DROP POLICY IF EXISTS "Apenas admins podem atualizar procedimentos" ON public.procedures;
DROP POLICY IF EXISTS "Apenas admins podem deletar procedimentos" ON public.procedures;
DROP POLICY IF EXISTS "Admins podem fazer upload de arquivos" ON storage.objects;

-- Now we can safely remove the role column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update trigger function to assign default 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Recreate procedures RLS policies using has_role function
CREATE POLICY "Apenas admins podem criar procedimentos"
ON public.procedures FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem atualizar procedimentos"
ON public.procedures FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar procedimentos"
ON public.procedures FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Todos podem ver procedimentos ativos"
ON public.procedures FOR SELECT
USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

-- Recreate categories RLS policies
CREATE POLICY "Apenas admins podem criar categorias"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Recreate storage policies
CREATE POLICY "Admins podem fazer upload de arquivos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Usuários autenticados podem ver arquivos"
ON storage.objects FOR SELECT
USING (bucket_id = 'files' AND auth.role() = 'authenticated');