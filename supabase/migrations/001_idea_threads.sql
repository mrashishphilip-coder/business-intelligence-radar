create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create table if not exists idea_threads (
  id uuid primary key default gen_random_uuid(),
  canonical_thesis text not null,
  category text not null default 'Other',
  status text not null default 'active' check (status in ('active','dormant','closed')),
  current_confidence numeric(4,2) not null default 5.0,
  current_evidence numeric(4,2) not null default 5.0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_material_update_at timestamptz not null default now(),
  observation_count integer not null default 0,
  supporting_count integer not null default 0,
  challenging_count integer not null default 0,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists source_episodes (
  id text primary key,
  source text not null,
  title text not null,
  url text,
  transcript_url text,
  published_at timestamptz,
  content_type text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists thread_observations (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references idea_threads(id) on delete cascade,
  observed_at timestamptz not null default now(),
  claim text not null,
  synthesis text,
  stance text not null default 'neutral' check (stance in ('supports','challenges','neutral')),
  confidence numeric(4,2),
  evidence_score numeric(4,2),
  novelty_score numeric(4,2),
  relevance_score numeric(4,2),
  source_episode_ids text[] not null default '{}',
  contradiction_flag boolean not null default false,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists feedback_events (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references idea_threads(id) on delete set null,
  observation_id uuid references thread_observations(id) on delete set null,
  feedback_type text not null check (feedback_type in ('useful','skip','deep_dive')),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idea_threads_last_seen_idx on idea_threads(last_seen_at desc);
create index if not exists thread_observations_thread_time_idx on thread_observations(thread_id, observed_at desc);
create index if not exists idea_threads_thesis_trgm_idx on idea_threads using gin (canonical_thesis gin_trgm_ops);
create index if not exists idea_threads_embedding_hnsw_idx on idea_threads using hnsw (embedding vector_cosine_ops);
create index if not exists observations_embedding_hnsw_idx on thread_observations using hnsw (embedding vector_cosine_ops);

create or replace function match_idea_threads(
  query_embedding vector(1536),
  match_threshold float default 0.72,
  match_count int default 5
)
returns table (
  id uuid,
  canonical_thesis text,
  category text,
  current_confidence numeric,
  current_evidence numeric,
  similarity float
)
language sql stable
as $$
  select
    t.id,
    t.canonical_thesis,
    t.category,
    t.current_confidence,
    t.current_evidence,
    1 - (t.embedding <=> query_embedding) as similarity
  from idea_threads t
  where t.status = 'active'
    and t.embedding is not null
    and 1 - (t.embedding <=> query_embedding) >= match_threshold
  order by t.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function match_idea_threads_text(
  query_text text,
  match_threshold float default 0.18,
  match_count int default 5
)
returns table (
  id uuid,
  canonical_thesis text,
  category text,
  current_confidence numeric,
  current_evidence numeric,
  similarity float
)
language sql stable
as $$
  select
    t.id,
    t.canonical_thesis,
    t.category,
    t.current_confidence,
    t.current_evidence,
    similarity(t.canonical_thesis, query_text) as similarity
  from idea_threads t
  where t.status = 'active'
    and similarity(t.canonical_thesis, query_text) >= match_threshold
  order by similarity(t.canonical_thesis, query_text) desc
  limit match_count;
$$;

alter table idea_threads enable row level security;
alter table source_episodes enable row level security;
alter table thread_observations enable row level security;
alter table feedback_events enable row level security;
