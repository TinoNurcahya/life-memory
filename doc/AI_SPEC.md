# Life Memory — AI Engineering & Behavioral Specification

> **Document Version:** 1.3  
> **Status:** Approved Architectural Specification (Pre-Implementation Alignment)  
> **AI Provider:** Google Gemini API via official Google Gen AI SDK (`@google/genai`)  
> **Target Models:**  
> • Extraction Pipeline: `gemini-3.5-flash-lite` (Fast, minimal thinking, cost-efficient for structured extraction)  
> • Reflection Pipeline: `gemini-3.8-flash` (or `gemini-3.5-flash-lite`, gentle editorial voice)  
> • Nostalgic Recall (S-14): **100% Deterministic Code** (Zero API calls)  
> **Core Pattern:** Native Structured Outputs (`responseSchema`), Substring Match Validation, Deterministic Analytics Core, Footnote-Grounded Narratives with Citation Validation.  
> **Rule Compliance:** Non-Code Specification. All algorithms, schemas, and workflows are expressed as declarative specifications, markdown tables, JSON schemas, and algorithmic pseudo-code. Relative documentation links use repository paths (`./DESIGN.md`, `./PRD.md`).

---

## 1. AI Vision & Philosophical Boundaries

Life Memory operates on a strict separation of concerns between artificial intelligence and deterministic software engineering:

```
Human Activity → Natural Language → AI Understanding → Structured Data → Deterministic Analysis → AI Interpretation → Grounded Narrative
```

### Strict Behavioral Mandates

1. **AI as Translator, Not Calculator:**  
   AI translates messy, colloquial natural language into structured entity records. AI does **not** count activities, calculate averages, compute percentages, or determine time deltas. All mathematical, statistical, and windowing calculations are performed deterministically in PostgreSQL and TypeScript.
2. **Zero Hallucination & Strict Verbatim Grounding:**  
   The AI must never invent events, people, places, or emotional states. The extraction pipeline extracts **only explicitly stated facts**. Speculative inference of unexpressed sentiment or implied backstory is strictly forbidden.
3. **Evidence Linkage & Footnote Integrity:**  
   Every statement, trend observation, and thematic shift in reflection narratives must cite specific database records (`evidence_ids` linking to `activity_detail_id` and verified snippets). Narratives that fail deterministic citation validation are rejected and fall back to deterministic templates.
4. **Non-Judgmental Stance & Zero Mood Tracking:**  
   The AI is an observant, compassionate chronicler. It never lectures, moralizes, gives unsolicited advice, scolds for lack of activity, or imposes toxic productivity optimization. **There is zero mood tracking and zero inferred sentiment.**
5. **Data Privacy, Governance & Regulatory Compliance:**  
   - **Google AI Studio Free Tier (Unpaid Services):** Data submitted to the free tier may be logged and reviewed by human evaluators, and may be used by Google for model improvement. The application enforces a prominent demo disclaimer: *"Gunakan data fiktif atau akun demo. Jangan masukkan catatan pribadi asli."*
   - **Age & Jurisdictional Restriction:** The application is strictly intended for users aged 18 and older. Users in the EEA, Switzerland, and UK must be routed through paid services per Google Terms of Service.
   - **Paid Services Transparency:** When using paid Google Cloud API services, customer data is not used to train Google models. Operational logs are retained temporarily solely for abuse monitoring, security audits, and system troubleshooting in accordance with Google Cloud Data Processing agreements (no unconditional "zero retention" claim).
   - **Cost Ceiling:** Production deployment leverages `gemini-3.5-flash-lite` (~$0.30 / 1M input tokens, ~$2.50 / 1M output tokens; approximately $0.001 per log) backed by strict cloud budget alerts.

---

## 2. Model Selection & Runtime Configuration

### 2.1 Runtime Configuration Matrix

| Parameter | Activity Extraction Pipeline | Monthly Reflection Generator | Nostalgic Recall Engine (S-14) |
|---|---|---|---|
| **Engine Type** | Gemini LLM via `@google/genai` | Gemini LLM via `@google/genai` | **100% Deterministic Code** |
| **Target Model** | `gemini-3.5-flash-lite` | `gemini-3.8-flash` (or `3.5-flash-lite`) | *N/A (Zero API Calls)* |
| **Response Format** | `application/json` (Native Schema) | `application/json` (Native Schema) | *N/A (React Component Template)* |
| **Temperature** | `0.1` (Maximum determinism) | `0.3` (Gentle editorial tone, restrained) | *N/A* |
| **Top-P** | `0.95` | `0.95` | *N/A* |
| **Top-K** | `40` | `40` | *N/A* |
| **Max Output Tokens** | `4096` *(Headroom prevents truncation)* | `4096` | *N/A* |
| **SDK Thinking Config** | `thinkingConfig: { thinkingLevel: "minimal" }` | `thinkingConfig: { thinkingLevel: "low" }` | *N/A* |

### 2.2 Official SDK Call Signatures (`@google/genai`)

In the `@google/genai` TypeScript SDK, thinking configuration is nested within `config.thinkingConfig.thinkingLevel`:

