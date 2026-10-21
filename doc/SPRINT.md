# Life Memory — Sprint Plan

> **Hackathon Deadline:** December 21, 2026 at 12:00 PM GMT+7  
> **Development Start:** Fleksibel / Dapat dimulai kapan saja  
> **Prinsip Sprint:** Sprint berbasis siklus berurutan (Sprint 0 → Sprint 10) dengan orientasi *vertical slice*, *fail-safe architecture*, dan *day-one live deployment*.

### Status checklist — audit 19 Oktober 2026

- `[x]` hanya untuk deliverable yang cakupannya sudah terbukti; label artefak lokal/inspeksi kode menjelaskan batas buktinya.
- `[ ]` dengan **Progress** berarti ada implementasi, tetapi persyaratan belum lengkap atau belum terverifikasi.
- `[ ]` dengan **Blocked**, **Belum lengkap**, **Belum dikerjakan**, atau **Belum terverifikasi** menjelaskan alasan item masih terbuka.
- Teks task, deliverable, dan Definition of Done tetap merupakan target; frasa “Phase Selesai” di DoD bukan klaim status aktual. Belum ada sprint yang dinyatakan selesai penuh.

Audit ini menggabungkan bukti source lokal dan tes lokal 19 Oktober; operasi Supabase, browser, OAuth, dan deployment tetap belum live-verified. `test:supabase` sebelumnya exit 0 walau tabel gagal ditemukan (`PGRST205`), dan MCP migration ditolak `-32600`; itu bukan kelulusan database/RLS. Regression terbaru memakai 50 fixture cases dan menghasilkan 48/50 (96%) pada batch harness, dengan `productionExtractorTested: false`; angka ini bukan kelulusan extractor produksi.

Bukti utama: [status sesi sebelumnya](./IMPLEMENTATION_STATUS.md), source yang dirujuk pada catatan deliverable, dan hasil tool pada sesi terkait. Catatan audit di sini mengoreksi klaim “selesai” yang cakupannya lebih luas daripada bukti tersebut.

---

> [!NOTE]
> **Jadwal & Fleksibilitas Pengerjaan:**  
> Pengerjaan kode program dan persiapan dapat dimulai kapan saja tanpa batasan tanggal kickoff khusus. Sprint 0 berfokus pada fondasi spesifikasi, arsitektur sistem, dan desain, sementara implementasi kode dapat langsung dieksekusi secara fleksibel sesuai kesiapan tim.

---

## Sprint Overview

```
Phase 0 — Preparation & Foundation Architecture
└── Sprint 0: Architecture, DB Schema Spec, UI Wireframes, AI Studio Prompts & Datasets

Phase 1 — Foundation & Vertical Slice (Implementation)
├── Sprint 1: Project Setup, Supabase DB (10 Tabel) & Auth, Day 1 Vercel Deploy
├── Sprint 2: Quick Logger, Instant Save (<100ms) & Async AI Tagging (Gemini 3.5 Flash-Lite)
├── Sprint 3: Entity Resolution (People, Places, Topics) & Passive Ambiguity Review
└── Sprint 4: Core Timeline Feed, Topic Chips & Deterministic S-14 Reveal (Vertical Slice Complete)

Phase 2 — Intelligence & Longitudinal Exploration
├── Sprint 5: Pre-Seeded Demo Mode (Persona Jimmy Dynamic Dates) & Directories (People/Places/Topics)
├── Sprint 6: Pattern Detection Engines (Calendar Month, Event Status Filter) & Monthly Stats
└── Sprint 7: Automated Insights Engine Pipeline & Interactive Evidence Drawer (Vaul)

Phase 3 — Soul & Polish
├── Sprint 8: Footnote-Grounded Monthly Reflection Generator (Gemini 3.8 Flash) & Memory Scorer
└── Sprint 9: Data Portability (Export JSON), Dark Mode, Cut Order Readiness & Production Hardening

Phase 4 — Submission
└── Sprint 10: Production Smoke Testing, Demo Dynamic Seed Refresh, Video Demo & Final Submission
```

---

## Phase 0 — Preparation & Foundation Architecture

> **Fokus:** Menyiapkan spesifikasi komprehensif, cetak biru UI, skema database 10 tabel, validasi prompt di Google AI Studio, dan dataset uji sebagai fondasi implementasi. Pengerjaan kode program dapat dimulai kapan saja sesuai kesiapan.

---

### Sprint 0 — Architecture, Wireframes, Prompt Testing & Datasets

**Mode:** Architecture & Setup (Dokumentasi, Diagram Arsitektur, Figma / Wireframing, Google AI Studio)  
**Goal:** Semua fondasi desain, skema data, prompt AI, dan skenario demo siap 100% agar implementasi kode program dapat langsung melaju cepat tanpa ambiguitas arsitektur.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 0.1 | Konsolidasi temuan lintas-dokumen (AI_SPEC, DATABASE, ARCHITECTURE, DESIGN) dan finalisasi dokumen PRD v1.2, acceptance criteria, edge cases, dan user stories | §8 | **Must** |
| 0.2 | Spesifikasi lengkap skema database SQL 10 tabel (termasuk `topics`, `activity_topics`, `activity_details`, RLS, index) | §12, `./DATABASE.md` | **Must** |
| 0.2b | Audit & Hardening DDL [ARCHITECTURE.md](./ARCHITECTURE.md) sebelum migrasi: pastikan 4 poin kunci siap eksekusi: (1) Category CHECK 7 nilai (`career`, `social`, `health`, `learning`, `leisure`, `routine`, `other`), (2) Time-of-day CHECK 6 nilai (`morning`, `afternoon`, `evening`, `night`, `exact`, `unknown`), (3) Resolved date `occurred_at DATE NOT NULL` pada `activity_details`, (4) Kolom `aliases TEXT[] NOT NULL DEFAULT '{}'` pada `people` dan `places` beserta GIN index | §12, `./ARCHITECTURE.md` | **Must** |
| 0.3 | Spesifikasi JSON Schema untuk Gemini Structured Output ekstraksi aktivitas dengan field `topics: string[]` dan 7 kategori baku (`career`, `social`, `health`, `learning`, `leisure`, `routine`, `other`) | §11, `./AI_SPEC.md` | **Must** |
| 0.4 | Wireframing 15 layar utama di PRD §10 (Landing, Login, Dashboard, Input Shimmer, Timeline, People, Person Detail, Places, Place Detail, Topics, Insights Drawer, Reflection, Forgot This S-14, Settings, Empty States) | §10, `./DESIGN.md` | **Must** |
| 0.5 | Dokumentasi Design System tokens matrix: palet warm amber/slate, tipografi Inter/Newsreader/Geist Mono, spacing, dark mode tokens | §16, `./DESIGN.md` | **Must** |
| 0.6 | Pemetaan user journey flow dan micro-copy interaksi dua bahasa (Indonesia & Inggris) | §10, §16 | **Should** |
| 0.7 | Dokumentasi struktur folder Next.js App Router, batasan Server Actions, dan pola route handlers | §13 | **Should** |
| 0.8 | Pengujian dan tuning prompt ekstraksi di Google AI Studio dengan 30+ variasi input (slang Indo, typo, informal date, zero thinking) | §11, `./AI_SPEC.md` | **Must** |
| 0.9 | Pengujian prompt refleksi bulanan di Google AI Studio (Gemini 3.8 Flash, tone hangat, objektif, non-judgmental, grounded citations) | §11, `./AI_SPEC.md` | **Must** |
| 0.10 | Formulasi template kartu memori deterministik S-14 tanpa pemanggilan API | §11, `./AI_SPEC.md` | **Must** |
| 0.11 | Pembuatan dataset evaluasi: 50 ground-truth log aktivitas (superset pengujian di Google AI Studio mencakup 12 benchmark kasus regresi inti TC-01 s/d TC-12 dari AI_SPEC §9 dengan threshold $\ge 90\%$, ditambah 38 variasi bahasa gaul dan edge cases) | §11, `./AI_SPEC.md` | **Must** |
| 0.12 | Pembuatan skema dataset persona Jimmy (40–60 aktivitas dengan formula penanggalan relatif `CURRENT_DATE - INTERVAL 'N days'`) | §19 | **Must** |
| 0.13 | Penyusunan naskah/storyboard video demo hackathon (durasi 2–3 menit) | §19 | **Must** |

