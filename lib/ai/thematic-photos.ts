/**
 * Curated Thematic Photography Library for Life Memory
 * Authentic, warm 35mm analog film aesthetic snapshots (golden hour, soft grain, candid perspective)
 * Used as default visual engine for Jimmy Demo and zero-quota instant fallback for live user entries.
 */

export interface ThematicPhoto {
  url: string;
  alt: string;
  credit: string;
}

// Curated collections mapped by theme keywords
export const THEMATIC_PHOTOS: Record<string, ThematicPhoto[]> = {
  coffee: [
    {
      url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
      alt: "Warm cup of artisan coffee at a sunlit rustic wooden cafe table",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      alt: "Pouring hand drip coffee in cozy morning light",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
      alt: "Espresso and a journal beside a window overlooking a quiet street",
      credit: "Unsplash",
    },
  ],
  coding: [
    {
      url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
      alt: "Late-night laptop coding session with warm desk lamp ambient glow",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      alt: "Working through backend code logic with coffee beside the keyboard",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
      alt: "Screen reflection and code terminal during focused pair programming",
      credit: "Unsplash",
    },
  ],
  nature_walk: [
    {
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      alt: "Golden sunlight filtering through tall autumn trees in a quiet park",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
      alt: "Walking path covered in autumn leaves during morning solitude",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      alt: "Quiet afternoon horizon with warm gentle breeze and calm water",
      credit: "Unsplash",
    },
  ],
  social: [
    {
      url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
      alt: "Friends sharing hearty laughter around a candlelit dining table",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1200&q=80",
      alt: "Deep evening conversation over tea in a warm living room",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
      alt: "Candid group of friends sitting together under golden twilight",
      credit: "Unsplash",
    },
  ],
  reading_library: [
    {
      url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
      alt: "Quiet university library study table lined with hardcover books",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
      alt: "Open book with thoughtful notes scribbled in warm amber lighting",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
      alt: "Sunlight falling across vintage novel pages on a slow Sunday",
      credit: "Unsplash",
    },
  ],
  running_health: [
    {
      url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
      alt: "Morning jog along a mist-covered park loop at sunrise",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80",
      alt: "Running shoes resting on grass after a refreshing outdoor workout",
      credit: "Unsplash",
    },
  ],
  creative_studio: [
    {
      url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
      alt: "Art studio workbench with paintbrushes, notebooks, and dried flowers",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
      alt: "Quiet creative desk with mechanical pencil sketches and paper notebooks",
      credit: "Unsplash",
    },
  ],
  music_culture: [
    {
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      alt: "Acoustic guitar leaning against a sunlit brick wall",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80",
      alt: "Vintage vinyl record spinning on an analog turntable",
      credit: "Unsplash",
    },
  ],
  city_market: [
    {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
      alt: "Strolling through weekend outdoor flea market stalls and curios",
      credit: "Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
      alt: "Twilight streetscape with warm glowing shop windows and wet pavement",
      credit: "Unsplash",
    },
  ],
};

// Simple deterministic hash to consistently select an image for identical text
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic, highly aesthetic 35mm film photograph based on memory content.
 */
export function getThematicPhotoForMemory(summary: string, category: string = "other"): string {
  const text = (summary + " " + category).toLowerCase();

  let pool: ThematicPhoto[];

  if (text.includes("coffee") || text.includes("cafe") || text.includes("ngopi") || text.includes("blank street") || text.includes("latte") || text.includes("breakfast")) {
    pool = THEMATIC_PHOTOS.coffee;
  } else if (text.includes("code") || text.includes("coding") || text.includes("debug") || text.includes("api") || text.includes("backend") || text.includes("rust") || text.includes("capstone") || text.includes("laptop")) {
    pool = THEMATIC_PHOTOS.coding;
  } else if (text.includes("walk") || text.includes("autumn") || text.includes("park") || text.includes("prospect") || text.includes("nature") || text.includes("tree") || text.includes("head") || text.includes("jalan")) {
    pool = THEMATIC_PHOTOS.nature_walk;
  } else if (text.includes("friend") || text.includes("conversation") || text.includes("dinner") || text.includes("ethan") || text.includes("lena") || text.includes("maya") || text.includes("noah") || text.includes("sofia") || text.includes("raka") || text.includes("stranger") || text.includes("talk") || text.includes("bincang") || category === "social") {
    pool = THEMATIC_PHOTOS.social;
  } else if (text.includes("library") || text.includes("book") || text.includes("reading") || text.includes("study") || text.includes("graduate") || text.includes("research") || category === "learning") {
    pool = THEMATIC_PHOTOS.reading_library;
  } else if (text.includes("run") || text.includes("workout") || text.includes("jog") || text.includes("gym") || text.includes("health") || category === "health") {
    pool = THEMATIC_PHOTOS.running_health;
  } else if (text.includes("music") || text.includes("vinyl") || text.includes("concert") || text.includes("guitar") || text.includes("song")) {
    pool = THEMATIC_PHOTOS.music_culture;
  } else if (text.includes("market") || text.includes("flea") || text.includes("street") || text.includes("brooklyn") || text.includes("city")) {
    pool = THEMATIC_PHOTOS.city_market;
  } else {
    // Default by category or creative studio
    if (category === "career") pool = THEMATIC_PHOTOS.coding;
    else if (category === "leisure") pool = THEMATIC_PHOTOS.nature_walk;
    else pool = THEMATIC_PHOTOS.creative_studio;
  }

  const hash = hashString(summary);
  const selected = pool[hash % pool.length];
  return selected.url;
}
