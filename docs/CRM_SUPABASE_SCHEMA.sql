-- FACTUSYS CRM Supabase schema
-- Ejecutar en Supabase SQL Editor cuando se active NEXT_PUBLIC_CRM_STORAGE=supabase.

create table if not exists public.crm_prospects (
  id text primary key,
  business_name text not null,
  rubro text not null,
  city text,
  contact_name text not null,
  whatsapp text not null,
  social_url text,
  interest text not null,
  status text not null,
  origin text,
  permission_contact text not null default 'Pendiente',
  last_contact_at date,
  next_follow_up_at date,
  last_message text,
  notes text,
  history jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_prospects_whatsapp_idx on public.crm_prospects (whatsapp);
create index if not exists crm_prospects_status_idx on public.crm_prospects (status);
create index if not exists crm_prospects_next_follow_up_idx on public.crm_prospects (next_follow_up_at);

create or replace function public.set_crm_prospects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_prospects_updated_at on public.crm_prospects;

create trigger crm_prospects_updated_at
before update on public.crm_prospects
for each row
execute function public.set_crm_prospects_updated_at();

-- RLS queda listo para activarse cuando haya auth interna real.
-- alter table public.crm_prospects enable row level security;