```typescript
// 1. Activity Extraction Pipeline (gemini-3.5-flash-lite)
const extractionResponse = await ai.models.generateContent({
  model: 'gemini-3.5-flash-lite',
  contents: prompt,
  config: {
    thinkingConfig: { thinkingLevel: 'minimal' },
    responseMimeType: 'application/json',
    responseSchema: ActivityExtractionSchema,
    temperature: 0.1,
    maxOutputTokens: 4096,
  },
});

// 2. Monthly Reflection Generator (gemini-3.8-flash)
const reflectionResponse = await ai.models.generateContent({
  model: 'gemini-3.8-flash',
  contents: prompt,
  config: {
    thinkingConfig: { thinkingLevel: 'low' },
    responseMimeType: 'application/json',
    responseSchema: MonthlyReflectionSchema,
    temperature: 0.3,
    maxOutputTokens: 4096,
  },
});
```

> [!IMPORTANT]
> **Thinking Token Headroom & Status Defense:** Modern Gemini models (3.5 Flash-Lite and 3.8 Flash) tally internal reasoning tokens within `max_output_tokens`. Setting an overly tight token cap (e.g. 2048) causes JSON responses to be truncated mid-syntax or returned empty with `finishReason == "MAX_TOKENS"` or `status == "incomplete"`. We configure `max_output_tokens: 4096` with `thinkingLevel: "minimal"` for extraction. The extraction pipeline explicitly treats `incomplete` or truncated status as a recoverable error, prompting an immediate retry with simplified schema parameters.

---

## 3. Activity Extraction Engine

The extraction engine parses informal daily micro-logs into discrete, structured activity records.

### 3.1 Declarative JSON Schema (`ActivityExtractionSchema`)

Configured via `@google/genai` using standard schema primitives matching the single source of truth 6-category taxonomy:

```json
{
  "type": "OBJECT",
  "properties": {
    "activities": {
      "type": "ARRAY",
      "description": "Discrete activity records extracted from the log. If text describes multiple actions, split them into separate items.",
      "items": {
        "type": "OBJECT",
        "properties": {
          "summary": {
            "type": "STRING",
            "description": "Concise summary of the activity in the user's primary language."
          },
          "source_text": {
            "type": "STRING",
            "description": "Exact verbatim substring from the raw log representing this activity, used for deterministic substring validation."
          },
          "category": {
            "type": "STRING",
            "description": "Core taxonomy category matching the UI design system tokens (exact 7 categories).",
            "enum": [
              "career",
              "social",
              "health",
              "learning",
              "leisure",
              "routine",
              "other"
            ]
          },
          "day_offset": {
            "type": "INTEGER",
            "description": "Relative day offset from reference_date. 0 for base entry date, -1 for yesterday ('kmrn', 'semalem'), -2 for two days ago, etc."
          },
          "time_of_day": {
            "type": "STRING",
            "description": "Time phase of the activity.",
            "enum": ["morning", "afternoon", "evening", "night", "exact", "unknown"]
          },
          "time_hint": {
            "type": "STRING",
            "nullable": true,
            "description": "Explicit clock time if mentioned (e.g., '14:30', '09:00') or conversational time phrase ('sore', 'subuh')."
          },
          "event_status": {
            "type": "STRING",
            "description": "Execution status of the event. Only 'completed' activities enter the life history timeline.",
            "enum": ["completed", "planned", "cancelled"]
          },
          "people": {
            "type": "ARRAY",
            "items": { "type": "STRING" },
            "description": "Proper names of people mentioned, stripped of honorifics."
          },
          "places": {
            "type": "ARRAY",
            "items": { "type": "STRING" },
            "description": "Specific public venues, commercial establishments, parks, or cities. Private/generic dwellings (kosan, rumah) must be excluded."
          },
          "topics": {
            "type": "ARRAY",
            "items": { "type": "STRING" },
            "description": "1-3 key subjects, skills, technical tools, or project themes mentioned explicitly verbatim in the text (e.g. 'React', 'Next.js', 'Machine Learning', 'Proposal'). Leave empty [] for general chores or unspecific notes."
          },
          "is_first_time": {
            "type": "BOOLEAN",
            "description": "True ONLY if user explicitly states or unmistakably declares this was their first time doing it."
          }
        },
        "required": [
          "summary",
          "source_text",
          "category",
          "day_offset",
          "time_of_day",
          "event_status",
          "people",
          "places",
          "topics",
          "is_first_time"
        ]
      }
    }
  },
  "required": ["activities"]
}
```

---

### 3.2 System Prompt & Extraction Directives

