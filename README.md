# Business Intelligence Radar

Business Intelligence Radar is a personal research and learning system for people who consume a lot of high-quality business content but do not want to spend hours listening to every podcast, reading every transcript, or repeatedly encountering the same ideas.

The core product thesis is simple:

> **Podcasts, interviews, essays and other long-form sources are raw research material. The unit of output should be the idea.**

The Radar continuously scans selected business conversations, extracts atomic claims, clusters related ideas across sources, detects agreement and disagreement, scores what is genuinely new, and builds persistent **Idea Threads** that show how an important thesis evolves over time.

The live product is available at:

**https://business-intelligence-radar.vercel.app**

---

## Why we built this

There is no shortage of business content. The problem is the opposite: there is too much of it.

A single week can contain dozens of potentially useful founder interviews, investor conversations, technical discussions and strategy podcasts. Traditional content tools usually solve this by creating:

- episode summaries;
- transcript summaries;
- newsletters with links;
- recommendations based on popularity;
- keyword alerts.

Those approaches are useful, but they still organize information around the **content object**: the episode, article or transcript.

That is not how useful knowledge accumulates.

When several operators independently discuss outcome-based AI pricing, the useful output is not four episode summaries. The useful output is:

> **AI may expand the economically viable boundary of work, making previously uneconomic tasks worth performing.**

And then:

- who supports that thesis?
- what evidence do they give?
- who disagrees?
- is this genuinely new?
- has the thesis strengthened over the last three months?
- what would falsify it?
- is it important enough to change how I think or act?

Business Intelligence Radar is designed around that higher level of abstraction.

---

## The problem the Radar tries to solve

The product is intended to reduce five common failure modes in business-content consumption.

### 1. Information overload

A user may subscribe to dozens of podcasts and newsletters but realistically have time to explore only a few ideas each day.

The Radar therefore does **not** try to maximize content surfaced. It deliberately suppresses material that does not clear a quality threshold.

A quiet day with two useful ideas is better than an artificial “Top 10”.

### 2. Repetition disguised as learning

Popular business topics are repeated constantly. Hearing the same claim from five different people can create the feeling of learning even when no new information has been added.

The Radar separates:

- a repeated idea;
- new supporting evidence;
- a meaningful counterargument;
- a genuinely new mechanism;
- a material change in the thesis.

### 3. Summaries that remain trapped inside one source

Most summarizers answer:

> “What did this episode say?”

The Radar tries to answer:

> “What is the best current synthesis after considering several relevant conversations?”

That distinction is fundamental.

### 4. No memory across time

A daily digest usually forgets yesterday.

The Radar creates persistent **Idea Threads**, allowing a thesis to accumulate evidence and evolve.

For example:

**July**  
AI agents mainly help workers complete tasks.

**August**  
Several operators report agents handling complete sub-workflows.

**September**  
Human review starts becoming a mechanism for teaching organizational judgment.

**October**  
The emerging product boundary looks less like “AI assistant” and more like “system of action”.

The user should see the evolution, not four disconnected summaries.

### 5. Weak distinction between evidence and opinion

A compelling statement from a famous guest is not automatically strong evidence.

The Radar is designed to distinguish between:

- opinion;
- anecdote;
- operator experience;
- company data;
- industry data;
- cross-source corroboration;
- contradictory evidence.

This is reflected in the **Evidence** and **Confidence** scores.

---

# Product philosophy

## 1. The idea is the primary object

Episodes are sources.

Claims are raw material.

**Ideas are the product.**

A single idea can contain evidence from several episodes, speakers and eventually other source types.

---

## 2. No forced quota

The Radar should not produce five insights simply because the UI has room for five cards.

Only ideas above the quality threshold should be surfaced.

This means daily output can vary significantly.

---

## 3. Novelty matters separately from importance

A claim can be important but well known.

A claim can also be novel but poorly supported.

