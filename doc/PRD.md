# Life Memory — Product Requirements Document (PRD)

> **Document Version:** 1.2  
> **Status:** Approved for Implementation (Sprint 0 Deliverable)  
> **Product Category:** Private Personal Memory Intelligence  
> **Development Start:** Fleksibel / Dapat dimulai kapan saja (Anytime).  
> **Canonical References:** [AI_SPEC.md](./AI_SPEC.md) (AI Prompts & Runtime) · [DATABASE.md](./DATABASE.md) (PostgreSQL DDL & RLS) · [DESIGN.md](./DESIGN.md) (Design System & Wireframes) · [ARCHITECTURE.md](./ARCHITECTURE.md) (System Architecture) · [SPRINT.md](./SPRINT.md) (Sprint Roadmap)

---

## 1. Executive Summary

Life Memory is a **Private Personal Memory Intelligence platform** that turns unstructured, everyday micro-logs into a rich, structured, and longitudinal record of a person's life.

People live hundreds of meaningful, quiet moments every week: solving a hard problem at work, grabbing coffee with an old friend, discovering a new bookstore, or learning a new framework. Yet within weeks, nearly all of these moments vanish from memory. Existing digital tools force an unnatural choice:
* **Traditional Notes & Journals (Obsidian, Notion, Apple Notes):** Require heavy manual filing, tagging, and maintenance that users quickly abandon.
* **Corporate Productivity / Habit Trackers (Streaks, Todoist):** Reduce life to anxiety-inducing streak counters, gamified scoreboards, and hustle-culture guilt.
* **Conversational AI Wrappers ("AI Diary Chatbots"):** Suffer from severe factual hallucination, fabricate emotional memories, and lack verifiable database ground truth.

Life Memory introduces a new paradigm: **AI as Translator, Deterministic Code as Calculator**. Users type natural, unpolished micro-notes in seconds. A background AI extraction engine translates the text into atomic entity records. A 100% deterministic analytics engine discovers patterns, recurrence, and forgotten memories—every insight backed by verifiable database citations.

---

## 2. Product Positioning & Voice

Life Memory is explicitly **not** a habit tracker, mood logger, or productivity manager.

* **Category:** Private Personal Memory Intelligence & Longitudinal Journal.
* **Atmospheric Voice:** A quiet, thoughtful companion. A warm, observant chronicler that notices what you did without ever judging how much you did.
* **Core Tenet:** **No Guilt, No Gamification, No Moral Evaluation.** Missing 5 days carries zero penalty. There are no red notification dots, no streak flames, and no arbitrary productivity scores.
* **Privacy Anchor:** User data is strictly partitioned via database-level Row Level Security (RLS). Users own their life records and can export all raw and structured data at any time.

---

## 3. The Problem

Human memory is an imperfect recording medium. Modern life moves fast, creating four chronic memory breakdowns:

1. **The Fog of Everyday Routine:** People feel like their weeks blur together and forget that they actually experienced new things, met interesting people, and made meaningful progress.
2. **Invisible Relationship Drifts:** Friends, mentors, and collaborators subtly slip out of our lives without us noticing when we last shared a conversation.
3. **Forgotten Firsts & Quiet Milestones:** The first time someone tried a sport, visited a neighborhood, or started learning a skill gets buried beneath subsequent repetition.
4. **The Journaling Burden:** People want a record of their lives, but traditional journaling requires 20+ minutes of dedicated writing per day—a habit that 95% of users abandon within two weeks.

---

## 4. The Solution

Life Memory provides a low-friction capture loop connected to an automated intelligence engine:

1. **Frictionless Capture (<30s):** The user writes a casual micro-note:  
   > *"Sore ngopi bareng Raka di Warung Bu Kris Jaksel, ngobrolin ide startup baru sambil ngemil toast."*
