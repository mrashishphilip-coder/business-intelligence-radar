# Business Intelligence Radar

Business Intelligence Radar is a personal AI research product that turns high-quality business conversations into a small number of decision-useful ideas.

**Product thesis:** the unit of value is not the episode or transcript. It is the **idea**.

Live product: https://business-intelligence-radar.vercel.app

---

## Problem

Business content is abundant; attention is scarce.

Most tools optimize for:
- episode summaries;
- transcript summaries;
- popularity;
- keyword alerts.

That still leaves the user with the same core problem: too much content, repeated ideas, little memory, and weak synthesis across sources.

The Radar is designed to answer a different question:

> **What is genuinely worth knowing, what is changing, and what should I investigate further?**

---

## Target user

A business, product, investing or technology professional who:
- consumes long-form business content;
- cares more about insight quality than content volume;
- wants cross-source synthesis rather than episode summaries;
- wants important ideas to accumulate over time.

---

## Core jobs to be done

1. **Filter noise** — surface only ideas that clear a quality bar.
2. **Synthesize across sources** — combine related claims into a stronger thesis.
3. **Track belief evolution** — show how evidence changes an Idea Thread over time.
4. **Expose disagreement** — distinguish consensus from credible counterarguments.
5. **Allocate attention** — tell the user which 1–2 items deserve a deeper dive.

---

## Product workflow

```text
Sources
  ↓
Transcript / show-note ingestion
  ↓
Candidate selection
  ↓
Atomic claim extraction
  ↓
Semantic clustering
  ↓
Consensus + contradiction detection
  ↓
Cross-source synthesis
  ↓
Novelty / Evidence / Confidence / Relevance
  ↓
Idea Thread matching
  ↓
Persistent semantic memory
  ↓
Today / Deep Dive / Weekly Review
```

---

## Core product surfaces

### Today

A small set of current ideas that clear the quality bar.

Each insight includes:
- synthesized thesis;
- why it matters;
- Novelty;
- Evidence;
- Confidence;
- Relevance;
- consensus / disagreement;
- source trail;
- feedback actions.

There is **no fixed daily quota**.

---

### Idea Threads

Persistent theses that evolve across multiple days and sources.

A thread should answer:
- what is the current thesis?
- what new evidence appeared?
- did confidence increase or decrease?
- what contradicts the thesis?
- which sources changed the view?

The goal is to accumulate knowledge rather than restart from zero each day.

---

### Deep Dive

Used when an idea is important enough to investigate.

It expands:
- thesis;
- supporting evidence;
- counterarguments;
- uncertainty;
- source trail.

---

### Weekly Review

A higher-level learning summary focused on:
- strongest belief updates;
- theses that strengthened;
- assumptions that weakened;
- unresolved questions;
- ideas worth remembering.

---

## Scoring model

Scores are independent. They should not be treated as one combined “truth score”.

| Score | Question |
|---|---|
| **Novelty** | Is this materially new versus what the user already knows or repeatedly sees? |
| **Evidence** | How strong is the underlying support? |
| **Confidence** | How strongly should the current thesis be believed given evidence and disagreement? |
| **Relevance** | How important is this to the user's interests and goals? |

Examples:

- **Novelty 9 / Evidence 6** → interesting emerging thesis, not yet established.
- **Novelty 6 / Evidence 9** → well-supported, but not necessarily worldview-changing.

---

## How to use the Radar

### Daily: 5–10 minutes

1. Open **Today**.
2. Read only the ideas that clear the quality bar.
3. Check the score pattern, not just the headline.
4. Read consensus and disagreement.
5. Open a **Deep Dive** only for ideas that may change a decision or belief.
6. Mark **Useful** or **Not for me** to improve future relevance.

The Radar should reduce content consumption, not create another feed.

### Weekly: 20–30 minutes

Use **Weekly Review** and Idea Threads to ask:
- What did I actually learn?
- Which thesis strengthened?
- Which belief weakened?
- What deserves further investigation?

---

## Current source set

Initial live sources:
- Acquired
- Lenny's Podcast
- The a16z Show
- Invest Like the Best

Future source types:
- earnings calls;
- investor letters;
- founder essays;
- technical blogs;
- conference talks;
- research reports.

Source type is secondary to idea quality.

---

## Persistence and semantic memory

Idea Threads are stored in **Supabase Postgres + pgvector**.

Main entities:
- `idea_threads` — canonical thesis and current state;
- `thread_observations` — evidence and updates over time;
- `source_episodes` — provenance;
- `feedback_events` — preference signals.

Supabase Edge AI generates **384-dimensional `gte-small` embeddings**.

New synthesized ideas are matched against existing threads using semantic similarity. If a strong match exists, the observation is appended; otherwise a new thread is created.

```text
new idea
  ↓
embedding
  ↓
pgvector similarity search
  ↓
existing thread OR new thread
  ↓
append observation
  ↓
update thread state
```

---

## Architecture

### Front end
Static HTML / CSS / JavaScript on Vercel.

### API
Vercel serverless functions.

### AI extraction and synthesis
Vercel AI SDK / AI Gateway with heuristic fallback.

### Persistent memory
Supabase Postgres + pgvector.

### Embeddings
Supabase Edge AI `gte-small`.

### Memory service
Secured Supabase Edge Function.

### Refresh
Vercel Cron shortly before the daily 8:00 AM IST Radar.

---

## Reliability principles

The product is designed to degrade gracefully.

```text
AI + transcript + semantic memory
            ↓
AI + show notes
            ↓
heuristic extraction
            ↓
browser-local fallback
```

A source or model failure should not make the product unusable.

---

## Security model

- Database tables are not exposed directly to the browser.
- Row Level Security is enabled.
- Persistent writes go through a secured Supabase Edge Function.
- Sensitive credentials remain server-side.

---

## Seven-day pilot guardrails

Before the first dogfooding week, three product changes were added:

1. **Thesis-first Idea Threads** — extraction and synthesis prompts now explicitly reject episode titles, guest names and promotional headlines as canonical thread names. Legacy episode-style threads are suppressed from the pilot UI.
2. **What changed today?** — recurring threads now show the score/evidence delta versus the prior observation instead of only listing history.
3. **Reasoned feedback** — “Not for me” asks whether the issue was Already knew this, Repetitive, Not relevant, Weak evidence or Too generic. Deep Dive opens are also captured as pilot feedback.

For the pilot, feedback reasons are retained in the browser so the one-week review can distinguish relevance, novelty and evidence problems.

---

## Current product gaps

The next meaningful improvements after the pilot are:

1. **Broader source discovery** — move beyond a fixed podcast list.
2. **Higher transcript coverage** — add additional transcript sources or audio transcription.
3. **Stronger personalization** — make Novelty increasingly mean “new to this user”.
4. **Better thread evolution logic** — explicit merge / split operations and stronger semantic matching.
5. **Weekly belief-change engine** — automatically identify the most important shifts in the user's mental model.

---

## Product north star

The goal is not to help the user consume more content.

The goal is to help the user:

> **build a better mental model of business while consuming dramatically less content.**

A mature Radar should reliably answer:
- What are the most important ideas I encountered this month?
- Which beliefs strengthened?
- Which beliefs weakened?
- What disagreements remain unresolved?
- Which emerging thesis deserves attention before it becomes consensus?
