insert into public.businesses(id, name, business_type)
values ('11111111-1111-4111-8111-111111111111', 'Restaurante Paco', 'Restaurante')
on conflict do nothing;

insert into public.proposals(id, business_id, slug, public_token, demo_url, stage, commercial_status, is_active, activated_at)
values ('11111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'restaurante-paco', 'demo-seguro-trazo-2026', 'https://example.com', 'sent', 'unclassified', true, now())
on conflict do nothing;
