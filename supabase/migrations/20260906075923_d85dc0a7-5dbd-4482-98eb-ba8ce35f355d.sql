-- roles
create type public.app_role as enum ('admin','moderator','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null default '',
  phone text not null default '',
  bio text not null default '',
  avatar_url text,
  sms_updates boolean not null default true,
  mpesa_ready boolean not null default false,
  joined_community boolean not null default false,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles are public" on public.profiles for select using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- wallets
create table public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(14,2) not null default 0,
  locked numeric(14,2) not null default 0,
  referral_earnings numeric(14,2) not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.wallets to authenticated;
grant all on public.wallets to service_role;
alter table public.wallets enable row level security;
create policy "own wallet readable" on public.wallets for select to authenticated using (user_id = auth.uid());

-- transactions
create type public.txn_kind as enum ('topup','withdraw','stake','payout','creator_fee','referral','fee');
create type public.txn_status as enum ('pending','complete','failed');

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  kind public.txn_kind not null,
  amount numeric(14,2) not null,
  label text not null default '',
  channel text,
  status public.txn_status not null default 'pending',
  provider_ref text,
  provider_payload jsonb,
  created_at timestamptz not null default now()
);
create index transactions_user_created_idx on public.transactions (user_id, created_at desc);
create index transactions_provider_ref_idx on public.transactions (provider_ref);
grant select on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "own transactions readable" on public.transactions for select to authenticated using (user_id = auth.uid());

-- markets
create type public.market_kind as enum ('binary','multi','sports');
create type public.market_state as enum ('draft','pending','rejected','open','resolved','disputed');

create table public.markets (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  short_title text not null default '',
  description text not null default '',
  category text not null default 'politics',
  kind public.market_kind not null default 'binary',
  thumbnail_url text,
  thumbnail_emoji text not null default '🎯',
  versus jsonb,
  sports jsonb,
  closes_at timestamptz not null,
  resolution_criteria text not null default '',
  sources text[] not null default '{}',
  seed_liquidity numeric(14,2) not null default 0,
  creator_fee_bps int not null default 200,
  platform_fee_bps int not null default 300,
  state public.market_state not null default 'pending',
  ai_verdict text not null default 'pending',
  ai_note text not null default '',
  resolved_outcome_id uuid,
  resolved_at timestamptz,
  resolution_rationale text,
  volume numeric(14,2) not null default 0,
  traders int not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index markets_state_category_idx on public.markets (state, category);
grant select on public.markets to anon;
grant select, insert, update on public.markets to authenticated;
grant all on public.markets to service_role;
alter table public.markets enable row level security;
create policy "live markets are public" on public.markets for select using (state in ('open','resolved','disputed'));
create policy "creators read own markets" on public.markets for select to authenticated using (creator_id = auth.uid());
create policy "creators insert markets" on public.markets for insert to authenticated with check (creator_id = auth.uid());
create policy "creators edit pending markets" on public.markets for update to authenticated using (creator_id = auth.uid() and state in ('draft','pending','rejected')) with check (creator_id = auth.uid());

-- outcomes
create table public.market_outcomes (
  id uuid primary key default gen_random_uuid(),
  market_id uuid references public.markets(id) on delete cascade not null,
  label text not null,
  tone text not null default 'primary',
  sort int not null default 0,
  pool numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);
create index market_outcomes_market_idx on public.market_outcomes (market_id, sort);
grant select on public.market_outcomes to anon;
grant select, insert on public.market_outcomes to authenticated;
grant all on public.market_outcomes to service_role;
alter table public.market_outcomes enable row level security;
create policy "outcomes follow market visibility" on public.market_outcomes for select using (
  exists (select 1 from public.markets m where m.id = market_id and (m.state in ('open','resolved','disputed') or m.creator_id = auth.uid()))
);
create policy "creators add outcomes" on public.market_outcomes for insert to authenticated with check (
  exists (select 1 from public.markets m where m.id = market_id and m.creator_id = auth.uid())
);

-- stakes
create table public.stakes (
  id uuid primary key default gen_random_uuid(),
  market_id uuid references public.markets(id) on delete cascade not null,
  outcome_id uuid references public.market_outcomes(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(14,2) not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index stakes_user_idx on public.stakes (user_id, created_at desc);
create index stakes_market_idx on public.stakes (market_id);
grant select on public.stakes to authenticated;
grant all on public.stakes to service_role;
alter table public.stakes enable row level security;
create policy "own stakes readable" on public.stakes for select to authenticated using (user_id = auth.uid());

-- disputes
create table public.market_disputes (
  id uuid primary key default gen_random_uuid(),
  market_id uuid references public.markets(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  reason text not null,
  status text not null default 'open',
  ai_verdict text,
  created_at timestamptz not null default now()
);
grant select, insert on public.market_disputes to authenticated;
grant all on public.market_disputes to service_role;
alter table public.market_disputes enable row level security;
create policy "own disputes readable" on public.market_disputes for select to authenticated using (user_id = auth.uid());
create policy "own disputes insert" on public.market_disputes for insert to authenticated with check (user_id = auth.uid());

-- signup bootstrap
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1), 'forecaster'), '[^a-z0-9_]', '', 'g'));
  if base = '' then base := 'forecaster'; end if;
  candidate := base;
  while exists (select 1 from public.profiles p where p.username = candidate) loop
    n := n + 1;
    candidate := base || n::text;
  end loop;

  insert into public.profiles (id, username, name)
  values (new.id, candidate, coalesce(new.raw_user_meta_data->>'name', initcap(replace(base, '_', ' '))));

  insert into public.wallets (user_id) values (new.id);
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger markets_touch before update on public.markets for each row execute function public.touch_updated_at();