2. **Instant Optimistic Save (<100ms):** The note is committed to the database instantly with status `PENDING`, dropping onto the timeline with a gentle shimmer animation. No blocking modals interrupt the user.
3. **Asynchronous Entity & Topic Tagging:** `gemini-3.5-flash-lite` parses the note in the background into structured entities:
   - **Activities:** Discrete actions with category, relative day offset, and time phase.
   - **Entities:** People (honorifics stripped) and Places (prepositions removed, domestic dwellings filtered).
   - **Topics & Skills:** Verbatim subjects (e.g. `"startup"`, `"React"`).
4. **Deterministic Discovery Core:** PostgreSQL queries discover longitudinal patterns:
   - *First-time events* (`is_first_time = true`).
   - *Recurring habits & connections* ($\ge 3$ times per calendar month).
   - *Month-over-month shifts* with mathematical safeguards against noise.
5. **Grounded Editorial Reflection:** `gemini-3.8-flash` generates a warm monthly essay where every assertion cites exact database records via interactive footnotes `[1]`, `[2]`.
6. **Tactile Recall ("You Probably Forgot This"):** A 100% deterministic memory reveal that resurfaces meaningful, dormant experiences without using LLM tokens.

---

## 5. Target Audience & Personas

### Persona 1: Arya — The Overworked Knowledge Worker & Lifelong Learner
* **Profile:** 26-year-old software engineer in Jakarta. Constantly learning new technologies, juggling side projects, and catching up with friends on weekends.
* **Pain Point:** At the end of every month, Arya feels like he just worked and slept. He forgets the books he read, the people he met, and the technical hurdles he overcame.
* **Life Memory Value:** Proves to Arya that his month had texture: *"You studied React 8 times, visited 4 new cafes, and hung out with Raka 5 times."*

### Persona 2: Maya — The Reflective Creative
* **Profile:** 23-year-old freelance writer and designer. Values quiet introspection but hates rigid productivity apps with streak counters.
* **Pain Point:** Wants to keep a personal diary but struggles with blank-page paralysis and guilt when she skips a week.
* **Life Memory Value:** Provides a zero-guilt logging canvas where 1-sentence micro-notes transform into beautiful, footnote-grounded monthly essays.

---

## 6. The Core Loop

```
LOG (Natural Language Micro-Note, <100ms Instant Save)
 ↓
STRUCTURE (Async Tagging via Gemini 3.5 Flash-Lite: People, Places, Topics, 6 Categories)
 ↓
DISCOVER (Deterministic Recurrence, First-Times, Shifts in PostgreSQL)
 ↓
REFLECT (Footnote-Grounded Reflection via Gemini 3.8 Flash)
 ↓
REMEMBER (Deterministic Recall, S-14 Instant Reveal, Zero API Cost)
```

---