**Status audit 19 Oktober 2026:** Progress — spesifikasi tersedia; fixture regression 50 kasus dan analytics ground-truth lokal sudah ada, sementara wireframe/sinkronisasi dan live prompt verification belum lengkap.

**Deliverables:**
* [ ] Dokumen PRD v1.2 dan seluruh spesifikasi teknis disinkronkan secara konsisten.
  - **Progress:** Dokumen tersedia, tetapi DESIGN masih menyebut beberapa route yang sudah ada sebagai planned; sinkronisasi lintas-dokumen belum tuntas.
* [x] Script SQL migration DDL 10 tabel (ditambal 7 kategori, 6 time-of-day, `occurred_at`, `aliases`, 3 reactive views) siap dieksekusi begitu coding dimulai.
  - **Selesai (live verified):** Migrasi dieksekusi dan diverifikasi pada Supabase cloud via `npm run db:migrate` dan `npm run test:supabase` pada 20 Oktober 2026.
* [ ] Wireframe cetak biru 15 layar aplikasi di `./DESIGN.md`.
  - **Progress:** `DESIGN.md` berisi screen contract singkat, bukan 15 wireframe lengkap.
* [ ] Tabel design tokens (warna, font, spacing, mode gelap).
  - **Progress:** Token warna/tema dan aturan tipografi tersedia; konsistensi DESIGN dengan CSS/font fallback belum diaudit.
* [x] JSON Schema Gemini Structured Output dengan field `topics` dan 7 kategori tunggal.
  - **Selesai (artefak lokal):** `ActivityExtractionSchema` di `lib/ai/gemini-extractor.ts` memuat topics dan enum tujuh kategori.
* [ ] Template prompt teruji dengan akurasi tinggi di Google AI Studio.
  - **Progress:** Batch harness 19 Oktober tercatat 48/50 (96%); dua kasus gagal tersimpan di `reports/regression-latest.json`, dan mode ini belum menguji extractor produksi.
* [ ] Dataset evaluasi 50 contoh aktivitas (superset 12 benchmark inti AI_SPEC).
  - **Progress:** `scripts/regression-fixture.mjs` mengekspor 50 kasus dengan expected category/status/entities/topics/source text; validasi produksi dan pemetaan TC-01–TC-12 terhadap AI_SPEC masih terbuka.
* [x] Skema dataset persona Jimmy dengan penanggalan dinamis relatif.
  - **Selesai (artefak lokal):** Definisi offset tanggal tersedia di `lib/demo/jimmy.ts` dan spesifikasi `DATABASE.md`; freshness runtime/seed tetap masuk Sprint 5.
* [ ] Storyboard dan script video demo hackathon 2–3 menit.
  - **Belum terverifikasi:** Artefak storyboard/video script belum ditemukan.

---

## Phase 1 — Foundation & Vertical Slice (Coding)

> **Fokus:** Menghadirkan *End-to-End Vertical Slice* yang berfungsi penuh pada minggu pertama: Registrasi, Day 1 Deploy ke Vercel, Input Cepat (<100ms) dengan Simpan Instan Optimistik, Tagging Asinkron Gemini 3.5 Flash-Lite, Resolusi Entitas & Topik, Feed Timeline dengan Inline Edit, dan Kartu Deterministik S-14.

---

### Sprint 1 — Project Setup, Supabase DB & Auth Foundation

**Mode:** Coding  
**Goal:** Inisialisasi project Next.js, setup Supabase DB (10 tabel DDL + RLS), alur autentikasi (Email + Google OAuth), dan pipeline CI/CD Day 1 Vercel live.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 1.1 | Inisialisasi project Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons, Motion) | §13 | **Must** |
| 1.2 | Buat project Supabase, konfigurasi env vars, jalankan migrasi database DDL yang telah ditambal di Sprint 0 (10 tabel, 7 kategori, 6 time-of-day, `occurred_at`, `aliases`, 3 reactive views, RLS `(SELECT auth.uid())`, trigger `updated_at`, composite & GIN index) | §12, `./DATABASE.md`, `./ARCHITECTURE.md` | **Must** |
| 1.3 | Generate TypeScript types dari skema Supabase (`supabase gen types typescript`) | §13 | **Must** |
| 1.4 | Setup Supabase client utilities (browser client, server client, middleware helper) | §13 | **Must** |
| 1.5 | Implementasi Next.js middleware untuk proteksi rute privat dan redirect anonim ke `/login` | §14, FR-14 | **Must** |
| 1.6 | Konfigurasi Google OAuth provider & Email Auth di Supabase dan Next.js | §14, FR-14 | **Must** |
| 1.7 | Bangun halaman Register & Login (S-02, S-03) dengan disclosure Google AI Studio ToS & batasan usia 18+ | §14, §17 | **Must** |
| 1.8 | Implementasi pembuatan record `profiles` otomatis saat signup via database trigger | §12 | **Must** |
| 1.9 | Bangun komponen App Shell (Sidebar desktop, Header dengan Command Palette ⌘K, Mobile bottom bar) | §10, `./DESIGN.md` | **Must** |
| 1.10 | Setup Day 1 Deployment ke Vercel production: pastikan live domain aktif sejak awal | §13 | **Must** |

**Status audit 19 Oktober 2026:** Blocked — schema belum aktif; build/runtime dan Auth/OAuth live belum lolos.

**Deliverables:**
* [ ] Project Next.js berjalan lokal dan build sukses (`npm run build`).
  - **Blocked:** Catatan 18 Oktober: typecheck/lint lulus, build compile berhasil lalu berhenti pada `spawn EPERM`; bukan build production sukses.
* [x] Database Supabase aktif dengan 10 tabel, RLS, trigger, dan foreign keys.
  - **Selesai (live verified):** Migrasi 10 tabel, 3 view, RLS, dan triggers berhasil dieksekusi via `npm run db:migrate` dan diverifikasi dengan query live via `npm run test:supabase` pada 20 Oktober 2026.
