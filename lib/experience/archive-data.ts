/** Curated fictional entries used only by the landing-page illustration. */
export interface ArchiveEntry {
  id: string;
  date: string;
  time: string;
  text: string;
  people: string[];
  place: string;
  topics: string[];
  first?: {
    title: string;
    caption: string;
    image: string;
    alt: string;
  };
}

export const ARCHIVE_SAMPLE_NOTE =
  "Met Amy at a small café. We talked, shared a slice of cake, and waited for the rain to stop.";

export const ARCHIVE_ENTRIES: ArchiveEntry[] = [
  {
    id: "oct-01-coffee", date: "2026-10-01", time: "09:15",
    text: "Found a quiet corner at the neighborhood café. Brought a book and stayed for a second cup.",
    people: [], place: "Neighborhood café", topics: ["Coffee", "Reading"],
    first: { title: "A new corner of the world.", caption: "The first café visit in this archive.", image: "/images/memory-cafe-corner.jpg", alt: "Coffee and an open notebook on a wooden table beside a café window" },
  },
  { id: "oct-01-reading", date: "2026-10-01", time: "20:30", text: "Read a few pages at home. Left a few thoughts in the margin.", people: [], place: "Home", topics: ["Reading"] },
  { id: "oct-02-library", date: "2026-10-02", time: "14:00", text: "Met Amy at the library. We talked through the ideas from last night.", people: ["Amy"], place: "Library", topics: ["Reading", "Learning"] },
  { id: "oct-03-amy", date: "2026-10-03", time: "18:10", text: ARCHIVE_SAMPLE_NOTE, people: ["Amy"], place: "Neighborhood café", topics: ["Coffee", "Conversation", "Rain"] },
  { id: "oct-03-walk", date: "2026-10-03", time: "19:45", text: "Took the long way through City Park after the rain.", people: [], place: "City Park", topics: ["Walking", "Rain"] },
  { id: "oct-04-office", date: "2026-10-04", time: "11:00", text: "A quiet morning at work. Sketched the first version of a little idea.", people: [], place: "Work", topics: ["Ideas", "Work"] },
  { id: "oct-04-home", date: "2026-10-04", time: "21:00", text: "Cooked dinner at home with the windows open.", people: [], place: "Home", topics: ["Cooking"] },
  { id: "oct-05-coffee", date: "2026-10-05", time: "17:30", text: "Back at the neighborhood café with Amy. Showed her the little idea I had drawn.", people: ["Amy"], place: "Neighborhood café", topics: ["Coffee", "Ideas"] },
  {
    id: "oct-06-park", date: "2026-10-06", time: "08:20",
    text: "First morning walk with Jimmy in City Park. No plan, just another lap.",
    people: ["Jimmy"], place: "City Park", topics: ["Walking"],
    first: { title: "The long way, together.", caption: "The first recorded morning walk with Jimmy.", image: "/images/memory-autumn-park.jpg", alt: "Two wooden chairs beneath an autumn tree in a quiet cobbled square" },
  },
  { id: "oct-06-home", date: "2026-10-06", time: "20:15", text: "Worked on the little project at home. The pieces are beginning to fit.", people: [], place: "Home", topics: ["Ideas", "Making"] },
  { id: "oct-07-coffee", date: "2026-10-07", time: "16:40", text: "Same café, same table. Finished the chapter I started on the first day.", people: [], place: "Neighborhood café", topics: ["Coffee", "Reading"] },
  {
    id: "oct-08-studio", date: "2026-10-08", time: "09:10",
    text: "Opened the finished project at the studio. Sent Amy and Jimmy a message to show them.",
    people: ["Amy", "Jimmy"], place: "Studio", topics: ["Making", "Ideas"],
    first: { title: "An idea becomes a thing.", caption: "The first finished project in these notes.", image: "/images/memory-late-night-desk.jpg", alt: "A laptop, handwritten project notes, and a warm desk lamp" },
  },
];

export const ARCHIVE_SAMPLE_ENTRY = ARCHIVE_ENTRIES[3];
export const ARCHIVE_CAFE_VISITS = ARCHIVE_ENTRIES.filter((entry) => entry.place === "Neighborhood café");
export const ARCHIVE_FIRSTS = ARCHIVE_ENTRIES.filter((entry): entry is ArchiveEntry & { first: NonNullable<ArchiveEntry["first"]> } => Boolean(entry.first));
export const ARCHIVE_STATS = {
  moments: ARCHIVE_ENTRIES.length,
  days: new Set(ARCHIVE_ENTRIES.map((entry) => entry.date)).size,
  places: new Set(ARCHIVE_ENTRIES.map((entry) => entry.place)).size,
  people: new Set(ARCHIVE_ENTRIES.flatMap((entry) => entry.people)).size,
  cafeVisits: ARCHIVE_CAFE_VISITS.length,
  firsts: ARCHIVE_FIRSTS.length,
};

export function archiveDate(date: string, withYear = false) {
  const [year, month, day] = date.split("-");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${day} ${months[Number(month) - 1]}${withYear ? ` ${year}` : ""}`;
}

export const ARCHIVE_PERIOD = `${archiveDate(ARCHIVE_ENTRIES[0].date)} — ${archiveDate(ARCHIVE_ENTRIES[ARCHIVE_ENTRIES.length - 1].date, true)}`;
