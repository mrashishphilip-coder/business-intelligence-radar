# Business Intelligence Radar

A personal research system that scans high-quality business conversations and surfaces the ideas most likely to materially deepen or change your thinking.

## Live pipeline

The production site now runs a live server-side pipeline:

1. **Discovery** — fetches current RSS feeds from the configured source set.
2. **Normalization** — extracts episode title, show notes, link, audio URL and publish time.
3. **Topic classification** — maps episodes into AI Products, Business Strategy, Investing, Fintech and Operators.
4. **Relevance scoring** — combines recency, topic fit, source quality and description depth.
5. **Novelty / repetition suppression** — uses token overlap to remove near-duplicate candidates.
6. **Ranking** — scores Novelty, Evidence, Confidence and Relevance independently.
7. **Delivery** — serves JSON from `/api/radar`, rendered by the Today view.
8. **Feedback memory** — Useful / Not for me signals are stored locally in the browser.
9. **Scheduled refresh** — Vercel cron warms the Radar each day shortly before 8:00 AM IST.
10. **Fallback behavior** — the interface remains usable if an individual source feed is temporarily unavailable.

### Current live sources
- Acquired
- Lenny's Podcast
- The a16z Show
- Invest Like the Best

## Important product boundary

This is now a **live discovery + ranking pipeline**, but not yet a transcript-grade synthesis engine. Show notes are treated honestly as show notes.

The next intelligence layer will add:
- transcript acquisition;
- atomic claim extraction;
- semantic clustering across episodes;
- contradiction detection;
- persistent Idea Threads;
- server-side personalization;
- AI synthesis with citations.

## Endpoints
- `/api/radar` — current ranked live Radar
- `/api/health` — service health

## Product principle
Podcasts are raw research material, not the unit of output. The unit of output is the **idea**.


## Persistence
Idea Threads are persisted through a secured Supabase Edge Function backed by Postgres + pgvector. Supabase Edge AI generates native 384-dimensional gte-small embeddings for semantic thread matching. Browser-local memory remains a fallback only.
