const HONORIFICS = /^(mas|mbak|pak|bu|bapak|ibu|mr|mrs|ms)\s+/i;
const GENERIC_PLACES = new Set(["rumah", "home", "kos", "kosan", "kantor", "office", "kampus", "campus"]);

export function normalizeEntityName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(HONORIFICS, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function normalizeTopicName(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function isGenericPlace(value: string) {
  return GENERIC_PLACES.has(normalizeEntityName(value));
}

export function uniqueClean(values: string[], normalizer: (value: string) => string) {
  const seen = new Set<string>();
  return values.map((value) => value.trim()).filter((value) => {
    const normalized = normalizer(value);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