```markdown
You are the Activity Extraction Engine for Life Memory, an intimate personal intelligence system.
Your responsibility is to analyze natural language micro-logs and extract discrete, structured activity records.

### RUNTIME CONTEXT:
- reference_date: {SERVER_CALCULATED_ENTRY_DATE_ISO} (The base date selected in the UI date picker, e.g. "2026-10-20")
- user_timezone: {CLIENT_TIMEZONE} (e.g. "Asia/Jakarta")

### CORE EXTRACTION RULES:
1. VERBATIM SUBSTRING CHECK:
   - For every extracted activity, "source_text" MUST be an exact verbatim excerpt from the user's input.
   - The application executes a normalized substring check:
     `normalizeWhitespace(raw_text).toLowerCase().includes(normalizeWhitespace(source_text).toLowerCase())`.
   - If an extracted item fails this match, it is discarded, and the parent log is flagged for manual review.

2. TEMPORAL RESOLUTION:
   - Compute `day_offset` strictly relative to `reference_date` (the selected entry date, NOT the current wall-clock time):
     * Today / base entry date -> 0
     * "kmrn", "kemarin", "yesterday", "semalem" (relative to entry date) -> -1
     * "2 hari lalu", "two days ago" -> -2
   - Resolve `time_of_day` into: "morning" (05:00-11:59), "afternoon" (12:00-16:59), "evening" (17:00-20:59), "night" (21:00-04:59), "exact" (if clock time provided), or "unknown".
   - Record explicit clock strings ("14:00", "09:15") in `time_hint`.

3. EVENT STATUS FILTER:
   - Distinguish completed actions from plans and cancellations:
     * "besok mau ke gym" -> event_status: "planned"
     * "gak jadi ketemu Raka karena hujan" -> event_status: "cancelled"
     * "tadi lari 5k di GBK" -> event_status: "completed"
   - Only "completed" activities will be committed to the user's retrospective life history and analytics. Planned/cancelled activities are flagged and excluded from counts.

4. TAXONOMY MAPPING (Strict 7-Category UI Alignment):
   - career: Professional work, job tasks, coding projects, client presentations, meetings, invoicing.
   - social: Spending intentional time with friends, family dinners, meetups, dates, phone calls with loved ones.
   - health: Physical exercise, gym, running, doctor visits, dental care, meditation, sleep recovery.
   - learning: Reading non-fiction books, technical documentation, online courses, tutorials, language study.
   - leisure: Gaming, walks, flea markets, movies, hobbies, relaxing, entertainment, creative side projects.
   - routine: Household chores, grocery runs, commuting, paying bills/finances, admin paperwork, cooking routine meals.
   - other: Meaningful activities that do not neatly fit the primary six taxonomy buckets.

5. ENTITY CLEANING & BOUNDARIES:
   - People: Strip honorifics (Mas, Mbak, Pak, Bu, Kak, Bang, Uncle, Auntie).
     * "Mas Dimas" -> "Dimas"
     * Generic kinship ("Mama", "Ayah", "Ibu") without proper names are preserved as relational names.
     * Do NOT extract collective pronouns ("teman-teman", "my colleagues").
   - Places: Strip spatial prepositions (di, ke, dari, at, to, in, from).
     * DO NOT strip business nouns: "Warung Bu Kris" remains "Warung Bu Kris"; "Central Park Mall" remains "Central Park Mall".
     * Filter generic domestic dwellings: "kosan", "rumah", "apartemen", "kantor", "kampus" are NOT public places. Set places to empty [] unless a specific named venue is mentioned.

6. ZERO FEELING / MOOD INFERENCE:
   - In accordance with system design guidelines ([DESIGN.md](./DESIGN.md)), Life Memory does NOT track mood or infer sentiment.
   - Do NOT attempt to infer, summarize, or assign emotional categories (e.g. "bangga", "puas", "sedih"). Extract only factual events.

7. TOPICS & SKILLS EXTRACTION:
   - Extract 1 to 3 distinct subject areas, technical frameworks, skills, or specific project themes explicitly mentioned (e.g. "React", "Next.js", "Design System", "Machine Learning", "Proposal").
   - Must appear verbatim in the text; strip punctuation and normalize.
   - Do NOT extract generic filler words ("tugas", "hal", "pekerjaan", "buku").
   - Set to empty array [] for routine chores or general leisure lacking specific subjects.
```

---

### 3.3 Few-Shot Regression Cases

#### Example 1 (Casual Indonesian + Slang + Proper Venue Preservation)
* **User Input:**  
  `"td sore ngopi santai sm Mas Raka di Warung Bu Kris Jaksel, ngobrolin ide startup baru sambil ngemil toast."`
* **Extraction Output:**
  ```json
  {
    "activities": [
      {
        "summary": "Ngopi santai dan diskusi ide startup bersama Raka di Warung Bu Kris Jaksel",
        "source_text": "ngopi santai sm Mas Raka di Warung Bu Kris Jaksel, ngobrolin ide startup baru sambil ngemil toast",
        "category": "social",
        "day_offset": 0,
        "time_of_day": "afternoon",
        "time_hint": "sore",
        "event_status": "completed",
        "people": ["Raka"],
        "places": ["Warung Bu Kris Jaksel"],
        "topics": ["startup"],
        "is_first_time": false
      }
    ]
  }
  ```

#### Example 2 (Multiple Activities + First-Time + Domestic Dwelling Filter)
* **User Input:**  
  `"Pagi ini lari 5km di Lapangan Banteng, rekor personal baru. Malemnya pertama kali nyobain bikin pasta aglio olio sendiri di kosan, ternyata enak walau agak keasinan."`
