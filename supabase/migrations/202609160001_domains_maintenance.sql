-- Gestión interna de webs contratadas, dominios, facturas y mantenimiento.
create table public.managed_websites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete restrict,
  proposal_id uuid references public.proposals(id) on delete set null,
  website_url text check (website_url is null or website_url ~ '^https://'),
  activated_on date,
  deactivated_on date,
  maintenance_monthly_cents integer check (maintenance_monthly_cents is null or maintenance_monthly_cents >= 0),
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (deactivated_on is null or activated_on is null or deactivated_on >= activated_on)
);

create table public.managed_domains (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.managed_websites(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 253),
  provider text,
  contracted_on date,
  next_renewal_on date,
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.domain_events (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.managed_domains(id) on delete cascade,
  event_type text not null check (event_type in ('purchase', 'renewal', 'other')),
  event_date date not null,
  provider text,
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  notes text,
  file_path text,
  file_name text,
  file_mime text check (file_mime is null or file_mime in ('application/pdf', 'image/jpeg', 'image/png')),
  file_size integer check (file_size is null or file_size <= 10485760),
  created_at timestamptz not null default now()
);

create table public.maintenance_payments (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.managed_websites(id) on delete cascade,
  paid_on date not null,
  amount_cents integer not null check (amount_cents >= 0),
  notes text,
  voided_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.maintenance_payment_periods (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.maintenance_payments(id) on delete cascade,
  website_id uuid not null references public.managed_websites(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  unique (website_id, period_start),
  check (period_end > period_start)
);

create index managed_domains_renewal_idx on public.managed_domains(next_renewal_on);
create index managed_websites_active_idx on public.managed_websites(archived, activated_on);
create index maintenance_periods_website_idx on public.maintenance_payment_periods(website_id, period_start);

create or replace function public.guard_managed_website_dates() returns trigger language plpgsql as $$
begin
  if old.activated_on is distinct from new.activated_on and exists (select 1 from public.maintenance_payment_periods where website_id = old.id) then
    raise exception 'ACTIVATION_DATE_LOCKED';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger managed_websites_guard before update on public.managed_websites for each row execute function public.guard_managed_website_dates();

alter table public.managed_websites enable row level security;
alter table public.managed_domains enable row level security;
alter table public.domain_events enable row level security;
alter table public.maintenance_payments enable row level security;
alter table public.maintenance_payment_periods enable row level security;

create policy "admin managed websites" on public.managed_websites for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin managed domains" on public.managed_domains for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin domain events" on public.domain_events for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin maintenance payments" on public.maintenance_payments for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin maintenance periods" on public.maintenance_payment_periods for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create or replace function public.create_managed_website(
  p_business_id uuid,
  p_business_name text,
  p_website_url text,
  p_activated_on date,
  p_maintenance_monthly_cents integer,
  p_notes text,
  p_proposal_id uuid
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_business_id uuid; v_id uuid;
begin
  if not public.is_active_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  v_business_id := p_business_id;
  if v_business_id is null and p_proposal_id is not null then
    select business_id into v_business_id from public.proposals where id = p_proposal_id;
  end if;
  if v_business_id is null then
    insert into public.businesses(name, business_type) values (nullif(trim(p_business_name), ''), 'Cliente') returning id into v_business_id;
  end if;
  insert into public.managed_websites(business_id, proposal_id, website_url, activated_on, maintenance_monthly_cents, notes)
  values (v_business_id, p_proposal_id, nullif(trim(p_website_url), ''), p_activated_on, p_maintenance_monthly_cents, nullif(trim(p_notes), '')) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_managed_website(uuid,text,text,date,integer,text,uuid) from public, anon;
grant execute on function public.create_managed_website(uuid,text,text,date,integer,text,uuid) to authenticated;

create or replace function public.register_maintenance_payment(
  p_website_id uuid,
  p_paid_on date,
  p_amount_cents integer,
  p_period_starts date[],
  p_period_ends date[],
  p_notes text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_payment_id uuid; i integer;
begin
  if not public.is_active_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if coalesce(array_length(p_period_starts, 1), 0) = 0 or array_length(p_period_starts, 1) <> array_length(p_period_ends, 1) then raise exception 'INVALID_PERIODS'; end if;
  insert into public.maintenance_payments(website_id, paid_on, amount_cents, notes) values (p_website_id, p_paid_on, p_amount_cents, nullif(trim(p_notes), '')) returning id into v_payment_id;
  for i in 1..array_length(p_period_starts, 1) loop
    insert into public.maintenance_payment_periods(payment_id, website_id, period_start, period_end)
    values (v_payment_id, p_website_id, p_period_starts[i], p_period_ends[i]);
  end loop;
  return v_payment_id;
exception when unique_violation then raise exception 'PERIOD_ALREADY_PAID';
end;
$$;
revoke all on function public.register_maintenance_payment(uuid,date,integer,date[],date[],text) from public, anon;
grant execute on function public.register_maintenance_payment(uuid,date,integer,date[],date[],text) to authenticated;

create or replace function public.void_maintenance_payment(p_payment_id uuid) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_active_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  update public.maintenance_payments set voided_at = coalesce(voided_at, now()) where id = p_payment_id;
end;
$$;
revoke all on function public.void_maintenance_payment(uuid) from public, anon;
grant execute on function public.void_maintenance_payment(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('domain-invoices', 'domain-invoices', false, 10485760, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

create policy "admin read domain invoices" on storage.objects for select to authenticated using (bucket_id = 'domain-invoices' and public.is_active_admin());
create policy "admin upload domain invoices" on storage.objects for insert to authenticated with check (bucket_id = 'domain-invoices' and public.is_active_admin());
create policy "admin delete domain invoices" on storage.objects for delete to authenticated using (bucket_id = 'domain-invoices' and public.is_active_admin());