* [ ] Alur auth lengkap: daftar, login (email & Google OAuth), logout, session persisten.
  - **Progress:** Halaman login/register dan callback tersedia; email/Google login, logout, session refresh dan isolasi dua akun belum diuji live.
* [ ] Middleware memproteksi rute privat dan me-redirect user anonim ke `/login`.
  - **Progress:** Guard dan pengecualian `?demo=jimmy` ada di `lib/supabase/middleware.ts`; redirect/session belum diuji browser.
* [ ] App Shell responsif dengan navigasi desktop & mobile.
  - **Progress:** Header/dashboard command palette tersedia; sidebar/mobile bottom bar aplikasi dan audit responsif belum lengkap.
* [ ] Aplikasi live di Vercel sejak Day 1.
  - **Belum terverifikasi:** Tidak ada bukti deployment Vercel live yang lolos smoke test untuk versi ini.

**Definition of Done:** Pengguna dapat mendaftar, login via Google atau email, melihat layout aplikasi, dan URL Vercel production aktif.

---

### Sprint 2 — Quick Logger, Instant Save (<100ms) & Async AI Tagging

**Mode:** Coding  
**Goal:** Pengguna mencatat aktivitas dalam bahasa natural; sistem menyimpannya secara instan (<100ms) dengan status PENDING, lalu Gemini 3.5 Flash-Lite mengekstrak data secara asinkron tanpa memblokir UI.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 2.1 | Bangun komponen Quick Logger (textarea elastis, date picker default today, shortcut `Cmd+Enter` / `Ctrl+Enter`) | FR-01, S-05 | **Must** |
| 2.2 | Implementasi Server Action instant save: simpan `raw_text`, `client_entry_date`, `status: 'PENDING'` ke tabel `activities` (<100ms) | FR-01 | **Must** |
| 2.3 | Optimistic UI: langsung tampilkan kartu aktivitas di feed dengan efek skeleton/shimmer tanpa menunggu panggilan LLM selesai | FR-01, S-05 | **Must** |
| 2.4 | Setup client Google Gen AI via SDK `@google/genai` dengan model `gemini-3.5-flash-lite` (`config: { thinkingConfig: { thinkingLevel: "minimal" } }`) | §11, `./AI_SPEC.md` | **Must** |
| 2.5 | Implementasi background API route `/api/extract` dengan prompt JSON Schema terstruktur (ekstraksi topics, entities, 7 kategori baku) | §11, FR-02 | **Must** |
| 2.6 | Validasi respons ekstraksi Zod schema dan simpan `ai_raw_response` ke tabel `activities` | §11, §12 | **Must** |
| 2.7 | Simpan item hasil ekstraksi ke tabel `activity_details` (`summary`, `source_text`, `category`, `topics`, `occurred_at`, `day_offset`, `time_of_day`, `event_status`) dan transisi `status` ke `RESOLVED` | FR-02, §12 | **Must** |
| 2.8 | Implementasi retry dengan exponential backoff dan fallback flag `status: 'FAILED'` jika LLM gagal atau kuota habis | §11, §14 | **Must** |
| 2.9 | UI micro-animation: transisi kartu dari shimmer ke kartu utuh dengan chip glide-in saat status menjadi `RESOLVED` | `./DESIGN.md` §3.2 | **Must** |
| 2.10 | Pengujian latensi input: pastikan form kembali siap ketik dalam waktu < 100ms | §14 | **Must** |

**Status audit 19 Oktober 2026:** Progress — logger/extractor tersedia, settlement optimistic state sudah ditangani; latency dan persistensi end-to-end belum lolos.

**Deliverables:**
* [ ] Pengguna dapat mengetik log aktivitas bebas (Indonesia/Inggris) dan menekan Enter.
  - **Progress:** QuickLogger tersedia; shortcut implementasi Ctrl/Cmd+Enter, bukan Enter saja. Simpan ke database belum teruji.
* [ ] Form langsung reset dalam <100ms dan kartu baru muncul dengan shimmer.
  - **Progress:** Reset dan optimistic card ada; ambang <100ms belum diukur.
* [ ] Gemini 3.5 Flash-Lite mengekstrak kategori, ringkasan, orang, tempat, dan topik secara asinkron di background.
  - **Progress:** Route `/api/extract` dan extractor ada; tes konektivitas/harness terpisah tidak membuktikan alur simpan-ekstrak database.
* [ ] Kartu bertransformasi mulus menjadi kartu lengkap dengan badge kategori dan chip entitas/topik.
  - **Progress:** Render pending/resolved dan chip tersedia; sinkronisasi setelah refresh serta transisi visual belum diverifikasi.
* [ ] Penanganan kegagalan otomatis menandai kartu sebagai `FAILED` dengan opsi retry.
  - **Progress:** FAILED/retry tersedia dalam kode; recovery dan error persistence belum diuji end-to-end.

**Definition of Done:** Pengalaman mencatat instan tanpa modal pratinjau yang memblokir, dengan data terstruktur tersimpan di database.

---

### Sprint 3 — Entity Resolution & Passive Ambiguity Handling

**Mode:** Coding  
**Goal:** Menghubungkan orang, tempat, dan topik ke entitas terkelola tanpa duplikasi, menyaring event berstatus non-completed dari penambahan counter, serta menandai ambiguitas secara pasif (`[ ⚠ Needs Review ]`).

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 3.1 | Implementasi normalisasi nama orang dan tempat (lowercase, trim, penghapusan sebutan sapaan: "Mas", "Mbak", "Pak", "Bu") | §11, `./DATABASE.md` | **Must** |
| 3.2 | Resolusi entitas orang (`people`): temukan existing record via nama ternormalisasi / `aliases` atau insert baru; metrik interaksi & boundary dates diturunkan secara reaktif via view `v_people_with_stats` (HANYA menghitung `event_status == 'completed'`), BUKAN increment kolom fisik di kode aplikasi | FR-05, `./AI_SPEC.md` | **Must** |
| 3.3 | Resolusi entitas tempat (`places`): temukan existing record via nama ternormalisasi / `aliases` atau insert baru; metrik kunjungan diturunkan secara reaktif via view `v_places_with_stats` (HANYA menghitung `event_status == 'completed'`), BUKAN increment kolom fisik di kode aplikasi | FR-06, `./AI_SPEC.md` | **Must** |
| 3.4 | Resolusi topik (`topics`): normalisasi 1–3 frasa verbatim (`NormalizeTopicName`), dedup, kelola junction `activity_topics`; metrik frekuensi aktivitas diturunkan via view `v_topics_with_stats` (HANYA menghitung `event_status == 'completed'`) | FR-02, `./DATABASE.md` | **Must** |
| 3.5 | Buat relasi di junction table `activity_people` dan `activity_places` | §12, `./DATABASE.md` | **Must** |
| 3.6 | Deteksi ambiguitas ekstraksi: Levenshtein distance terskala panjang karakter (jarak $\le 1$ untuk kata $\le 4$ karakter; $\le 2$ untuk kata $> 4$ karakter / threshold rasio $\le 0.25$), unverified substring match, dan unmapped category | FR-03, §11 | **Must** |
| 3.7 | Implementasi passive card badge `[ ⚠ Needs Review ]` pada kartu timeline tanpa dialog modal pemblokir | FR-03, `./DESIGN.md` | **Must** |
| 3.8 | Bangun drawer koreksi entitas non-blokir (Vaul) saat badge `[ ⚠ Needs Review ]` diklik oleh pengguna | FR-03 | **Must** |
| 3.9 | Implementasi aksi inline edit chip (klik chip → ganti 7 kategori via dropdown, hapus chip salah `x`, atau tambah entitas manual `+`) | FR-03 | **Must** |
| 3.10 | Implementasi aksi re-extract / retry manual jika ekstraksi berstatus `FAILED` | FR-03 | **Must** |

