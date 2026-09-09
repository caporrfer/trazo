create extension if not exists pgcrypto;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create or replace function public.normalized_search(value text) returns text
language sql immutable parallel safe
set search_path = ''
as $$ select lower(extensions.unaccent(coalesce(value, ''))) $$;

create type proposal_stage as enum ('draft', 'prepared', 'sent', 'archived');
create type commercial_status as enum ('unclassified', 'pending_contact', 'contacted', 'waiting', 'interested', 'client', 'not_interested');
create type response_intent as enum ('information', 'changes', 'talk', 'share', 'opinion', 'demo_help', 'decline');
create type followup_state as enum ('none', 'pending', 'attended');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text check (name is null or char_length(name) between 2 and 140),
  business_type text check (business_type is null or char_length(business_type) between 2 and 80),
  search_name text generated always as (public.normalized_search(name)) stored,
  known_contact_name text,
  known_contact_email text,
  known_contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  slug text unique check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  public_token text not null unique check (char_length(public_token) >= 22),
  demo_url text check (demo_url is null or demo_url ~ '^https://'),
  form_version integer not null default 1 check (form_version > 0),
  stage proposal_stage not null default 'draft',
  commercial_status commercial_status not null default 'unclassified',
  is_active boolean not null default false,
  activated_at timestamptz,
  sent_at timestamptz,
  next_contact_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archived_is_inactive check (stage <> 'archived' or is_active = false)
);

create table public.responses (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  request_id uuid not null,
  form_version integer not null,
  pricing_version integer not null default 1,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  intent response_intent not null,
  impression text,
  goal text,
  selected_plan text,
  respondent_name text check (char_length(respondent_name) <= 100),
  relationship text,
  decision_role text,
  decline_reason text,
  is_read boolean not null default false,
  followup_status followup_state not null default 'none',
  created_at timestamptz not null default now(),
  unique (proposal_id, request_id)
);

create table public.response_contacts (
  response_id uuid primary key references public.responses(id) on delete cascade,
  method text not null check (method in ('whatsapp', 'phone', 'email', 'relay')),
  contact_value text check (char_length(contact_value) <= 180),
  preferred_time text,
  preferred_datetime timestamptz,
  relay_email text,
  check (method = 'relay' or nullif(trim(contact_value), '') is not null)
);

create table public.domain_preferences (
  response_id uuid primary key references public.responses(id) on delete cascade,
  status text not null check (status in ('existing', 'wanted', 'help', 'undecided')),
  current_domain text,
  desired_domains text[] not null default '{}',
  check (cardinality(desired_domains) <= 3)
);

create table public.response_changes (
  response_id uuid not null references public.responses(id) on delete cascade,
  category text not null check (category in ('design', 'photos', 'texts', 'structure', 'menu', 'reservations', 'orders', 'whatsapp', 'languages', 'other')),
  primary key (response_id, category)
);

create table public.pricing_versions (
  version integer primary key,
  content jsonb not null,
  active_from timestamptz not null default now(),
  active_until timestamptz
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  response_id uuid references public.responses(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  response_id uuid references public.responses(id) on delete set null,
  author_id uuid not null references auth.users(id) on delete restrict,
  channel text not null check (channel in ('whatsapp', 'phone', 'email', 'other')),
  result text not null check (char_length(result) between 1 and 1000),
  contacted_at timestamptz not null default now(),
  next_contact_at timestamptz
);

create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  origin_hash text not null,
  created_at timestamptz not null default now()
);

create index proposals_business_idx on public.proposals(business_id);
create index businesses_search_name_idx on public.businesses using gin (search_name extensions.gin_trgm_ops);
create index proposals_status_idx on public.proposals(commercial_status, stage);
create index proposals_next_contact_idx on public.proposals(next_contact_at) where next_contact_at is not null;
create index responses_proposal_date_idx on public.responses(proposal_id, created_at desc);
create index responses_filters_idx on public.responses(intent, selected_plan, created_at desc);
create index responses_unread_idx on public.responses(created_at desc) where is_read = false;
create index responses_followup_idx on public.responses(created_at desc) where followup_status = 'pending';
create index rate_limit_origin_idx on public.rate_limit_events(origin_hash, created_at desc);
create index rate_limit_proposal_idx on public.rate_limit_events(proposal_id, created_at desc);

alter table public.admin_users enable row level security;
alter table public.businesses enable row level security;
alter table public.proposals enable row level security;
alter table public.responses enable row level security;
alter table public.response_contacts enable row level security;
alter table public.domain_preferences enable row level security;
alter table public.response_changes enable row level security;
alter table public.pricing_versions enable row level security;
alter table public.notes enable row level security;
alter table public.followups enable row level security;
alter table public.rate_limit_events enable row level security;

create function public.is_active_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and active = true);
$$;

revoke all on function public.is_active_admin() from public;
grant execute on function public.is_active_admin() to authenticated;