The Radar therefore scores **Novelty, Evidence, Confidence and Relevance independently**.

---

## 4. Disagreement is valuable

The goal is not to manufacture consensus.

If credible sources disagree, the disagreement should be visible.

Contradictions often contain more intelligence than agreement.

---

## 5. Memory should update beliefs

Idea Threads are intended to behave more like a research notebook than a news feed.

The product should be able to say:

> “This thesis strengthened.”

or:

> “The evidence is now mixed.”

or:

> “A new counterargument materially weakens the original claim.”

---

## 6. Provenance should remain visible

The Radar may synthesize above individual episodes, but the source trail should never disappear.

Users should always be able to inspect the underlying conversation.

---

# How the Radar works

The current production pipeline follows roughly this sequence:

```text
Long-form sources
       ↓
Episode discovery
       ↓
Transcript / show-note acquisition
       ↓
Candidate selection
       ↓
Atomic claim extraction
       ↓
Semantic clustering
       ↓
Agreement / contradiction analysis
       ↓
Cross-source synthesis
       ↓
Novelty / Evidence / Confidence / Relevance scoring
       ↓
Idea Thread matching
       ↓
Persistent pgvector memory
       ↓
Daily Radar + Deep Dive + Weekly Review
```

---

## 1. Discovery

The Radar currently scans selected podcast feeds including:

- Acquired
- Lenny's Podcast
- The a16z Show
- Invest Like the Best

The source pool is intentionally small in the initial version. The architecture is designed to expand later to:

- earnings calls;
- investor letters;
- founder essays;
- technical engineering blogs;
- conference talks;
- research reports;
- high-quality niche podcasts.

Source prestige alone does not determine whether an item is surfaced.

---

## 2. Transcript acquisition

Where a podcast exposes a transcript through Podcasting 2.0 metadata, the system attempts to retrieve it.

Supported transcript formats include:

- plain text;
- VTT;
- SRT-style text;
- JSON transcript structures.

If a transcript is unavailable, the Radar can still use show notes, but it explicitly marks the weaker evidence type.

This prevents the system from pretending that a short description is equivalent to a full transcript.

---

## 3. Candidate selection

Not every new episode deserves expensive analysis.

The Radar first applies a lightweight relevance filter using:

- topic fit;
- source quality;
- recency;
- description depth;
- user-interest keywords.

Only the strongest candidates move into deeper extraction.

---

## 4. Atomic claim extraction

The AI extraction layer decomposes long-form content into individual claims.

A useful atomic claim should ideally be:

- specific;
- falsifiable;
- mechanism-oriented;
- evidence-backed;
- commercially or strategically meaningful.

Bad atomic claim:

> AI is changing business.

Better atomic claim:

> AI agents may make low-value procurement negotiations economically viable because marginal execution cost approaches zero.

The extraction layer also records:

- category;
- evidence;
- stance;
- specificity;
- novelty.

---

## 5. Cross-source clustering

Claims with similar underlying meaning are grouped into clusters.

This is critical because different speakers rarely use the same wording.

For example:

> “Agents will execute workflows.”

and:

> “Software will increasingly own the process between systems of record.”

may be different expressions of the same underlying thesis.

Semantic matching is used to identify these relationships.

---

## 6. Synthesis

The synthesis layer operates **above the transcript level**.

Instead of summarizing each claim independently, it asks:

- what is the common thesis?
- what is genuinely new?
- where is the evidence strongest?
- what do the sources agree on?
- where do they disagree?
- why should the user care?

The result becomes a Radar insight.

---

# Understanding the four scores

Each surfaced insight receives four independent scores from 1–10.

## Novelty

**Question:** How much does this add beyond ideas the user is likely to have already encountered?

High novelty usually means:

- a new mechanism;
- new quantitative evidence;
- a surprising implication;
- an important reframing;
- a meaningful contradiction to conventional wisdom.

Low novelty often means:

- generic AI enthusiasm;
- standard founder advice;
- widely repeated market commentary.

Novelty does **not** mean the claim is necessarily true.

---

## Evidence

**Question:** How strong is the underlying support?

Evidence can strengthen when an insight contains:

- transcript-backed detail;
- operating examples;
- numbers;
- company data;
- multiple independent sources;
- corroborating evidence.

A highly interesting claim with little evidence can have high Novelty but moderate Evidence.

---

## Confidence

**Question:** Given all available evidence and disagreement, how strongly should the current thesis be believed?

Confidence considers:

- evidence quality;
- corroboration;
- contradictions;
- source diversity;
- uncertainty.

Confidence should change over time as an Idea Thread evolves.

---

## Relevance

**Question:** How relevant is this idea to the user's current intellectual and professional interests?

The initial Radar emphasizes areas such as:

- AI products and agents;
- business strategy;
- company building;
- competitive advantage;
- investing and capital allocation;
- fintech and financial services;
- India and UAE business themes;
- strong operator and founder insights.

Relevance is intentionally separate from universal importance.

---

# How to use the product

The Radar is designed to be used as an **attention allocation tool**, not as another feed to scroll indefinitely.

## Recommended daily workflow: 5–10 minutes

### Step 1: Open **Today**

Start with the small number of insights that cleared the daily quality bar.

Do not begin with the source list.

The purpose of the Radar is to decide which ideas deserve your attention before you decide which content deserves your time.

---

### Step 2: Look at the score pattern

Do not interpret the scores as one combined “truth score”.

Different combinations mean different things.

Example:

**Novelty 9.3 / Evidence 6.2**

This may be a highly interesting emerging thesis worth watching, but not something to treat as established.

Another example:

**Novelty 6.5 / Evidence 9.0**

This may not change your worldview, but it is probably a well-supported development.

---

### Step 3: Read Consensus and Disagreement

This is often the most valuable part of a card.

Ask:

> What exactly are the sources agreeing about?

and:

> What remains contested?

If the disagreement appears more interesting than the consensus, open the Deep Dive.

---

### Step 4: Use **Deep Dive** selectively

Do not deep-dive every insight.

Use it when:

- the thesis challenges your existing belief;
- the relevance score is high;
- there is meaningful disagreement;
- the idea has strategic consequences;
- you may want to act on the insight.

The Deep Dive exposes the source trail so you can choose whether to consume the original material.

---

### Step 5: Give feedback

Use:

- **Useful**
- **Not for me**
- **Deep Dive**

as genuine signals.

Feedback is not meant to create a social-media recommendation bubble.

The long-term objective is to learn the user's **intellectual taste**.

For example, the system may learn that the user consistently prefers:

- hard operating numbers;
- business-model mechanisms;
- unusual competitive dynamics;
- contrarian claims with evidence;

and consistently rejects:

- generic leadership advice;
- motivational content;
- promotional founder interviews.

---

# How to use Idea Threads

Idea Threads are the Radar's persistent knowledge layer.

A Thread represents a thesis that may recur across many days and sources.

Examples:

- Enterprise AI shifts from assistance to work ownership.
- AI expands the economically viable frontier of work.
- Indian fintech opportunity is moving toward harder vertical workflows.
- AI infrastructure spending is increasingly becoming a capital-markets story.

Each thread can contain:

- the current thesis;
- first-seen date;
- latest update;
- current confidence;
- current evidence score;
- supporting observations;
- challenging observations;
- contradiction flags;
- source history.

## The right way to read a Thread

Do not ask:

> “What does the thread say?”

Ask:

> **“What changed?”**

The most useful thread update is often a confidence change.

For example:

```text
Confidence
July       6.3
August     6.9
September  7.5
October    8.4
```

The interesting question becomes:

> What new evidence caused confidence to increase?

Likewise, a thread whose confidence falls from 8.1 to 6.5 deserves attention even if no dramatic new headline appeared.

