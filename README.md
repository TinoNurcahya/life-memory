# Life Memory

> **Log a little. Remember more. Understand your life.**

Life Memory is a **Private Personal Memory Intelligence** system that transforms everyday activity logs into a structured, longitudinal representation of a person's life.

People experience hundreds of small moments every week—working, learning, meeting people, visiting places, trying something new, or simply following a routine. Most of these moments disappear from memory.

Life Memory helps users answer:

* **What did I actually do this week?**
* **Where have I been?**
* **Who have I spent time with?**
* **What new things did I experience?**
* **What changed compared with previous months?**
* **What have I probably already forgotten?**
* **Was my month really as uneventful as I thought?**

Instead of functioning as another AI diary or productivity dashboard, Life Memory treats everyday activities as **grounded, structured personal data** analyzed deterministically over time.

---

## 📚 Specification & Architecture Documentation

Life Memory is specified across a rigorous, mutually synchronized suite of 6 companion documents:

* **[PRD.md](./PRD.md)** — Product Requirements Document (Core Loop, Hero Moments, 9-Point DoD, Functional Specs)
* **[AI_SPEC.md](./AI_SPEC.md)** — AI Architecture, Structured Extraction Schemas, Reflection Citation Validator & Golden Benchmark
* **[DESIGN.md](./DESIGN.md)** — Design System, Declarative CSS Variables, WCAG AA Contrast Matrix & ASCII Wireframes
* **[DATABASE.md](./DATABASE.md)** — Production Relational Data Model (10 Tables, 3 Reactive Views) & Persona Jimmy Seed Dataset
* **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Technical Architecture, Next.js 15 Demarcation, Complete DDL & TypeScript Types
* **[SPRINT.md](./SPRINT.md)** — 10-Sprint Execution Roadmap (Oct 20 – Dec 21, 2026)

---

## ✨ Core Idea

The central idea behind Life Memory is simple:

**Small daily activities contain more information about our lives than we realize.**

A user can simply write:

> "Worked until 5, had dinner with Raka in Malioboro, bought a React book, then studied until 10."

Life Memory uses AI to understand the entry and extract meaningful information such as:

* Work activity
* Social activity
* Person: Raka
* Place: Malioboro
* New object/experience: React book
* Learning activity
* Approximate time
* Activity categories

The extracted information becomes structured life data that can later be analyzed.

### Core Loop

```text
LOG
 ↓
AI EXTRACT
 ↓
STRUCTURE
 ↓
DISCOVER
 ↓
REFLECT
 ↓
REMEMBER
```

---

# 🎯 Problem

Modern life is full of activity, but our memory is not a reliable database.

People often:

* Forget what they did a few days or weeks ago.
* Underestimate how much they accomplished.
* Fail to notice recurring patterns.
* Forget when they first encountered a person, place, or activity.
* Experience long periods of routine that become difficult to remember individually.
* Remember isolated moments rather than the overall progression of their life.

Traditional note-taking and journaling can store memories, but they generally require users to manually organize and interpret them.

Life Memory asks a different question:

> **What if your daily notes could become a living representation of your life?**

---

# 💡 Solution

Life Memory converts lightweight natural-language activity logs into structured personal life data.

The system combines:

1. **Natural-language activity logging**
2. **AI-powered information extraction**
3. **Structured temporal data**
4. **Deterministic life analytics**
5. **Pattern detection**
6. **Evidence-backed AI reflection**

The result is not simply a collection of diary entries.

It is a way to explore:

**Activities → People → Places → Experiences → Patterns → Changes → Reflections**

---

# 🚀 Key Features

## 1. Natural-Language Activity Logging

Users do not need to complete complicated forms.

They simply describe what happened.

Example:

```text
Today I worked from 8 until 5, met Dimas after work,
and we discussed my new project at a coffee shop.
```

Life Memory handles the structure automatically.

---

## 2. AI Activity Extraction

The AI analyzes each entry and extracts structured, atomic information using Google Gemini 3.5 Flash-Lite with structured JSON schema output.

Example input:

```text
Today I worked from 8 until 5, met Dimas after work, and we discussed my new project at Blank Street Coffee.
```

Extracted structure (`ActivityExtractionSchema`):