* **Extraction Output:**
  ```json
  {
    "activities": [
      {
        "summary": "Lari 5km di Lapangan Banteng mencapai rekor personal baru",
        "source_text": "Pagi ini lari 5km di Lapangan Banteng, rekor personal baru.",
        "category": "health",
        "day_offset": 0,
        "time_of_day": "morning",
        "time_hint": "pagi",
        "event_status": "completed",
        "people": [],
        "places": ["Lapangan Banteng"],
        "topics": ["running"],
        "is_first_time": false
      },
      {
        "summary": "Pertama kali memasak pasta aglio olio sendiri",
        "source_text": "pertama kali nyobain bikin pasta aglio olio sendiri di kosan, ternyata enak walau agak keasinan.",
        "category": "leisure",
        "day_offset": 0,
        "time_of_day": "night",
        "time_hint": "malem",
        "event_status": "completed",
        "people": [],
        "places": [],
        "topics": ["cooking", "pasta"],
        "is_first_time": true
      }
    ]
  }
  ```

#### Example 3 (Future Plan & Cancellation Handling)
* **User Input:**  
  `"Tadi siang gak jadi lunch bareng Sarah karena meeting kerjaan overrun. Besok sore mau reschedule ke Warung Pasta."`
* **Extraction Output:**
  ```json
  {
    "activities": [
      {
        "summary": "Batal makan siang bareng Sarah karena meeting pekerjaan",
        "source_text": "Tadi siang gak jadi lunch bareng Sarah karena meeting kerjaan overrun.",
        "category": "social",
        "day_offset": 0,
        "time_of_day": "afternoon",
        "time_hint": "siang",
        "event_status": "cancelled",
        "people": ["Sarah"],
        "places": [],
        "topics": [],
        "is_first_time": false
      },
      {
        "summary": "Rencana reschedule ke Warung Pasta",
        "source_text": "Besok sore mau reschedule ke Warung Pasta.",
        "category": "social",
        "day_offset": 1,
        "time_of_day": "afternoon",
        "time_hint": "sore",
        "event_status": "planned",
        "people": [],
        "places": ["Warung Pasta"],
        "topics": [],
        "is_first_time": false
      }
    ]
  }
  ```

---

## 4. Entity & Topic Normalization & Resolution Specifications

All entity and topic normalization procedures are specified as deterministic algorithms and pseudo-code contracts.

### 4.1 Normalization Specification

```
ALGORITHM NormalizeEntityName(rawName: String, entityType: "person" | "place") -> String:
  1. Trim leading and trailing whitespace.
  2. Collapse consecutive whitespace characters into a single space.
  3. Convert to lowercase.
  4. Replace Unicode apostrophes (‘, ’) with standard single quote (').
  5. Assign result to variable `cleaned`.
  
  6. IF entityType == "person":
       // Strip common Indonesian and English honorific prefixes from the cleaned string
       HONORIFICS = /^(mas|mbak|pak|bu|bapak|ibu|kak|kakak|bang|om|tante|dek|adik|koh|ci|dr|drg|mr|mrs|ms)\.?\s+/i
       cleaned = StripRegex(cleaned, HONORIFICS)
       RETURN cleaned.trim()
       
  7. IF entityType == "place":
       // Strip ONLY spatial prepositions; PRESERVE business nouns (Warung, Kafe, Mall)
       PREPOSITIONS = /^(di|ke|dari|at|in|to|from)\s+/i
       cleaned = StripRegex(cleaned, PREPOSITIONS)
       RETURN cleaned.trim()
```

### 4.2 Topic Normalization & Deduplication Specification

```
ALGORITHM NormalizeTopicName(rawTopic: String) -> String:
  1. Trim whitespace, collapse spaces, convert to lowercase.
  2. Strip leading hashtags (#) and surrounding quotes or punctuation.
  3. Canonical Alias Mapping:
     - "reactjs" | "react.js" -> "react"
     - "nextjs" | "next.js" -> "next.js"
     - "postgres" | "postgresql" -> "postgresql"
     - "ts" | "typescript" -> "typescript"
     - "js" | "javascript" -> "javascript"
  4. RETURN normalized topic.

FUNCTION DeduplicateAndValidateTopics(topics: Array<String>, rawText: String) -> Array<String>:
  1. normalizedList = []
  2. FOR EACH topic IN topics:
       norm = NormalizeTopicName(topic)
       // Verbatim check: ensure the topic string exists in rawText
       IF norm.length >= 2 AND rawText.toLowerCase().includes(norm):
         IF norm NOT IN normalizedList:
           normalizedList.push(norm)
  3. RETURN normalizedList.slice(0, 3) // Cap at maximum 3 topics
```

### 4.3 Generic Place Denylist Specification

```
GENERIC_DWELLINGS = ["kosan", "kos", "kost", "rumah", "home", "apartemen", "kantor", "office", "kampus"]

FUNCTION IsGenericDwelling(normalizedPlace: String) -> Boolean:
  RETURN normalizedPlace IN GENERIC_DWELLINGS
```

### 4.4 Resolution, Reactive Views & Idempotent Tracking

To avoid cache desynchronization from backdated entries, edits, deletes, or cancelled/planned logs:
- **Reactive Derivation Principle:** Counters (`interaction_count`, `visit_count`, `activity_count`) and temporal boundaries (`first_seen_at`, `last_seen_at`) are **never stored as mutable cached columns** in `people`, `places`, or `topics`. They are derived dynamically on-the-fly via PostgreSQL Reactive Views (`v_people_with_stats`, `v_places_with_stats`, `v_topics_with_stats`) with `FILTER (WHERE ad.event_status = 'completed')`.
- **Identity & Alias Resolution:** `ResolvePerson` and `ResolvePlace` strictly manage canonical identity and `aliases TEXT[]` arrays without manual counter increments.

