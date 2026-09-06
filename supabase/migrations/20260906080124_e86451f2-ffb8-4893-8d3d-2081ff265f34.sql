create or replace function public.place_stake(_market_id uuid, _outcome_id uuid, _amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _bal numeric;
  _first boolean;
begin
  if _uid is null then raise exception 'Not signed in'; end if;
  if _amount is null or _amount <= 0 then raise exception 'Amount must be positive'; end if;

  select balance into _bal from wallets where user_id = _uid for update;
  if _bal is null then raise exception 'No wallet found'; end if;
  if _bal < _amount then raise exception 'Insufficient balance'; end if;

  if not exists (
    select 1 from markets m
    join market_outcomes o on o.market_id = m.id
    where m.id = _market_id and o.id = _outcome_id and m.state = 'open'
  ) then raise exception 'Market is not open'; end if;

  update wallets set balance = balance - _amount, locked = locked + _amount, updated_at = now()
  where user_id = _uid;

  select not exists (select 1 from stakes where market_id = _market_id and user_id = _uid) into _first;

  insert into stakes(market_id, outcome_id, user_id, amount)
  values (_market_id, _outcome_id, _uid, _amount);

  update market_outcomes set pool = pool + _amount where id = _outcome_id;

  update markets
  set volume = volume + _amount,
      traders = traders + case when _first then 1 else 0 end,
      updated_at = now()
  where id = _market_id;

  insert into transactions(user_id, kind, amount, label, channel, status)
  values (_uid, 'stake', -_amount, 'Stake placed', 'wallet', 'complete');

  return (select balance from wallets where user_id = _uid);
end
$$;

revoke all on function public.place_stake(uuid, uuid, numeric) from public, anon;
grant execute on function public.place_stake(uuid, uuid, numeric) to authenticated;

create or replace function public.settle_provider_transaction(
  _provider_ref text,
  _success boolean,
  _payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _txn transactions;
begin
  select * into _txn from transactions where provider_ref = _provider_ref for update;
  if _txn.id is null then return; end if;
  if _txn.status <> 'pending' then return; end if;

  if _success then
    update transactions set status = 'complete', provider_payload = _payload where id = _txn.id;
    if _txn.kind = 'topup' then
      update wallets set balance = balance + abs(_txn.amount), updated_at = now() where user_id = _txn.user_id;
    end if;
  else
    update transactions set status = 'failed', provider_payload = _payload where id = _txn.id;
    if _txn.kind = 'withdraw' then
      update wallets set balance = balance + abs(_txn.amount), updated_at = now() where user_id = _txn.user_id;
    end if;
  end if;
end
$$;

revoke all on function public.settle_provider_transaction(text, boolean, jsonb) from public, anon, authenticated;

create or replace function public.hold_withdrawal(_amount numeric, _phone text, _fee numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _bal numeric;
  _total numeric := _amount + coalesce(_fee, 0);
  _txn_id uuid;
begin
  if _uid is null then raise exception 'Not signed in'; end if;
  if _amount is null or _amount <= 0 then raise exception 'Amount must be positive'; end if;

  select balance into _bal from wallets where user_id = _uid for update;
  if _bal is null or _bal < _total then raise exception 'Insufficient balance'; end if;

  update wallets set balance = balance - _total, updated_at = now() where user_id = _uid;

  insert into transactions(user_id, kind, amount, label, channel, status)
  values (_uid, 'withdraw', -_total, 'M-Pesa withdrawal to ' || _phone, 'M-Pesa', 'pending')
  returning id into _txn_id;

  return _txn_id;
end
$$;

revoke all on function public.hold_withdrawal(numeric, text, numeric) from public, anon;
grant execute on function public.hold_withdrawal(numeric, text, numeric) to authenticated;

create or replace function public.debit_market_seed(_amount numeric, _market_label text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _bal numeric;
begin
  if _uid is null then raise exception 'Not signed in'; end if;
  if _amount is null or _amount < 0 then raise exception 'Invalid seed amount'; end if;
  if _amount = 0 then return; end if;

  select balance into _bal from wallets where user_id = _uid for update;
  if _bal is null or _bal < _amount then raise exception 'Insufficient balance to seed this market'; end if;

  update wallets set balance = balance - _amount, locked = locked + _amount, updated_at = now()
  where user_id = _uid;

  insert into transactions(user_id, kind, amount, label, channel, status)
  values (_uid, 'stake', -_amount, 'Seeded market: ' || _market_label, 'wallet', 'complete');
end
$$;

revoke all on function public.debit_market_seed(numeric, text) from public, anon;
grant execute on function public.debit_market_seed(numeric, text) to authenticated;