// Ground truth v2: TC-01..TC-12 match doc/AI_SPEC.md section 9.
// Arrays are exact normalized sets; nested arrays document equivalent topic spellings.
const item = (source_text, category, people = [], places = [], topics = [], extra = {}) => ({
  source_text, category, event_status: "completed", people, places, topics,
  day_offset: 0, time_of_day: "unknown", is_first_time: false, ...extra,
});
const single = (id, text, category, people = [], places = [], topics = [], extra = {}) => ({
  id, sourceText: text, referenceDate: "2026-10-19", expected: [item(text, category, people, places, topics, extra)],
});
const longParts = [
  "This morning I went jogging in Prospect Park. The park was quiet, with soft light between the trees and damp gravel along the path. There was no rush, no finish line, and no special occasion, just a familiar route beside the water on an ordinary Monday morning.",
  "In the afternoon I studied TypeScript at Campus Library. My subject was TypeScript generics, with particular attention to constraints and the relationship between parameter types and return values. The table was near the window, away from the busy entrance and the large group near the stairs.",
  "Later I had dinner with Maya at Warung Bu Kris. The room was warm and the table was beside a wall covered with old photographs. Our dinner was the main social moment of the day, with no celebration, meeting, or other appointment attached to it.",
  "At night I watched a film at home. It was a quiet ending after the earlier exercise, study, and dinner. The film was a familiar one, with a small cast and a gentle pace. There were no visitors or other activities during that part of the evening. These are the four activities from my day, all already completed, without any future plans, cancellations, or claims about first experiences. This note is a factual record of those moments and their locations, with the surrounding details included only as context."
];
const canonical = [
  single("TC-01", "kmrn sore nongkrong sm Raka di kafe dkt stasiun", "social", ["Raka"], [], [], { day_offset: -1, time_of_day: "afternoon" }),
  { id: "TC-02", sourceText: "Shipped the authentication middleware and reviewed 3 PRs with David.", referenceDate: "2026-10-19", expected: [
    item("Shipped the authentication middleware", "career", [], [], [["authentication middleware", "authentication", "middleware"]]),
    item("reviewed 3 PRs with David.", "career", ["David"], [], [["PRs", "pull requests", "code review"]]),
  ] },
  { id: "TC-03", sourceText: "Pagi jogging 5k di GBK, siang coding fitur auth, malem dinner sm Maya", referenceDate: "2026-10-19", expected: [
    item("Pagi jogging 5k di GBK", "health", [], ["GBK"], [], { time_of_day: "morning" }),
    item("siang coding fitur auth", "career", [], [], [["auth", "authentication"]], { time_of_day: "afternoon" }),
    item("malem dinner sm Maya", "social", ["Maya"], [], [], { time_of_day: "night" }),
  ] },
  single("TC-04", "Pertama kali nyobain diving di Pulau Pari", "leisure", [], ["Pulau Pari"], [["diving", "menyelam"]], { is_first_time: true }),
  single("TC-05", "semalem begadang beresin proposal bisnis bareng tim", "career", [], [], [["proposal bisnis", "business proposal"]], { day_offset: -1, time_of_day: "night" }),
  single("TC-06", "makan siang soto ayam di Warung Bu Kris bareng Mas Dimas", "social", ["Dimas"], ["Warung Bu Kris"], [], { time_of_day: "afternoon" }),
  single("TC-07", "Besok sore mau coba lari 10k di GBK bareng anak-anak kantor", "health", [], ["GBK"], [], { day_offset: 1, time_of_day: "afternoon", event_status: "planned" }),
  single("TC-08", "Tadi gak jadi ketemu Raka di Senopati karena mendadak hujan badai", "social", ["Raka"], ["Senopati"], [], { event_status: "cancelled" }),
  single("TC-09", "Dianter Mama belanja bulanan di Superindo", "routine", ["Mama"], ["Superindo"]),
  single("TC-10", "Seharian di kosan ngerjain tugas kuliah", "learning", [], [], []),
  { id: "TC-11", sourceText: "...", referenceDate: "2026-10-19", expected: [] },
  { id: "TC-12", sourceText: longParts.join("\n\n"), referenceDate: "2026-10-19", expected: [
    item("This morning I went jogging in Prospect Park.", "health", [], ["Prospect Park"], [], { time_of_day: "morning" }),
    item("In the afternoon I studied TypeScript at Campus Library.", "learning", [], ["Campus Library"], [["TypeScript", "TypeScript generics"]], { time_of_day: "afternoon" }),
    item("Later I had dinner with Maya at Warung Bu Kris.", "social", ["Maya"], ["Warung Bu Kris"], [], { time_of_day: "evening" }),
    item("At night I watched a film at home.", "leisure", [], [], [], { time_of_day: "night" }),
  ] },
];
const variants = [
  single("V-01", "kemarin ngopi sama Dita di Kopi Kenangan", "social", ["Dita"], ["Kopi Kenangan"], [], { day_offset: -1 }),
  single("V-02", "Meeting client di kantor", "career"),
  single("V-03", "gue lari pagi 5k di GBK", "health", [], ["GBK"], [], { time_of_day: "morning" }),
  single("V-04", "first time nyobain pottery", "leisure", [], [], [["pottery", "keramik"]], { is_first_time: true }),
  single("V-05", "besok rencana baca buku design systems", "learning", [], [], ["design systems"], { day_offset: 1, event_status: "planned" }),
  single("V-06", "appointment dokter dibatalin", "health", [], [], [], { event_status: "cancelled" }),
  single("V-07", "Maya helped me debug the login flow at work", "career", ["Maya"], [], [["login", "login flow", "authentication"]]),
  single("V-08", "met Arif and Nia at Prospect Park", "social", ["Arif", "Nia"], ["Prospect Park"]),
  single("V-09", "belajar psikologi burnout", "learning", [], [], [["burnout", "psikologi burnout"]]),
  single("V-10", "belajar TypeScript generics", "learning", [], [], [["TypeScript", "TypeScript generics"]]),
  single("V-11", "watched a movie at CGV", "leisure", [], ["CGV"]),
  single("V-12", "cleaned the kitchen at home", "routine"),
  single("V-13", "besok mau liburan ke Bandung", "leisure", [], ["Bandung"], [], { day_offset: 1, event_status: "planned" }),
  single("V-14", "didn't go to the gym, cancelled it", "health", [], [], [], { event_status: "cancelled" }),
  single("V-15", "shipped v2 of the API for work", "career", [], [], ["API"]),
  single("V-16", "first time presenting the API at work", "career", [], [], ["API"], { is_first_time: true }),
  single("V-17", "late-night study session for calculus", "learning", [], [], [["calculus", "kalkulus"]], { time_of_day: "night" }),
  single("V-18", "nongkrong sore sama Bima di Taman Suropati", "social", ["Bima"], ["Taman Suropati"], [], { time_of_day: "afternoon" }),
  single("V-19", "besok telepon Mama", "social", ["Mama"], [], [], { day_offset: 1, event_status: "planned" }),
  single("V-20", "batal kontrol gigi hari ini", "health", [], [], [], { event_status: "cancelled" }),
  single("V-21", "fixed a React bug for work", "career", [], [], ["React"]),
  single("V-22", "watched a documentary at home", "leisure"),
  single("V-23", "made nasi goreng at home", "routine"),
  single("V-24", "pertama kali lari di GBK", "health", [], ["GBK"], [], { is_first_time: true }),
  single("V-25", "besok dinner sama Lena", "social", ["Lena"], [], [], { day_offset: 1, event_status: "planned" }),
  single("V-26", "cancelled my holiday to Bali", "leisure", [], ["Bali"], [], { event_status: "cancelled" }),
  single("V-27", "reviewed the API with Kevin for work", "career", ["Kevin"], [], ["API"]),
  single("V-28", "read about cognitive science", "learning", [], [], [["cognitive science", "ilmu kognitif"]]),
  single("V-29", "exercise walk in Prospect Park", "health", [], ["Prospect Park"]),
  single("V-30", "hangout at Kopi Kenangan with Jo", "social", ["Jo"], ["Kopi Kenangan"]),
  single("V-31", "tomorrow I will practice yoga", "health", [], [], ["yoga"], { day_offset: 1, event_status: "planned" }),
  single("V-32", "cancelled yoga because of rain", "health", [], [], ["yoga"], { event_status: "cancelled" }),
  single("V-33", "updated the Figma handoff for work", "career", [], [], ["Figma"]),
  single("V-34", "first time visiting Museum Nasional", "leisure", [], ["Museum Nasional"], [], { is_first_time: true }),
  single("V-35", "kmrn bljr Rust", "learning", [], [], ["Rust"], { day_offset: -1 }),
  single("V-36", "nongkrong sm Rani di Perpustakaan Nasional", "social", ["Rani"], ["Perpustakaan Nasional"]),
  single("V-37", "lusa mau belajar SQL", "learning", [], [], ["SQL"], { day_offset: 2, event_status: "planned" }),
  single("V-38", "belajar SQL dua hari lalu", "learning", [], [], ["SQL"], { day_offset: -2 }),
];
export const REGRESSION_CASES = [...canonical, ...variants];
if (REGRESSION_CASES.length !== 50) throw new Error("Expected exactly 50 regression cases");