```
ALGORITHM ResolvePerson(userId: UUID, rawName: String, occurredDate: Date, eventStatus: String) -> PersonID:
  1. normalized = NormalizeEntityName(rawName, "person")
  
  2. Query database for existing person where:
     user_id == userId AND (normalized_name == normalized OR normalized = ANY(aliases))
     
  3. IF existing record found:
     -- If an alternative spelling was used, record it in aliases for future lookups
     IF NOT (existing.normalized_name == normalized OR normalized = ANY(existing.aliases)):
       UPDATE people
       SET aliases = array_append(aliases, normalized),
           updated_at = NOW()
       WHERE id == existing.id
     RETURN existing.id
     
  4. ELSE:
     INSERT INTO people (user_id, name, normalized_name, aliases)
     VALUES (userId, rawName.trim(), normalized, ARRAY[]::TEXT[])
     RETURNING id
     RETURN newly created id
```

*Place and Topic resolution algorithms follow identical idempotent logic. All interaction counts, visit counts, and boundary dates are dynamically computed by database views.*

### 4.5 Deterministic Ambiguity Triggers & Passive Review

Rather than querying the LLM for self-reported confidence scores or popping disruptive modal drawers, the system flags ambiguous entries **passively** on the timeline card:

| Trigger Condition | Deterministic Check | System Action |
|---|---|---|
| **Multiple Name Matches** | Levenshtein distance scaled by length colliding among $\ge 2$ candidate people | Attaches passive card badge: `[ ⚠ Needs Review: Ambiguous Person ]` |
| **Substring Validation Mismatch** | Normalized `raw_text` does not include normalized `source_text` | Discards invalid item; flags card: `[ ⚠ Needs Review: Unverified Activity ]` |
| **Empty Extraction on Non-Empty Text** | `activities.length == 0` when `raw_text.trim().length > 10` | Timeline displays card as unextracted note with `[ + Add Tag Manually ]` |
| **Unmapped Category** | Category falls outside core 7 tokens | Maps to closest token or renders neutral chip with inline re-categorize dropdown |

$$\text{IsAmbiguousMatch}(s_1, s_2) = \begin{cases} 
\text{Levenshtein}(s_1, s_2) \le 1, & \text{if } \max(|s_1|, |s_2|) \le 4 \\
\text{Levenshtein}(s_1, s_2) \le 2 \text{ AND } \frac{\text{Levenshtein}(s_1, s_2)}{\max(|s_1|, |s_2|)} \le 0.25, & \text{if } \max(|s_1|, |s_2|) > 4
\end{cases}$$

> [!NOTE]
> **Non-Blocking Review Flow:** The user is never blocked by a modal dialog. The passive `[ ⚠ Needs Review ]` badge sits quietly on the timeline card. Clicking the badge opens an optional slide-over drawer (Vaul) allowing the user to select the intended person, correct a topic, or change category at their own leisure.

---

## 5. Deterministic Analytics Engine Specifications

All calculations are strictly deterministic and executed via TypeScript and PostgreSQL. **All analytics engines strictly query `WHERE event_status = 'completed'`.**

### 5.1 First-Time Detection Engine
* **Cold-Start Guard:** To avoid spamming the user during Week 1 (where every person, place, and topic is technically new), automatic entity-based first-time insights require:
  - Account age $\ge 21$ days AND total lifetime activities $\ge 20$.
* **Explicit First-Time Signal:** If `activity_details.is_first_time === true` is explicitly stated in the log by the user, an insight is created immediately regardless of account age.
* **Evidence:** Links directly to the source `activity_detail_id`.

### 5.2 Recurring Pattern Engine (Calendar Month)
* **Execution:** Runs deterministically over an adjustable time horizon (`asOf: Date = NOW()`).
* **Time Horizon:** Strictly anchored to the **Calendar Month** (`date_trunc('month', asOf)` to `date_trunc('month', asOf) + INTERVAL '1 month' - INTERVAL '1 day'`).
* **Algorithm:**
  1. Query completed activities within the calendar month:  
     `WHERE occurred_at >= date_trunc('month', asOf) AND occurred_at < date_trunc('month', asOf) + INTERVAL '1 month' AND event_status = 'completed'`.
  2. Exclude generic dwelling entities (`GENERIC_DWELLINGS`).
  3. Group by `person_id`. If occurrences in month $\ge 3$, emit recurring social insight.
  4. Group by `place_id`. If occurrences in month $\ge 3$, emit recurring venue insight.
  5. Group by `topic_id`. If occurrences in month $\ge 3$, emit recurring skill/topic pattern (*"You studied React 8 times this month"*).
  6. Group by `category`. If count in month $\ge 5$, emit lifestyle focus pattern.