create policy "admin read own record" on public.admin_users for select to authenticated using (user_id = auth.uid() and active = true);
create policy "admin businesses" on public.businesses for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin proposals" on public.proposals for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin responses" on public.responses for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin contacts" on public.response_contacts for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin domains" on public.domain_preferences for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin changes" on public.response_changes for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin pricing" on public.pricing_versions for select to authenticated using (public.is_active_admin());
create policy "admin notes" on public.notes for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin followups" on public.followups for all to authenticated using (public.is_active_admin()) with check (public.is_active_admin());

create or replace function public.prevent_public_link_change() returns trigger language plpgsql as $$
begin
  if old.activated_at is not null and (new.slug is distinct from old.slug or new.public_token is distinct from old.public_token) then
    raise exception 'PUBLIC_LINK_LOCKED';
  end if;
  if new.is_active and old.activated_at is null then new.activated_at := now(); end if;
  if (new.is_active or new.stage in ('prepared', 'sent')) and (
    new.slug is null or new.demo_url is null or
    not exists (
      select 1 from public.businesses b
      where b.id = new.business_id and b.name is not null and b.business_type is not null
    )
  ) then
    raise exception 'PROPOSAL_INCOMPLETE';
  end if;
  if new.stage = 'archived' then new.is_active := false; new.archived_at := coalesce(new.archived_at, now()); end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger proposals_guard before update on public.proposals for each row execute function public.prevent_public_link_change();