## 7. The 3 Signature Hero Moments (Evaluation Anchors)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE 3 HERO MOMENTS                               │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│    HERO MOMENT 1      │        HERO MOMENT 2        │     HERO MOMENT 3     │
│ Instant Micro-Log &   │  Insight Card → Interactive │ Tactile Memory Reveal │
│ Ghost-to-Solid Tag    │       Evidence Drawer       │  ("Forgot This" S-14) │
├───────────────────────┼─────────────────────────────┼───────────────────────┤
│ • <100ms instant save │ • "Lena appeared 4x in      │ • Center envelope card│
│ • Shimmer placeholder │   past 2 weeks"             │ • Warm glow unfold    │
│ • Async Gemini tag    │ • Click "[4 Sources →]"     │ • Rediscover Oct 2    │
│   glide-in (1.2s)     │ • Vaul drawer slides open   │ • "[Don't show again]"│
│ • Note never lost     │ • 100% grounded proof       │   privacy respect     │
└───────────────────────┴─────────────────────────────┴───────────────────────┘
```

---

## 8. Feature Requirements (P0, P1, P2)

### P0: Must Have (Core MVP Foundation)

#### FR-01: Natural-Language Micro-Logging (Instant Save Pipeline)
* **Priority:** P0
* **Description:** User types an unpolished daily note and hits `⌘ + Enter`. The note is immediately persisted to PostgreSQL (`status = 'PENDING'`) in $<100\text{ms}$.
* **Temporal Context:** The server computes `reference_date` from the date selected in the UI date picker (defaults to today's date), correctly anchoring backdated entries.
* **Acceptance Criteria:**
  - Raw text is preserved immutably.
  - UI provides instant optimistic feedback without blocking network spinners.
  - Logging takes $<30$ seconds.

#### FR-02: Asynchronous AI Extraction Engine
* **Priority:** P0
* **Description:** Background route handler invokes `gemini-3.5-flash-lite` (`@google/genai`) with `config: { thinkingConfig: { thinkingLevel: "minimal" }, responseSchema, responseMimeType: "application/json" }` and `maxOutputTokens: 4096`.
* **Extraction Targets:**
  - `summary`: Concise activity description.
  - `source_text`: Exact verbatim substring from user note.
  - `category`: Core 7 taxonomy tokens (`career`, `social`, `health`, `learning`, `leisure`, `routine`, `other`).
  - `day_offset`: Relative day integer relative to `reference_date`.
  - `time_of_day`: Enum (`morning`, `afternoon`, `evening`, `night`, `exact`, `unknown`).
  - `time_hint`: Clock time or colloquial time phrase.
  - `event_status`: Enum (`completed`, `planned`, `cancelled`). Only `completed` enters retrospective life history, increments relationship counters, and triggers analytics.
  - `people`: Array of cleaned personal names (honorifics stripped).
  - `places`: Array of public venues (spatial prepositions stripped, business nouns preserved, generic dwellings filtered).
  - `topics`: Array of 1–3 specific skills, technologies, or project themes (e.g. `"React"`, `"Next.js"`).
  - `is_first_time`: Boolean flag for explicit first-time milestones.
* **Acceptance Criteria:**
  - Normalized substring check verifies `raw_text.includes(source_text)`.
  - Discard invalid items and attach passive card badge `[ ⚠ Needs Review ]` without disruptive modal popups.
  - Zero inferred sentiment or mood tracking.

#### FR-03: Life Timeline Feed & Inline Chip Editing
* **Priority:** P0
* **Description:** Unified chronological stream grouped by date with full user editing agency.
* **Acceptance Criteria:**
  - Renders category badges, time phase, people chips, place chips, and topic chips.
  - New cards drop in with tactile entry animation; async tags glide in with 150ms micro-fade.
  - Category filter tabs (`All`, `Career`, `Social`, `Health`, `Learning`, `Leisure`, `Routine`, `Other`) and local keyword search.
  - **Inline Chip Editing:** User can click any chip to change category via 7-category dropdown, remove a misextracted chip (`x`), or manually add missing people/places/topics (`+`). Edits update `activity_details` and junction tables instantly without requiring LLM re-extraction.

#### FR-04: People, Places & Topics Directories
* **Priority:** P0
* **Description:** Dedicated directories indexing all tracked entities.
* **Acceptance Criteria:**
  - **People (`/people`):** Lists persons with derived interaction count, first seen, and last seen dates.
  - **Places (`/places`):** Lists non-generic venues with visit count, first visit, and last visit. Generic dwellings (`kosan`, `rumah`, `kantor`, `kampus`) are excluded.
  - **Topics (`/topics`):** Lists skills, frameworks, and projects with occurrence count.

#### FR-05: Deterministic Pattern Discovery (First-Times & Recurrence)
* **Priority:** P0
* **Description:** Deterministic analytics engine runs upon confirmed `completed` activities.
* **Acceptance Criteria:**
  - **First-Time Detection:** Flags explicit `is_first_time: true` milestones immediately. Automatic entity first-times require account age $\ge 21$ days AND $\ge 20$ activities (cold-start defense).
  - **Topic & Entity Recurrence:** Detects $\ge 3$ occurrences within a calendar month for a topic (*"You studied React 8 times this month"*), person, or venue.
  - Strictly filters `WHERE event_status = 'completed'`.
  - Every insight card contains a `[ X Sources → ]` button linking directly to source activities via the Vaul Evidence Drawer.

#### FR-06: Deterministic "You Probably Forgot This" Reveal (S-14)
* **Priority:** P0
* **Description:** Signature recall feature resurfacing meaningful, dormant memories.
* **Technical Guarantee:** **100% deterministic code engine ($0$ API calls)**.
* **Selection Criteria:**
  - Activity occurred $\ge 14$ days ago (`WHERE event_status = 'completed'`).
  - Contains at least one anchor: Person, non-generic Place, or First-Time Milestone.
  - **True Dormancy:** The anchor entity has not appeared in any activity for $\ge 21$ days.
  - **Milestone-Only Dormancy:** When the qualifying anchor is an explicit first-time milestone (`is_first_time: true`) with no accompanying person or place entity, dormancy is defined as time elapsed since the milestone itself occurred ($\ge 14$ days), with copy reflecting: *"Momen pertama kali ini terjadi N hari lalu dan belum pernah kamu catat lagi."*
  - **Mathematical Copy Integrity:** Calculates $N = \text{asOf} - T_{\text{last}}(E)$ so that copy stating *"Belum pernah kamu sebut lagi sejak N hari lalu"* is 100% true.
* **Actions:** `[ Show Another ]` and `[ Don't surface this again ]`.

#### FR-07: Pre-Seeded Demo Mode (Persona Jimmy)
* **Priority:** P0
* **Description:** 1-click exploration mode pre-loaded with 40–60 activities over an 8-week span.
* **Dynamic Relative Dates:** Activity dates are anchored dynamically relative to runtime (`occurred_at = CURRENT_DATE - INTERVAL 'N days'`). This guarantees that copy stating *"29 days ago"* or *"Belum pernah kamu sebut lagi sejak 29 hari yang lalu"* remains 100% mathematically exact and fresh whenever judges evaluate the demo during late December 2026.
* **Acceptance Criteria:**
  - Instant access from landing page without requiring OAuth.
  - Pre-cached monthly reflection with footnotes `[1]`, `[2]`.
  - Ready-to-reveal S-14 card.
  - Zero API calls consumed during demo browsing.

#### FR-08: Authentication & Protected App Shell
* **Priority:** P0
* **Description:** Secure multi-tenant authentication via Supabase Auth.
* **Acceptance Criteria:**
  - Google OAuth (primary frictionless path) and Email/Password.
  - Database Row Level Security (RLS) guarantees tenant isolation (`auth.uid() = user_id`).
  - Session persistence across page reloads.

---

### P1: Should Have (Depth & User Agency)

#### FR-09: Footnote-Grounded Monthly Reflection (S-13)
* **Priority:** P1
* **Description:** Editorial synthesis of the user's month powered by `gemini-3.8-flash` (`thinkingConfig: { thinkingLevel: "low" }`).
* **Acceptance Criteria:**
  - Deterministically prepares an ID-tagged `evidence_pool` (4–8 curated activities, `event_status = 'completed'`).
  - Skema paragraf mewajibkan array `evidence_ids` dan penanda sitasi `[1]`, `[2]`.
  - Deterministic Citation Validator verifies that all cited IDs exist and that all names/numbers match source facts.
  - Renumbers local paragraph citations to global footnotes $[1]..[K]$ matching DESIGN S-13.
  - Automated fallback to deterministic summary template if validation fails.

#### FR-10: Calendar Month Change Detection
* **Priority:** P1
* **Description:** Compares current calendar month against previous calendar month.
* **Acceptance Criteria:**
  - Compares category volumes and top entity distributions (`event_status = 'completed'`).
  - Enforces minimum volume shift $|V_A - V_B| \ge 3$ (eliminates noise like $0 \to 1$).
  - Division-by-zero safeguard when $V_B = 0$ (displays absolute format `"0 → V_A"`).

#### FR-11: Data Portability (JSON Export) & Entity Management
* **Priority:** P1
* **Description:** User controls and owns their complete life history.
* **Acceptance Criteria:**
  - `[ Export All Data (JSON) ]` in Settings downloads all raw notes, extracted details, and entity records.
  - Ability to merge duplicate people (e.g. "Raka" and "Raka Pratama") or rename places.
  - Soft delete activity with 6-second instant undo toast.

---

### P2: Nice to Have (Polish & Post-MVP Cut Order)

#### FR-12: Aesthetic Polish & Theme Controls
* **Priority:** P2 *(First to cut if time is constrained)*
* **Features:**
  - Light / Dark Mode toggle (defaults to Light warm alabaster luxury theme).
  - Custom tablet breakpoint optimizations.
  - Dedicated `/people/[id]` and `/places/[id]` sub-route detail pages (fallback to interactive filter modal).
  - Month-over-month interactive visual bar charts.

---

## 9. User Flows

### 9.1 Primary User Flow

```
Landing Page
   ├──> Click "✦ Explore Demo Account" ──> Instant Demo State (Dynamic 8 weeks of Jimmy)
   └──> Click "Get Started Free" (Google OAuth)
            │
            ▼
       Dashboard (<2s load)
            │
            ▼
       Quick Log (⌘ + Enter)
            │
            ├──> <100ms Instant Save to PostgreSQL (status: 'PENDING')
            ├──> Card drops onto Timeline with shimmer placeholder
            └──> Async Gemini 3.5 Flash-Lite extracts tags in background
                     ├── Valid ──> Chips glide in with 150ms fade (status: 'RESOLVED')
                     └── Ambiguous ──> Passive card badge: [ ⚠ Needs Review ]
```

### 9.2 Longitudinal Discovery Flow

```
Timeline / Insights Page
   │
   ├──> View Recurring Topic Card ("React 8x this month")
   │         └── Click "[ 8 Source Logs → ]" ──> Vaul Evidence Drawer opens
   │
   ├──> Navigate to S-14 ("You Probably Forgot This")
   │         └── Unfold Memory Envelope ──> Verbatim raw note + True Dormancy note
   │
   └──> Navigate to S-13 ("Monthly Reflection")
             └── Read editorial narrative with footnotes [1], [2]
                     └── Footnote table verifies exact dates and activity details
```

---

## 10. Screen Specifications

### S-01: Landing Page (`/`)
* **Hero:** Tagline *"Log a little. Remember more. Understand your life."*
* **Primary CTAs:** `[ Get Started Free ]` (OAuth) and prominent `[ ✦ Explore Demo Account ]`.
* **Core Transformation:** Side-by-side comparison of 5-second raw note vs. structured memory card.
* **Privacy Banner:** Unmissable disclaimer: *"Demo Notice: Life Memory Demo uses Google AI Studio Free Tier. Gunakan data fiktif atau akun demo. Jangan masukkan data pribadi asli."*

### S-04: Dashboard (`/dashboard`)
* **Global Navigation:** Header contains **Global Command Palette (⌘K / `/`)** — an app-wide Radix modal overlay for cross-screen search (jump to Person/Place/Topic, trigger actions like `+ Log Note` or `Toggle Theme`, and full-text search across all notes).
* **Greeting & Quick Action:** *"Good afternoon, [Name]"* with prominent Quick Logger.
* **KPI Metrics:** 3 clean stat cards (Total Activities, People Known, Places Visited).
* **Recent Memory Card:** One-line teaser resurfacing a forgotten memory with `[ Unfold → ]`.
* **Recent Activity Feed:** Latest 5 micro-logs with category badges and entity chips.

### S-05: Quick Logger Component
* **Inputs:** Auto-expanding textarea (*"What did you do today?"*) + Date selector (defaults to current date).
* **Shortcut:** Pressing `⌘ + Enter` executes instant optimistic save.
* **Feedback:** Shimmer pulse transitions seamlessly to solid chips upon async completion.

### S-07: Timeline (`/timeline`)
* **Local In-Page Search & Filter:** A persistent in-page filter bar with 8 Category tabs (`All`, `Career`, `Social`, `Health`, `Learning`, `Leisure`, `Routine`, `Other`), date range picker, and instantaneous keyword search that filters the displayed timeline cards in-memory without modal dialogs or route navigation.
* **Grouped Cards:** Chronologically clustered by date with hairline dividers.
* **Card Anatomy:** Category badge, time phase, summary, people chips, place chips, topic chips, and passive review badge if ambiguous.
* **Inline Editing:** Click any chip to adjust category, remove, or add entities.

### S-08 & S-10: People & Places Directories (`/people`, `/places`)
* **Grid Layout:** Cards showing entity display name, aliases, interaction/visit count, and first/last seen dates.
* **Actions:** Search filter, sort by frequency or date, and `[ Merge Entity ]` utility.

### S-12: Insights Page (`/insights`)
* **Insight Cards:** Grouped by `First-Time Experience`, `Recurring Pattern`, and `Monthly Shift`.
* **Evidence Button:** Interactive `[ X Sources → ]` button opening the right-hand **Vaul Evidence Drawer** displaying verified source activities.

### S-13: Monthly Reflection Page (`/reflection`)
* **Selector:** Calendar month dropdown.
* **Header Stats:** 4 aggregate metric pills (Activities, People, Venues, First-Times).
* **Narrative Section:** Literary reflection with inline citation markers `[1]`, `[2]`.
* **Footnote Registry:** Bottom table linking each numbered citation to its source activity summary and date.

### S-14: "You Probably Forgot This" Reveal (`/forgotten`)
* **State 1 (Sealed Envelope):** Dim canvas, warm amber ambient glow, header: *"29 days ago. A conversation at the library."* with `[ Unfold Memory ]`.
* **State 2 (Unfolded Reveal):** Smooth unfurl animation revealing verbatim note, entity badges, and verified dormancy copy (*"Belum pernah kamu sebut lagi sejak 29 hari yang lalu"*).
* **Actions:** `[ Show Another ]` and `[ Don't surface this again ]`.

### S-15: Settings Page (`/settings`)
* **Theme Controls:** Light Mode (default), Dark Mode, System.
* **Data Portability:** `[ Export All Data (JSON) ]` button downloading complete database records.
* **Privacy Disclosures:** Full statement on Gemini API data processing and age restrictions (18+).
* **Danger Zone:** `[ Delete Account & All Memories ]` with double-confirmation modal.

---

## 11. AI Behavior, Boundaries & Constraints

### Models & Execution Matrix
* **Activity Extraction:** `gemini-3.5-flash-lite` via `@google/genai`. Configured with `thinkingConfig: { thinkingLevel: "minimal" }` and `maxOutputTokens: 4096`.
* **Monthly Reflection:** `gemini-3.8-flash` via `@google/genai`. Configured with `thinkingConfig: { thinkingLevel: "low" }`, temperature `0.3`, and strict schema constraints.
* **S-14 Reveal Engine:** **100% Deterministic Code (0 API calls)**.

### Strict AI Boundaries (What AI Never Does)
The database and deterministic analytics engine handle all mathematical and logical evaluations:
* AI never counts activities, people, or places.
* AI never calculates percentages, trends, or period-over-period variance.
* AI never scores memories or determines dormancy eligibility.
* AI never hallucinates sentiment or infers unstated emotions.

### Rate Limiting & Persistence
* Rate limiting is enforced via a **persistent PostgreSQL token-bucket** table (max 10 extractions per 5 minutes per user account).
* Failed or hung extractions ($>60\text{s}$ in `PENDING`) are automatically transitioned to `FAILED` by a sweeper query, exposing a `[Retry Extraction]` button on the timeline card.

---

## 12. Data Architecture (Conceptual Overview)

The production database is managed via Supabase PostgreSQL 15. The detailed SQL DDL, indexes, and RLS policies are authoritatively defined in [DATABASE.md](./DATABASE.md).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONCEPTUAL DATA MODEL                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ profiles (User accounts linked to auth.users)                               │
│    │                                                                        │
│    ├── activities (Raw micro-log container: raw_text, occurred_at, status)  │
│    │      │                                                                 │
│    │      └── activity_details (Atomic extracted activity records)          │
│    │             │                                                          │
│    │             ├── activity_people ──> people (Aliases, derived counts)   │
│    │             ├── activity_places ──> places (Prepositions stripped)     │
│    │             └── activity_topics ──> topics (Skills, frameworks)        │
│    │                                                                        │
│    └── insights (Grounded insights: evidence references activity_detail_id) │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **Atomic Granularity:** `activity_details` is the atomic unit of truth. Junction tables and insight evidence link directly to `activity_detail_id`, ensuring multi-activity logs are indexed cleanly without ambiguity.

---

## 13. Technical Architecture

* **Framework:** Next.js 15 (App Router) with React 19 and TypeScript 5.
* **Styling:** Vanilla CSS design token matrix mapped to Tailwind utility classes.
* **Database & Auth:** Supabase Cloud (PostgreSQL 15 with Row Level Security, GoTrue Auth).
* **AI SDK:** Official Google Gen AI SDK (`@google/genai`).
* **Component Primitives:** Radix UI Primitives, Vaul (Drawer), Sonner (Toasts), Lucide Icons.
* **Deployment:** Vercel (Continuous Deployment from GitHub `main`).

---

## 14. Non-Functional Requirements

* **Performance:** Timeline and Dashboard render in $<2$ seconds. Instant log save responds in $<100\text{ms}$.
* **Data Isolation:** PostgreSQL Row Level Security enforces `auth.uid() = user_id` across all queries and mutations.
* **Resilience:** Uncaught API errors or serverless function timeouts never corrupt or discard raw user notes.
* **Reliability:** Background extractions gracefully retry with exponential jitter before flagging `FAILED`.

---

## 15. Privacy, Data Governance & Regulatory Principles

1. **Free Tier Transparency:** Google AI Studio Free Tier classifies inputs as Unpaid Services. User data may be reviewed by human evaluators and used for model training. The application mandates a clear demo notice advising against logging real PII or confidential credentials.
2. **Age & Territorial Restrictions:** Service is strictly restricted to individuals aged 18 and older. Users in the EEA, Switzerland, and UK must be routed through paid billing services or restricted to the pre-seeded demo account.
3. **Paid Services Reality:** When operating under paid Google Cloud API services, customer data is not used to train Google models. Operational logs are retained temporarily solely for abuse monitoring, security audits, and system troubleshooting in accordance with Google Cloud Data Processing agreements (no unconditional "zero retention" claim).
4. **Data Ownership & Deletion:** Users retain 100% ownership of their notes. Deleting an account triggers an immediate `ON DELETE CASCADE` wipe across all tables.

---

## 16. Design Principles & Typography Single Source of Truth

Authoritatively defined in [DESIGN.md](./DESIGN.md):

1. **Quiet Luxury Meets Personal Memoir:** Tactile alabaster canvas, warm obsidian dark surfaces, generous whitespace, and restrained micro-animations (150–250ms).
2. **Harmonized Typography Matrix:**
   - **UI & Chrome (Sans-Serif):** `Inter`
   - **Reflective Narratives & Memory Recall (Serif):** `Newsreader`
   - **Metadata, Timestamps & Codes (Monospace):** `Geist Mono`
3. **Zero Gamification:** Strictly no fire icons, daily streaks, or guilt-inducing notifications. Missing a day carries zero penalty.

---

## 17. Product Philosophy & Anti-Patterns

| Forbidden Anti-Pattern | Why It Is Forbidden | Life Memory Approach |
|---|---|---|
| **Daily Streak Counters** | Induces anxiety and daily guilt | Calm longitudinal timeline; entries stand on their own |
| **Productivity Scores** | Reduces human life to an arbitrary KPI | Objective descriptive categorizations without moral evaluation |
| **Sentiment Guessing** | LLMs hallucinate false emotional narratives | Strict extraction of factual events; zero inferred mood |
| **Corporate Analytics Tone** | Feels cold and managerial | Gentle personal chronicler voice |

---

## 18. Scope Tiers & Execution Cut Order

### Tier Distribution
* **P0 (Must Have):** Instant Logger (<100ms), Async Tag Extraction, Timeline with Inline Chip Edit, People/Places/Topics Directories, Basic Recurrence Insight, Deterministic S-14 Reveal, Pre-Seeded Demo Mode (Jimmy with Dynamic Dates), Google OAuth, Day 1 Deploy.
* **P1 (Should Have):** Footnote-Grounded Monthly Reflection, Calendar Month Change Detection, JSON Data Export, Entity Merge Utility.
* **P2 (Nice to Have):** Dark Mode Toggle, Custom Tablet Polish, Dedicated Entity Detail Pages, Visual Change Charts.

### Strict Cut Order (If Sprint Time Runs Short)
1. **Cut 1:** Visual Month-over-Month Bar Charts (rely on clean textual change cards).
2. **Cut 2:** Dedicated `/people/[id]` and `/places/[id]` sub-pages (rely on timeline search filter).
3. **Cut 3:** Tablet-specific CSS polish (desktop and mobile responsive layouts take priority).
4. **Cut 4:** Dark Mode Toggle (ship with high-polish Light Warm Alabaster theme).

---

## 19. Hackathon Scope, Vertical Slice & Schedule

### Hackathon Key Dates
* **Code Implementation:** Fleksibel / Dapat dimulai kapan saja.
* **Submission Deadline:** December 21, 2026 at 12:00 PM GMT+7.
* **Judging Period:** December 21 – December 31, 2026.
* **Winners Announced:** January 1, 2027.

### Day 1 Vertical Slice Strategy
* **Day 1:** Live Next.js skeleton deployed to Vercel, connected to Supabase Auth and database with valid production OAuth redirect URLs.
* **Days 2–4:** Core vertical slice operational (Quick Logger $\to$ Async Extraction $\to$ Timeline $\to$ Deterministic S-14 Card).
* **Days 5–8:** Pre-seeded demo account (dynamic relative dates), pattern analytics, and footnote-grounded monthly reflection.
* **Days 9–10:** Polish, JSON export, demo video recording, and submission portal finalization.

---

## 20. Definition of Done

The Life Memory MVP is considered 100% complete and hackathon-ready when:

1. [ ] **Day 1 Deployment:** Application is live on Vercel with HTTPS and working Google OAuth.
2. [ ] **Instant Quick Logger:** Micro-log saves in $<100\text{ms}$ with optimistic timeline card drop.
3. [ ] **Async Tagging:** Gemini 3.5 Flash-Lite extracts category, people, places, and topics without blocking the UI.
4. [ ] **Pre-Seeded Demo Account:** 1-click "✦ Explore Demo Account" loads Persona Jimmy (40–60 logs over 8 weeks, dynamically anchored to `CURRENT_DATE`) instantly with zero API calls.
5. [ ] **Topic Recurrence:** System discovers recurring skill/topic patterns (*"You studied React 8 times this month"*).
6. [ ] **Grounded Footnotes:** Monthly reflection generates narrative with verified footnotes `[1]`, `[2]` linking to source activity logs.
7. [ ] **Deterministic S-14 Card:** Resurfaces a dormant memory with verified true dormancy math and zero hallucinated text.
8. [ ] **Data Portability:** User can download complete data via `[ Export All Data (JSON) ]`.
9. [ ] **Submission Deliverables:**
   - Public GitHub repository with complete commit history.
   - High-quality 2–3 minute video presentation demonstrating the 3 Hero Moments.
   - Comprehensive Devpost submission with live URL and architectural overview.

---

## 21. Future Possibilities

* Offline-first mobile logging via Progressive Web App (PWA).
* Voice-to-text micro-logging via Web Speech API.
* Year-in-Review longitudinal book generation with printable PDF formatting.
* On-device local LLM execution (e.g. Gemini Nano via WebGPU) for absolute zero-cloud privacy.

---

> **Your days may feel ordinary.**  
> **Your data tells a different story.**