### 5.3 Change Detection Engine & Formula Safeguards (Month-over-Month)
* **Time Horizon:** Compares Calendar Month A (`date_trunc('month', asOf)`) against Calendar Month B (`date_trunc('month', asOf) - INTERVAL '1 month'`).
* **Algorithm:**
  1. Query completed activity counts for Month A ($V_A$) and Month B ($V_B$) per category:  
     `WHERE event_status = 'completed'`.
  2. **Minimum Volume Shift Threshold:** Require $|V_A - V_B| \ge 3$ before evaluating change significance (prevents noise such as $0 \to 1$ or $1 \to 2$).
  3. **Safeguards & Formatting:**
     - IF $V_B == 0$ AND $V_A \ge 3$: Output absolute observation: `"Pergeseran fokus baru: 0 → {V_A} aktivitas"`.
     - IF $\max(V_A, V_B) < 5$: Output absolute volume: `"{V_B} → {V_A} aktivitas"`.
     - ELSE: Compute variance $\Delta = \frac{V_A - V_B}{V_B} \times 100\%$. If $|\Delta| \ge 50\%$, generate insight with `type = 'change'`.

### 5.4 Reformed "You Probably Forgot This" Scoring & True Dormancy (S-14)

Every past completed activity is scored to surface meaningful, dormant memories:

$$\text{Score} = \min(\text{DaysAgo}, 90) \times 0.3 + (\text{IsFirstTime} \times 30) + (\text{RarityScore}) + (\text{DormancyBonus}) - (\text{RecentRecallPenalty})$$

#### Scoring Parameters:
* **Prerequisite Filter:** `WHERE event_status = 'completed'`.
* **Anchor Entity Prerequisite:** The activity must have at least one qualifying anchor:
  1. A recognized person (e.g. "Raka").
  2. A recognized non-generic place (e.g. "Warung Bu Kris").
  3. An explicit first-time milestone (`is_first_time: true`).
  *(Routine activities lacking people, venues, and first-time markers are disqualified from S-14 recall).*
* **True Dormancy Calculation:**  
  Let $E$ be the primary anchor entity. Let $T_{\text{last}}(E)$ be the date of the most recent recorded activity involving $E$.  
  $$\text{DormancyDays} = \text{asOf} - T_{\text{last}}(E)$$
  - **Filter:** $\text{DormancyDays} \ge 21$ days.
  - **Factual Copy Integrity:** The UI copy displays:  
    *"Belum pernah kamu sebut lagi sejak {DormancyDays} hari yang lalu."*  
    *(Calculated from $T_{\text{last}}(E)$, ensuring that if the entity was mentioned 25 days ago, the card truthfully states 25 days, NOT the activity age).*
* **Capped Age Factor:** $\min(\text{DaysAgo}, 90) \times 0.3$ (caps at 27 points).
* **$\text{IsFirstTime}$:** $+30$ points if `is_first_time == true`.
* **$\text{RarityScore}$:** $+25$ points if lifetime interactions $\le 1$; $+10$ points if $\le 3$.
* **$\text{DormancyBonus}$:** $+25$ points if $\text{DormancyDays} \ge 30$.
* **$\text{RecentRecallPenalty}$:** $-100$ points if resurfaced within the last 30 days.
* **Selection Mechanism:** Sample randomly from the **Top 5 eligible candidates**.

---

## 6. Monthly Reflection Generator

Generates a grounded, literary monthly reflection with verifiable footnote citations.

### 6.1 Deterministic Evidence Selection & Payload

To ensure factual grounding, the backend deterministically selects a curated candidate pool of 4–8 salient activities (`WHERE event_status = 'completed'`):
- 2 activities from the top shifting categories.
- Up to 2 first-time experiences.
- 2 activities representing primary recurring social connections.

```json
{
  "month": "October 2026",
  "stats": {
    "total_activities": 40,
    "unique_people_count": 12,
    "unique_places_count": 9,
    "first_times_count": 4
  },
  "top_categories": [
    { "category": "career", "count": 16, "delta": "+25%" },
    { "category": "social", "count": 12, "delta": "+50%" }
  ],
  "evidence_pool": [
    {
      "id": "act_01",
      "date": "2026-10-03",
      "summary": "Capstone planning and ML algorithm review with Ethan",
      "category": "career",
      "people": ["Ethan"],
      "places": ["Campus Library"]
    },
    {
      "id": "act_02",
      "date": "2026-10-12",
      "summary": "Met Lena at Blank Street Coffee, discussed Next.js and design systems",
      "category": "social",
      "people": ["Lena"],
      "places": ["Blank Street Coffee"]
    },
    {
      "id": "act_03",
      "date": "2026-10-20",
      "summary": "First freelance client presentation via Zoom",
      "category": "career",
      "people": [],
      "places": [],
      "is_first_time": true
    },
    {
      "id": "act_04",
      "date": "2026-10-26",
      "summary": "Sent first professional developer invoice",
      "category": "career",
      "people": [],
      "places": [],
      "is_first_time": true
    }
  ]
}
```

---

### 6.2 Grounded Response Schema (`MonthlyReflectionSchema`)