```json
{
  "activities": [
    {
      "summary": "Worked full day shift",
      "source_text": "worked from 8 until 5",
      "category": "career",
      "day_offset": 0,
      "time_of_day": "morning",
      "time_hint": "8 until 5",
      "event_status": "completed",
      "people": [],
      "places": [],
      "topics": [],
      "is_first_time": false
    },
    {
      "summary": "Met Dimas at Blank Street Coffee and discussed new project",
      "source_text": "met Dimas after work, and we discussed my new project at Blank Street Coffee",
      "category": "social",
      "day_offset": 0,
      "time_of_day": "afternoon",
      "time_hint": "after work",
      "event_status": "completed",
      "people": ["Dimas"],
      "places": ["Blank Street Coffee"],
      "topics": ["new project"],
      "is_first_time": false
    }
  ]
}
```

The extracted information is deterministically validated before database insertion.

---

## 3. Life Timeline

All activities are organized chronologically and grouped by resolved date (`occurred_at`).

Users can move through their life history and filter by:

* **Category Tabs:** `All`, `Career`, `Social`, `Health`, `Learning`, `Leisure`, `Routine`, `Other`
* **Entities:** People, Places, Topics
* **Search:** Local timeline keyword search

---

## 4. People Directory

Life Memory automatically identifies people mentioned in activity logs (with honorific stripping and alias resolution).

Users can discover:

* People they interacted with
* Frequency of interactions (derived at query time from completed logs)
* First seen and most recent interaction dates
* Co-occurrence timelines

---

## 5. Places Directory

The same principle applies to public venues.

Life Memory identifies:

* Frequently visited places (excluding generic domestic dwellings like "kosan" or "office")
* First visits (`is_first_time: true`)
* Recent visits
* Venue visit trends

---

## 6. Topics & Skills Directory

Life Memory extracts 1–3 verbatim subject matters, frameworks, or project themes:

* Track technologies learned (e.g. `React`, `Next.js`, `PostgreSQL`, `System Design`)
* Review recurring skill practice (*"You studied React 8 times this month"*)
* Trace project progression over time

---

## 7. First-Time Detection

Life Memory detects potentially significant milestone occurrences:

* First visit to a place
* First mention of a person
* First time trying an activity or technology
* Explicit milestone events (`is_first_time: true`)

*(Cold-start defense requires $\ge 21$ days account age and $\ge 20$ activities before automatic entity first-times trigger, preventing first-week alert spam).*

---

## 8. Recurring Pattern Detection

The system deterministically analyzes calendar-month activity data to identify recurring behavior:

* *"You studied React 8 times this month."*
* *"You visited Blank Street Coffee 6 times."*
* *"You worked on client landing pages every weekend for the last three weeks."*

The goal is not to judge behavior, but to make invisible habits visible.

---

## 9. Month-over-Month Change Detection

Life Memory compares adjacent calendar months (Month A vs. Month B):

* Category volume shifts (enforcing a minimum volume delta $|V_A - V_B| \ge 3$)
* Emerging social circles or shifting study focus
* Mathematical guards against division-by-zero ($0 \to V_A$ rendered as absolute volume)

---

## 10. You Probably Forgot This (Signature Nostalgia Reveal)

**You Probably Forgot This** (S-14) resurfaces meaningful, dormant moments from the user's history.

* **100% Deterministic Engine ($0$ API Calls):** Instant (<50ms) rendering.
* **Two-Step Verification:**
  1. The activity is $\ge 14$ days old (`WHERE event_status = 'completed'`).
  2. The anchor entity (person or place) has not appeared in any *other* activity for $\ge 21$ days.
* **Factual Copy Integrity:** Copy displays *"Belum pernah kamu sebut lagi sejak N hari yang lalu"* calculated strictly from the entity's true last recorded appearance date.
* **Privacy Controls:** Includes `[ Don't surface this again ]` for sensitive memories (stored via `insights.is_suppressed`).

---

## 11. Footnote-Grounded Monthly Life Reflection

At the end of a calendar month, Gemini 3.8 Flash synthesizes a literary, grounded reflection:

* Every narrative paragraph is backed by an `evidence_ids` array referencing factual activities.
* Features interactive inline citation markers `[1]`, `[2]`.
* Clicking any footnote marker opens an interactive **Vaul Evidence Drawer** displaying the exact source activity logs.

