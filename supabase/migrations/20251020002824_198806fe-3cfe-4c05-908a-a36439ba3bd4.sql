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

-- Update procedures RLS policies to use has_role function
DROP POLICY IF EXISTS "Apenas admins podem criar procedimentos" ON public.procedures;
DROP POLICY IF EXISTS "Apenas admins podem atualizar procedimentos" ON public.procedures;
DROP POLICY IF EXISTS "Apenas admins podem deletar procedimentos" ON public.procedures;
DROP POLICY IF EXISTS "Todos podem ver procedimentos ativos" ON public.procedures;

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

-- Update categories RLS policies
DROP POLICY IF EXISTS "Apenas admins podem criar categorias" ON public.categories;

CREATE POLICY "Apenas admins podem criar categorias"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));