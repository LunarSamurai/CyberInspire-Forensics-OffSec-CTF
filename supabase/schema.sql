-- =============================================
-- CTF PLATFORM — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── PROFILES ──────────────────────────────────
-- Extends auth.users with a public username
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  created_at timestamptz default now()
);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles(id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── CHALLENGES ────────────────────────────────
create table public.challenges (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text not null,           -- 'forensics' | 'web' | 'crypto' | 'pwn'
  description text not null,
  points      int  not null default 100,
  flag        text not null,           -- store as plaintext or hashed (see note below)
  hint        text,
  difficulty  text not null default 'medium', -- 'easy' | 'medium' | 'hard'
  created_at  timestamptz default now()
);

-- ── SOLVES ────────────────────────────────────
create table public.solves (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  solved_at    timestamptz default now(),
  unique(user_id, challenge_id)         -- one solve per user per challenge
);

-- ── SCOREBOARD VIEW ───────────────────────────
create or replace view public.scoreboard as
  select
    p.id          as user_id,
    p.username,
    p.created_at  as joined_at,
    coalesce(sum(c.points), 0) as total_points,
    count(s.id)   as solves_count,
    max(s.solved_at) as last_solve
  from public.profiles p
  left join public.solves    s on s.user_id      = p.id
  left join public.challenges c on c.id          = s.challenge_id
  group by p.id, p.username, p.created_at
  order by total_points desc, last_solve asc;

-- ── ROW LEVEL SECURITY ────────────────────────
alter table public.profiles   enable row level security;
alter table public.challenges  enable row level security;
alter table public.solves      enable row level security;

-- Profiles: anyone can read; owner can update their own
create policy "profiles_select_all"   on public.profiles for select using (true);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);

-- Challenges: anyone authenticated can read
create policy "challenges_select_auth" on public.challenges for select
  using (auth.role() = 'authenticated');

-- Solves: users can see all solves; can only insert their own
create policy "solves_select_all"  on public.solves for select using (true);
create policy "solves_insert_own"  on public.solves for insert
  with check (auth.uid() = user_id);

-- ── SEED CHALLENGES ───────────────────────────
-- ⚠️  Replace the flag values with your real flags before running!
insert into public.challenges (slug, title, category, description, points, flag, hint, difficulty)
values
  (
    'forensics-file-carving',
    'File Carving 101',
    'forensics',
    'A suspicious disk image was recovered from a compromised workstation. Buried inside is a hidden file that the attacker tried to wipe. Use file carving techniques to recover the deleted artifact and find the flag hidden within.

Tools you might need: Autopsy, foremost, scalpel, Sleuth Kit (icat / fls), or binwalk.

The image file is available in the challenge download.',
    300,
    'CTF{YOUR_FORENSICS_FLAG_HERE}',
    'Try running `foremost -t all -i disk.img` and check the output directory.',
    'medium'
  ),
  (
    'browser-history-hacking',
    'Web Browser History Hacking',
    'forensics',
    'An insider threat suspect''s browser was imaged before they wiped their laptop. The SOC team believes they exfiltrated data through a specific URL — but the history was "deleted". Recover the browsing history and find the flag the attacker hid in a visited URL.

The SQLite history database is in the challenge download. Supported browsers: Chrome, Firefox.',
    250,
    'CTF{YOUR_BROWSER_FLAG_HERE}',
    'Chrome history is stored in a SQLite DB. Try: `sqlite3 History "SELECT url FROM urls ORDER BY last_visit_time DESC LIMIT 50;"`',
    'easy'
  ),
  (
    'windows-password-hacking',
    'Windows Password Hacking',
    'forensics',
    'You''ve obtained the SAM and SYSTEM hive files from a Windows machine during an incident response engagement. The threat actor created a backdoor local account. Crack the NTLM hash of that account to reveal the flag.

Files: SAM and SYSTEM registry hives are in the challenge download.',
    350,
    'CTF{YOUR_WINDOWS_FLAG_HERE}',
    'Use `impacket-secretsdump -sam SAM -system SYSTEM LOCAL` to dump the hashes, then crack with hashcat or john.',
    'hard'
  );