---

## 12. 1-Click "✦ Try Demo" Mode (Persona Jimmy)

Solves the hackathon cold-start evaluation problem:

* Bypasses sign-up with a single click from the landing page hero banner.
* Pre-loaded with **40 authentic activity logs** (44 atomic activity details) for Jimmy (NYU CS senior & freelance developer).
* Dynamic relative dates (`CURRENT_DATE - INTERVAL 'N days'`) guarantee that S-14 memory reveals (*"29 days ago"*) remain 100% mathematically exact regardless of when judges evaluate the app in December 2026.
* Consumes **$0$ LLM API calls** during demo browsing.

---

# 🤖 AI Architecture

AI is applied strictly where natural language comprehension is required.

### AI Responsibilities

* Activity extraction & multi-sentence splitting
* Entity recognition (people, venues, topics)
* 7-category taxonomy classification
* Footnote-grounded monthly narrative synthesis

### Non-AI Deterministic Responsibilities

PostgreSQL and TypeScript handle all factual and statistical calculations:

* Counting activities, people, and places
* Calendar month comparison & trend math
* First-time experience detection & cold-start gating
* Entity dormancy scoring & candidate selection for S-14
* Evidence selection & footnote validation

### Anti-Wrapper Verification Guarantees

1. **Verbatim Substring Validation:**  
   Every extracted `source_text` is verified via case-insensitive, whitespace-normalized substring matching against `raw_text`:  
   `normalizeWhitespace(raw_text).toLowerCase().includes(normalizeWhitespace(source_text).toLowerCase())`.  
   Items failing this check are discarded, and the card receives a passive `[ ⚠ Needs Review ]` badge without disruptive modal blocking.

2. **Deterministic Citation Validator:**  
   The reflection generator verifies that every paragraph contains sequential citation markers `[1]..[N]` corresponding to valid activities in the evidence pool, and verifies that mentioned proper names exist in the cited facts.

> **"The AI interprets the data. The system calculates the facts."**

---

# 🏗️ System Architecture

```text
┌───────────────────────┐
│        User           │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Activity Input        │
│ Natural Language      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────────────────────────┐
│          Next.js (App Router)             │
│                                           │
│  ┌─────────────┐    ┌──────────────────┐  │
│  │   Server     │    │   API Routes /   │  │
│  │  Components  │    │  Server Actions  │  │
│  └──────┬──────┘    └────────┬─────────┘  │
│         │                    │            │
│         │                    ├──────────────────► Gemini API
│         │                    │            │          │
│         │                    │            │          ▼
│         │                    │            │    AI Extraction
│         ▼                    ▼            │
│  ┌────────────────────────────────────┐   │
│  │          Supabase Client           │   │
│  └────────────────┬───────────────────┘   │
│                   │                       │
└───────────────────┼───────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────┐
│              Supabase                     │
│                                           │
│  ┌──────────┐  ┌───────────────────────┐  │
│  │   Auth   │  │   PostgreSQL          │  │
│  │  (OAuth  │  │   + Row Level         │  │
│  │  +Email) │  │     Security          │  │
│  └──────────┘  └───────────┬───────────┘  │
│                            │              │
└────────────────────────────┼──────────────┘
                             │
                             ▼
              ┌───────────────────────┐
              │ Life Analysis Engine  │
              │                       │
              │ • First-Time          │
              │ • Recurrence          │
              │ • People              │
              │ • Places              │
              │ • Changes             │
              │ • Trends              │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ Reflection Engine     │
              │ AI + Evidence         │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ UI Layer              │
              │                       │
              │ • Timeline            │
              │ • People              │
              │ • Places              │
              │ • Insights            │
              │ • Reflection          │
              └───────────────────────┘
```

---

# 🗄️ Data Model

The production database is built on Supabase Cloud (PostgreSQL 15) with strict Row Level Security (RLS) guaranteeing tenant isolation via `(SELECT auth.uid()) = user_id`.

To prevent cache desynchronization under backdated entries, edits, and retries, entity counts and temporal boundaries are **derived dynamically at query time** via PostgreSQL Reactive Views rather than incremented mutable table columns.

### 10 Production Tables