```json
{
  "type": "OBJECT",
  "properties": {
    "title": {
      "type": "STRING",
      "description": "Evocative, factual title for the month (e.g. 'Fokus Karier & Pertemuan Baru'). Must reflect verified statistics."
    },
    "paragraphs": {
      "type": "ARRAY",
      "description": "List of thematic reflection paragraphs. Every paragraph must substantiate its text with at least one evidence_id.",
      "items": {
        "type": "OBJECT",
        "properties": {
          "theme": {
            "type": "STRING",
            "enum": ["rhythm_and_focus", "relationships_and_places", "shifts_and_firsts"]
          },
          "text": {
            "type": "STRING",
            "description": "Narrative paragraph containing sequential citation markers [1], [2] in order."
          },
          "evidence_ids": {
            "type": "ARRAY",
            "items": { "type": "STRING" },
            "description": "Array of evidence_pool IDs corresponding directly to the sequential citation markers in this paragraph."
          }
        },
        "required": ["theme", "text", "evidence_ids"]
      }
    },
    "key_themes": {
      "type": "ARRAY",
      "items": { "type": "STRING" },
      "description": "3-4 concise thematic tags directly drawn from top categories and active entities."
    }
  },
  "required": ["title", "paragraphs", "key_themes"]
}
```

---

### 6.3 Deterministic Citation Validator & Fallback Pipeline

Every generated reflection undergoes automated deterministic validation before storage:

```
FUNCTION ValidateReflection(payload: InputPayload, response: ReflectionResponse) -> Boolean:
  validIds = Set(payload.evidence_pool.map(e => e.id))
  poolEntities = Set(ExtractAllNamesAndPlaces(payload.evidence_pool))
  
  FOR EACH paragraph IN response.paragraphs:
    // 1. Mandatory evidence check (no uncited paragraphs permitted)
    IF paragraph.evidence_ids.length == 0:
      RETURN False
      
    // 2. Referenced IDs validity check
    FOR EACH id IN paragraph.evidence_ids:
      IF NOT validIds.has(id):
        RETURN False // Hallucinated ID
        
    // 3. Sequential citation marker check ([1]..[N])
    citations = ExtractCitationMarkers(paragraph.text) // e.g. [1], [2]
    expectedCount = paragraph.evidence_ids.length
    IF citations.length != expectedCount OR citations != [1..expectedCount]:
      RETURN False // Mismatched or non-sequential markers
      
    // 4. Entity grounding check (proper names in text must exist in cited evidence)
    textEntities = ExtractProperNames(paragraph.text)
    FOR EACH entity IN textEntities:
      IF NOT poolEntities.has(entity):
        RETURN False // Hallucinated person or place
      
  RETURN True
```

* **Global Footnote Renumbering:** The UI transforms local paragraph citations (`[1]`, `[2]`) into global consecutive footnote references (`[1]`, `[2]`, `[3]`, `[4]`) matching the layout in [DESIGN.md](./DESIGN.md) Screen S-13.
* **Deterministic Fallback:** If LLM validation fails on retry, the system falls back to a purely deterministic report template with zero hallucination risk.

---

## 7. "You Probably Forgot This" Reveal Engine (S-14)

In full compliance with [DESIGN.md](./DESIGN.md) (Hero 3 and Screen S-14 wireframe), the nostalgic reveal engine is **100% deterministic**. It requires **zero API calls**, delivers instant (<50ms) rendering, and preserves complete fidelity to authentic memory.

### 7.1 Relative Demo Anchor for Judging Period

> [!IMPORTANT]
> **Temporal Integrity for Persona Jimmy (Hackathon Demo):**  
> To guarantee that copy stating *"29 days ago"* or *"Belum pernah kamu sebut lagi sejak 29 hari yang lalu"* is 100% mathematically truthful whenever hackathon judges evaluate the application in late December 2026, the demo dataset dynamically anchors dates relative to `CURRENT_DATE`:  
> `occurred_at = CURRENT_DATE - (offset_days || INTERVAL 'N days')`.  
> - Recent activities: `CURRENT_DATE - INTERVAL '1 day'`, `CURRENT_DATE - INTERVAL '2 days'`.  
> - S-14 Memory Candidate: `CURRENT_DATE - INTERVAL '29 days'`, with anchor entity last mentioned `CURRENT_DATE - INTERVAL '29 days'`.  
> - Earliest Activity: `CURRENT_DATE - INTERVAL '56 days'`.  
> This eliminates hardcoded stale calendar dates and ensures dynamic, mathematical truth on any evaluation date.