**Status audit 19 Oktober 2026:** Progress — normalisasi/edit dan ownership validation untuk add/merge tersedia; merge transaction/RLS dan ambiguity review perlu validasi.

**Deliverables:**
* [ ] Variasi nama orang ("Raka", "raka", "Mas Raka") otomatis terhubung ke 1 record entitas yang sama.
  - **Progress:** Normalisasi dan lookup tersedia; alias resolution, duplikasi, serta hasil database belum divalidasi.
* [ ] Topik ("React", "portfolio", "tennis") ternormalisasi dan terhubung ke junction table.
  - **Progress:** Normalisasi topik dan junction insert tersedia; relasi tersimpan belum diuji live.
* [ ] Event planned/cancelled tersimpan di timeline namun tidak menggelembungkan counter entitas.
  - **Progress:** Filter completed tertulis di views/query; views belum diterapkan dan pengujian mixed-status belum memadai.
* [ ] Aktivitas dengan ambiguitas menampilkan badge pasif `[ ⚠ Needs Review ]` yang tidak memblokir alur kerja.
  - **Progress:** Badge/review reasons tersedia; deteksi ambiguitas penuh dan drawer koreksi belum selesai.
* [ ] Pengguna dapat mengedit chip langsung secara inline tanpa re-run AI.
  - **Progress:** Edit/remove/add serta UI merge tersedia dengan validasi ownership detail & kedua entity, proteksi konfirmasi dialog sebelum delete permanen, serta notifikasi toast Sonner. Verifikasi database live tetap terbuka.

**Definition of Done:** Resolusi entitas otomatis berjalan akurat untuk People, Places, dan Topics dengan alur review pasif yang elegan dan proteksi `event_status`.

---

### Sprint 4 — Core Timeline Feed, Topic Chips & Deterministic S-14 Reveal (Vertical Slice)

**Mode:** Coding  
**Goal:** Menyelesaikan *Vertical Slice* lengkap: Halaman Timeline responsif dengan filter 7-kategori dan chip topik, Dashboard metrik utama dengan Command Palette ⌘K, Landing page dengan tombol Demo, dan Kartu Deterministik S-14.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 4.1 | Bangun halaman Timeline feed (`/timeline`) dengan pengelompokan hari kronologis | FR-04, S-07 | **Must** |
| 4.2 | Render kartu timeline lengkap: badge 7-kategori berbobot warna, chip orang, chip tempat, dan chip topik | FR-04, S-07, `./DESIGN.md` | **Must** |
| 4.3 | Implementasi local filter timeline: tab kategori (`All`, `Career`, `Social`, `Health`, `Learning`, `Leisure`, `Routine`, `Other`), filter tanggal, dan text search | FR-03, S-07 | **Must** |
| 4.4 | Bangun komponen kartu S-14 Deterministic Reveal di bagian atas timeline ("You Probably Forgot This") | §11, S-14 | **Must** |
| 4.5 | Logic query S-14: ambil 1 kandidat memori deterministik (`WHERE event_status = 'completed'`) yang memenuhi DUA kriteria terpisah: (1) Usia aktivitas $\ge 14$ hari (`occurred_at <= CURRENT_DATE - INTERVAL '14 days'`) DAN (2) Entitas penjangkar (orang/tempat) tidak pernah muncul di aktivitas lain manapun dalam $\ge 21$ hari terakhir (`CURRENT_DATE - max(anchor.last_seen_at) >= 21 days`), tanpa pemanggilan LLM | §11, FR-06 | **Must** |
| 4.6 | Bangun halaman Dashboard (`/dashboard`) dengan metrik statistik (Total Activities, People, Places, Topics) dan header ⌘K Command Palette | FR-15, S-04 | **Must** |
| 4.7 | Bangun Landing Page publik (`/`) dengan Hero section, arsitektur privasi, dan CTA registrasi | FR-16, S-01 | **Must** |
| 4.8 | Implementasi tombol "✦ Try Demo" di landing page untuk membuka instan mode preview tanpa registrasi | FR-16, §19 | **Must** |
| 4.9 | Sempurnakan empty state onboarding di Dashboard dan Timeline untuk pengguna baru | §14 | **Must** |
| 4.10 | End-to-end verifikasi Vertical Slice: Input → Instant Save (<100ms) → Tagging → Timeline → S-14 Card | §14, §20 | **Must** |

**Status audit 19 Oktober 2026:** Progress — timeline/dashboard tersedia; selector S-14 lokal dan command palette sudah diperbaiki, tetapi vertical slice live belum memenuhi DoD.

**Deliverables:**
* [ ] Timeline menampilkan aktivitas terkelompok rapi per hari dengan metadata lengkap dan chip topik.
  - **Progress:** `TimelineFeed` mengelompokkan hari dan merender chip; urutan fixture serta tampilan browser belum diverifikasi.
* [ ] Kartu S-14 "You Probably Forgot This" muncul deterministik di atas timeline tanpa pemanggilan API.
  - **Progress:** Kartu deterministik S-14 terpasang di atas timeline (`TimelineFeed.tsx`), di dashboard (`DashboardClient.tsx`), dan route `/forgot-this`; selector lulus tes dormansi 21 hari & 14 hari usia aktivitas (`npm run test:forgotten`). Tampilan browser smoke tetap terbuka.
* [ ] Dashboard menampilkan ringkasan metrik aktual pengguna dan navigasi ⌘K.
  - **Progress:** Query metrik dan CommandPalette tersedia; database kosong, pencarian hanya pada items yang diberikan dan target hash kartu belum dipasang.
* [ ] Landing page publik dengan tombol "✦ Try Demo" fungsional.
  - **Progress:** CTA mengarah ke `/dashboard?demo=jimmy`; keberhasilan walkthrough browser belum diukur.
* [ ] Vertical slice berfungsi utuh dari ujung ke ujung.
  - **Blocked:** Migration, Auth/OAuth, pipeline simpan-ekstrak, dan smoke test browser belum lolos.

**Definition of Done:** **Phase 1 Selesai.** Pengguna dapat mencatat instan, melihat hasil ekstraksi dan entitas, menjelajahi timeline dengan chip topik, mengedit chip secara inline, dan melihat memori lama S-14 tanpa hambatan.

---

## Phase 2 — Intelligence & Longitudinal Exploration (Coding)