| Table | Role & Description |
|---|---|
| **`profiles`** | User account profile extending Supabase `auth.users` |
| **`activities`** | Raw activity log records with processing status (`PENDING`, `RESOLVED`, `FAILED`) |
| **`activity_details`** | **Atomic unit of truth:** structured items with resolved `occurred_at`, 7-category taxonomy, time hints, and `event_status` (`completed`, `planned`, `cancelled`) |
| **`people`** | Tracked contacts and friends with `aliases TEXT[]` array |
| **`places`** | Tracked public venues with `aliases TEXT[]` array |
| **`topics`** | Tracked skills, technical frameworks, and project themes |
| **`activity_people`** | Junction table linking `activity_details.id` to `people.id` |
| **`activity_places`** | Junction table linking `activity_details.id` to `places.id` |
| **`activity_topics`** | Junction table linking `activity_details.id` to `topics.id` |
| **`insights`** | Generated patterns and reflections with JSONB citations referencing `activity_detail_id` |

### 3 Reactive Views (`security_invoker = true`)

* **`v_people_with_stats`**: Computes `interaction_count`, `first_seen_at`, and `last_seen_at` dynamically (`WHERE event_status = 'completed'`).
* **`v_places_with_stats`**: Computes `visit_count`, `first_visit_at`, and `last_visit_at` dynamically (`WHERE event_status = 'completed'`).
* **`v_topics_with_stats`**: Computes `activity_count`, `first_seen_at`, and `last_seen_at` dynamically (`WHERE event_status = 'completed'`).

*For complete DDL, index definitions, foreign key cascades, and RLS policies, refer to **[DATABASE.md](./DATABASE.md)** and **[ARCHITECTURE.md](./ARCHITECTURE.md) §5**.*

---

# 🔍 Evidence-Based Insights

A core tenet of Life Memory is that every pattern or AI synthesis is mathematically verifiable:

```text
Insight:
"You spent significantly more time learning in March."

Evidence (Vaul Drawer):
- March 4  — Studied React [act_01]
- March 8  — Completed a React tutorial [act_02]
- March 12 — Built a React component [act_03]
- March 19 — Studied React again [act_04]
```

The AI does not invent events. Every observation cites factual source rows (`activity_detail_id`).

---

# 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router with React 19 Server Components and `proxy.ts`) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Database & Auth** | Supabase Cloud (PostgreSQL 15 with Row Level Security, GoTrue Auth) |
| **AI SDK** | Official Google Gen AI SDK (`@google/genai`) |
| **AI Extraction Model** | `gemini-3.5-flash-lite` (`thinkingConfig: { thinkingLevel: "minimal" }`, structured JSON schema) |
| **AI Reflection Model** | `gemini-3.8-flash` (`thinkingConfig: { thinkingLevel: "low" }`, grounded footnote schema) |
| **UI Primitives** | Radix UI Primitives, Vaul (Drawer), Sonner (Toasts), Lucide Icons |
| **Styling** | Vanilla CSS Token Matrix mapped to Tailwind CSS Utilities |
| **Deployment** | Vercel (Production CI/CD) + Supabase Cloud |

---

# 📁 Project Structure

```text
life-memory/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── timeline/page.tsx
│   │   ├── people/page.tsx
│   │   ├── places/page.tsx
│   │   ├── topics/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── reflections/page.tsx
│   │   ├── forgotten/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── extract/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── activity/
│   │   ├── QuickLogger.tsx
│   │   ├── TimelineCard.tsx
│   │   └── EntityReviewDrawer.tsx
│   ├── timeline/
│   ├── insights/
│   │   ├── InsightCard.tsx
│   │   └── EvidenceDrawer.tsx
│   ├── people/
│   ├── places/
│   ├── reflection/
│   └── layout/
├── lib/
│   ├── ai/
│   │   ├── client.ts
│   │   ├── extraction.ts
│   │   └── reflection.ts
│   ├── analytics/
│   │   ├── first-time.ts
│   │   ├── recurrence.ts
│   │   ├── changes.ts
│   │   ├── stats.ts
│   │   └── scoring.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils/
│       ├── normalization.ts
│       └── dates.ts
├── types/
│   ├── database.ts
│   ├── ai.ts
│   └── domain.ts
├── middleware.ts
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── README.md
```