---

# Recommended weekly workflow: 20–30 minutes

Once a week, use the Radar as a learning review rather than a content feed.

Focus on four questions:

### What did I actually learn?

Identify the 2–3 ideas that materially changed or sharpened your thinking.

### Which theses strengthened?

Look for Idea Threads where confidence rose because of new evidence.

### Which assumptions weakened?

A belief becoming less certain can be more valuable than discovering a completely new idea.

### What should I still investigate?

Good research systems should create better questions, not merely more answers.

---

# What the user should *not* do

The Radar works best when it changes consumption behavior.

Avoid using it as:

### Another infinite feed

If six insights are shown, that does not mean all six need to be consumed.

### A replacement for primary sources

The Radar decides where attention is worth spending.

For important decisions, inspect the source.

### A truth engine

Confidence reflects the current evidence set. It does not turn uncertain business claims into facts.

### A popularity ranking

A famous guest or widely shared episode does not automatically receive priority.

### A summary archive

The objective is not to preserve every conversation. The objective is to build a useful evolving model of important ideas.

---

# Example: from four episodes to one Idea Thread

Suppose four conversations produce these claims:

**Source A**

> AI procurement agents can negotiate contracts below thresholds that human teams historically ignored.

**Source B**

> AI services are increasingly being priced against outcomes rather than user seats.

**Source C**

> Lower inference and orchestration costs allow software to perform work that previously had negative ROI.

**Source D**

> AI productivity estimates often assume only substitution of current labor and may underestimate newly created activity.

A normal podcast application gives four summaries.

Business Intelligence Radar should produce something closer to:

### AI may expand the economically viable boundary of work

**Current thesis**

AI does not only reduce the cost of existing work. By drastically lowering marginal execution cost, it can make previously uneconomic tasks worth performing, potentially expanding addressable markets beyond current software and labor budgets.

**Consensus**

Multiple sources independently point toward cost compression creating new activity rather than only replacing existing activity.

**Open question**

How much of the new economic surplus will accrue to AI vendors versus customers?

**Confidence:** 8.0  
**Novelty:** 9.0  
**Evidence:** 7.9  
**Relevance:** 9.2

That becomes an Idea Thread.

Future evidence updates the same thread instead of creating another disconnected summary.

---

# Persistent semantic memory

Idea Threads are stored in **Supabase Postgres + pgvector**.

The system uses:

- `idea_threads` — canonical current thesis;
- `thread_observations` — historical evidence and claim updates;
- `source_episodes` — provenance;
- `feedback_events` — user preference signals.

Supabase Edge AI generates native **384-dimensional `gte-small` embeddings**.

When a new synthesized idea appears:

```text
new idea
   ↓
embedding
   ↓
pgvector similarity search
   ↓
nearest existing Idea Threads
   ↓
match existing thread OR create new thread
   ↓
append observation
   ↓
update confidence / evidence / contradiction state
```

This is what allows the Radar to accumulate knowledge instead of resetting every day.

---

# Current system architecture

```text
                     BUSINESS INTELLIGENCE RADAR

     Acquired        Lenny's        a16z        Invest Like the Best
         \              |             |                 /
                         RSS
                          ↓
                    Episode ingest
                          ↓
                Transcript acquisition
                          ↓
                 Candidate filtering
                          ↓
              Atomic claim extraction
                          ↓
                Semantic clustering
                          ↓
          Consensus / contradiction analysis
                          ↓
                   AI synthesis
                          ↓
        Novelty · Evidence · Confidence · Relevance
                          ↓
               Semantic Thread matching
                          ↓
              Supabase Postgres + pgvector
                          ↓
        ┌─────────────────┼──────────────────┐
        ↓                 ↓                  ↓
      Today          Idea Threads         Deep Dive
                          ↓
                    Weekly Review
```

---

# Current technology

### Front end
Static HTML / CSS / JavaScript hosted on Vercel.