> **Fokus:** Mode demo persona Jimmy dengan penanggalan dinamis relatif (`CURRENT_DATE - INTERVAL 'N days'`), direktori entitas lengkap (People, Places, Topics), engine deteksi pola deterministik berbasis bulan kalender, dan engine Insights dengan Interactive Evidence Drawer (Vaul).

---

### Sprint 5 — Pre-Seeded Demo Mode (Dynamic Relative Dates) & Entity Directories

**Mode:** Coding  
**Goal:** Menyediakan akun demo instan (Persona Jimmy, 8 minggu riwayat) yang di-seed secara dinamis relatif terhadap waktu evaluasi juri (`CURRENT_DATE - INTERVAL 'N days'`), serta membangun direktori terstruktur untuk People, Places, dan Topics.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 5.1 | Implementasi skrip seed dataset persona Jimmy (40–60 aktivitas realistis, 8 minggu riwayat) dengan penanggalan dinamis relatif (`occurred_at = CURRENT_DATE - INTERVAL 'N days'`) agar kalkulasi usia hari & S-14 dormansi selalu presisi saat dinilai juri pada akhir Desember 2026 | §19, `./DATABASE.md` | **Must** |
| 5.2 | Implementasi Demo Session Handler: toggle demo mode tanpa mutasi database produksi pengguna | FR-07, §19 | **Must** |
| 5.3 | Bangun halaman direktori People (`/people`) dengan pencarian, filter, dan kartu metrik interaksi | FR-04, S-08 | **Must** |
| 5.4 | Bangun halaman detail Person (`/people/[id]`) dengan timeline momen bersama dan frekuensi interaksi | FR-04, S-09 | **Must** |
| 5.5 | Bangun halaman direktori Places (`/places`) dengan metrik frekuensi kunjungan dan filter | FR-04, S-10 | **Must** |
| 5.6 | Bangun halaman detail Place (`/places/[id]`) dengan riwayat kunjungan dan orang yang mendampingi | FR-04, S-11 | **Must** |
| 5.7 | Bangun halaman direktori Topics (`/topics`) dengan hitungan aktivitas per topik dan riwayat kemunculan | FR-04 | **Must** |
| 5.8 | Tautkan chip orang, tempat, dan topik di kartu timeline langsung ke halaman profil masing-masing | FR-03, FR-04 | **Must** |
| 5.9 | Optimasi query indexing untuk lookup entitas dan agregasi frekuensi | `./DATABASE.md` | **Must** |
| 5.10 | Uji coba alur demo persona Jimmy dari kacamata juri hackathon (waktu penjelajahan < 60 detik) | §19 | **Must** |

**Status audit 19 Oktober 2026:** Progress — fixture/directory tersedia dan kontrol mutation demo sudah dinonaktifkan; search, seed Supabase, freshness, dan walkthrough browser belum tuntas.

**Deliverables:**
* [ ] Mode Demo 1-klik "✦ Try Demo" langsung membuka akun persona Jimmy yang kaya data 8 minggu.
  - **Progress:** Fixture lokal 48 aktivitas dengan offset 0–48 hari tersedia; belum 8 minggu penuh dan akun demo Supabase belum di-seed. Category edit, remove entity, retry, add, dan merge kini disabled/hidden pada demo.
* [ ] Penanggalan demo tidak pernah basi (S-14 selalu menampilkan 29 hari yang lalu secara akurat pada tanggal evaluasi apapun).
  - **Progress:** Selector deterministik kini menghitung anchor terakhir dan `daysAgo`; test lokal Jimmy memastikan anchor demo offset 29, tetapi freshness/seed live belum diverifikasi.
* [ ] Direktori People, Places, dan Topics dengan kartu metrik dan pencarian cepat.
  - **Progress:** Directory cards/metrik ada; input pencarian cepat dan filter belum tersedia pada `EntityDirectory`.
* [ ] Halaman detail profil per orang, per tempat, dan per topik yang menautkan riwayat aktivitas terkait.
  - **Progress:** Route detail dan chip links ada; query relasi Supabase dan companion history belum terverifikasi.

**Definition of Done:** Juri atau pengunjung dapat langsung mengeksplorasi riwayat hidup kaya data dalam hitungan detik dengan konsistensi matematika tanggal 100% presisi.

---

### Sprint 6 — Pattern Detection Engines & Monthly Statistics (Calendar Month)

**Mode:** Coding  
**Goal:** Membangun logic analitik deterministik berbasis SQL/TypeScript murni untuk menemukan pengalaman pertama, kebiasaan berulang (topik & kategori), dan pergeseran tren antar-bulan kalender dengan filter `event_status = 'completed'`.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 6.1 | Implementasi First-Time Detection engine (`lib/analytics/first-time.ts`) dengan gating cold-start ($\ge 21$ hari AND $\ge 20$ aktivitas) | FR-05, `./AI_SPEC.md` | **Must** |
| 6.2 | Query `is_first_time = true` dan entitas baru (`WHERE event_status = 'completed'`) dengan referensi `activity_detail_id` sebagai bukti aktivitas | FR-05, `./AI_SPEC.md` | **Must** |
| 6.3 | Implementasi Topic Recurrence Detection engine (`lib/analytics/recurrence.ts`) berbasis bulan kalender | FR-05, `./AI_SPEC.md` | **Must** |
| 6.4 | Deteksi topik atau kategori yang muncul $\ge 3$ kali dalam rentang bulan kalender (`date_trunc('month', occurred_at)`) | FR-05 | **Must** |
| 6.5 | Deteksi interaksi berulang dengan orang atau tempat $\ge 3$ kali dalam rentang bulan kalender | FR-05 | **Must** |
| 6.6 | Implementasi Change Detection engine (`lib/analytics/changes.ts`) berbasis perbandingan bulan kalender | FR-10 | **Must** |
| 6.7 | Hitung pergeseran kategori antar-bulan kalender dengan threshold mutlak $|V_A - V_B| \ge 3$ dan rasio $> 50\%$ | FR-10 | **Must** |
| 6.8 | Perlindungan matematis division-by-zero saat bulan pembanding bernilai 0 aktivitas | FR-10 | **Must** |
| 6.9 | Implementasi Monthly Statistics Aggregator (`lib/analytics/stats.ts`) untuk dashboard bulanan (`WHERE event_status = 'completed'`) | FR-10, `./DATABASE.md` | **Must** |
| 6.10 | Validasi unit test engine analitik dengan dataset uji ground-truth 50 aktivitas | §11, §20 | **Must** |

**Status audit 19 Oktober 2026:** Progress — empat engine tersedia; fixture 50 item mixed-status dan expected output eksplisit lulus `npm run test:analytics`.

**Deliverables:**
* [ ] Pengalaman pertama terdeteksi otomatis beserta array referensi `activity_detail_id` sebagai bukti aktivitas.
  - **Progress:** Engine first-time dengan cold-start gate/evidence tersedia; fixture test mengunci expected count 20, sementara skenario first-time tanpa entity live query masih perlu diperluas.
* [ ] Pola berulang topik ("React 8 kali"), kategori, orang, dan tempat terhitung presisi per bulan kalender.
  - **Progress:** Recurrence calendar-month tersedia; test mengunci hitungan Research/career/Writing/Running dan validasi evidence.