---

# 🔐 Privacy & Data Principles

Life Memory deals with highly personal information, so privacy is part of the product architecture.

### Principles

* Users can only access their own memories.
* Authentication is required for private data.
* AI API keys remain on the server side (Next.js Server Actions and API Routes).
* Raw activity logs should not be unnecessarily written to server logs.
* Users should be able to delete their memories.
* Deleted data should not remain accessible through the application.
* Personal information should not be exposed between users.

### Data Ownership

The user owns the activity data they create.

Life Memory is designed as a **private personal memory system**, not a social network.

---

# 🎨 Product Philosophy

Life Memory intentionally avoids becoming another productivity dashboard.

It should not constantly tell users:

> "You were productive."

or:

> "You wasted your time."

Instead, it should help users see what actually happened.

### The product should be:

* Reflective
* Personal
* Calm
* Evidence-based
* Exploratory
* Human
* Non-judgmental

The system should **surface information rather than dictate how users should feel about it.**

---

# 🧪 MVP

The first working version focuses on the smallest complete experience.

### Must Have

* [x] Natural-language activity logging
* [x] AI activity extraction
* [x] Structured activity storage
* [x] Timeline
* [x] People detection
* [x] Place detection
* [x] First-time detection
* [x] Recurring activity detection
* [x] Monthly statistics
* [x] AI-generated reflection
* [x] Evidence-backed insights
* [x] "You Probably Forgot This"

### Not in MVP

* [ ] GPS auto tracking
* [ ] Wearable integration
* [ ] Calendar integration
* [ ] Automatic photo recognition
* [ ] Social network
* [ ] Health tracking
* [ ] Voice assistant
* [ ] Screen monitoring
* [ ] Complex mood tracking
* [ ] Native mobile application
* [ ] Large-scale knowledge graph visualization

These features may be considered later.

---

# 🧭 Main User Flow

```text
Landing Page (or "✦ Explore Demo Account")
     │
     ▼
Log Activity via Quick Logger (⌘+Enter)
     │
     ▼
Instant Optimistic Save (<100ms, status: 'PENDING')
     │
     ▼
Async AI Extraction (Gemini 3.5 Flash-Lite, @google/genai)
     │
     ▼
Timeline Feed (Tag Glide-in / Passive [⚠ Needs Review] Badge if Ambiguous)
     │
     ▼
Pattern Discovery & Life Insights (First-Times & Recurrence)
     │
     ▼
"You Probably Forgot This" Reveal (S-14, 100% Deterministic Engine)
     │
     ▼
Monthly Footnote Reflection (S-13, Grounded in Cited Evidence)
```

---

# 🖥️ Main Screens

## Dashboard

Provides a high-level view of the user's recent life activity.

Potential sections:

* Recent activities
* Activity count
* New experiences
* People
* Places
* Emerging patterns
* Forgotten memories

---

## Timeline

Chronological representation of activities.

```text
March 28

10:00
Worked on frontend

17:30
Met Raka

19:00
Dinner at Malioboro

21:00
Studied React
```

---

## Life Insights

A collection of automatically discovered patterns.

Examples:

* First-time experiences
* Recurring activities
* Frequent places
* People interactions
* Activity changes
* Monthly trends

---

## People

A personal index of people appearing in the user's activity history.

---

## Places

A personal index of places appearing in the user's memories.

---

## Reflection

A generated narrative explaining what happened during a specific period.

---

## Forgotten Memories

The **You Probably Forgot This** experience.

This is designed to make users explore older activity rather than only viewing recent entries.

---

# 📈 Example Analysis

Suppose a user logs:

```text
March 3
Started learning React.

March 7
Built my first React component.

March 12
Worked on a React project.

March 19
Studied React again.

March 26
Finished another React tutorial.
```

The analytics engine can determine:

```text
Learning activities: 5

Topic:
React

First occurrence:
March 3

Recurring pattern:
Weekly learning

Trend:
Consistent activity throughout March
```

The AI can then generate:

> You spent much more time learning React than your memory may suggest. You returned to it almost every week throughout March.

The statement is supported by the underlying activity records.

---

# 🧩 Design Principles

### 1. Minimal Input

