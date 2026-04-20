-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  canton TEXT NOT NULL,
  description TEXT,
  project_type TEXT,
  units INTEGER,
  start_date DATE,
  status TEXT NOT NULL DEFAULT 'En gestación',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create status_history table
CREATE TABLE public.status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by TEXT NOT NULL DEFAULT 'Daniel Salas'
);

CREATE INDEX idx_status_history_project ON public.status_history(project_id, changed_at DESC);
CREATE INDEX idx_projects_created ON public.projects(created_at DESC);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- Sprint 1 prototype: no auth, allow public access (anon role) for all operations
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public can insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public can delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Public can view status history" ON public.status_history FOR SELECT USING (true);
CREATE POLICY "Public can insert status history" ON public.status_history FOR INSERT WITH CHECK (true);