### 7.2 Deterministic Card Template Specification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✦ YOU PROBABLY FORGOT THIS                                                  │
│                                                                             │
│ {occurredAtFormatted} — {daysAgo} days ago • Late Afternoon                 │
│                                                                             │
│ "{rawText}"                                                                 │
│                                                                             │
│ 📍 Campus Library   👤 Stranger (Grad Applicant)                            │
│ ✦ Belum pernah kamu sebut lagi sejak {dormancyDays} hari yang lalu.         │
│                                                                             │
│ [ Show Another ]                     [ Don't surface this again ]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Resilience, Rate Limiting & Privacy Governance

### 8.1 Rate Limit Realities & Dynamic Quotas
* **Variable Quotas:** Google AI Studio free tier quotas (RPM, TPM, RPD) vary by model and geographical tier. Quota limits are monitored directly via the Google AI Studio Console.
* **Persistent Rate Limiting:** Enforced via a PostgreSQL token-bucket table (10 requests per 5 minutes per user account). Exceeded requests return HTTP 429 with gentle user guidance.

### 8.2 Asynchronous Extraction Pipeline (Serverless Timeout Defense)

```
1. USER HITS SAVE (⌘+Enter)
   │
   ├──> Fast Save to PostgreSQL (<100ms)
   │    activities row created with status = 'PENDING'
   │    Raw note is 100% PERSISTED and immediately visible on timeline.
   │
2. ASYNC EXTRACTION TRIGGER
   │
   ├──> Background Route Handler invokes Gemini 3.5 Flash-Lite
   │    ├── Success
   │    │   └── Inserts activity_details, activity_people, activity_places, activity_topics
   │    │   └── Updates status = 'RESOLVED'
   │    │   └── Entity chips glide into timeline card (150ms micro-fade)
   │    │
   │    ├── Timeout / Crash Guard (>60s in PENDING)
   │    │   └── Sweeper query automatically marks status = 'FAILED'
   │    │   └── Timeline card displays discreet button: "[Retry Extraction]"
   │    │
   │    └── Ambiguity Detected
   │        └── Timeline card displays passive badge: "[ ⚠ Needs Review ]"
```

### 8.3 Privacy Governance & Terms of Service Architecture
* **Free Tier Disclosure:** Google Unpaid Services terms permit Google to use prompts and generated responses for model training, with potential human reviewer access.
* **Application Safeguards:**
  1. **Demo Notice:** Disclosed prominently: *"Gunakan data fiktif atau akun demo. Jangan masukkan data pribadi asli."*
  2. **Age Restriction:** Strictly restricted to individuals aged 18 and older.
  3. **Paid Tier Disclosures:** When operating on paid Google Cloud services, customer data is excluded from global model training. Log retention for operational security adheres to Google Cloud data processing agreements without false claims of zero retention.

---

## 9. Evaluation Benchmark Suite (Regression Suite)

The evaluation suite acts as an automated regression defense against prompt drift, model updates, and formatting anomalies. 

* **Canonical 12-Case Golden Suite:** The 12 named benchmark cases below (TC-01 through TC-12) constitute the essential regression suite required for every PR and local CI run. The engineering threshold for production readiness is **$\ge 90\%$ pass rate (at least 11/12 test cases)**.
* **Expanded 50 Ground-Truth Dataset (SPRINT.md Task 0.11):** For comprehensive release validation and Google AI Studio benchmarking, an expanded 50-item dataset acts as a direct superset—incorporating these 12 core cases alongside 38 additional Indonesian slang variations, colloquial temporal phrases, and complex multi-clause journal entries.

| ID | Test Category | Sample Input Text | Key Assertions |
|---|---|---|---|
| **TC-01** | Indonesian Slang + Relative Date | `"kmrn sore nongkrong sm Raka di kafe dkt stasiun"` | `day_offset: -1`, `time_of_day: "afternoon"`, `people: ["Raka"]`, `category: "social"` |
| **TC-02** | English Professional Log | `"Shipped the authentication middleware and reviewed 3 PRs with David."` | `people: ["David"]`, `category: "career"`, `places: []`, `event_status: "completed"` |
| **TC-03** | Multi-Activity Split | `"Pagi jogging 5k di GBK, siang coding fitur auth, malem dinner sm Maya"` | Splits into exactly 3 discrete items in `activities` array |
| **TC-04** | Explicit First-Time Experience | `"Pertama kali nyobain diving di Pulau Pari"` | `is_first_time: true`, `category: "leisure"`, `places: ["Pulau Pari"]` |
| **TC-05** | Ambiguous Relative Night | `"semalem begadang beresin proposal bisnis bareng tim"` | `day_offset: -1`, `time_of_day: "night"`, `category: "career"`, `people: []` |
| **TC-06** | Place Preposition + Business Type | `"makan siang soto ayam di Warung Bu Kris bareng Mas Dimas"` | `places: ["Warung Bu Kris"]` *(not "bu kris")*, `people: ["Dimas"]` |
| **TC-07** | Future Planned Event | `"Besok sore mau coba lari 10k di GBK bareng anak-anak kantor"` | `event_status: "planned"`, `category: "health"` *(filtered from past timeline)* |
| **TC-08** | Cancelled Activity | `"Tadi gak jadi ketemu Raka di Senopati karena mendadak hujan badai"` | `event_status: "cancelled"`, `people: ["Raka"]` |
| **TC-09** | Kinship Term Without Surname | `"Dianter Mama belanja bulanan di Superindo"` | `people: ["Mama"]`, `category: "routine"`, `places: ["Superindo"]` |
| **TC-10** | Domestic Generic Dwelling Filter | `"Seharian di kosan ngerjain tugas kuliah"` | `places: []` *(Kosan filtered out from public venues)*, `category: "learning"` |
| **TC-11** | Empty / Noise Input | `"..."` or `"asdfghjkl 123"` | Returns `activities: []` without throwing JSON syntax errors |
| **TC-12** | Long Multi-Sentence Entry | Multi-paragraph journal entry (~250 words) covering an entire day | Splits into discrete activities without truncating JSON schema (`max_output_tokens: 4096`) |
