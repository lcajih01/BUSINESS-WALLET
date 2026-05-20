-- Hotel Wallet — Supabase Schema
-- All IDs are text (not uuid) to support both legacy seed IDs and crypto.randomUUID() outputs.
-- RLS is disabled; this app has no per-user row isolation.

create table if not exists wallet_balances (
  id         text primary key,
  balance    numeric not null default 0,
  updated_at timestamptz default now()
);

create table if not exists transactions (
  id                text primary key,
  type              text not null,
  business          text not null,
  wallet            text not null,
  to_wallet         text,
  transfer_group_id text,
  category          text,
  amount            numeric not null,
  note              text default '',
  room              text,
  created_at        timestamptz not null
);

create table if not exists bills (
  id            text primary key,
  name          text not null,
  business      text not null,
  amount        numeric not null,
  due_date      text not null,
  priority      text not null default 'IMPORTANT',
  category      text,
  paid_amount   numeric not null default 0,
  paid_at       timestamptz,
  is_recurring  boolean not null default false,
  recurring_id  text,
  recurring_day int,
  created_at    timestamptz default now()
);

create table if not exists recurring_bills (
  id            text primary key,
  name          text not null,
  business      text not null,
  amount        numeric not null,
  priority      text not null,
  category      text,
  frequency     text not null,
  day_of_month  int,
  notes         text default '',
  next_due_date text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null
);

create table if not exists deposits (
  id           text primary key,
  business     text not null,
  guest_name   text not null,
  room         text default '',
  amount       numeric not null,
  payment_type text not null,
  wallet_id    text not null,
  status       text not null default 'ACTIVE',
  check_in     timestamptz,
  check_out    timestamptz,
  created_at   timestamptz not null,
  refunded_at  timestamptz,
  notes        text default ''
);

create table if not exists receivables (
  id           text primary key,
  wallet_id    text not null,
  business     text not null,
  source       text not null,
  amount       numeric not null,
  receive_date timestamptz not null,
  status       text not null default 'PENDING',
  notes        text default '',
  received_at  timestamptz,
  created_at   timestamptz not null
);

alter table wallet_balances  disable row level security;
alter table transactions      disable row level security;
alter table bills             disable row level security;
alter table recurring_bills   disable row level security;
alter table deposits          disable row level security;
alter table receivables       disable row level security;
