# Life Memory — Hackathon Submission Kit & Evaluation Guide

> **Tagline:** *Your days may feel ordinary. Your data may tell a different story.*  
> **Evaluation Mode:** 1-Click Instant Preview (No Registration Required): [`/dashboard?demo=jimmy`](http://localhost:3000/dashboard?demo=jimmy)

---

## 1. Project Overview & Pitch

### The Problem
Most people stop journaling within 14 days because logging requires too much manual organization, while traditional notes quickly get buried and forgotten. Existing "AI diary" apps either generate generic, flattering summaries or hallucinate events that never happened—destroying the trust essential to personal autobiography.

### The Innovation: Life Memory
**Life Memory** is an autobiographical intelligence system designed for effortless, long-term personal recall. It combines:
1. **Frictionless Quick Logging (<100ms)**: Raw moments are saved instantly to a paper-like canvas; structured taxonomy (categories, people, places, topics) arrives quietly in the background.
2. **Dual Gemini Model Synergy**:
   - **Gemini 3.5 Flash-Lite** (`@google/genai`): Sub-second asynchronous extraction of people, venues, verbatim topics, and milestones with minimal thinking overhead.
   - **Gemini 3.8 Flash** (`@google/genai`): Produces deeply reflective monthly narrative essays with low thinking depth, strictly constrained by a deterministic citation validator (`ValidateReflection`).
3. **The Two Signature Heroes**:
   - **Hero 1 — S-14 Deterministic Memory Reveal**: Signature recall feature resurfacing dormant memories ($0$ API calls) using a 2-step mathematical dormancy guarantee ($\ge 14$ days activity age, $\ge 21$ days anchor dormancy).
   - **Hero 2 — Interactive Evidence Drawer (Vaul)**: Every pattern claim and reflection statement is grounded with interactive footnote citations (`[1]`, `[2]`) and source pills opening a sleek bottom drawer with highlighted verbatim text.
4. **Absolute Data Sovereignty**: 1-click full JSON export covering all 10 database tables and relationships.

---

## 2. Gemini AI Architecture & Grounding Strategy

```mermaid
graph TD
  UserNote[User Raw Diary Note] --> InstantSave[Instant Optimistic Save <100ms]
  InstantSave --> Gemini35[Gemini 3.5 Flash-Lite: Async Extraction]
  Gemini35 --> StructuredData[Structured Categories, People, Places, Topics]
  StructuredData --> RelationalDB[(Supabase 10 Tables & Reactive Views)]
  
  RelationalDB --> S14Engine[Deterministic S-14 Engine: $0 API Cost]
  S14Engine --> ForgottenCard[Resurfaced Dormant Memory Card]
  
  RelationalDB --> EvidencePool[Curated Completed Memories Pool]
  EvidencePool --> Gemini38[Gemini 3.8 Flash: Monthly Reflection Essay]
  Gemini38 --> CitationValidator{ValidateReflection Engine}
  CitationValidator -->|Hallucination or Uncited| FallbackCascade[Deterministic Literary Fallback]
  CitationValidator -->|100% Grounded Citations| Renumbering[Global Continuous Footnotes [1]..[N]]
  Renumbering --> EditorialUI[Editorial Essay & Interactive Vaul Popovers]
```

### Models & Execution Matrix
| Role | Model Tier | SDK Configuration | Purpose |
| :--- | :--- | :--- | :--- |
| **Activity Extraction** | `gemini-3.5-flash-lite` | `@google/genai`, `thinkingConfig: { thinkingLevel: "minimal" }`, `maxOutputTokens: 4096` | Fast asynchronous categorization and entity extraction. |
| **Monthly Reflection** | `gemini-3.8-flash` | `@google/genai`, `thinkingConfig: { thinkingLevel: "low" }`, JSON response schema | Deep literary autobiographical essay generation. |
| **Cascade Fallback** | `gemini-3.5-flash-lite` $\rightarrow$ Deterministic | Rule-based template with verbatim citations | Guaranteed zero-downtime and zero hallucination. |

---

## 3. Judges' 1-Click Evaluation Walkthrough (3 Minutes)

Judges can explore the complete application instantly using **Persona Jimmy** without signing up:

### Step 1: Open the Landing Page
- Visit [`/`](http://localhost:3000/)
- Click the prominent **✦ Try Demo** button to enter Jimmy's archive.
- Notice that all 48 completed memories are dynamically anchored relative to **today** (`CURRENT_DATE - INTERVAL 'N days'`), ensuring that relative dates (*"3 days ago"*, *"29 days ago"*) are always mathematically exact.

### Step 2: Experience the Dashboard & Hero 1 (S-14 Reveal)
- Land on [`/dashboard?demo=jimmy`](http://localhost:3000/dashboard?demo=jimmy).
- Notice the **"You Probably Forgot This · deterministic S-14"** card at the top.
- Click **Open memory →** to open the dedicated signature reveal at [`/forgot-this?demo=jimmy`](http://localhost:3000/forgot-this?demo=jimmy), displaying the dormant memory and exact days elapsed since the last anchor mention.

### Step 3: Explore Hero 2 — Interactive Evidence Drawer (Vaul)
- Visit [`/insights?demo=jimmy`](http://localhost:3000/insights?demo=jimmy).
- Test the 4 filter tabs: **All Patterns**, **First-Times**, **Recurring**, and **Monthly Shifts**.
- Click the **[ X Sources → ]** button on any pattern card.
- Watch the **Vaul bottom drawer** smoothly glide in from the bottom with drag handle, displaying verbatim memory snippets with **amber highlighted anchor keywords** and direct links to the timeline.

### Step 4: Inspect Footnote-Grounded Monthly Reflection
- Visit [`/reflection?demo=jimmy`](http://localhost:3000/reflection?demo=jimmy).
- Read the literary reflection essay generated by Gemini 3.8 Flash.
- Hover or click on any citation badge (`[1]`, `[2]`).
- The **Footnote Popover** displays the exact historical memory snippet, date, and tagged entities proving that claim.

### Step 5: Test Data Portability & 3-Way Dark Mode
- Visit [`/settings?demo=jimmy`](http://localhost:3000/settings?demo=jimmy).
- Switch between **Light**, **Dark**, and **System** mode with visual cards.
- Click **Download Full Archive (JSON)** to download Jimmy's complete 10-table archive file (101.7 KB) containing all raw notes, details, entities, junctions, and insights.
- Notice the **Danger Zone** is protected with a read-only badge in demo mode.

---

## 4. Video Demo Storyboard & Screenplay (2m 30s)

| Time | Scene | Visual Cue | Spoken Voiceover / Screen Action |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:25** | **The Hook & Problem** | Cinematic landing page hero with typewriter animation. | *"We live rich, eventful lives, but within weeks, the details fade. Traditional journaling feels like a chore, while generic AI apps flatter you with summaries they made up. Life Memory is different: an autobiographical archive that turns raw moments into verified, grounded intelligence."* |
| **0:25 - 0:55** | **Quick Logger & Instant Save** | Types a natural diary note in Quick Logger and presses `⌘+Enter`. | *"It starts with the Quick Logger. You write freely in English or Indonesian. In less than 100 milliseconds, the card saves optimistically. In the background, Google Gemini 3.5 Flash-Lite extracts categories, people, places, and topics without blocking your workflow."* |
| **0:55 - 1:25** | **Hero 2: Vaul Evidence Drawer** | Navigates to `/insights`, toggles 4 filter tabs, clicks `[ 8 Sources → ]`. | *"Over time, deterministic patterns emerge. Look at 'What keeps returning'. Click on any pattern pill, and the Vaul Evidence Drawer glides up. Notice the keyword highlighting: every insight links directly to verifiable source memory logs. Zero black box, zero hallucination."* |
| **1:25 - 1:55** | **Gemini 3.8 Flash Monthly Reflection** | Opens `/reflection`, interacts with footnote popovers `[1]`, `[2]`. | *"At the end of the month, Gemini 3.8 Flash weaves your memories into an essay. But here is the critical breakthrough: our Deterministic Citation Validator guarantees that every claim is grounded with clickable footnote citations back to raw evidence records."* |
| **1:55 - 2:15** | **Hero 1: S-14 Forgotten Memory Reveal** | Opens `/forgot-this`, reveals dormant memory card with dormancy counter. | *"And my favorite signature feature: 'You Probably Forgot This'. Using pure mathematical dormancy scoring with zero API cost, it resurfaces meaningful moments and people you haven't mentioned in over 21 days."* |
| **2:15 - 2:30** | **Data Sovereignty & Closing** | Clicks `Download Full Archive (JSON)` in Settings, toggles dark mode. | *"You own 100% of your memories with a one-click 10-table JSON export. Life Memory: Your days may feel ordinary, but your data tells a profound story."* |

---

## 5. Technical Specifications & Quality Verification

### Complete Automated Test Results
| Test Suite | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **Production Smoke Test** | `npm.cmd run test:smoke` | **PASSED (6/6 Checks)** | Verifies dynamic demo freshness, S-14 dormancy, analytics, evidence drawer, reflection citations, and JSON export. |
| **Full Archive Export** | `npm.cmd run test:export` | **PASSED** | 10 tables, 48 demo activities, 104 junctions, 53 insights, 101.7 KB round-trip. |
| **Insights & Evidence Drawer** | `npm.cmd run test:insights` | **PASSED** | 53 deterministic patterns generated on Jimmy dataset, 100% evidence linkage. |
| **Monthly Reflection Engine** | `npm.cmd run test:reflection` | **PASSED** | Evidence curation, deterministic fallback, ValidateReflection citation integrity, continuous global numbering. |
| **S-14 Forgotten Memory** | `npm.cmd run test:forgotten` | **PASSED** | 14-day activity age + 21-day anchor dormancy rules. |
| **Analytics Ground Truth** | `npm.cmd run test:analytics` | **PASSED** | 50 total / 48 completed / mixed-status ground-truth. |
| **Supabase Cloud DB** | `npm.cmd run test:supabase` | **PASSED** | GoTrue Auth 200 OK, live queries to `profiles`, `activities`, and `activity_details`. |
| **TypeScript Typecheck** | `npm.cmd run typecheck` | **PASSED (0 Errors)** | Clean compilation across all routes and components. |
| **ESLint Quality** | `npm.cmd run lint` | **PASSED (0 Errors)** | Clean code standards. |

---

## 6. Future Sprint Roadmap (Post-Hackathon)
As cataloged in `SPRINT.md`:
- **Diary Image Generation**: Add generative illustrations using Gemini AI or upload personal photos directly from the device (minimum 1 image per entry).
- **Responsive Media Layout**: Adaptive layout dynamically adjusting based on image count in diary entries.
- **AI Tag Suggestions**: Contextual autocomplete for entity tagging based on surrounding semantic narrative.
- **Calendar Visualization View**: Rich monthly grid and timeline heatmap of diary frequency.
- **Sidebar Navigation**: Collapsible persistent drawer navigation for authenticated archives.
