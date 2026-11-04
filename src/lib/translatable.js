// True when `data` contains at least one human-readable string value worth
// translating. Empty results such as "{}", "[]" or {"detected": false,
// "indicator": ""} have nothing to translate, so no server call is made for them.
const HAS_LETTER = /\p{L}/u;

function walk(value) {
  if (typeof value === 'string') return HAS_LETTER.test(value);
  if (Array.isArray(value)) return value.some(walk);
  if (value && typeof value === 'object') return Object.values(value).some(walk);
  return false;
}

export function hasTranslatableText(data) {
  if (data == null) return false;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return walk(JSON.parse(trimmed));
      } catch {
        // not JSON: treat as plain text
      }
    }
    return HAS_LETTER.test(trimmed);
  }
  return walk(data);
}