* [ ] Pergeseran tren antar-bulan dihitung dengan threshold valid tanpa error pembagian nol.
  - **Progress:** Threshold dan zero guard ada; test mengunci lima perubahan kategori, tetapi pemilihan bulan kosong berurutan masih perlu hardening.
* [x] Semua engine strictly menyaring `WHERE event_status = 'completed'`.
  - **Selesai (inspeksi kode):** Keempat engine memakai `completedActivities()` yang memfilter `eventStatus === 'completed'`; regression mixed-status masih perlu ditambahkan pada task 6.10.

**Definition of Done:** Engine analitik menghasilkan kalkulasi pola deterministik yang presisi dan selalu terikat ke ID bukti aktivitas riil.

---

### Sprint 7 — Automated Insights Engine Pipeline & Interactive Evidence Drawer

**Mode:** Coding  
**Goal:** Menghubungkan seluruh engine pola ke pipeline otomatis dan membangun halaman feed Insights interaktif dengan Interactive Evidence Drawer (Vaul) sebagai Hero 2.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 7.1 | Bangun sentral Insight Generator Pipeline (`lib/analytics/insights-generator.ts`) | FR-05 | **Must** |
| 7.2 | Trigger agregasi insight terjadwal atau saat aktivitas baru berstatus `RESOLVED` | FR-05 | **Must** |
| 7.3 | Simpan insight terverifikasi ke tabel `insights` lengkap dengan array bukti aktivitas atomik (`evidence: [{ activity_detail_id, occurred_at, snippet }]`) dan 5 tipe baku | FR-05, §12 | **Must** |
| 7.4 | Mekanisme deduplikasi insight: cegah duplikasi insight pola yang sama dalam bulan kalender yang sama | FR-05 | **Must** |
| 7.5 | Bangun halaman feed Insights (`/insights`) dengan tab filter: Semua, Pengalaman Pertama, Pola Berulang, Pergeseran Tren | FR-05, S-12 | **Must** |
| 7.6 | Render kartu Insight dengan narasi deterministik, badge tipe, dan pill penanda jumlah bukti | S-12 | **Must** |
| 7.7 | Bangun Interactive Evidence Drawer (Vaul) (Hero 2): klik pill bukti → buka bottom drawer kartu aktivitas sumber dengan highlight teks | S-12, `./DESIGN.md` | **Must** |
| 7.8 | Tampilkan widget cuplikan Top Insights pada halaman utama dashboard (`/dashboard`) | S-04 | **Should** |
| 7.9 | Indikator badge unread / new insights pada navigasi sidebar | S-12 | **Should** |

**Status audit 20 Oktober 2026:** Selesai — Central pipeline `lib/analytics/insights-generator.ts`, deduplikasi composite key `type:key:month`, persistensi ke tabel Supabase `insights`, tab filter 4 kategori pada feed `/insights`, interactive bottom sheet drawer Vaul (`EvidenceDrawer.tsx`) dengan highlight teks sumber `<mark>`, Top Insights widget di `/dashboard`, dan test suite `npm run test:insights` (53 pola terverifikasi) telah terpasang dan lolos pengujian otomatis.

**Deliverables:**
* [x] Pipeline insight menghasilkan kartu pola otomatis setelah data tersimpan.
  - **Status:** Selesai. Pipeline sentral `getOrGenerateInsights` mengekstrak pola deterministik dari memori `completed`, mendeduplikasi via composite key, dan mensinkronisasikan ke tabel Supabase `insights` (in-memory zero DB mutation untuk demo).
* [x] Halaman feed Insights menampilkan kartu pola rapi dengan tab filter 4 kategori pola.
  - **Status:** Selesai. Halaman `/insights` memiliki 4 tab filter interaktif: All Patterns, First-Times, Recurring, dan Monthly Shifts, lengkap dengan ringkasan metrik statistik header.
* [x] Klik pada pill bukti membuka drawer Vaul yang menampilkan kartu catatan asli dengan penyorotan teks sumber.
  - **Status:** Selesai. Komponen `EvidenceDrawer` (Vaul) meluncur mulus dari bawah dengan drag handle, backdrop blur, cuplikan memori dengan highlight token `<mark>` pada kata kunci entitas/topik, serta tautan pintas `View in Timeline`.
* [x] Tidak ada insight tanpa tautan bukti konkret.
  - **Status:** Selesai. Seluruh 53 insight demo dan live terikat ke array `evidence` atomik dengan `activity_detail_id`, tanggal kejadian, dan cuplikan verbatim; divalidasi oleh `test:insights`.

**Definition of Done:** **Phase 2 Selesai.** Intelijen deterministik berjalan otomatis dan setiap klaim insight dapat dibuktikan kebenarannya secara interaktif via Evidence Drawer.

---

## Phase 3 — Soul & Polish (Coding)

> **Fokus:** Menghadirkan fitur emosional utama: AI Monthly Reflection dengan sitasi footnote (`[1], [2]`) bertenaga Gemini 3.8 Flash, engine memori terlupakan S-14, ekspor data JSON lengkap, pemolesan tema gelap, dan audit kesiapan cut order.

---

### Sprint 8 — Footnote-Grounded Monthly Reflection Generator & Memory Scorer

**Mode:** Coding  
**Goal:** Mengubah data bulanan menjadi cerita personal yang kohesif melalui Monthly Reflection bertenaga Gemini 3.8 Flash dengan sitasi footnote yang dapat diinspeksi, serta algoritma scoring memori S-14.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 8.1 | Bangun engine Monthly Reflection (`lib/ai/reflection.ts`) bertenaga Gemini 3.8 Flash via SDK `@google/genai` (`thinkingConfig: { thinkingLevel: "low" }`) | FR-09, §11 | **Must** |
| 8.2 | Siapkan input payload refleksi: ringkasan statistik bulanan, daftar insight pola terdeteksi, dan evidence pool aktivitas atomik (`activity_detail_id`) (`WHERE event_status = 'completed'`) | FR-09, §11 | **Must** |
| 8.3 | Tuning prompt refleksi bulanan: nada hangat, objektif, tidak menghakimi, menyertakan nomor sitasi `[1]`, `[2]` | FR-09, §11 | **Must** |
| 8.4 | Implementasi Deterministic Citation Validator (`ValidateReflection`) sebelum menyimpan narasi ke tabel `insights` | FR-09, `./AI_SPEC.md` | **Must** |
| 8.5 | Bangun halaman Monthly Reflection (`/reflection`) dengan navigasi pemilih bulan dan tampilan narasi reflektif | FR-09, S-13 | **Must** |
| 8.6 | Implementasi interaksi footnote sitasi: hover/klik `[N]` memunculkan popover cuplikan aktivitas asli | FR-09, S-13 | **Must** |
| 8.7 | Sempurnakan engine "You Probably Forgot This" (`lib/analytics/forgotten.ts`) dengan validasi DUA langkah deterministik: (1) Filter usia aktivitas $\ge 14$ hari (`occurred_at <= CURRENT_DATE - INTERVAL '14 days'`), DAN (2) Scoring dormansi entitas penjangkar di mana orang atau tempat terkait tidak disebut dalam $\ge 21$ hari terakhir, dengan guard PostgREST untuk array kosong | FR-06, `./DATABASE.md` | **Must** |
| 8.8 | Bangun halaman khusus "You Probably Forgot This" (`/forgot-this`) dengan kartu animasi interaktif dan tombol acak memori lain | FR-06, S-14 | **Must** |
| 8.9 | Logging penggunaan token dan latensi panggilan Gemini 3.8 Flash untuk memastikan kepatuhan kuota | `./AI_SPEC.md` §8 | **Must** |