Users should spend seconds logging an activity.

### 2. Maximum Interpretation

The system should do the organizational work.

### 3. Facts Before Narratives

Statistics and structured data should exist before AI-generated conclusions.

### 4. Evidence Before Confidence

Important insights should point back to the activities that produced them.

### 5. Longitudinal Thinking

The value of Life Memory increases as the user's history grows.

### 6. No Judgment

The application describes patterns without telling users whether their behavior is good or bad.

---

# 🔮 Future Possibilities

After the MVP, Life Memory could evolve into a deeper personal knowledge system.

Potential future features:

* Automatic calendar integration
* Photo-based memory extraction
* Location history
* Voice logging
* Semantic search
* Personal knowledge graph
* Year-in-review
* "On this day" memories
* Life chapters
* Major transition detection
* Cross-year comparisons
* Import from existing notes
* Mobile application
* Offline-first logging

These features are intentionally outside the initial hackathon MVP.

---

# 🏁 Hackathon Scope

Life Memory is designed around a focused hackathon demonstration.

### Schedule

| Phase              | Start                           | End                             |
| ------------------ | ------------------------------- | ------------------------------- |
| **Submissions**    | October 20, 2026 11:00 PM GMT+7 | **December 21, 2026 12:00 PM GMT+7** |
| Judging            | December 21, 2026 12:00 PM GMT+7| December 31, 2026 8:00 AM GMT+7 |
| Winners Announced  |                                 | January 1, 2027 12:00 AM GMT+7  |

The demo should show the complete transformation:

```text
Human Activity
      ↓
Natural Language
      ↓
AI Understanding
      ↓
Structured Data
      ↓
Deterministic Analysis
      ↓
AI Interpretation
      ↓
Personal Insight
```

The most important demonstration is not simply:

> "AI summarizes my diary."

Instead:

> **"I gave the system ordinary activity logs, and it discovered things about my life that I didn't explicitly ask it to track."**

---

# 📋 Definition of Done

The canonical 9-point MVP Definition of Done is formally governed in **[PRD.md §20](./PRD.md#20-definition-of-done)**. A release candidate is accepted only when all 9 criteria pass with $\ge 90\%$ evaluation benchmark coverage, instant <100ms logging, multi-tenant RLS isolation, deterministic S-14 reveal, and footnote-grounded monthly reflection.

---

# 🚧 Current Status

**Status:** In Development

### Product

* [x] Product concept
* [x] Problem definition
* [x] Product positioning
* [x] MVP scope
* [x] Core user flow
* [x] Technical architecture
* [x] AI strategy
* [ ] UI implementation
* [ ] Backend implementation
* [ ] AI extraction pipeline
* [ ] Analytics engine
* [ ] End-to-end demo

---

# ⚡ Supabase Keep-Alive Automation (Free Tier Auto-Pause Prevention)

On the **Supabase Free Tier**, projects are automatically paused if they do not receive database queries or inbound API traffic for 7 consecutive days. To keep the Life Memory Supabase instance active indefinitely without manual intervention, this repository includes a **GitHub Actions Scheduled Cron**:

- **Workflow File**: [`.github/workflows/keep-alive.yml`](.github/workflows/keep-alive.yml)
- **Schedule**: Runs automatically every 3 days at 04:00 UTC (`0 4 */3 * *`).
- **Mechanism**: The workflow pings the health endpoint [`/api/health`](app/api/health/route.ts), which executes a query to the Supabase database, resetting the 7-day inactivity timer.
- **60-Day Limit Bypass**: Equipped with an automated native Git keepalive check that commits a timestamp to `.github/.keepalive` only if repository inactivity approaches 45 days, preventing GitHub's 60-day scheduled workflow suspension rule without spamming commit history.
- **Manual Trigger**: Can be manually triggered at any time via the **Actions** tab on GitHub (*Run workflow*).
- **Diagnostics**: Run `npm run test:supabase` to test your connection and table status locally.

---

# 📄 License

This project is currently developed as a personal hackathon project.

License details may be added before public release.

---

# 👤 Author

**Tino Nurcahya**

Frontend Developer

GitHub: `TinoNurcahya`

---

## Life Memory

> **Your days may feel ordinary.
> Your data may tell a different story.**