### Application API
Vercel serverless functions.

### AI extraction and synthesis
Vercel AI SDK / AI Gateway with graceful heuristic fallback.

### Persistent memory
Supabase Postgres.

### Semantic matching
pgvector + HNSW indexes.

### Embeddings
Supabase Edge AI `gte-small`, 384 dimensions.

### Memory service
Secured Supabase Edge Function.

### Scheduled refresh
Vercel Cron shortly before the daily 8:00 AM IST Radar.

---

# Reliability principles

The Radar is designed to degrade gracefully.

If:

- one RSS feed fails;
- transcripts are unavailable;
- the AI synthesis layer temporarily fails;
- the persistent store is unavailable;

the entire application should not go blank.

The system progressively falls back from:

```text
AI + transcript + semantic memory
             ↓
AI + show notes
             ↓
heuristic extraction
             ↓
browser-local memory
```

The UI attempts to make the active mode visible.

---

# Security model

The database is not exposed directly to the browser.

All primary tables have Row Level Security enabled and deliberately have no public read/write policies.

Persistent memory operations are handled through a secured Supabase Edge Function.

Sensitive database credentials remain server-side.

This keeps the storage architecture private while still allowing the public Radar site to use persistent memory.

---

# Repository structure

```text
/
├── index.html
├── styles.css
├── app.js
├── today.html
├── threads.html
├── deepdive.html
├── weekly.html
├── sources.html
├── preferences.html
├── api/
│   ├── radar.js
│   ├── threads.js
│   ├── feedback.js
│   └── health.js
├── lib/
│   └── thread-store.js
├── supabase/
│   └── migrations/
│       └── 001_idea_threads.sql
├── vercel.json
├── package.json
└── README.md
```

---

# API endpoints

### `GET /api/radar`

Runs or retrieves the current Radar pipeline and returns:

- pipeline mode;
- episodes scanned;
- transcript coverage;
- atomic claim count;
- cluster count;
- surfaced insights;
- scores;
- source trails;
- persistent-memory state.

### `GET /api/threads`

Returns persisted Idea Threads and recent observations.

### `POST /api/feedback`

Stores Useful / Skip feedback for an idea/thread.

### `GET /api/health`

Basic service health.

---

# What is still intentionally unfinished

The architecture is usable, but several product improvements remain valuable.

### Broader source discovery

The system should eventually discover high-signal conversations outside a fixed feed list.

### Better transcript coverage

Some podcasts do not publish structured transcripts. Additional transcript providers or audio transcription could materially improve evidence quality.

### Stronger semantic clustering

Current thread matching can become more sophisticated by incorporating:

- entity extraction;
- claim-level embeddings;
- temporal context;
- explicit merge/split operations.

### Personalized novelty memory

Novelty should increasingly mean:

> “new to this user”

rather than simply:

> “different from today's other content.”

### Weekly belief-change engine

The Weekly Review should ultimately compute:

- strongest thesis upgrades;
- largest confidence declines;
- new contradictions;
- ideas worth remembering in one month;
- unresolved questions.

### Source expansion

The long-term Radar should combine podcasts with:

- earnings calls;
- annual letters;
- founder essays;
- technical reports;
- investor letters;
- research papers;
- conference talks.

The source type should become progressively less important than the underlying idea.

---

# Product north star

The goal is not to help a user **consume more content**.

The goal is to help a user:

> **build a better mental model of business while consuming dramatically less content.**

A successful Radar should eventually be able to answer questions such as:

- What are the three most important business ideas I encountered this month?
- Which beliefs became stronger?
- Which beliefs weakened?
- What important disagreements are still unresolved?
- Which emerging thesis deserves investigation before it becomes consensus?
- What have I repeatedly ignored despite strong evidence?
- What ideas am I seeing again without learning anything new?

If the product can answer those questions reliably, it has moved beyond summarization into **personal business intelligence**.