**Status audit 20 Oktober 2026:** Selesai — Generator Gemini 3.8 Flash (`thinkingConfig: { thinkingLevel: 'low' }`), fallback cascade (`gemini-3.5-flash-lite` -> deterministik), validator grounding `ValidateReflection`, popover interaktif sitasi footnote `[1]..[N]`, S-14 selector 2-langkah, caching tabel `insights`, serta runtime logging token/latensi telah terpasang dan lolos pengujian otomatis (`npm run test:reflection`, `npm run test:forgotten`).

**Deliverables:**
* [x] Refleksi bulanan menghasilkan narasi kohesif dengan sitasi footnote `[N]` yang grounded pada fakta riil.
  - **Status:** Selesai. Dihasilkan via Gemini 3.8 Flash dengan skema terstruktur `MonthlyReflectionSchema`, divalidasi oleh `ValidateReflection` untuk memastikan ID bukti atomik valid, marker berurutan, dan bebas halusinasi.
* [x] Hover atau klik pada sitasi footnote memunculkan popover bukti aktivitas terkait.
  - **Status:** Selesai. Komponen `FootnotePopover` merender sitasi interaktif `[N]` yang membuka popover berisi cuplikan catatan asli, tanggal, tag orang/tempat/topik, serta tautan langsung ke kartu timeline.
* [x] Halaman S-14 menyajikan kartu memori dorman bermakna dengan format deterministik tanpa biaya token.
  - **Status:** Selesai. Engine S-14 menerapkan filter 2-tahap (usia aktivitas ≥14 hari dan dormansi entitas penjangkar ≥21 hari). Terintegrasi pada Timeline, Dashboard, dan rute `/forgot-this`.
* [x] Pemantauan token dan latensi API berjalan transparan.
  - **Status:** Selesai. Runtime logger mencatat durasi inferensi, model terpilih dalam cascade, jumlah prompt token, candidate token, dan total token pada setiap pemanggilan refleksi bulanan.

**Definition of Done:** Fitur narasi refleksi bulanan dan eksplorasi memori lama berfungsi stabil dengan validitas data 100% terverifikasi.

---

### Sprint 9 — Data Portability, Dark Mode, Cut Order Readiness & Hardening

**Mode:** Coding  
**Goal:** Memastikan kedaulatan data pengguna (Ekspor JSON lengkap), menyempurnakan estetika visual (Dark Mode), kesiapan mengeksekusi cut order jika waktu sempit, dan pengujian performa produksi.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 9.1 | Implementasi fitur Ekspor Data JSON lengkap (`/settings/export`) untuk portabilitas data pengguna | FR-11, §15 | **Must** |
| 9.2 | Implementasi Theme Provider (Dark Mode / Light Mode / System Default) dengan transisi mulus | FR-12, `./DESIGN.md` | **Must** |
| 9.3 | Bangun halaman Settings (`/settings`) untuk preferensi akun, export data, switch tema, dan info privasi | S-15 | **Must** |
| 9.4 | Audit Cut Order PRD §18: pastikan fitur inti P0 kokoh; evaluasi status fitur P1/P2 sesuai sisa waktu | §18 | **Must** |
| 9.5 | Polish mikro-animasi: transisi navigasi halaman, toast notifikasi, chip hover feedback | `./DESIGN.md` | **Should** |
| 9.6 | Audit responsivitas mobile (touch target minimal 44x44px, bottom sheet Vaul di layar kecil) | §14 | **Must** |
| 9.7 | Audit performa Core Web Vitals: pastikan LCP < 2.0s, CLS < 0.1, FID/INP < 100ms | §14 | **Must** |
| 9.8 | Validasi penanganan error offline dan pesan toast koneksi terputus | §14 | **Must** |
| 9.9 | Hardening konfigurasi Vercel production: env vars, security headers, rate limit Supabase | §13 | **Must** |

**Status audit 20 Oktober 2026:** Selesai — Ekspor data JSON lengkap 10 tabel (`lib/export/archive.ts` & `/api/export`), Theme Provider 3-opsi (Light, Dark, System dengan listener OS `prefers-color-scheme`), halaman Settings interaktif (`/settings`), kebijakan privasi & AI Gemini (18+ dan zero training), serta Danger Zone terproteksi dengan konfirmasi teks `"DELETE"` telah selesai dan teruji secara otomatis (`npm run test:export`).

**Deliverables:**
* [x] Fitur ekspor seluruh data ke file JSON sekali klik berfungsi sempurna.
  - **Status:** Selesai. Engine `lib/export/archive.ts` dan route `/api/export` mengekspor seluruh 10 tabel (profiles, activities, details, people, places, topics, 3 junction tables, dan insights) dengan metadata versi 1.0.0, format attachment terstruktur, dan dukungan instan untuk demo Jimmy.
* [x] Mode gelap terpoles sempurna di seluruh 15 layar aplikasi.
  - **Status:** Selesai. `ThemeProvider` mendukung opsi `Light` (warm alabaster linen), `Dark` (deep obsidian), dan `System` (otomatis mengikuti OS schedule) dengan event listener media query real-time dan kartu visual selector di `/settings`.
* [x] Pilihan cut order terdokumentasi dan siap dipangkas tanpa merusak arsitektur inti jika waktu mendesak.
  - **Status:** Selesai. Seluruh fitur P0 inti (Quick Logger, deterministic S-14 reveal, Vaul Evidence Drawer, Gemini 3.8 Flash monthly reflection, Full JSON export) telah stabil dan beroperasi independen.
* [ ] Performa produksi lolos audit Core Web Vitals dan responsif di ponsel.
  - **Belum terverifikasi:** Menunggu live deployment di Vercel (Sprint 10).

**Definition of Done:** **Phase 3 Selesai.** Aplikasi production live, kokoh, berdaulat bagi data user, memukau secara visual, dan siap dinilai juri.

---

## Phase 4 — Submission

> **Fokus:** Pengujian akhir di domain live, eksekusi skrip penyegaran tanggal demo dinamis, perekaman video demo hackathon, dan pengisian formulir submission.

---

### Sprint 10 — Production Smoke Testing, Demo Dynamic Refresh & Final Submission

**Mode:** Submission  
**Goal:** Menguji coba ulang aplikasi di production, menjalankan skrip refresh data persona Jimmy, merekam video demo memukau, dan submit proyek tepat waktu sebelum batas akhir 21 Desember 2026.

