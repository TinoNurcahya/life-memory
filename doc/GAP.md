# Analisis GAP Fitur: Life Memory (Curated & Actionable)

Dokumen ini menyajikan audit komparatif terkurasi antara **[Life Memory](file:///d:/PORTFOLIO/life-memory)** terhadap dua proyek portofolio referensi (**[Lunarys v2](file:///D:/PORTFOLIO/lunarysv2)** dan **[Profesia](file:///D:/PORTFOLIO/profesia)**). 

> [!NOTE]
> Fitur-fitur yang tidak relevan dengan identitas Life Memory sebagai *Private Personal Memory Intelligence* (seperti fitur jejaring sosial, leaderboard publik, sistem follow, dan multilingual i18n) **telah dieliminasi** dari dokumen ini agar fokus pada nilai guna produk yang sebenarnya.

---

## 📊 Matriks Fitur Relevan & Status Adopsi

| Dimensi Fitur / Arsitektur | Kategori Urgensi | Status di Life Memory | Sumber Referensi |
| :--- | :--- | :--- | :--- |
| **Toast Feedback (`sonner`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **Error Boundary (`app/error.tsx`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **Instant Loading (`app/loading.tsx`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **Custom 404 (`app/not-found.tsx`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **Dynamic Sitemap (`app/sitemap.ts`)**| 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **Robots Config (`app/robots.ts`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **Dedicated Logger (`lib/logger.ts`)**| 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys & Profesia |
| **HTTP Security Headers** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai di Tahap 1 | Lunarys (`next.config.ts`) |
| **Integrasi AI Extractor (`lib/ai/`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai (`gemini-extractor.ts`) | Profesia (`aiService.ts`) |
| **Input Dashboard Real-Time** | 🟢 **Sangat Perlu (Core)** | ✅ `PENDING` Server Action + async `/api/extract` | Life Memory Core |
| **Visualisasi Data Memori (`recharts`)** | 🟢 **Sangat Perlu (Core)** | ✅ Selesai (`CategoryDistributionChart.tsx`) | Profesia |
| **Ekspor Kartu Polaroid (`html-to-image`)**| 🟢 **Sangat Perlu (Core)** | ✅ Selesai (`PolaroidExportModal.tsx`) | Lunarys v2 |
| **Koneksi Supabase Cloud Database** | 🟢 **Sangat Perlu (Core)** | ⚠️ Perlu run migration SQL di Supabase | Lunarys & Profesia |
| **Typecheck Script (`tsc --noEmit`)** | 🟡 **Opsional / Nanti Saja** | ✅ Selesai di `package.json` | Profesia |
| **CI Quality Gate (`.github/workflows/ci.yml`)** | 🟡 **Opsional / Nanti Saja** | ✅ Selesai dibuat | Profesia |
| **ESLint 9 Flat Config (`eslint.config.mjs`)**| 🟡 **Opsional / Nanti Saja** | ✅ Selesai dimigrasikan | Lunarys & Profesia |
| **Test Runner (Vitest)** | 🟡 **Opsional / Nanti Saja** | ⏳ Belum ada | Lunarys v2 |
| **Halaman `/profile` & `/settings`** | 🟡 **Opsional / Nanti Saja** | ⏳ Belum ada | Lunarys & Profesia |
| **Safe Lifecycle GSAP (`@gsap/react`)** | 🟡 **Opsional / Nanti Saja** | ⏳ Raw GSAP di useEffect | Profesia |
| **Tailwind CSS v4** | 🟡 **Opsional / Nanti Saja** | ⏸️ Ditunda (v3.4 stabil dengan custom tokens) | Lunarys & Profesia |

---

## 1. Fitur Sangat Perlu (Core Value untuk Life Memory)

Fitur-fitur ini selaras langsung dengan proposisi nilai Life Memory: mengarsipkan momen hidup mikro, menjaga privasi data, serta menyajikan refleksi longitudinal yang bermakna.

### 1.1. Fondasi DX & Keandalan (Telah Selesai di Tahap 1)
* **Toast Notification (`sonner`)**: Memberikan konfirmasi visual saat log memori disimpan, disalin, atau saat terjadi kendala jaringan.
* **App Router Boundaries (`error.tsx`, `loading.tsx`, `not-found.tsx`)**: Mencegah layar putih (*blank screen*), menyediakan fallback ramah, dan graceful recovery.
* **Dynamic SEO (`sitemap.ts` & `robots.ts`)**: Membuka rute publik ke mesin pencari sekaligus mengunci seluruh rute privat (`/dashboard`, `/timeline`, `/settings`, `/api/`) dari crawler luar.
* **Structured Logger & Masking (`lib/logger.ts`)**: Menjamin data sensitif (password, token auth, secret) di-mask sebelum dicatat di log.
* **HTTP Security Headers**: Menerapkan HSTS, proteksi anti-clickjacking (`SAMEORIGIN`), dan anti-MIME sniffing.

### 1.2. Visualisasi Tren Memori Bulanan (`recharts`)
* **Inspirasi dari:** Profesia (grafik radar chart & perbandingan dimensi).
* **Kebutuhan di Life Memory:** Menjawab pertanyaan inti PRD: *"Was my month really as uneventful as I thought?"*. Grafik tren waktu (distribusi kategori: Career, Social, Health, Learning, Leisure, Routine) per minggu dan per bulan memberikan pemahaman objektif atas alokasi waktu dan energi pengguna.

### 1.3. Ekspor Kenangan ke Kartu Polaroid (`html-to-image`)
* **Inspirasi dari:** Lunarys v2 (`QuoteImageModal.tsx`).
* **Kebutuhan di Life Memory:** Life Memory mengusung estetika taktil (kertas arsip, cap stempel, foto Polaroid). Dengan `html-to-image`, pengguna dapat mengekspor momen penting menjadi kartu Polaroid atau rangkuman bulanan siap simpan/bagikan secara estetik.

### 1.4. Integrasi Core AI & Database Supabase
* **Kebutuhan di Life Memory:**
  - Mengisi `lib/ai/` dengan extractor Gemini terstruktur untuk membedah teks bebas harian menjadi entitas: kategori, orang, tempat, dan pengalaman pertama (*first-time experiences*).
  - Mengganti mock data statis di `app/dashboard/page.tsx` dengan data nyata dari tabel Supabase.

---

## 2. Fitur Opsional / Nanti Saja (Bagus, tapi Bukan Prioritas Utama)

Fitur-fitur pada kategori ini meningkatkan kualitas teknik dan kebersihan basis kode, namun tidak menghalangi fungsionalitas utama aplikasi:

### 2.1. Typecheck & Script Verifikasi Kode
* **Inspirasi dari:** Profesia (`npm run typecheck: tsc --noEmit`).
* **Pertimbangan:** Sangat ringan dan berguna untuk mendeteksi type mismatch di seluruh file tanpa harus menjalankan compiler build penuh.

### 2.2. Automated CI Quality Gate (`.github/workflows/ci.yml`)
* **Inspirasi dari:** Profesia.
* **Pertimbangan:** Menjamin setiap pull request atau push lolos build dan lint sebelum deploy.

### 2.3. Test Runner Otomatis (Vitest)
* **Inspirasi dari:** Lunarys v2 (`vitest.config.ts`, `__tests__/`).
* **Pertimbangan:** Diprioritaskan untuk menguji ketepatan fungsi parsing AI dan kalkulasi agregasi analitik memori.

### 2.4. Halaman Profil & Pengaturan Akun (`/profile`, `/settings`)
* **Inspirasi dari:** Lunarys v2 & Profesia.
* **Pertimbangan:** Manajemen ganti kata sandi, preferensi tema, dan tombol penghapusan akun atau ekspor JSON arsip memori.

### 2.5. Safe GSAP React Lifecycle (`@gsap/react`)
* **Inspirasi dari:** Profesia.
* **Pertimbangan:** Menggunakan hook `useGSAP` untuk mencegah potensi memory leak pada komponen animasi GSAP saat komponen di-unmount.

### 2.6. Migrasi Tailwind CSS v4 & ESLint Flat Config
* **Inspirasi dari:** Lunarys v2 & Profesia.
* **Pertimbangan:** Life Memory saat ini berjalan stabil di Tailwind v3 dengan puluhan warna custom. Migrasi v4 dapat dilakukan di kemudian hari ketika sistem fitur utama telah selesai.

---

## 3. Utang Teknis & Komponen Tertunda Internal Life Memory

Hal-hal internal yang perlu segera diselesaikan:
1. **Folder Kosong yang Perlu Diisi:**
   - `lib/analytics/` (Kalkulasi agregasi memori per minggu/bulan).
2. **Koneksi Data Nyata di Dashboard:**
   - Dashboard sudah membaca query Supabase melalui `lib/queries/activities.ts`; fixture lokal hanya dipakai untuk preview Jimmy anonim.

---

## 4. Action Roadmap Terkurasi

```mermaid
graph TD
    A[Tahap 1: Fondasi DX & Keandalan] --> B[Tahap 2: AI Extractor & Koneksi Database]
    B --> C[Tahap 3: Visualisasi Recharts & Ekspor Polaroid]
    C --> D[Tahap 4: Quality Gate & Halaman Akun]

    subgraph Tahap 1 (Selesai)
    A1[Sonner Toast]
    A2[error, loading, not-found]
    A3[sitemap.ts & robots.ts]
    A4[lib/logger.ts]
    A5[Security Headers]
    end

    subgraph Tahap 2 (Core AI & Data)
    B1[Implementasi lib/ai Gemini Extractor]
    B2[Koneksi Supabase ke Dashboard Real-time]
    B3[Penyimpanan Entitas People, Places, Topics]
    end

    subgraph Tahap 3 (Visual & Ekspor)
    C1[Grafik Tren Kategori Recharts]
    C2[Ekspor Gambar Polaroid html-to-image]
    end

    subgraph Tahap 4 (DX & Pengaturan)
    D1[Script typecheck & CI Workflow]
    D2[Halaman /settings & /profile]
    end
```
