-- Bookings table for "Agendar Chamada de Setup" flow
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_name text not null,
  whatsapp text not null,
  service_type text not null,
  description text,
  preferred_date date not null,
  preferred_time text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

-- Only service role can read; public insert allowed via backend using anon key is NOT enabled here.
-- Backend uses service_role key, which bypasses RLS.
create policy "no public read" on bookings for select using (false);