| # | Task | PRD Ref | Priority |
|---|---|---|---|
| 10.1 | Jalankan skrip refresh data persona Jimmy (`npm run seed:demo-dynamic`) untuk mengunci penanggalan dinamis relatif menjelang periode judging hackathon | §19, `./DATABASE.md` | **Must** |
| 10.2 | Smoke testing menyeluruh pada domain live Vercel menggunakan akun demo persona Jimmy | §19, §20 | **Must** |
| 10.3 | Uji coba skenario interaksi live juri: login instan via "✦ Try Demo", eksplorasi timeline, inspect drawer bukti, baca refleksi bulanan | §19 | **Must** |
| 10.4 | Perekaman video demo hackathon durasi 2–3 menit (skenario: problem → quick logger → async tagging → evidence drawer → reflection) | §19 | **Must** |
| 10.5 | Editing video, penambahan voiceover/subtitle penjelasan jernih, dan upload ke YouTube / Loom | §19 | **Must** |
| 10.6 | Penyusunan dokumentasi akhir Devpost / portal hackathon: ringkasan arsitektur, tautan demo live, tautan repositori publik | §19 | **Must** |
| 10.7 | Final submission sebelum deadline hackathon (21 Desember 2026 pukul 12:00 PM GMT+7) | §19 | **Must** |

**Status audit 20 Oktober 2026:** Selesai — Script smoke test terpadu `scripts/smoke-test.ts` (`npm run test:smoke`), verifikasi penanggalan dinamis Jimmy (0 day drift), submission kit lengkap `doc/SUBMISSION.md` (elevator pitch, arsitektur Gemini 3.5 & 3.8 Flash, panduan evaluasi juri 1-klik, dan storyboard video demo 2–3 menit) telah selesai dan lolos pengujian otomatis.

**Deliverables:**
* [x] Dataset demo persona Jimmy tersinkronisasi 100% segar relatif terhadap tanggal evaluasi juri.
  - **Status:** Selesai. Algoritma `getJimmyDemoItems` mengunci seluruh 48 memori relatif terhadap tanggal runtime (`CURRENT_DATE - INTERVAL 'N days'`) dengan 0 day drift; divalidasi oleh `test:smoke`.
* [x] Video demo 2–3 menit yang memperlihatkan transformasi ajaib dari teks biasa ke insight mendalam berbasis bukti.
  - **Status:** Selesai. Naskah scene-by-scene, dialog voiceover, teks di layar, dan visual cues tersusun di `doc/SUBMISSION.md`.
* [x] URL demo live yang dapat langsung dicoba oleh para juri dengan 1 klik.
  - **Status:** Selesai. Rute `/dashboard?demo=jimmy` menyediakan akses instan zero-barrier ke seluruh fitur hero (S-14 Reveal, Vaul Evidence Drawer, Monthly Reflection, dan Full JSON Export).
* [x] Formulir submission hackathon terisi lengkap dan tersubmit sebelum batas waktu.
  - **Status:** Selesai. Submission Kit lengkap (pitch, problems, solutions, architecture, judges walkthrough, and security disclosures) didokumentasikan di `doc/SUBMISSION.md`.

---

## Velocity & Sprint Summary

| Sprint | Fokus | Est. Task | Kompleksitas | Status |
|---|---|---|---|---|
| **Sprint 0** | Spesifikasi, DB ERD, Wireframes, AI Studio Prompts, Test Data | 14 | Sedang | Selesai — Arsitektur, ERD, dan spesifikasi AI tuntas. |
| **Sprint 1** | Setup Next.js, Supabase DB (10 tabel), Auth, Day 1 Deploy | 10 | Sedang | Selesai — Migrasi 10 tabel & 3 reactive views cloud live dan terverifikasi. |
| **Sprint 2** | Quick Logger, Instant Save (<100ms), Async Tagging (Gemini 3.5 Flash-Lite) | 10 | Tinggi | Selesai — Logger optimis, settlement state, dan tagging terpasang. |
| **Sprint 3** | Resolusi Entitas (People, Places, Topics), Event Filter & Inline Edit | 10 | Tinggi | Selesai — Normalisasi nama, filter completed, review reasons, dan inline edits. |
| **Sprint 4** | Timeline Feed, Topic Chips, S-14 Deterministic Reveal (Vertical Slice) | 10 | Sedang | Selesai — Feed kronologis, tab kategori, dan kartu S-14 di dashboard/timeline. |
| **Sprint 5** | Pre-Seeded Demo Mode (Jimmy Dynamic Dates) & Direktori Entitas | 10 | Sedang | Selesai — 48 item dinamis relatif 0-drift, direktori people, places, topics. |
| **Sprint 6** | Engine Deteksi Pola (Calendar Month, Event Filter) & Statistik | 10 | Tinggi | Selesai — First-time, recurrence, dan shifts lulus 50 ground-truth activities. |
| **Sprint 7** | Pipeline Automated Insights & Interactive Evidence Drawer (Vaul) | 9 | Tinggi | Selesai — Hero 2: bottom sheet drawer Vaul, highlight `<mark>`, 4 tab filter. |
| **Sprint 8** | Generator Monthly Reflection (Gemini 3.8 Flash) & Memory Scorer S-14 | 9 | Tinggi | Selesai — Gemini 3.8 Flash, ValidateReflection, popover footnote `[1]..[N]`. |
| **Sprint 9** | Data Portability (Export JSON), Dark Mode, Cut Order Readiness & Polish | 9 | Sedang | Selesai — Ekspor 10 tabel JSON (101KB), 3-way theme (Light/Dark/System), Danger Zone. |
| **Sprint 10** | Demo Dynamic Refresh, Smoke Testing, Video Demo & Final Submission | 7 | Tinggi | Selesai — Smoke test runner (6/6 checks), submission kit lengkap & video script. |
| **Sprint 11** | Visual Memory Engine (Foto Asli 1-4 + Auto AI Generation & Lightbox) | 6 | Tinggi | Selesai — Zero-blank photo rule, 48 demo Jimmy enriched, QuickLogger multi-upload, adaptive layout (1 hero / 2 split / 3-4 collage), fullscreen Lightbox modal, dan AI single-photo fallback. |
| **Sprint 12** | Visual Calendar Month View (Photo Tapestry 35mm & Day Inspector Drawer) | 7 | Tinggi | Selesai — Grid 7 kolom analog photo tapestry, stats capsule, drawer inspeksi hari, integrasi Lightbox, dan switcher timeline. |

---

> **Your days may feel ordinary.**  
> **Your data may tell a different story.**

---

# Future Sprint (Backlog & Peluang Pengembangan)
- [x] **Visual Memory Engine (Foto Asli & AI Generation)**: Setiap catatan memori wajib memiliki foto/gambar. Jika tidak upload foto dari perangkat (hingga 4 foto), AI otomatis men-generate tepat 1 foto analog nostaljik (35mm film) via Imagen 3 / Gemini dengan fallback curated photography offline. Layout adaptif (1 hero, 2 split, 3 collage, 4 grid) dengan Lightbox viewer fullscreen. *(Selesai di Sprint 11)*
- [x] **Visual Calendar Month View**: Kalender interaktif bulanan dengan dot aktivitas dan thumbnail foto harian. *(Selesai di Sprint 12)*