create or replace function public.create_proposal_with_business(
  p_business_name text,
  p_business_type text,
  p_slug text,
  p_public_token text,
  p_demo_url text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_proposal_id uuid;
begin
  if not public.is_active_admin() then raise exception 'NOT_AUTHORIZED'; end if;

  insert into public.businesses(name, business_type)
  values (nullif(trim(p_business_name), ''), nullif(trim(p_business_type), ''))
  returning id into v_business_id;

  insert into public.proposals(business_id, slug, public_token, demo_url)
  values (v_business_id, nullif(trim(p_slug), ''), p_public_token, nullif(trim(p_demo_url), ''))
  returning id into v_proposal_id;

  return v_proposal_id;
end;
$$;

revoke all on function public.create_proposal_with_business(text,text,text,text,text) from public, anon;
grant execute on function public.create_proposal_with_business(text,text,text,text,text) to authenticated;

create or replace function public.update_proposal_details(
  p_proposal_id uuid,
  p_business_name text,
  p_business_type text,
  p_slug text,
  p_demo_url text,
  p_known_contact_name text,
  p_known_contact_email text,
  p_known_contact_phone text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
begin
  if not public.is_active_admin() then raise exception 'NOT_AUTHORIZED'; end if;

  select business_id into v_business_id
  from public.proposals
  where id = p_proposal_id
  for update;
  if not found then raise exception 'PROPOSAL_NOT_FOUND'; end if;

  update public.businesses
  set name = nullif(trim(p_business_name), ''),
      business_type = nullif(trim(p_business_type), ''),
      known_contact_name = nullif(trim(p_known_contact_name), ''),
      known_contact_email = nullif(trim(p_known_contact_email), ''),
      known_contact_phone = nullif(trim(p_known_contact_phone), ''),
      updated_at = now()
  where id = v_business_id;

  update public.proposals
  set slug = nullif(trim(p_slug), ''),
      demo_url = nullif(trim(p_demo_url), '')
  where id = p_proposal_id;
end;
$$;

revoke all on function public.update_proposal_details(uuid,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.update_proposal_details(uuid,text,text,text,text,text,text,text) to authenticated;

create or replace function public.register_followup(
  p_proposal_id uuid,
  p_response_id uuid,
  p_channel text,
  p_result text,
  p_next_contact_at timestamptz
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_followup_id uuid;
begin
  if not public.is_active_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_response_id is not null and not exists (
    select 1 from public.responses where id = p_response_id and proposal_id = p_proposal_id
  ) then raise exception 'INVALID_RESPONSE'; end if;

  insert into public.followups(proposal_id, response_id, author_id, channel, result, next_contact_at)
  values (p_proposal_id, p_response_id, auth.uid(), p_channel, p_result, p_next_contact_at)
  returning id into v_followup_id;

  if p_response_id is not null then
    update public.responses set followup_status = 'attended' where id = p_response_id;
  end if;
  update public.proposals
  set next_contact_at = p_next_contact_at, commercial_status = 'contacted'
  where id = p_proposal_id;
  if not found then raise exception 'PROPOSAL_NOT_FOUND'; end if;

  return v_followup_id;
end;
$$;

revoke all on function public.register_followup(uuid,uuid,text,text,timestamptz) from public, anon;
grant execute on function public.register_followup(uuid,uuid,text,text,timestamptz) to authenticated;

create or replace function public.submit_proposal_response(
  p_proposal_id uuid,
  p_request_id uuid,
  p_form_version integer,
  p_payload jsonb,
  p_ip_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_proposal public.proposals%rowtype;
  v_response_id uuid;
  v_existing uuid;
  v_intent text;
  v_change text;
begin
  delete from public.rate_limit_events where created_at < now() - interval '24 hours';

  perform pg_advisory_xact_lock(hashtextextended('request:' || p_proposal_id::text || ':' || p_request_id::text, 0));

  select * into v_proposal from public.proposals where id = p_proposal_id for share;
  if not found or not v_proposal.is_active or v_proposal.stage = 'archived' then raise exception 'INACTIVE_PROPOSAL'; end if;
  if v_proposal.form_version <> p_form_version then raise exception 'FORM_VERSION_MISMATCH'; end if;

  select id into v_existing from public.responses where proposal_id = p_proposal_id and request_id = p_request_id;
  if found then return jsonb_build_object('id', v_existing, 'duplicate', true); end if;

  perform pg_advisory_xact_lock(hashtextextended('origin:' || p_ip_hash, 0));
  perform pg_advisory_xact_lock(hashtextextended('proposal:' || p_proposal_id::text, 0));

  if (select count(*) from public.rate_limit_events where origin_hash = p_ip_hash and created_at > now() - interval '10 minutes') >= 10
     or (select count(*) from public.rate_limit_events where proposal_id = p_proposal_id and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'RATE_LIMIT';
  end if;
  insert into public.rate_limit_events(proposal_id, origin_hash) values (p_proposal_id, p_ip_hash);

  v_intent := p_payload->>'intent';
  if v_intent not in ('information','changes','talk','share','opinion','demo_help','decline') then raise exception 'INVALID_INTENT'; end if;

  insert into public.responses(proposal_id, request_id, form_version, answers, intent, impression, goal, selected_plan, respondent_name, relationship, decision_role, decline_reason, followup_status)
  values (p_proposal_id, p_request_id, p_form_version, p_payload, v_intent::response_intent, p_payload->>'impression', p_payload->>'goal', p_payload->>'plan', nullif(trim(p_payload->>'respondentName'),''), p_payload->>'relationship', p_payload->>'decisionRole', p_payload->>'declineReason', case when v_intent in ('information','changes','talk','demo_help') then 'pending'::followup_state else 'none'::followup_state end)
  returning id into v_response_id;

  if p_payload ? 'contactMethod' and nullif(p_payload->>'contactMethod','') is not null then
    insert into public.response_contacts(response_id, method, contact_value, preferred_time, preferred_datetime, relay_email)
    values (v_response_id, p_payload->>'contactMethod', nullif(trim(p_payload->>'contactValue'),''), p_payload->>'contactTime', nullif(p_payload->>'preferredDateTime','')::timestamptz, nullif(trim(p_payload->>'relayEmail'),''));
  end if;

  if p_payload ? 'domainStatus' and nullif(p_payload->>'domainStatus','') is not null then
    insert into public.domain_preferences(response_id, status, current_domain, desired_domains)
    values (
      v_response_id,
      p_payload->>'domainStatus',
      nullif(trim(p_payload->>'currentDomain'),''),
      coalesce(array(
        select d.value
        from jsonb_array_elements_text(coalesce(p_payload->'desiredDomains','[]'::jsonb)) as d(value)
        where d.value <> ''
        limit 3
      ), '{}')
    );
  end if;

  for v_change in select jsonb_array_elements_text(coalesce(p_payload->'changes','[]'::jsonb)) loop
    insert into public.response_changes(response_id, category) values (v_response_id, v_change) on conflict do nothing;
  end loop;
  return jsonb_build_object('id', v_response_id, 'duplicate', false);
end;
$$;

revoke all on function public.submit_proposal_response(uuid,uuid,integer,jsonb,text) from public, anon, authenticated;
grant execute on function public.submit_proposal_response(uuid,uuid,integer,jsonb,text) to service_role;

create view public.proposal_overview with (security_invoker = true) as
select p.*, b.name as business_name, b.business_type, b.search_name as business_search_name,
  b.known_contact_name, b.known_contact_email, b.known_contact_phone,
  (select count(*) from public.responses r where r.proposal_id = p.id) as response_count,
  (select count(*) from public.responses r where r.proposal_id = p.id and not r.is_read) as unread_count
from public.proposals p join public.businesses b on b.id = p.business_id;

create view public.response_overview with (security_invoker = true) as
select r.*, b.name as business_name, b.search_name as business_search_name, c.method as contact_method, c.contact_value
from public.responses r
join public.proposals p on p.id = r.proposal_id
join public.businesses b on b.id = p.business_id
left join public.response_contacts c on c.response_id = r.id;

insert into public.pricing_versions(version, content) values (1, '{"hosting":{"initial":300,"monthly":29},"updates":{"initial":300,"monthly":39},"development":{"single":950},"currency":"EUR"}');

-- Después del primer acceso con Google, autoriza la cuenta única:
-- insert into public.admin_users(user_id, email)
-- select id, email from auth.users where lower(email) = lower('tu-correo@example.com');
